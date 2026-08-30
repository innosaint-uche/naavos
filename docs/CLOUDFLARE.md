# Deploy NAAvOS to Cloudflare

> **Important:** This is a deployment guide, not deployment evidence. Do not
> publish or configure an endpoint until DNS, TLS, exact routing, MCP protocol,
> OAuth, tenant isolation, and release identity have passed live checks.

## Ownership boundary

This document describes the existing NAAS operator deployment and is not a
prerequisite for the open-source Universal Avatar or for an individual user.
The current NAAS route uses the maintainer's Hostinger/Coolify and Cloudflare
accounts. A user who chooses an online Avatar should deploy an isolated copy
into the user's own Cloudflare account, VPS, or other supported host; the user
owns that domain, storage, credentials, and operating cost. Local mode needs
none of these services.

The future no-code provisioning surface should collect the user's hosting
choice and open that provider's authorization flow. It must never silently
deploy into the maintainer's accounts or make the NAAS-managed route a hidden
dependency.

## Current routing decision

- `https://naavos.radoss.agency` is the existing public dashboard surface.
- The verified hosted MCP endpoint is
  `https://naavos-mcp.innosaint-uche.workers.dev/mcp`.
- `https://mcp.naavos.radoss.agency/mcp` is the verified branded route. Hostinger
  authoritative DNS points to the Coolify VPS, which terminates TLS and uses a
  thin Caddy proxy to the canonical Worker.
- The verified hosted MCP surface is `https://mcp.naavos.radoss.agency/mcp`.
- No ordinary public REST API is certified by this release evidence; do not
  invent or advertise an `api.naavos.radoss.agency` endpoint.
- `https://api.naavos.io/mcp/v1` is retired and unresolved; do not configure
  it.

The standards-based Worker remains deployed at this implementation/test origin:

```text
https://naavos-mcp.innosaint-uche.workers.dev/mcp
```

For the current NAAS architecture, the public dashboard remains on the
existing Hostinger/Coolify origin while the standards-compliant MCP service is
deployed as a Cloudflare Worker with D1 persistence. The branded route is
publicly reachable through the existing edge proxy; the Worker origin is not
the user-facing connector URL.

## Prerequisites

- Cloudflare account
- Wrangler CLI: `pnpm add -g wrangler`
- Node.js 22+

## Deploy MCP Server

```bash
cd apps/mcp-server

# Login to Cloudflare
wrangler login

# Configure (create wrangler.toml)
wrangler init

# Deploy
wrangler deploy
```

## wrangler.toml

```toml
name = "naavos-mcp-server"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
VERSION = "1.0.0"

[[ Durable Objects]]
class = "AvatarStore"
```

## Deploy Dashboard

```bash
cd apps/dashboard

# Build
pnpm run build

# Deploy to Pages
npx wrangler pages deploy .next/static --project-name=naavos-dashboard
```

## Environment Variables

```bash
# In Cloudflare dashboard
NAAVOS_D1_DATABASE=xxx
NAAVOS_R2_BUCKET=xxx
NAAVOS_API_KEY=xxx
```

## MCP Endpoints

After the authoritative Cloudflare account owns the zone, use a Worker Custom
Domain, not a raw CNAME, and verify the branded MCP server at:

```
https://mcp.naavos.radoss.agency/mcp
```

Do not recreate an accidental MCP CNAME or use any retired route. The branded
NAAS route is the user-facing connector for this operator deployment; a
user-owned deployment must use the user's own verified hostname. The Worker
URL is kept only as an implementation/test origin.

## CORS Configuration

Update `src/index.js` with your production domain:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://naavos.radoss.agency',
  // ...
};
```

## Custom Domain

1. Confirm `radoss.agency` appears in the Cloudflare account that deploys `naavos-mcp`.
2. Select the Worker and add `mcp.naavos.radoss.agency` under Custom Domains.
3. Remove any conflicting CNAME before creating the Custom Domain.
4. Let Cloudflare provision DNS and TLS.
5. Verify DNS, TLS, `/health`, OAuth discovery, MCP conformance, and release identity.

## Monitoring

```bash
# View logs
wrangler tail

# Check metrics
wrangler deployments list
```
