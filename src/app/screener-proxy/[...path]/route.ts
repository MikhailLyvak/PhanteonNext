export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UPSTREAM = 'https://pantheon-screener-service-47a52e37ec37.herokuapp.com'

// Headers from the upstream we want to surface to the client. Everything else
// (set-cookie, transfer-encoding, content-encoding, server) is dropped so it
// can't confuse the EC2 nginx in front of Next.
const PASSTHROUGH = ['content-type', 'cache-control', 'last-event-id', 'etag']

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  const search = new URL(request.url).search
  const upstreamUrl = `${UPSTREAM}/${path.map(encodeURIComponent).join('/')}${search}`

  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      accept: request.headers.get('accept') ?? '*/*',
    },
    cache: 'no-store',
    signal: request.signal,
  })

  const headers = new Headers()
  for (const name of PASSTHROUGH) {
    const v = upstream.headers.get(name)
    if (v) headers.set(name, v)
  }
  // Tell EC2 nginx not to buffer — required for SSE streams to flush.
  headers.set('x-accel-buffering', 'no')

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}
