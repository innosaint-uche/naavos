/**
 * NAAvOS hosted MCP gateway.
 *
 * This is intentionally a small, dependency-free Cloudflare Worker. It
 * implements the Streamable HTTP JSON-RPC surface required by MCP and keeps
 * identity, tenant scope, and persistence at the gateway boundary.
 */

const JSONRPC = "2.0";
const DEFAULT_PROTOCOL = "2025-06-18";
const SUPPORTED_PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const AVATAR_TOOL = {
  name: "avatar_get",
  description: "Read the authenticated user's approved Avatar profile.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false }
};

const MEMORY_SEARCH_TOOL = {
  name: "avatar_memory_search",
  description: "Search the authenticated user's approved Avatar memory projection.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", minLength: 1, maxLength: 500 },
      limit: { type: "integer", minimum: 1, maximum: 20, default: 5 }
    },
    required: ["query"],
    additionalProperties: false
  }
};

const UPDATE_TOOL = {
  name: "avatar_update",
  description: "Update the authenticated user's Avatar profile after explicit confirmation.",
  inputSchema: {
    type: "object",
    properties: { avatar: { type: "object" }, confirm: { type: "boolean", const: true } },
    required: ["avatar", "confirm"],
    additionalProperties: false
  }
};

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message, data) => ({
  jsonrpc: "2.0",
  id: id ?? null,
  error: { code, message, ...(data === undefined ? {} : { data }) }
});

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "https://naavos.radoss.agency")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const headers = {
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type, Accept, Mcp-Session-Id, Last-Event-ID",
    "access-control-expose-headers": "Mcp-Session-Id, WWW-Authenticate",
    vary: "Origin"
  };
  if (origin && allowedOrigins(env).includes(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

function originAllowed(request, env) {
  const origin = request.headers.get("Origin");
  return !origin || allowedOrigins(env).includes(origin);
}

function baseOrigin(request, env) {
  return String(env.OAUTH_ISSUER || new URL(request.url).origin).replace(/\/$/, "");
}

function oauthMetadata(request, env) {
  if (env.HF_OAUTH_ENABLED === "true") {
    return {
      issuer: "https://huggingface.co",
      authorization_endpoint: "https://huggingface.co/oauth/authorize",
      token_endpoint: "https://huggingface.co/oauth/token",
      registration_endpoint: "https://huggingface.co/oauth/register",
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["openid", "profile", "read-mcp", "write-avatar"],
      client_id_metadata_document_supported: true
    };
  }
  if (!env.OAUTH_ISSUER || !env.OAUTH_AUTHORIZATION_ENDPOINT || !env.OAUTH_TOKEN_ENDPOINT) return null;
  const issuer = baseOrigin(request, env);
  const authorizationEndpoint = env.OAUTH_AUTHORIZATION_ENDPOINT || `${issuer}/oauth/authorize`;
  const tokenEndpoint = env.OAUTH_TOKEN_ENDPOINT || `${issuer}/oauth/token`;
  return {
    issuer,
    authorization_endpoint: authorizationEndpoint,
    token_endpoint: tokenEndpoint,
    ...(env.OAUTH_REGISTRATION_ENDPOINT ? { registration_endpoint: env.OAUTH_REGISTRATION_ENDPOINT } : {}),
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["openid", "profile", "read-mcp", "write-avatar"],
    service_documentation: "https://naavos.radoss.agency/docs"
  };
}

function bearer(request) {
  const value = request.headers.get("Authorization") || "";
  return value.match(/^Bearer\s+([^\s]+)$/i)?.[1] || null;
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
}

async function verifyJwt(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3 || !env.JWT_SECRET) return null;
  let header;
  let claims;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
  } catch { return null; }
  if (header.alg !== "HS256" || !claims.sub || !claims.exp || Number(claims.exp) <= Math.floor(Date.now() / 1000)) return null;
  if (env.OAUTH_ISSUER && claims.iss !== env.OAUTH_ISSUER) return null;
  if (env.OAUTH_AUDIENCE && !(Array.isArray(claims.aud) ? claims.aud.includes(env.OAUTH_AUDIENCE) : claims.aud === env.OAUTH_AUDIENCE)) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!valid) return null;
  const scope = String(claims.scope || "").split(/\s+/).filter(Boolean);
  return { subject: String(claims.sub), tenantId: String(claims.tenant_id || claims.sub), scope, claims };
}

async function authenticate(request, env) {
  const token = bearer(request);
  if (token) {
    const identity = await verifyJwt(token, env);
    if (identity) return identity;
    if (env.HF_OAUTH_ENABLED === "true") {
      try {
        const response = await fetch("https://huggingface.co/api/whoami-v2", { headers: { authorization: `Bearer ${token}`, accept: "application/json" } });
        if (response.ok) {
          const profile = await response.json();
          const subject = String(profile.sub || profile.name || profile.username || "");
          if (subject) return { subject: `hf:${subject}`, tenantId: `hf:${subject}`, scope: env.HF_OAUTH_WRITE_ENABLED === "true" ? ["read-mcp", "write-avatar"] : ["read-mcp"], provider: "huggingface" };
        }
      } catch { /* fail closed below */ }
    }
  }
  if (env.NAAVOS_DEV_MODE === "true" && env.DEV_TENANT_ID) {
    return { subject: String(env.DEV_TENANT_ID), tenantId: String(env.DEV_TENANT_ID), scope: ["read-mcp", "write-avatar"], dev: true };
  }
  return null;
}

