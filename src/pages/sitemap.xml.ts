import type { APIRoute } from 'astro'
import { renderGarageSitemapXml } from '../lib/sitemap'

export const prerender = false

export const GET: APIRoute = () => {
  return new Response(renderGarageSitemapXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
