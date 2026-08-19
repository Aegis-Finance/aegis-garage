import type { APIRoute } from 'astro'
import { getSearchIndex } from '../../lib/search-index'

export const prerender = false

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getSearchIndex()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
