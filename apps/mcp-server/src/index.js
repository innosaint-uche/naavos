/**
 * NAAvOS hosted MCP gateway.
 *
 * This is intentionally a small, dependency-free Cloudflare Worker. It
 * implements the Streamable HTTP JSON-RPC surface required by MCP and keeps
 * identity, tenant scope, and persistence at the gateway boundary.
 */

const JSONRPC = '2.0';
const DEFAULT_PROTOCOL = '2025-06-18';
const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const developmentSessions = new WeakMap();
const MAX_BODY_BYTES = 256 * 1024;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isLoopback = (request) =>
  ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);

const AVATAR_TOOL = {
  name: 'avatar_get',
  description: "Read the authenticated user's approved Avatar profile.",
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

const MEMORY_SEARCH_TOOL = {
  name: 'avatar_memory_search',
  description: "Search the authenticated user's approved Avatar memory projection.",
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', minLength: 1, maxLength: 500 },
      limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
    },
    required: ['query'],
    additionalProperties: false,
  },
};

const UPDATE_TOOL = {
  name: 'avatar_update',
  description: "Update the authenticated user's Avatar profile after explicit confirmation.",
  inputSchema: {
    type: 'object',
    properties: { avatar: { type: 'object' }, confirm: { type: 'boolean', const: true } },
    required: ['avatar', 'confirm'],
    additionalProperties: false,
  },
};

const DELETE_TOOL = {
  name: 'avatar_delete',
  description:
    "Delete this account's hosted Avatar, memory projection and MCP sessions after explicit confirmation.",
  inputSchema: {
    type: 'object',
    properties: { confirm: { type: 'boolean', const: true } },
    required: ['confirm'],
    additionalProperties: false,
  },
};

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });

const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message, data) => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: { code, message, ...(data === undefined ? {} : { data }) },
});

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || 'https://naavos.radoss.agency')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const headers = {
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers':
      'Authorization, Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID',
    'access-control-expose-headers': 'Mcp-Session-Id, WWW-Authenticate',
    vary: 'Origin',
  };
  if (origin && allowedOrigins(env).includes(origin))
    headers['access-control-allow-origin'] = origin;
  return headers;
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  return !origin || allowedOrigins(env).includes(origin);
}

function baseOrigin(request, env) {
  return new URL(env.MCP_RESOURCE_URL || request.url).origin;
}

function oauthMetadata(request, env) {
  if (!env.OAUTH_ISSUER || !env.OAUTH_AUTHORIZATION_ENDPOINT || !env.OAUTH_TOKEN_ENDPOINT)
    return null;
  const issuer = env.OAUTH_ISSUER;
  const authorizationEndpoint = env.OAUTH_AUTHORIZATION_ENDPOINT || `${issuer}/oauth/authorize`;
  const tokenEndpoint = env.OAUTH_TOKEN_ENDPOINT || `${issuer}/oauth/token`;
  return {
    issuer,
    authorization_endpoint: authorizationEndpoint,
    token_endpoint: tokenEndpoint,
    ...(env.OAUTH_REGISTRATION_ENDPOINT
      ? { registration_endpoint: env.OAUTH_REGISTRATION_ENDPOINT }
      : {}),
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['openid', 'profile', 'read-mcp', 'write-avatar'],
    service_documentation: 'https://github.com/innosaint-uche/naavos/blob/main/docs/API.md',
  };
}

function bearer(request) {
  const value = request.headers.get('Authorization') || '';
  return value.match(/^Bearer\s+([^\s]+)$/i)?.[1] || null;
}

function base64UrlDecode(value) {
  const normalized =
    value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
}

