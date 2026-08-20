import { defineMiddleware } from 'astro:middleware'
import { existsSync, statSync } from 'node:fs'
import { publicFilePath, readPublicAsset } from './lib/public-assets'

const MIME: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname
  if (!pathname.startsWith('/images/')) return next()

  const filePath = publicFilePath(pathname)
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return next()
  }

  const body = readPublicAsset(pathname)
  if (!body) return next()

  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return new Response(body, {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})
