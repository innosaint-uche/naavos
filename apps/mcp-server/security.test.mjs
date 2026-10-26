import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import worker, { verifyJwt } from './src/index.js';

class SqliteD1 {
  db = new DatabaseSync(':memory:');
  constructor() {
    this.db.exec(readFileSync(new URL('./migrations/0001_initial.sql', import.meta.url), 'utf8'));
  }
  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => this.db.prepare(sql).get(...values) ?? null,
        all: async () => ({ results: this.db.prepare(sql).all(...values) }),
        run: async () => this.db.prepare(sql).run(...values),
      }),
    };
  }
  async batch(statements) {
    this.db.exec('BEGIN');
    try {
      const result = await Promise.all(statements.map((statement) => statement.run()));
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}

const config = {
  JWT_SECRET: 'test-only-signing-secret',
  OAUTH_ISSUER: 'https://issuer.example',
  OAUTH_AUDIENCE: 'https://gateway.example/mcp',
  OAUTH_AUTHORIZATION_ENDPOINT: 'https://issuer.example/authorize',
  OAUTH_TOKEN_ENDPOINT: 'https://issuer.example/token',
};
function jwt(overrides = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({
      sub: 'user-a',
      tenant_id: 'tenant-a',
      scope: 'read-mcp write-avatar',
      iss: config.OAUTH_ISSUER,
      aud: config.OAUTH_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    })
  ).toString('base64url');
  const input = `${header}.${claims}`;
  return `${input}.${createHmac('sha256', config.JWT_SECRET).update(input).digest('base64url')}`;
}
function rpc(env, token, body, session, extraHeaders = {}) {
  return worker.fetch(
    new Request('https://gateway.example/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(session ? { 'mcp-session-id': session } : {}),
        ...extraHeaders,
      },
      body: JSON.stringify(body),
    }),
    env
  );
}
async function initialize(env, token = jwt()) {
  const response = await rpc(env, token, { jsonrpc: '2.0', id: 1, method: 'initialize' });
  assert.equal(response.status, 200);
  return response.headers.get('mcp-session-id');
}
const call = (name, args = {}) => ({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: { name, arguments: args },
});

test('JWT validation rejects malformed, unbounded, future and wrong-audience claims', async () => {
  assert.ok(await verifyJwt(jwt(), config));
  for (const claims of [
    { exp: 'forever' },
    { exp: '9999999999' },
    { exp: null },
    { exp: {} },
    { exp: 0 },
    { nbf: 9999999999 },
    { sub: {} },
    { tenant_id: [] },
    { iss: 'wrong' },
    { aud: 'wrong' },
  ]) {
    assert.equal(await verifyJwt(jwt(claims), config), null, JSON.stringify(claims));
  }
  assert.equal(await verifyJwt(jwt().replace(/\.[^.]+$/, '.%%%'), config), null);
  assert.equal(await verifyJwt(jwt(), { JWT_SECRET: config.JWT_SECRET }), null);
});

test('production cannot use anonymous dev mode or a provider identity token', async () => {
  const env = { NAAVOS_DEV_MODE: 'true', DEV_TENANT_ID: 'operator', HF_OAUTH_ENABLED: 'true' };
  assert.equal((await rpc(env, null, call('avatar_get'))).status, 401);
  assert.equal((await rpc(env, 'hf_test_token', call('avatar_get'))).status, 401);
});

test('opaque-token introspection accepts only active tokens for the dedicated resource audience', async () => {
  const db = new SqliteD1();
  const originalFetch = globalThis.fetch;
  let claims = {
    active: true,
    sub: 'opaque-user',
    aud: config.OAUTH_AUDIENCE,
    scope: 'read-mcp',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  globalThis.fetch = async (endpoint, options) => {
    assert.equal(String(endpoint), 'https://issuer.example/introspect');
    assert.equal(options.method, 'POST');
    return Response.json(claims);
  };
  try {
    const env = {
      ...config,
      DB: db,
      OAUTH_INTROSPECTION_ENDPOINT: 'https://issuer.example/introspect',
    };
    assert.ok(await initialize(env, 'opaque-access-token'));
    claims = { ...claims, aud: 'other-service' };
    assert.equal((await rpc(env, 'opaque-access-token', call('avatar_get'))).status, 401);
    claims = { ...claims, aud: config.OAUTH_AUDIENCE, active: false };
    assert.equal((await rpc(env, 'opaque-access-token', call('avatar_get'))).status, 401);
  } finally {
    globalThis.fetch = originalFetch;
    db.db.close();
  }
});

test('OAuth challenge resolves to resource metadata and keeps issuer distinct from resource', async () => {
  const response = await rpc(config, null, call('avatar_get'));
  const metadataUrl = response.headers
    .get('www-authenticate')
    .match(/resource_metadata="([^"]+)"/)[1];
  assert.equal(metadataUrl, 'https://gateway.example/.well-known/oauth-protected-resource/mcp');
  const metadata = await (await worker.fetch(new Request(metadataUrl), config)).json();
  assert.equal(metadata.resource, 'https://gateway.example/mcp');
  assert.deepEqual(metadata.authorization_servers, [config.OAUTH_ISSUER]);
});