async function verifyJwt(token, env) {
  try {
    const parts = token.split('.');
    if (
      parts.length !== 3 ||
      !env.JWT_SECRET ||
      !env.OAUTH_ISSUER ||
      !env.OAUTH_AUDIENCE ||
      parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))
    )
      return null;
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    if (
      !isObject(header) ||
      !isObject(claims) ||
      header.alg !== 'HS256' ||
      typeof claims.sub !== 'string' ||
      !claims.sub.trim() ||
      typeof claims.exp !== 'number' ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now ||
      (claims.nbf !== undefined &&
        (typeof claims.nbf !== 'number' || !Number.isFinite(claims.nbf) || claims.nbf > now)) ||
      (claims.tenant_id !== undefined &&
        (typeof claims.tenant_id !== 'string' || !claims.tenant_id.trim())) ||
      claims.iss !== env.OAUTH_ISSUER ||
      !(Array.isArray(claims.aud)
        ? claims.aud.includes(env.OAUTH_AUDIENCE)
        : claims.aud === env.OAUTH_AUDIENCE)
    )
      return null;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    return {
      subject: claims.sub,
      tenantId: claims.tenant_id || claims.sub,
      scope: typeof claims.scope === 'string' ? claims.scope.split(/\s+/).filter(Boolean) : [],
      claims,
    };
  } catch {
    // Malformed headers, claims and signatures are authentication failures, never 500s.
    return null;
  }
}

async function authenticate(request, env) {
  const token = bearer(request);
  if (token) {
    const identity = await verifyJwt(token, env);
    if (identity) return identity;
    if (env.OAUTH_INTROSPECTION_ENDPOINT && env.OAUTH_ISSUER && env.OAUTH_AUDIENCE) {
      try {
        const endpoint = new URL(env.OAUTH_INTROSPECTION_ENDPOINT);
        if (endpoint.protocol !== 'https:') return null;
        const headers = {
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        };
        if (env.OAUTH_INTROSPECTION_CLIENT_ID && env.OAUTH_INTROSPECTION_CLIENT_SECRET) {
          headers.authorization =
            'Basic ' +
            btoa(
              encodeURIComponent(env.OAUTH_INTROSPECTION_CLIENT_ID) +
                ':' +
                encodeURIComponent(env.OAUTH_INTROSPECTION_CLIENT_SECRET)
            );
        }
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: new URLSearchParams({ token, token_type_hint: 'access_token' }),
          signal: AbortSignal.timeout(5000),
          redirect: 'error',
        });
        if (!response.ok) return null;
        const claims = await response.json();
        if (
          !isObject(claims) ||
          claims.active !== true ||
          typeof claims.sub !== 'string' ||
          !claims.sub.trim() ||
          typeof claims.exp !== 'number' ||
          !Number.isFinite(claims.exp) ||
          claims.exp <= Date.now() / 1000 ||
          (claims.iss !== undefined && claims.iss !== env.OAUTH_ISSUER) ||
          (claims.tenant_id !== undefined &&
            (typeof claims.tenant_id !== 'string' || !claims.tenant_id.trim())) ||
          !(Array.isArray(claims.aud)
            ? claims.aud.includes(env.OAUTH_AUDIENCE)
            : claims.aud === env.OAUTH_AUDIENCE)
        )
          return null;
        return {
          subject: claims.sub,
          tenantId: claims.tenant_id || claims.sub,
          scope: typeof claims.scope === 'string' ? claims.scope.split(/\s+/).filter(Boolean) : [],
          claims,
        };
      } catch {
        /* fail closed */
      }
    }
  }
  if (!token && env.NAAVOS_DEV_MODE === 'true' && env.DEV_TENANT_ID && isLoopback(request)) {
    return {
      subject: String(env.DEV_TENANT_ID),
      tenantId: String(env.DEV_TENANT_ID),
      scope: ['read-mcp', 'write-avatar'],
      dev: true,
    };
  }
  return null;
}

function unauthorized(request, env) {
  const metadata = `${baseOrigin(request, env)}/.well-known/oauth-protected-resource/mcp`;
  return json(
    { error: 'unauthorized', error_description: 'A valid OAuth bearer token is required.' },
    401,
    {
      'www-authenticate': `Bearer resource_metadata="${metadata}", scope="read-mcp"`,
    }
  );
}

