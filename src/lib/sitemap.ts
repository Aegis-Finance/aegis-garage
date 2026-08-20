import { getCategories, getPublishedArticles } from './content-fs'
import { GARAGE } from './site'

type SitemapEntry = {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: string
}

function isoDate(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function latestContentDate(dates: string[]): string {
  const today = new Date().toISOString().slice(0, 10)
  if (dates.length === 0) return today
  return dates.reduce((max, d) => (d > max ? d : max), today)
}

/** Live sitemap — new Keystatic articles appear on the next crawl without redeploy. */
export function buildGarageSitemapEntries(): SitemapEntry[] {
  const articles = getPublishedArticles()
  const categories = getCategories()
  const articleDates = articles.map((a) => isoDate(a.meta.publishDate))
  const feedLastmod = latestContentDate(articleDates)

  const entries: SitemapEntry[] = [
    {
      loc: `${GARAGE}/`,
      lastmod: feedLastmod,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: `${GARAGE}/search`,
      lastmod: feedLastmod,
      changefreq: 'weekly',
      priority: '0.4',
    },
  ]

  for (const category of categories) {
    entries.push({
      loc: `${GARAGE}/category/${category.slug}`,
      lastmod: feedLastmod,
      changefreq: 'daily',
      priority: '0.7',
    })
  }

  for (const article of articles) {
    entries.push({
      loc: `${GARAGE}/articles/${article.slug}`,
      lastmod: isoDate(article.meta.publishDate),
      changefreq: 'weekly',
      priority: '0.8',
    })
  }

  return entries
}

export function renderGarageSitemapXml(): string {
  const entries = buildGarageSitemapEntries()
  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`
}
