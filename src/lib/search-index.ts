import { getCategoryMap, getPublishedArticles } from './content-fs'

export type SearchIndexEntry = {
  slug: string
  title: string
  description: string
  kicker: string
  category: string | null
  categoryName: string | null
  publishDate: string | null
  excerpt: string
  url: string
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerpt(body: string, max = 220): string {
  const plain = stripMarkdown(body)
  if (plain.length <= max) return plain
  return `${plain.slice(0, max).trimEnd()}…`
}

export function getSearchIndex(): SearchIndexEntry[] {
  const categoryMap = getCategoryMap()
  return getPublishedArticles().map((article) => {
    const title =
      typeof article.meta.title === 'string'
        ? article.meta.title
        : String(article.meta.title)
    const cat = article.meta.category ? categoryMap.get(article.meta.category) : null
    return {
      slug: article.slug,
      title,
      description: article.meta.description?.trim() ?? '',
      kicker: article.meta.kicker?.trim() ?? '',
      category: article.meta.category ?? null,
      categoryName: cat?.meta.name ?? null,
      publishDate: article.meta.publishDate ?? null,
      excerpt: excerpt(article.body),
      url: `/articles/${article.slug}/`,
    }
  })
}

export function searchIndex(entries: SearchIndexEntry[], query: string): SearchIndexEntry[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
  if (!terms.length) return entries

  return entries
    .map((entry) => {
      const haystack = [
        entry.title,
        entry.description,
        entry.kicker,
        entry.categoryName ?? '',
        entry.excerpt,
        entry.slug.replace(/-/g, ' '),
      ]
        .join(' ')
        .toLowerCase()

      let score = 0
      for (const term of terms) {
        if (!haystack.includes(term)) return { entry, score: 0 }
        if (entry.title.toLowerCase().includes(term)) score += 12
        if (entry.description.toLowerCase().includes(term)) score += 8
        if (entry.kicker.toLowerCase().includes(term)) score += 6
        if (entry.excerpt.toLowerCase().includes(term)) score += 2
        score += 1
      }
      return { entry, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.entry)
}
