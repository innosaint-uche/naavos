import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const mcpUrl = 'https://mcp.naavos.radoss.agency/mcp';

export function GET() {
  return NextResponse.json({
    product: 'NAAvOS',
    service: 'hosted-mcp-discovery',
    protocol: 'Model Context Protocol',
    canonical_endpoint: mcpUrl,
    health: 'https://mcp.naavos.radoss.agency/health',
    oauth_protected_resource:
      'https://mcp.naavos.radoss.agency/.well-known/oauth-protected-resource/mcp',
    oauth_authorization_server:
      'https://mcp.naavos.radoss.agency/.well-known/oauth-authorization-server',
    notes: [
      'Use the hosted MCP endpoint for authenticated Avatar access.',
      'The public API discovery surface does not expose private Avatar data.',
      'Do not use https://api.naavos.io/mcp/v1.',
    ],
  });
}
