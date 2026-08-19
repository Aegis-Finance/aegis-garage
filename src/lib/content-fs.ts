import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { load as loadYaml } from 'js-yaml'
import { Marked } from 'marked'

const renderer = {
  link({ href, text }: { href: string; text: string }) {
    const isExternal = href.startsWith('http')
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${href}"${attrs}>${text}</a>`
  },
}

const marked = new Marked({ breaks: false, gfm: true, renderer })

const ROOT = join(process.cwd(), 'content')

export type ArticleMeta = {
  title: string
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

function readBody(dir: string): string {
  for (const name of ['content.mdoc', 'content.md']) {
    const path = join(dir, name)
    if (existsSync(path)) return readFileSync(path, 'utf8')
  }
  return ''
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
      const meta = readYaml<ArticleMeta>(join(dir, slug, 'index.yaml'))
      if (!meta) return null
      const body = readBody(join(dir, slug))
      return {
        slug,
        meta,
        body,
        bodyHtml: marked.parse(body, { async: false }) as string,
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
