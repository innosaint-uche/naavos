import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const dashboardUrl = 'https://naavos.radoss.agency';
const apiUrl = `${dashboardUrl}/api`;
const mcpUrl = 'https://mcp.naavos.radoss.agency/mcp';
const betaReleaseUrl =
  'https://github.com/innosaint-uche/radoss-universal-avatar/releases/tag/v0.2.0-beta.1';

export function GET() {
  return NextResponse.json({
    product: 'NAAvOS',
    service: 'public-api-discovery',
    status: 'public-development-beta',
    authenticated_avatar_data: false,
    routes: {
      dashboard: dashboardUrl,
      public_api: apiUrl,
      health: `${apiUrl}/health`,
      mcp_discovery: `${apiUrl}/mcp`,
      hosted_mcp: mcpUrl,
    },
    distribution: {
      beta_release: betaReleaseUrl,
      signed_customer_release: 'not_yet_verified',
    },
    ownership_model: {
      local: 'User-owned local Avatar. No NAAvOS hosting account required.',
      hosted: 'User-owned or operator-owned hosting must be declared by the selected setup path.',
      mcp: 'Authenticated MCP access is handled by the hosted MCP gateway.',
    },
    retired_routes: [
      {
        url: 'https://api.naavos.io/mcp/v1',
        reason: 'unresolved retired assumption; do not configure clients to use it',
      },
    ],
  });
}
