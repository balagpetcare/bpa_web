import { NextRequest, NextResponse } from 'next/server';
import { getApiOrigin } from '@/lib/utils/api-url';

export async function GET(request: NextRequest) {
  const flowId = request.nextUrl.searchParams.get('flowId');
  const completion = request.nextUrl.searchParams.get('completion');

  if (!flowId || !completion) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing popup completion parameters.' } },
      { status: 400 },
    );
  }

  const upstream = new URL(`${getApiOrigin()}/api/v1/auth/central-auth/popup/completion`);
  upstream.searchParams.set('flowId', flowId);
  upstream.searchParams.set('completion', completion);

  const response = await fetch(upstream.toString(), {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
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