function unauthorized(request, env) {
  const metadata = `${baseOrigin(request, env)}/.well-known/oauth-authorization-server`;
  return json({ error: "unauthorized", error_description: "A valid OAuth bearer token is required." }, 401, {
    "www-authenticate": `Bearer resource_metadata="${metadata}"`
  });
}

function defaultAvatar(identity) {
  return {
    avatar_api: {
      version: "1.0",
      owner: identity.subject,
      endpoint_type: "MCP-Dynamic-Inject",
      cognitive_profile: {
        communication_style: { verbosity: "minimal", structure: "bulleted" }
      },
      strict_operational_rules: ["Execute 70% faster", "Zero fluff"]
    }
  };
}

async function loadAvatar(identity, env) {
  if (env.DB) {
    const row = await env.DB.prepare("SELECT payload FROM avatars WHERE tenant_id = ?").bind(identity.tenantId).first();
    if (row?.payload) return JSON.parse(row.payload);
    // First authenticated use provisions a private, tenant-scoped starter
    // profile. This keeps the no-code flow usable without weakening auth or
    // exposing any cross-tenant data.
    const avatar = defaultAvatar(identity);
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO avatars (tenant_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(tenant_id) DO NOTHING")
      .bind(identity.tenantId, JSON.stringify(avatar), now).run();
    const created = await env.DB.prepare("SELECT payload FROM avatars WHERE tenant_id = ?").bind(identity.tenantId).first();
    if (created?.payload) return JSON.parse(created.payload);
  }
  if (env.NAAVOS_DEV_MODE === "true") {
    return defaultAvatar(identity);
  }
  return null;
}

async function saveAvatar(identity, avatar, env) {
  if (!env.DB) throw Object.assign(new Error("Avatar persistence is not configured"), { code: -32003 });
  // The authenticated tenant is the sole owner of the persisted Avatar. Do
  // not allow client-provided payload fields to reassign ownership or create a
  // confused-deputy path across tenants.
  const persistedAvatar = avatar && typeof avatar === "object"
    ? structuredClone(avatar)
    : {};
  persistedAvatar.avatar_api = {
    ...(persistedAvatar.avatar_api && typeof persistedAvatar.avatar_api === "object" ? persistedAvatar.avatar_api : {}),
    owner: identity.subject
  };
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO avatars (tenant_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(tenant_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind(identity.tenantId, JSON.stringify(persistedAvatar), now).run();
  return { avatar: persistedAvatar, updated_at: now };
}

async function searchMemory(identity, query, limit, env) {
  if (!env.DB) return [];
  const rows = await env.DB.prepare("SELECT id, content, metadata, created_at FROM memory_items WHERE tenant_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT ?").bind(identity.tenantId, `%${query}%`, limit).all();
  return rows.results || [];
}

async function sessionFor(request, env, identity) {
  const sessionId = request.headers.get("Mcp-Session-Id");
  if (!sessionId) return null;
  if (!env.DB) return env.NAAVOS_DEV_MODE === "true" ? sessionId : null;
  const row = await env.DB.prepare("SELECT tenant_id, expires_at FROM mcp_sessions WHERE session_id = ?").bind(sessionId).first();
  if (!row || row.tenant_id !== identity.tenantId || Number(row.expires_at) <= Math.floor(Date.now() / 1000)) return null;
  return sessionId;
}

async function createSession(identity, protocolVersion, env) {
  const sessionId = crypto.randomUUID();
  if (env.DB) {
    await env.DB.prepare("INSERT INTO mcp_sessions (session_id, tenant_id, protocol_version, expires_at) VALUES (?, ?, ?, ?)").bind(sessionId, identity.tenantId, protocolVersion, Math.floor(Date.now() / 1000) + 3600).run();
  }
  return sessionId;
}

async function callTool(name, args, identity, env) {
  if (name === "avatar_get") {
    const avatar = await loadAvatar(identity, env);
    if (!avatar) throw Object.assign(new Error("No Avatar profile has been saved for this account."), { code: -32004 });
    return { content: [{ type: "text", text: JSON.stringify(avatar) }], structuredContent: { avatar } };
  }
  if (name === "avatar_memory_search") {
    if (typeof args?.query !== "string" || !args.query.trim()) throw Object.assign(new Error("query is required"), { code: -32602 });
    const items = await searchMemory(identity, args.query.trim(), Math.min(Number(args.limit || 5), 20), env);
    return { content: [{ type: "text", text: JSON.stringify({ items }) }], structuredContent: { items } };
  }
  if (name === "avatar_update") {
    if (args?.confirm !== true || !args.avatar || typeof args.avatar !== "object") throw Object.assign(new Error("avatar_update requires confirm=true and an avatar object"), { code: -32602 });
    if (!identity.scope.includes("write-avatar")) throw Object.assign(new Error("write-avatar scope is required"), { code: -32001 });
    const saved = await saveAvatar(identity, args.avatar, env);
    return { content: [{ type: "text", text: JSON.stringify(saved) }], structuredContent: saved };
  }
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
}

async function handleRpc(request, env, identity) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json(rpcError(null, -32600, "Content-Type application/json is required"), 415);
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 256 * 1024) return json(rpcError(null, -32600, "Request body is too large"), 413);
  let message;
  try { message = JSON.parse(body); } catch { return json(rpcError(null, -32700, "Parse error"), 400); }
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") return json(rpcError(message?.id, -32600, "Invalid Request"), 400);
  if (message.method === "notifications/initialized" || message.method.startsWith("notifications/")) return new Response(null, { status: 202 });
  if (message.method === "initialize") {
    const requested = String(message.params?.protocolVersion || DEFAULT_PROTOCOL);
    const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : DEFAULT_PROTOCOL;
    const sessionId = await createSession(identity, protocolVersion, env);
    return json(rpcResult(message.id, { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "naavos-avatar-gateway", version: "1.0.0" }, instructions: "Use avatar_get for read-only context. Mutations require explicit confirmation." }), 200, { "mcp-session-id": sessionId });
  }
  if (!(await sessionFor(request, env, identity))) return json(rpcError(message.id, -32000, "A valid Mcp-Session-Id is required"), 400);
  if (message.method === "ping") return json(rpcResult(message.id, {}));
  if (message.method === "tools/list") return json(rpcResult(message.id, { tools: [AVATAR_TOOL, MEMORY_SEARCH_TOOL, UPDATE_TOOL] }));
  if (message.method === "tools/call") {
    try { return json(rpcResult(message.id, await callTool(message.params?.name, message.params?.arguments || {}, identity, env))); }
    catch (error) { return json(rpcError(message.id, error.code || -32000, error.message || "Tool call failed"), 200); }
  }
  return json(rpcError(message.id, -32601, `Method not found: ${message.method}`), 200);
}

