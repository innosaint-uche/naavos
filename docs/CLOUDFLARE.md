# Deploy NAAvOS to Cloudflare

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

After deployment, your MCP server will be available at:

```
https://naavos-mcp-server.your-subdomain.workers.dev/mcp/v1/
```

## CORS Configuration

Update `src/index.js` with your production domain:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://naavos.io',
  // ...
};
```

## Custom Domain

1. Go to Cloudflare Dashboard
2. Select your worker
3. Custom Domains → Add custom domain
4. Point DNS to Cloudflare

## Monitoring

```bash
# View logs
wrangler tail

# Check metrics
wrangler deployments list
```