# Deploy N-A-A-S to Cloudflare

## Prerequisites

- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`
- Node.js 18+

## Deploy MCP Server

```bash
cd naass-mcp-server

# Login to Cloudflare
wrangler login

# Configure (create wrangler.toml)
wrangler init

# Deploy
wrangler deploy
```

## wrangler.toml

```toml
name = "naass-mcp-server"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
VERSION = "1.0.0"

[[ Durable Objects]]
class = "AvatarStore"
```

## Deploy Dashboard

```bash
cd dashboard

# Build
npm run build

# Deploy to Pages
npx wrangler pages deploy .next/static --project-name=naas-dashboard
```

## Environment Variables

```bash
# In Cloudflare dashboard
NAASS_D1_DATABASE=xxx
NAASS_R2_BUCKET=xxx
NAASS_API_KEY=xxx
```

## MCP Endpoints

After deployment, your MCP server will be available at:

```
https://naass-mcp-server.your-subdomain.workers.dev/mcp/v1/
```

## CORS Configuration

Update `src/index.js` with your production domain:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://naass.io',
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