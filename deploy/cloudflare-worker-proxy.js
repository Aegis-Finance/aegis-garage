/**
 * Cloudflare Worker — reverse proxy to VPS Node app on port 4321.
 * Route: garage.aegisprotocol.org/*
 *
 * Rewrites origin URLs in redirects so Keystatic OAuth uses the public hostname
 * (Node sees origin-garage host because fetch cannot spoof Host to a different DNS name).
 */
const ORIGIN = 'http://origin-garage.aegisprotocol.org:4321'
const PUBLIC_HOST = 'garage.aegisprotocol.org'
const ORIGIN_HOST = 'origin-garage.aegisprotocol.org:4321'
const PUBLIC_BASE = `https://${PUBLIC_HOST}`
const ORIGIN_BASE = `http://${ORIGIN_HOST}`

function rewritePublicUrl(value) {
  if (!value || !value.includes('origin-garage.aegisprotocol.org')) {
    return value
  }

  return value
    .replaceAll(ORIGIN_BASE, PUBLIC_BASE)
    .replaceAll(encodeURIComponent(ORIGIN_BASE), encodeURIComponent(PUBLIC_BASE))
    .replaceAll(`//${ORIGIN_HOST}`, `//${PUBLIC_HOST}`)
    .replaceAll(encodeURIComponent(`//${ORIGIN_HOST}`), encodeURIComponent(`//${PUBLIC_HOST}`))
}

function rewriteOAuthLocation(location) {
  let loc = rewritePublicUrl(location)
  if (!loc?.includes('github.com/login/oauth/authorize')) return loc

  try {
    const url = new URL(loc)
    if (!url.searchParams.has('scope')) {
      url.searchParams.set('scope', 'public_repo')
    }
    return url.toString()
  } catch {
    return loc
  }
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url)
    const target = new URL(incoming.pathname + incoming.search, ORIGIN)

    const headers = new Headers(request.headers)
    headers.delete('Host')
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

    const location = outHeaders.get('Location')
    if (location) {
      outHeaders.set('Location', rewriteOAuthLocation(location))
    }

    for (const [key, value] of outHeaders.entries()) {
      if (key.toLowerCase() === 'set-cookie' && value.includes('origin-garage.aegisprotocol.org')) {
        outHeaders.set(key, rewritePublicUrl(value))
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    })
  },
}