function insufficientScope(request, env, scope) {
  return json({ error: 'insufficient_scope', scope }, 403, {
    'www-authenticate': `Bearer error="insufficient_scope", scope="${scope}", resource_metadata="${baseOrigin(request, env)}/.well-known/oauth-protected-resource/mcp"`,
  });
}

function defaultAvatar(identity) {
  return {
    avatar_api: {
      version: '1.0',
      owner: identity.subject,
      endpoint_type: 'MCP-Dynamic-Inject',
      cognitive_profile: {
        communication_style: { verbosity: 'minimal', structure: 'bulleted' },
      },
      strict_operational_rules: [
        'Ask before sharing private context',
        'Cite evidence before claiming completion',
      ],
    },
  };
}

async function loadAvatar(identity, env) {
  if (env.DB) {
    const row = await env.DB.prepare('SELECT payload FROM avatars WHERE tenant_id = ?')
      .bind(identity.tenantId)
      .first();
    if (row?.payload) return JSON.parse(row.payload);
    // First authenticated use provisions a private, tenant-scoped starter
    // profile. This keeps the no-code flow usable without weakening auth or
    // exposing any cross-tenant data.
    const avatar = defaultAvatar(identity);
    const now = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO avatars (tenant_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(tenant_id) DO NOTHING'
    )
      .bind(identity.tenantId, JSON.stringify(avatar), now)
      .run();
    const created = await env.DB.prepare('SELECT payload FROM avatars WHERE tenant_id = ?')
      .bind(identity.tenantId)
      .first();
    if (created?.payload) return JSON.parse(created.payload);
  }
  if (env.NAAVOS_DEV_MODE === 'true') {
    return defaultAvatar(identity);
  }
  return null;
}

