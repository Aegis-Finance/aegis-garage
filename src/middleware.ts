import { defineMiddleware } from 'astro:middleware'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, normalize } from 'node:path'

const PUBLIC_ROOT = join(process.cwd(), 'public')

const MIME: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
}

/** Keystatic uploads land in public/ after build; SSR only ships dist/client from build time. */
function publicFileForUrl(pathname: string): string | null {
  if (!pathname.startsWith('/images/')) return null
  const rel = normalize(decodeURIComponent(pathname.slice(1)))
  if (rel.includes('..')) return null
  const full = join(PUBLIC_ROOT, rel)
  if (!full.startsWith(PUBLIC_ROOT)) return null
  return full
}

export const onRequest = defineMiddleware(async (context, next) => {
  const filePath = publicFileForUrl(new URL(context.request.url).pathname)
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return next()
  }

  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return new Response(readFileSync(filePath), {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})