test('reads require read-mcp and read-only accounts cannot discover or call mutation tools', async () => {
  const db = new SqliteD1();
  try {
    const env = { ...config, DB: db };
    assert.equal((await rpc(env, jwt({ scope: 'write-avatar' }), call('avatar_get'))).status, 403);
    const token = jwt({ scope: 'read-mcp' });
    const session = await initialize(env, token);
    const listed = await (
      await rpc(env, token, { jsonrpc: '2.0', id: 2, method: 'tools/list' }, session)
    ).json();
    assert.deepEqual(
      listed.result.tools.map((tool) => tool.name),
      ['avatar_get', 'avatar_memory_search']
    );
    const denied = await rpc(
      env,
      token,
      call('avatar_update', { confirm: true, avatar: {} }),
      session
    );
    assert.equal(denied.status, 403);
    assert.match(denied.headers.get('www-authenticate'), /insufficient_scope/);
  } finally {
    db.db.close();
  }
});

test('real SQLite persistence, deletion and session revocation stay inside the authenticated tenant', async () => {
  const db = new SqliteD1();
  try {
    const env = { ...config, DB: db };
    const tokenA = jwt();
    const tokenB = jwt({ sub: 'user-b', tenant_id: 'tenant-b' });
    const sessionA = await initialize(env, tokenA);
    const sessionB = await initialize(env, tokenB);
    for (const [token, session, name] of [
      [tokenA, sessionA, 'A'],
      [tokenB, sessionB, 'B'],
    ]) {
      const result = await (
        await rpc(
          env,
          token,
          call('avatar_update', {
            confirm: true,
            avatar: { avatar_api: { owner: 'spoof', display_name: name } },
          }),
          session
        )
      ).json();
      assert.equal(
        result.result.structuredContent.avatar.avatar_api.owner,
        name === 'A' ? 'user-a' : 'user-b'
      );
    }
    const reload = await (await rpc({ ...env }, tokenA, call('avatar_get'), sessionA)).json();
    assert.equal(reload.result.structuredContent.avatar.avatar_api.display_name, 'A');
    assert.equal((await rpc(env, tokenB, call('avatar_get'), sessionA)).status, 400);
    db.db
      .prepare('INSERT INTO memory_items VALUES (?, ?, ?, ?, ?)')
      .run('a', 'tenant-a', 'private A', null, '2026-10-26');
    db.db
      .prepare('INSERT INTO memory_items VALUES (?, ?, ?, ?, ?)')
      .run('b', 'tenant-b', 'private B', null, '2026-10-26');
    const searched = await (
      await rpc(env, tokenA, call('avatar_memory_search', { query: 'private' }), sessionA)
    ).json();
    assert.deepEqual(
      searched.result.structuredContent.items.map((item) => item.id),
      ['a']
    );
    assert.equal(
      (await (await rpc(env, tokenA, call('avatar_delete'), sessionA)).json()).error.code,
      -32602
    );
    const deleted = await (
      await rpc(env, tokenA, call('avatar_delete', { confirm: true }), sessionA)
    ).json();
    assert.equal(deleted.result.structuredContent.deleted, true);
    assert.equal(
      db.db.prepare('SELECT COUNT(*) AS n FROM avatars WHERE tenant_id = ?').get('tenant-a').n,
      0
    );
    assert.equal(
      db.db.prepare('SELECT COUNT(*) AS n FROM memory_items WHERE tenant_id = ?').get('tenant-a').n,
      0
    );
    assert.equal((await rpc(env, tokenA, call('avatar_get'), sessionA)).status, 400);
    assert.equal((await rpc(env, tokenB, call('avatar_get'), sessionB)).status, 200);
    assert.equal(
      db.db.prepare('SELECT COUNT(*) AS n FROM memory_items WHERE tenant_id = ?').get('tenant-b').n,
      1
    );
  } finally {
    db.db.close();
  }
});

test('hostile arguments, protocol headers and oversized bodies fail without raw internal errors', async () => {
  const db = new SqliteD1();
  try {
    const env = { ...config, DB: db };
    const session = await initialize(env);
    for (const args of [
      { query: 'x', limit: -1 },
      { query: 'x', limit: 1.5 },
      { query: 'x', limit: '20' },
      { query: 'x'.repeat(501) },
    ])
      assert.equal(
        (await (await rpc(env, jwt(), call('avatar_memory_search', args), session)).json()).error
          .code,
        -32602
      );
    assert.equal(
      (
        await (
          await rpc(env, jwt(), call('avatar_update', { confirm: true, avatar: [] }), session)
        ).json()
      ).error.code,
      -32602
    );
    assert.equal(
      (await rpc(env, jwt(), { jsonrpc: '2.0', method: 'notifications/initialized' })).status,
      400
    );
    assert.equal(
      (await rpc(env, jwt(), call('avatar_get'), session, { 'MCP-Protocol-Version': 'unknown' }))
        .status,
      400
    );
    assert.equal(
      (await rpc(env, jwt(), call('avatar_get', { padding: 'x'.repeat(256 * 1024) }), session))
        .status,
      413
    );
    const broken = {
      ...config,
      DB: {
        prepare() {
          throw new Error('DATABASE_PASSWORD=do-not-expose');
        },
      },
    };
    const failure = await rpc(broken, jwt(), { jsonrpc: '2.0', id: 1, method: 'initialize' });
    assert.equal(failure.status, 503);
    assert.doesNotMatch(await failure.text(), /PASSWORD|do-not-expose/);
  } finally {
    db.db.close();
  }
});