async function saveAvatar(identity, avatar, env) {
  if (!env.DB)
    throw Object.assign(new Error('Avatar persistence is not configured'), { code: -32003 });
  // The authenticated tenant is the sole owner of the persisted Avatar. Do
  // not allow client-provided payload fields to reassign ownership or create a
  // confused-deputy path across tenants.
  const persistedAvatar = avatar && typeof avatar === 'object' ? structuredClone(avatar) : {};
  persistedAvatar.avatar_api = {
    ...(persistedAvatar.avatar_api && typeof persistedAvatar.avatar_api === 'object'
      ? persistedAvatar.avatar_api
      : {}),
    owner: identity.subject,
  };
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO avatars (tenant_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(tenant_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at'
  )
    .bind(identity.tenantId, JSON.stringify(persistedAvatar), now)
    .run();
  return { avatar: persistedAvatar, updated_at: now };
}

async function searchMemory(identity, query, limit, env) {
  if (!env.DB) return [];
  const rows = await env.DB.prepare(
    'SELECT id, content, metadata, created_at FROM memory_items WHERE tenant_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT ?'
  )
    .bind(identity.tenantId, `%${query}%`, limit)
    .all();
  return rows.results || [];
}

async function sessionFor(request, env, identity) {
  const sessionId = request.headers.get('Mcp-Session-Id');
  if (!sessionId) return null;
  if (!env.DB) {
    const session = developmentSessions.get(env)?.get(sessionId);
    return session?.tenantId === identity.tenantId && session.expiresAt > Date.now()
      ? sessionId
      : null;
  }
  const row = await env.DB.prepare(
    'SELECT tenant_id, expires_at FROM mcp_sessions WHERE session_id = ?'
  )
    .bind(sessionId)
    .first();
  if (
    !row ||
    row.tenant_id !== identity.tenantId ||
    Number(row.expires_at) <= Math.floor(Date.now() / 1000)
  )
    return null;
  return sessionId;
}

async function createSession(identity, protocolVersion, env) {
  const sessionId = crypto.randomUUID();
  if (env.DB) {
    await env.DB.prepare(
      'INSERT INTO mcp_sessions (session_id, tenant_id, protocol_version, expires_at) VALUES (?, ?, ?, ?)'
    )
      .bind(sessionId, identity.tenantId, protocolVersion, Math.floor(Date.now() / 1000) + 3600)
      .run();
  }
  if (!env.DB && identity.dev) {
    if (!developmentSessions.has(env)) developmentSessions.set(env, new Map());
    const sessions = developmentSessions.get(env);
    for (const [id, session] of sessions) if (session.expiresAt <= Date.now()) sessions.delete(id);
    sessions.set(sessionId, { tenantId: identity.tenantId, expiresAt: Date.now() + 3600000 });
  }
  return sessionId;
}

async function callTool(name, args, identity, env) {
  if (typeof name !== 'string')
    throw Object.assign(new Error('Tool name must be a string'), { code: -32602 });
  if (!isObject(args))
    throw Object.assign(new Error('arguments must be an object'), { code: -32602 });
  const allowedKeys = {
    avatar_get: [],
    avatar_memory_search: ['query', 'limit'],
    avatar_update: ['avatar', 'confirm'],
    avatar_delete: ['confirm'],
  };
  if (
    Object.hasOwn(allowedKeys, name) &&
    Object.keys(args).some((key) => !allowedKeys[name].includes(key))
  )
    throw Object.assign(new Error('Unknown tool argument'), { code: -32602 });
  if (!identity.scope.includes('read-mcp'))
    throw Object.assign(new Error('read-mcp scope is required'), { code: -32001 });
  if (name === 'avatar_get') {
    const avatar = await loadAvatar(identity, env);
    if (!avatar)
      throw Object.assign(new Error('No Avatar profile has been saved for this account.'), {
        code: -32004,
      });
    return {
      content: [{ type: 'text', text: JSON.stringify(avatar) }],
      structuredContent: { avatar },
    };
  }
  if (name === 'avatar_memory_search') {
    if (
      typeof args.query !== 'string' ||
      !args.query.trim() ||
      args.query.length > 500 ||
      (args.limit !== undefined &&
        (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 20))
    )
      throw Object.assign(
        new Error('query must be 1-500 characters; limit must be an integer from 1 to 20'),
        { code: -32602 }
      );
    const items = await searchMemory(identity, args.query.trim(), args.limit ?? 5, env);
    return {
      content: [{ type: 'text', text: JSON.stringify({ items }) }],
      structuredContent: { items },
    };
  }
  if (name === 'avatar_update') {
    if (
      args.confirm !== true ||
      !isObject(args.avatar) ||
      (args.avatar.avatar_api !== undefined && !isObject(args.avatar.avatar_api))
    )
      throw Object.assign(new Error('avatar_update requires confirm=true and an avatar object'), {
        code: -32602,
      });
    if (!identity.scope.includes('write-avatar'))
      throw Object.assign(new Error('write-avatar scope is required'), { code: -32001 });
    const saved = await saveAvatar(identity, args.avatar, env);
    return { content: [{ type: 'text', text: JSON.stringify(saved) }], structuredContent: saved };
  }
  if (name === 'avatar_delete') {
    if (args.confirm !== true)
      throw Object.assign(new Error('avatar_delete requires confirm=true'), { code: -32602 });
    if (!identity.scope.includes('write-avatar'))
      throw Object.assign(new Error('write-avatar scope is required'), { code: -32001 });
    if (!env.DB?.batch)
      throw Object.assign(new Error('Transactional persistence is not configured'), {
        code: -32003,
      });
    await env.DB.batch([
      env.DB.prepare('DELETE FROM memory_items WHERE tenant_id = ?').bind(identity.tenantId),
      env.DB.prepare('DELETE FROM avatars WHERE tenant_id = ?').bind(identity.tenantId),
      env.DB.prepare('DELETE FROM mcp_sessions WHERE tenant_id = ?').bind(identity.tenantId),
    ]);
    const deleted = {
      deleted: true,
      scope: 'hosted-avatar-memory-and-sessions',
      local_data_changed: false,
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(deleted) }],
      structuredContent: deleted,
    };
  }
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
}

