# NAAvOS branded MCP edge route

This is a deliberately thin reverse-proxy layer for the Hostinger/Coolify VPS. The canonical MCP implementation and D1
persistence remain in the deployed Cloudflare Worker; this container only gives it the authoritative
`mcp.naavos.radoss.agency` TLS hostname.

## Deploy

From the VPS, in this directory:

```sh
docker compose up -d
docker compose ps
```

The host must already have the `coolify` Docker network and Traefik listening on ports 80/443. The `mcp.naavos` DNS
record must resolve to this VPS before Traefik can issue its certificate.

## Verify

```sh
curl -fsS https://mcp.naavos.radoss.agency/health
curl -fsS https://mcp.naavos.radoss.agency/.well-known/oauth-authorization-server
```

Do not point clients at `api.naavos.io` or the Worker URL after the branded route has passed its authenticated MCP
conformance and tenant-isolation tests.
