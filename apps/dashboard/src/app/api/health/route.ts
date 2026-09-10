import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json({
    product: 'NAAvOS',
    service: 'public-api',
    status: 'healthy',
    surface: 'https://naavos.radoss.agency/api',
    authenticated_avatar_data: false,
  });
}
