export const HOME = 'https://aegisprotocol.org'
export const GARAGE = 'https://garage.aegisprotocol.org'
export const DOCS = 'https://doc.aegisprotocol.org'
export const APP = 'https://app.aegisprotocol.org'
export const TGE = 'https://tge.aegisprotocol.org'

export const SITE_LINKS = [
  { label: 'Home', href: HOME },
  { label: 'Garage', href: GARAGE },
  { label: 'Docs', href: DOCS },
  { label: 'App', href: APP },
  { label: 'Sale', href: TGE },
] as const

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function excerpt(text: string, max = 160): string {
  const plain = text.replace(/\s+/g, ' ').trim()
  if (plain.length <= max) return plain
  return `${plain.slice(0, max).trim()}…`
}