async function boundedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw Object.assign(new Error('Request body is too large'), { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

async function handleRpc(request, env, identity) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    return json(rpcError(null, -32600, 'Content-Type application/json is required'), 415);
  const body = await boundedBody(request);
  let message;
  try {
    message = JSON.parse(body);
  } catch {
    return json(rpcError(null, -32700, 'Parse error'), 400);
  }
  if (
    !isObject(message) ||
    message.jsonrpc !== '2.0' ||
    typeof message.method !== 'string' ||
    (message.id !== undefined &&
      typeof message.id !== 'string' &&
      !(typeof message.id === 'number' && Number.isFinite(message.id))) ||
    (message.params !== undefined && !isObject(message.params))
  )
    return json(rpcError(message?.id, -32600, 'Invalid Request'), 400);
  if (message.method === 'initialize') {
    if (message.id === undefined)
      return json(rpcError(null, -32600, 'initialize requires an id'), 400);
    const requested = String(message.params?.protocolVersion || DEFAULT_PROTOCOL);
    const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : DEFAULT_PROTOCOL;
    const sessionId = await createSession(identity, protocolVersion, env);
    return json(
      rpcResult(message.id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'naavos-avatar-gateway', version: '1.0.0' },
        instructions:
          'Use avatar_get for read-only context. Mutations require explicit confirmation.',
      }),
      200,
      { 'mcp-session-id': sessionId }
    );
  }
  if (!(await sessionFor(request, env, identity)))
    return json(rpcError(message.id, -32000, 'A valid Mcp-Session-Id is required'), 400);
  const protocol = request.headers.get('MCP-Protocol-Version');
  if (protocol && !SUPPORTED_PROTOCOLS.includes(protocol))
    return json(rpcError(message.id, -32600, 'Unsupported MCP-Protocol-Version'), 400);
  if (message.id === undefined) return new Response(null, { status: 202 });
  if (message.method === 'ping') return json(rpcResult(message.id, {}));
  if (message.method === 'tools/list')
    return json(
      rpcResult(message.id, {
        tools: [
          AVATAR_TOOL,
          MEMORY_SEARCH_TOOL,
          ...(identity.scope.includes('write-avatar') ? [UPDATE_TOOL, DELETE_TOOL] : []),
        ],
      })
    );
  if (message.method === 'tools/call') {
    try {
      return json(
        rpcResult(
          message.id,
          await callTool(message.params?.name, message.params?.arguments ?? {}, identity, env)
        )
      );
    } catch (error) {
      if (error.code === -32001) return insufficientScope(request, env, 'read-mcp write-avatar');
      return json(
        rpcError(
          message.id,
          [-32602, -32001, -32003, -32004].includes(error.code) ? error.code : -32603,
          [-32602, -32001, -32003, -32004].includes(error.code) ? error.message : 'Tool call failed'
        ),
        200
      );
    }
  }
  return json(rpcError(message.id, -32601, `Method not found: ${message.method}`), 200);
}

