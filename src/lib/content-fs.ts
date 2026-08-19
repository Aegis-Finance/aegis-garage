import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { load as loadYaml } from 'js-yaml'
import { renderMarkdocToHtml } from './markdoc-render'

const ROOT = join(process.cwd(), 'content')

type KeystaticSlug = { slug: string; name: string }

export type ArticleMeta = {
  title: string | KeystaticSlug
  kicker?: string
  description?: string
  publishDate?: string
  category?: string
  heroImage?: string
  featured?: boolean
  draft?: boolean
}

export type CategoryMeta = {
  name: string
  description?: string
}

export type Article = {
  slug: string
  meta: ArticleMeta
  body: string
  bodyHtml: string
}

export type Category = {
  slug: string
  meta: CategoryMeta
}

function readYaml<T>(path: string): T | null {
  if (!existsSync(path)) return null
  return loadYaml(readFileSync(path, 'utf8')) as T
}

function resolveArticleTitle(
  title: ArticleMeta['title'],
  slug: string,
  body: string,
): string {
  if (typeof title === 'object' && title?.name) return title.name
  if (typeof title === 'string' && title.trim()) return title
  const h1 = body.match(/^#\s+(.+)$/m)
  return h1?.[1]?.trim() ?? slug
}

function readBody(dir: string): string {
  const indexMdoc = join(dir, 'index.mdoc')
  if (existsSync(indexMdoc)) {
    const raw = readFileSync(indexMdoc, 'utf8')
    const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)
    return match?.[1]?.trimStart() ?? raw
  }
  for (const name of ['content.mdoc', 'content.md']) {
    const path = join(dir, name)
    if (existsSync(path)) return readFileSync(path, 'utf8')
  }
  return ''
}

function readArticleMeta(dir: string, slug: string): ArticleMeta | null {
  const indexMdoc = join(dir, 'index.mdoc')
  if (existsSync(indexMdoc)) {
    const raw = readFileSync(indexMdoc, 'utf8')
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (match) return loadYaml(match[1]) as ArticleMeta
  }
  return readYaml<ArticleMeta>(join(dir, 'index.yaml'))
}

export function getCategories(): Category[] {
  const dir = join(ROOT, 'categories')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((file) => {
      const slug = file.replace(/\.yaml$/, '')
      const meta = readYaml<CategoryMeta>(join(dir, file))
      return meta ? { slug, meta } : null
    })
    .filter((c): c is Category => c !== null)
}

export function getCategoryMap(): Map<string, Category> {
  return new Map(getCategories().map((c) => [c.slug, c]))
}

export function getAllArticles(): Article[] {
  const dir = join(ROOT, 'articles')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const slug = d.name
      const dirPath = join(dir, slug)
      const meta = readArticleMeta(dirPath, slug)
      if (!meta) return null
      const body = readBody(dirPath)
      return {
        slug,
        meta: {
          ...meta,
          title: resolveArticleTitle(meta.title, slug, body),
        },
        body,
        bodyHtml: renderMarkdocToHtml(body),
      }
    })
    .filter((a): a is Article => a !== null)
}

export function getPublishedArticles(): Article[] {
  return getAllArticles()
    .filter((a) => !a.meta.draft)
    .sort(
      (a, b) =>
        new Date(b.meta.publishDate ?? 0).getTime() -
        new Date(a.meta.publishDate ?? 0).getTime(),
    )
}

export function getArticle(slug: string): Article | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getPublishedArticles().filter((a) => a.meta.category === categorySlug)
}
