import Markdoc from '@markdoc/markdoc'

const { nodes: markdocNodes, tags, Tag } = Markdoc

const HOST_LABELS: Record<string, string> = {
  'taxation-customs.ec.europa.eu': 'DG TAXUD',
  'eur-lex.europa.eu': 'EUR-Lex',
  'ecb.europa.eu': 'ECB',
  'legislation.gov.uk': 'UK legislation',
  'gov.uk': 'GOV.UK',
  'nationalcrimeagency.gov.uk': 'NCA',
  'cbp.gov': 'U.S. CBP',
  'home.treasury.gov': 'U.S. Treasury',
  'unodc.org': 'UNODC',
  'fatf-gafi.org': 'FATF',
  'anti-fraud.ec.europa.eu': 'OLAF',
}

function linkLabelFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')

    for (const [domain, label] of Object.entries(HOST_LABELS)) {
      if (host === domain || host.endsWith(`.${domain}`)) return label
    }

    const file = decodeURIComponent(u.pathname.split('/').pop() ?? '')
    if (file.endsWith('.pdf')) {
      const name = file
        .replace(/\.pdf$/i, '')
        .replace(/[-_%20]+/g, ' ')
        .trim()
      if (name.length > 0 && name.length <= 72) return name
      if (name.length > 72) return `${name.slice(0, 69)}…`
    }

    return host
  } catch {
    return 'Link'
  }
}

/** Legacy imports used `url` in backticks — convert to Markdoc links for the public site. */
export function preprocessMarkdocSource(source: string): string {
  let out = source.replace(
    /Link:\s*`(https?:\/\/[^`]+)`/gi,
    (_match, url: string) => `Link: [Link](${url})`,
  )

  out = out.replace(/`((https?:\/\/)[^`]+)`/g, (_match, url: string) => {
    return `[${linkLabelFromUrl(url)}](${url})`
  })

  return out
}

const nodes = {
  ...markdocNodes,
  link: {
    ...markdocNodes.link,
    transform(node, config) {
      const href = String(node.attributes.href ?? '')
      const attributes = node.transformAttributes(config)
      if (href.startsWith('http')) {
        attributes.target = '_blank'
        attributes.rel = 'noopener noreferrer'
      }
      return new Tag('a', attributes, node.transformChildren(config))
    },
  },
  fence: {
    ...markdocNodes.fence,
    transform(node, config) {
      const language = String(node.attributes.language ?? '')
      const attributes = node.transformAttributes(config)
      const children = node.children.length
        ? node.transformChildren(config)
        : [node.attributes.content]

      if (language === 'mermaid') {
        delete attributes['data-language']
        return new Tag('pre', { ...attributes, class: 'mermaid' }, children)
      }

      return new Tag('pre', attributes, children)
    },
  },
}

const config = { nodes, tags }

export function renderMarkdocToHtml(source: string): string {
  if (!source.trim()) return ''
  const prepared = preprocessMarkdocSource(source)
  const ast = Markdoc.parse(prepared)
  const content = Markdoc.transform(ast, config)
  return Markdoc.renderers.html(content)
}

export function bodyUsesMermaid(source: string): boolean {
  return /```\s*mermaid\b/m.test(source) || /class="mermaid"/.test(source)
}
