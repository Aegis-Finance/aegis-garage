/**
 * Cloudflare Worker — reverse proxy to VPS Node app on port 4321.
 * Route: garage.aegisprotocol.org/*
 */
const ORIGIN = 'http://origin-garage.aegisprotocol.org:4321'

export default {
  async fetch(request) {
    const incoming = new URL(request.url)
    const target = new URL(incoming.pathname + incoming.search, ORIGIN)
    target.protocol = 'http:'

    const headers = new Headers(request.headers)
    headers.set('Host', incoming.host)
    headers.set('X-Forwarded-Host', incoming.host)
    headers.set('X-Forwarded-Proto', 'https')
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '')
    headers.set('Forwarded', `host=${incoming.host};proto=https`)

    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body
    }

    const response = await fetch(target.toString(), init)
    const outHeaders = new Headers(response.headers)
    outHeaders.delete('content-encoding')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    })
  },
}
