import { NextRequest, NextResponse } from 'next/server';
import { getApiOrigin } from '@/lib/utils/api-url';

export async function GET(request: NextRequest) {
  const upstream = new URL(`${getApiOrigin()}/api/v1/auth/me`);
  const cookie = request.headers.get('cookie');

  const response = await fetch(upstream.toString(), {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    },
  });
}