async function handleMcp(request, env) {
  if (!originAllowed(request, env)) return json({ error: 'origin_not_allowed' }, 403);
  if (request.method === 'GET')
    return json({ error: 'SSE transport is not enabled; use Streamable HTTP POST.' }, 405, {
      allow: 'POST, OPTIONS',
    });
  if (request.method === 'DELETE') {
    const identity = await authenticate(request, env);
    if (!identity) return unauthorized(request, env);
    if (!identity.scope.includes('read-mcp')) return insufficientScope(request, env, 'read-mcp');
    const sessionId = request.headers.get('Mcp-Session-Id');
    if (!(await sessionFor(request, env, identity)))
      return json({ error: 'session_not_found' }, 404);
    if (env.DB && sessionId)
      await env.DB.prepare('DELETE FROM mcp_sessions WHERE session_id = ? AND tenant_id = ?')
        .bind(sessionId, identity.tenantId)
        .run();
    developmentSessions.get(env)?.delete(sessionId);
    return new Response(null, { status: 204 });
  }
  if (request.method !== 'POST')
    return json({ error: 'method_not_allowed' }, 405, { allow: 'POST, GET, DELETE, OPTIONS' });
  const identity = await authenticate(request, env);
  if (!identity) return unauthorized(request, env);
  if (!identity.scope.includes('read-mcp')) return insufficientScope(request, env, 'read-mcp');
  if (!env.DB && !identity.dev) return json({ error: 'persistence_not_configured' }, 503);
  return handleRpc(request, env, identity);
}

function protectedResourceMetadata(request, env) {
  const resource = env.MCP_RESOURCE_URL || baseOrigin(request, env) + '/mcp';
  return {
    resource,
    authorization_servers: oauthMetadata(request, env) ? [env.OAUTH_ISSUER] : [],
    scopes_supported: ['read-mcp', 'write-avatar'],
    bearer_methods_supported: ['header'],
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    try {
      if (!originAllowed(request, env)) response = json({ error: 'origin_not_allowed' }, 403);
      else if (request.method === 'OPTIONS') response = new Response(null, { status: 204 });
      else if (!['GET', 'POST', 'DELETE'].includes(request.method))
        response = json({ error: 'method_not_allowed' }, 405);
      else if (
        [
          '/.well-known/oauth-protected-resource',
          '/.well-known/oauth-protected-resource/mcp',
        ].includes(url.pathname)
      )
        response = json(protectedResourceMetadata(request, env));
      else if (url.pathname === '/.well-known/oauth-cimd') {
        const origin = baseOrigin(request, env);
        response = json({
          client_id: origin + '/.well-known/oauth-cimd',
          client_name: 'NAAvOS Universal Avatar',
          redirect_uris: [origin + '/oauth/callback/huggingface'],
          token_endpoint_auth_method: 'none',
          client_uri: origin,
        });
      } else if (url.pathname === '/.well-known/oauth-authorization-server') {
        const metadata = oauthMetadata(request, env);
        response = metadata
          ? json(metadata)
          : json(
              {
                error: 'oauth_not_configured',
                error_description:
                  'OAuth issuer and endpoints must be configured before discovery is published.',
              },
              503
            );
      } else if (url.pathname === '/health' || url.pathname === '/mcp/v1/health')
        response = json(
          {
            service: 'NAAvOS MCP gateway',
            status:
              env.DB &&
              (env.JWT_SECRET || env.OAUTH_INTROSPECTION_ENDPOINT) &&
              env.OAUTH_ISSUER &&
              env.OAUTH_AUDIENCE
                ? 'configured'
                : 'not-configured',
            protocol: 'streamable-http',
            auth: env.JWT_SECRET
              ? 'jwt-configured'
              : env.OAUTH_INTROSPECTION_ENDPOINT
                ? 'introspection-configured'
                : 'not-configured',
            persistence: env.DB ? 'd1-configured' : 'not-configured',
            release: env.RELEASE_SHA || 'unbound',
          },
          env.DB &&
            (env.JWT_SECRET || env.OAUTH_INTROSPECTION_ENDPOINT) &&
            env.OAUTH_ISSUER &&
            env.OAUTH_AUDIENCE
            ? 200
            : 503
        );
      else if (url.pathname === '/mcp' || url.pathname === '/mcp/v1')
        response = await handleMcp(request, env);
      else response = json({ error: 'not_found' }, 404);
    } catch (error) {
      response = json(
        { error: error.status === 413 ? 'request_too_large' : 'service_unavailable' },
        error.status === 413 ? 413 : 503
      );
    }
    return withCors(response, request, env);
  },
};

export { verifyJwt };
