import crypto from 'node:crypto';

const CANONICAL_ENDPOINT = 'https://mcp.naavos.radoss.agency/mcp';
const requestedEndpoint = process.env.NAAVOS_LIVE_MCP_URL;
const endpoint = CANONICAL_ENDPOINT;
const tokenA = process.env.NAAVOS_LIVE_TOKEN_A;
const tokenB = process.env.NAAVOS_LIVE_TOKEN_B;

if (requestedEndpoint && requestedEndpoint !== CANONICAL_ENDPOINT) {
  throw new Error(
    `This release gate only accepts the verified branded endpoint: ${CANONICAL_ENDPOINT}`
  );
}
if (!tokenA || !tokenB) {
  throw new Error(
    'Set NAAVOS_LIVE_TOKEN_A and NAAVOS_LIVE_TOKEN_B in the process environment; token values are never accepted as arguments or printed'
  );
}
if (tokenA === tokenB) {
  throw new Error(
    'Provide two distinct dedicated acceptance-account tokens; token values are never printed'
  );
}

async function rpc(token, message, sessionId = null, method = 'POST') {
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
    ...(method === 'POST' ? { 'content-type': 'application/json' } : {}),
    ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
  };
  const response = await fetch(endpoint, {
    method,
    headers,
    signal: AbortSignal.timeout(15_000),
    ...(method === 'POST' ? { body: JSON.stringify(message) } : {}),
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    /* Preserve status-only diagnostics without echoing response text. */
  }
  return { status: response.status, body, sessionId: response.headers.get('mcp-session-id') };
}

function requireStatus(label, result, status = 200) {
  if (result.status !== status)
    throw new Error(`${label} returned HTTP ${result.status}; expected HTTP ${status}`);
  if (result.body?.error)
    throw new Error(
      `${label} returned a JSON-RPC error: ${result.body.error.message || 'unknown error'}`
    );
}

function toolResult(label, result) {
  requireStatus(label, result);
  if (!result.body?.result?.structuredContent)
    throw new Error(`${label} did not return structuredContent`);
  return result.body.result.structuredContent;
}

async function startTenant(token, id) {
  const initialized = await rpc(token, {
    jsonrpc: '2.0',
    id,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'naavos-live-tenant-qa', version: '1' },
    },
  });
  requireStatus(`tenant ${id} initialize`, initialized);
  if (!initialized.sessionId) throw new Error(`tenant ${id} did not receive an MCP session`);
  const notification = await rpc(
    token,
    { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
    initialized.sessionId
  );
  requireStatus(`tenant ${id} initialized notification`, notification, 202);
  return initialized.sessionId;
}

async function call(token, sessionId, id, name, args = {}) {
  return rpc(
    token,
    {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name, arguments: args },
    },
    sessionId
  );
}

async function closeTenant(token, sessionId) {
  if (!sessionId) return;
  try {
    await rpc(token, null, sessionId, 'DELETE');
  } catch {
    /* Session cleanup is best effort; data restoration remains mandatory. */
  }
}

const marker = `naavos-live-tenant-qa-${Date.now()}-${crypto.randomUUID()}`;
let originalAvatar;
let sessionA;
let sessionB;
let restored = false;
let mutationAttempted = false;
let restorationError = null;
try {
  sessionA = await startTenant(tokenA, 1);
  sessionB = await startTenant(tokenB, 2);
  const toolsA = await rpc(
    tokenA,
    { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} },
    sessionA
  );
  const toolsB = await rpc(
    tokenB,
    { jsonrpc: '2.0', id: 4, method: 'tools/list', params: {} },
    sessionB
  );
  requireStatus('tenant A tools/list', toolsA);
  requireStatus('tenant B tools/list', toolsB);

  originalAvatar = toolResult(
    'tenant A avatar_get before mutation',
    await call(tokenA, sessionA, 5, 'avatar_get')
  ).avatar;
  const avatarBBefore = toolResult(
    'tenant B avatar_get before mutation',
    await call(tokenB, sessionB, 6, 'avatar_get')
  ).avatar;
  if (avatarBBefore?.avatar_api?.owner === originalAvatar?.avatar_api?.owner) {
    throw new Error('The two live credentials resolved to the same authenticated owner');
  }

  mutationAttempted = true;
  const updated = toolResult(
    'tenant A marker update',
    await call(tokenA, sessionA, 7, 'avatar_update', {
      avatar: {
        ...originalAvatar,
        avatar_api: { ...(originalAvatar.avatar_api || {}), isolation_test_marker: marker },
      },
      confirm: true,
    })
  );
  if (updated.avatar?.avatar_api?.isolation_test_marker !== marker)
    throw new Error('tenant A marker was not returned after update');

  const avatarAAfter = toolResult(
    'tenant A avatar_get after mutation',
    await call(tokenA, sessionA, 8, 'avatar_get')
  ).avatar;
  const avatarBAfter = toolResult(
    'tenant B avatar_get after tenant A mutation',
    await call(tokenB, sessionB, 9, 'avatar_get')
  ).avatar;
  if (avatarAAfter?.avatar_api?.isolation_test_marker !== marker)
    throw new Error('tenant A could not read its own marker');
  if (JSON.stringify(avatarBAfter).includes(marker))
    throw new Error("tenant B could read tenant A's marker");

  const crossSession = await rpc(
    tokenB,
    { jsonrpc: '2.0', id: 10, method: 'tools/list', params: {} },
    sessionA
  );
  if (crossSession.status !== 400 || crossSession.body?.error?.code !== -32000) {
    throw new Error(
      `cross-tenant session reuse was not rejected as expected (HTTP ${crossSession.status})`
    );
  }
} finally {
  if (mutationAttempted && sessionA && originalAvatar) {
    for (let attempt = 1; attempt <= 2 && !restored; attempt += 1) {
      try {
        const restore = await call(tokenA, sessionA, 10 + attempt, 'avatar_update', {
          avatar: originalAvatar,
          confirm: true,
        });
        restored = restore.status === 200 && !restore.body?.error;
        if (!restored) restorationError = new Error(`HTTP ${restore.status}`);
      } catch {
        restorationError = new Error('request failed or timed out');
      }
    }
  }
  await Promise.all([closeTenant(tokenA, sessionA), closeTenant(tokenB, sessionB)]);
}

if (!restored) {
  throw new Error(
    `Tenant A restoration could not be verified (${restorationError?.message || 'unknown error'}); inspect the dedicated test account before reuse`
  );
}
console.log(
  JSON.stringify(
    {
      status: 'pass',
      endpoint,
      checks: [
        'two independent owners',
        'MCP lifecycle',
        'tools/list',
        'owner-scoped mutation',
        'cross-tenant read isolation',
        'cross-tenant session rejection',
        'source restoration',
      ],
      restored,
      token_values_written: false,
      verified_at: new Date().toISOString(),
    },
    null,
    2
  )
);
