import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker from "./src/index.js";

const env = {
  NAAVOS_DEV_MODE: "true",
  DEV_TENANT_ID: "fixture-tenant",
  ALLOWED_ORIGINS: "https://naavos.radoss.agency"
};

function request(body, headers = {}) {
  return worker.fetch(new Request("https://fixture.test/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  }), env);
}

const unauthorized = await worker.fetch(new Request("https://fixture.test/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), {});
assert.equal(unauthorized.status, 401);
assert.match(unauthorized.headers.get("www-authenticate"), /resource_metadata/);

const hostileOrigin = await worker.fetch(new Request("https://fixture.test/mcp", { method: "POST", headers: { "content-type": "application/json", Origin: "https://evil.example" }, body: "{}" }), env);
assert.equal(hostileOrigin.status, 403);

const initialize = await request({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
assert.equal(initialize.status, 200);
const session = initialize.headers.get("mcp-session-id");
assert.ok(session);
const initializeBody = await initialize.json();
assert.equal(initializeBody.result.protocolVersion, "2025-06-18");

const notification = await request({ jsonrpc: "2.0", method: "notifications/initialized" }, { "mcp-session-id": session });
assert.equal(notification.status, 202);

const listed = await request({ jsonrpc: "2.0", id: 2, method: "tools/list" }, { "mcp-session-id": session });
const tools = (await listed.json()).result.tools;
assert.deepEqual(tools.map(({ name }) => name), ["avatar_get", "avatar_memory_search", "avatar_update"]);
assert.equal(tools.find(({ name }) => name === "avatar_update").inputSchema.properties.confirm.const, true);

const loaded = await request({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "avatar_get", arguments: {} } }, { "mcp-session-id": session });
const loadedBody = await loaded.json();
assert.equal(loadedBody.result.structuredContent.avatar.avatar_api.owner, "fixture-tenant");

const invalidMutation = await request({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "avatar_update", arguments: { avatar: {} } } }, { "mcp-session-id": session });
assert.equal((await invalidMutation.json()).error.code, -32602);

const missingSession = await request({ jsonrpc: "2.0", id: 5, method: "tools/list" });
assert.equal((await missingSession.json()).error.code, -32000);

const discovery = await worker.fetch(new Request("https://fixture.test/.well-known/oauth-authorization-server"), env);
assert.equal(discovery.status, 503);

class FixtureD1 {
  avatars = new Map();
  sessions = new Map();
  memories = [];

  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => {
          if (sql.includes("SELECT payload FROM avatars")) {
            const payload = this.avatars.get(values[0]);
            return payload ? { payload } : null;
          }
          if (sql.includes("SELECT tenant_id, expires_at FROM mcp_sessions")) {
            const session = this.sessions.get(values[0]);
            return session ? { tenant_id: session.tenant_id, expires_at: session.expires_at } : null;
          }
          return null;
        },
        all: async () => {
          if (!sql.includes("SELECT id, content, metadata, created_at FROM memory_items")) return { results: [] };
          const [tenantId, pattern, limit] = values;
          const query = String(pattern).replace(/^%|%$/g, "").toLowerCase();
          return {
            results: this.memories
              .filter((item) => item.tenant_id === tenantId && item.content.toLowerCase().includes(query))
              .slice(0, Number(limit))
          };
        },
        run: async () => {
          if (sql.includes("INSERT INTO avatars")) {
            const [tenantId, payload, updatedAt] = values;
            this.avatars.set(tenantId, payload);
            return { success: true };
          }
          if (sql.includes("INSERT INTO mcp_sessions")) {
            const [sessionId, tenantId, protocolVersion, expiresAt] = values;
            this.sessions.set(sessionId, { tenant_id: tenantId, protocol_version: protocolVersion, expires_at: expiresAt });
            return { success: true };
          }
          if (sql.includes("DELETE FROM mcp_sessions")) {
            const [sessionId, tenantId] = values;
            const session = this.sessions.get(sessionId);
            if (session?.tenant_id === tenantId) this.sessions.delete(sessionId);
            return { success: true };
          }
          return { success: true };
        }
      })
    };
  }
}

