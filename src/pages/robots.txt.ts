import type { APIRoute } from 'astro'
import { GARAGE } from '../lib/site'

export const prerender = false

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

# Essays update often — sitemap lists every published article on each request.
Sitemap: ${GARAGE}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