async function handleMcp(request, env) {
  if (!originAllowed(request, env)) return json({ error: "origin_not_allowed" }, 403);
  if (request.method === "GET") return json({ error: "SSE transport is not enabled; use Streamable HTTP POST." }, 405, { allow: "POST, OPTIONS" });
  if (request.method === "DELETE") {
    const identity = await authenticate(request, env);
    if (!identity) return unauthorized(request, env);
    const sessionId = request.headers.get("Mcp-Session-Id");
    if (env.DB && sessionId) await env.DB.prepare("DELETE FROM mcp_sessions WHERE session_id = ? AND tenant_id = ?").bind(sessionId, identity.tenantId).run();
    return new Response(null, { status: 204 });
  }
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, { allow: "POST, GET, DELETE, OPTIONS" });
  const identity = await authenticate(request, env);
  if (!identity) return unauthorized(request, env);
  return handleRpc(request, env, identity);
}

function protectedResourceMetadata(request, env) {
  const resource = baseOrigin(request, env) + "/mcp";
  return {
    resource,
    authorization_servers: env.HF_OAUTH_ENABLED === "true" ? ["https://huggingface.co"] : [],
    scopes_supported: ["read-mcp", "write-avatar"],
    bearer_methods_supported: ["header"]
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    if (request.method === "OPTIONS") response = new Response(null, { status: 204 });
    else if (url.pathname === "/.well-known/oauth-protected-resource") response = json(protectedResourceMetadata(request, env));
    else if (url.pathname === "/.well-known/oauth-cimd") {
      const origin = baseOrigin(request, env);
      response = json({ client_id: origin + "/.well-known/oauth-cimd", client_name: "NAAvOS Universal Avatar", redirect_uris: [origin + "/oauth/callback/huggingface"], token_endpoint_auth_method: "none", client_uri: origin });
    }
    else if (url.pathname === "/.well-known/oauth-authorization-server") {
      const metadata = oauthMetadata(request, env);
      response = metadata ? json(metadata) : json({ error: "oauth_not_configured", error_description: "OAuth issuer and endpoints must be configured before discovery is published." }, 503);
    }
    else if (url.pathname === "/health" || url.pathname === "/mcp/v1/health") response = json({ service: "NAAvOS MCP gateway", status: "healthy", protocol: "streamable-http", auth: env.HF_OAUTH_ENABLED === "true" ? "huggingface-oauth" : env.JWT_SECRET ? "jwt-configured" : "not-configured", persistence: env.DB ? "d1-configured" : "not-configured", release: env.RELEASE_SHA || "unbound" });
    else if (url.pathname === "/mcp" || url.pathname === "/mcp/v1") response = await handleMcp(request, env);
    else response = json({ error: "not_found" }, 404);
    return withCors(response, request, env);
  }
};

export { verifyJwt };