function fixtureJwt(subject, tenantId = subject) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: subject,
    tenant_id: tenantId,
    scope: "read-mcp write-avatar",
    iss: "https://fixture.test",
    aud: "naavos",
    exp: Math.floor(Date.now() / 1000) + 3600
  });
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", "fixture-secret").update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

function tenantRequest(token, body, sessionId) {
  return worker.fetch(new Request("https://fixture.test/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(sessionId ? { "mcp-session-id": sessionId } : {})
    },
    body: JSON.stringify(body)
  }), {
    JWT_SECRET: "fixture-secret",
    OAUTH_ISSUER: "https://fixture.test",
    OAUTH_AUDIENCE: "naavos",
    DB: tenantRequest.db,
    ALLOWED_ORIGINS: "https://naavos.radoss.agency"
  });
}

const tenantDb = new FixtureD1();
tenantRequest.db = tenantDb;
tenantDb.memories.push(
  { id: "memory-a", tenant_id: "tenant-a", content: "private alpha memory", metadata: null, created_at: "2026-08-25T00:00:00.000Z" },
  { id: "memory-b", tenant_id: "tenant-b", content: "private beta memory", metadata: null, created_at: "2026-08-25T00:00:00.000Z" }
);
const tokenA = fixtureJwt("user-a", "tenant-a");
const tokenB = fixtureJwt("user-b", "tenant-b");
const tenantInitializeA = await tenantRequest(tokenA, { jsonrpc: "2.0", id: 10, method: "initialize", params: { protocolVersion: "2025-06-18" } });
const tenantInitializeB = await tenantRequest(tokenB, { jsonrpc: "2.0", id: 11, method: "initialize", params: { protocolVersion: "2025-06-18" } });
assert.equal(tenantInitializeA.status, 200);
assert.equal(tenantInitializeB.status, 200);
const tenantSessionA = tenantInitializeA.headers.get("mcp-session-id");
const tenantSessionB = tenantInitializeB.headers.get("mcp-session-id");
assert.ok(tenantSessionA);
assert.ok(tenantSessionB);

const avatarA = await tenantRequest(tokenA, { jsonrpc: "2.0", id: 12, method: "tools/call", params: { name: "avatar_get", arguments: {} } }, tenantSessionA);
const avatarB = await tenantRequest(tokenB, { jsonrpc: "2.0", id: 13, method: "tools/call", params: { name: "avatar_get", arguments: {} } }, tenantSessionB);
assert.equal((await avatarA.json()).result.structuredContent.avatar.avatar_api.owner, "user-a");
assert.equal((await avatarB.json()).result.structuredContent.avatar.avatar_api.owner, "user-b");

const updateA = await tenantRequest(tokenA, {
  jsonrpc: "2.0",
  id: 14,
  method: "tools/call",
  params: { name: "avatar_update", arguments: { avatar: { avatar_api: { owner: "tenant-b", display_name: "A" } }, confirm: true } }
}, tenantSessionA);
assert.equal((await updateA.json()).result.structuredContent.avatar.avatar_api.owner, "user-a");

const memoryA = await tenantRequest(tokenA, { jsonrpc: "2.0", id: 15, method: "tools/call", params: { name: "avatar_memory_search", arguments: { query: "private" } } }, tenantSessionA);
const memoryB = await tenantRequest(tokenB, { jsonrpc: "2.0", id: 16, method: "tools/call", params: { name: "avatar_memory_search", arguments: { query: "private" } } }, tenantSessionB);
assert.deepEqual((await memoryA.json()).result.structuredContent.items.map(({ id }) => id), ["memory-a"]);
assert.deepEqual((await memoryB.json()).result.structuredContent.items.map(({ id }) => id), ["memory-b"]);

const crossTenantSession = await tenantRequest(tokenB, { jsonrpc: "2.0", id: 17, method: "tools/list" }, tenantSessionA);
assert.equal(crossTenantSession.status, 400);
assert.equal((await crossTenantSession.json()).error.code, -32000);

console.log("MCP gateway fixture: PASS");
