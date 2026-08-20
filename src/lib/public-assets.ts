import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from 'node:fs'
import { dirname, join, normalize } from 'node:path'

const PUBLIC_ROOT = join(process.cwd(), 'public')
const CLIENT_ROOT = join(process.cwd(), 'dist/client')

export function publicFileRel(publicPath: string): string | null {
  const normalized = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const rel = normalize(normalized)
  if (!rel || rel.includes('..')) return null
  return rel
}

export function publicFilePath(publicPath: string): string | null {
  const rel = publicFileRel(publicPath)
  if (!rel) return null
  const full = join(PUBLIC_ROOT, rel)
  if (!full.startsWith(PUBLIC_ROOT)) return null
  return full
}

/** Mirror Keystatic uploads into dist/client so the SSR static handler can serve them too. */
export function mirrorPublicAsset(publicPath: string): void {
  const rel = publicFileRel(publicPath)
  const source = rel ? join(PUBLIC_ROOT, rel) : null
  if (!source || !existsSync(source) || !statSync(source).isFile()) return

  const dest = join(CLIENT_ROOT, rel!)
  try {
    mkdirSync(dirname(dest), { recursive: true })
    if (!existsSync(dest) || statSync(source).mtimeMs > statSync(dest).mtimeMs) {
      copyFileSync(source, dest)
    }
  } catch {
    /* best-effort */
  }
}

/** Cache-bust browser 404s; mirror file when present on disk. */
export function resolvePublicAsset(publicPath: string): string {
  const normalized = publicPath.startsWith('/') ? publicPath : `/${publicPath}`
  const filePath = publicFilePath(normalized)
  if (!filePath || !existsSync(filePath)) return normalized

  mirrorPublicAsset(normalized)
  const version = Math.floor(statSync(filePath).mtimeMs)
  return `${normalized}?v=${version}`
}

export function readPublicAsset(publicPath: string): Uint8Array | null {
  const filePath = publicFilePath(publicPath)
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) return null
  mirrorPublicAsset(publicPath)
  return new Uint8Array(readFileSync(filePath))
}
