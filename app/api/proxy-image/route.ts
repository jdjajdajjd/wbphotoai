export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/proxy-image?url=...
 * Proxies a remote image to bypass CORS. Used for canvas compositing.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  // Only allow known trusted domains
  const allowed = [
    'kie.ai',
    'kieai.erweima.ai',
    'supabase.co',
    'supabase.in',
    'cdn.kie.ai',
  ]
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!allowed.some(d => hostname === d || hostname.endsWith('.' + d))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 })
    }
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') ?? 'image/png'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
