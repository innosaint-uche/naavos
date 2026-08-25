# NAAvOS API Reference

> **Deployment status — 2026-08-25:** The public website is live at
> `https://naavos.radoss.agency`. The standards-based MCP gateway is deployed,
> OAuth-authenticated, and conformance-tested at the branded route below.

## Canonical route policy

- Public web/dashboard: `https://naavos.radoss.agency`
- Hosted Worker implementation origin: `https://naavos-mcp.innosaint-uche.workers.dev/mcp`
- Branded hosted MCP: `https://mcp.naavos.radoss.agency/mcp` (user-facing canonical route)
- No ordinary public REST API endpoint is certified by the current release
  evidence. Use the verified Streamable HTTP MCP gateway instead:
  `https://mcp.naavos.radoss.agency/mcp`.
- Retired/unresolved URL: `https://api.naavos.io/mcp/v1` (**do not use**)

## MCP Server Endpoints

### Standards-based Streamable HTTP gateway

```
/mcp
```

The gateway implements `initialize`, `notifications/initialized`, `ping`,
`tools/list`, `tools/call`, session identifiers, structured JSON-RPC errors,
strict browser-origin checks, and tenant-scoped Avatar persistence through D1.

Available tools:

- `avatar_get` — read the authenticated Avatar projection.
- `avatar_memory_search` — search the authenticated memory projection.
- `avatar_update` — mutation requiring `confirm: true` and `write-avatar` scope.

### Authentication

The hosted Worker uses Hugging Face OAuth/OpenID as the current browser login
provider. Clients discover it from:

```
GET /.well-known/oauth-protected-resource
GET /.well-known/oauth-authorization-server
```

The old `X-NAAVOS-User-ID` header is not accepted as authorization.

## Protocol calls

Send JSON-RPC 2.0 to `POST /mcp` with `Content-Type: application/json` and a
Bearer token obtained through the advertised OAuth flow.

Lifecycle:

1. `initialize` — the response supplies `Mcp-Session-Id`.
2. `notifications/initialized` — send with the session header.
3. `tools/list` — discover the scoped tools.
4. `tools/call` — invoke a tool with the same session header.
5. `DELETE /mcp` — revoke the session.

The legacy REST-like `/mcp/v1/load`, `/mcp/v1/sync`, and `/mcp/v1/avatar`
prototype routes are not the public contract and must not be used by hosted
clients.
