import Markdoc from '@markdoc/markdoc'

const { nodes: markdocNodes, tags, Tag } = Markdoc

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
  const ast = Markdoc.parse(source)
  const content = Markdoc.transform(ast, config)
  return Markdoc.renderers.html(content)
}

export function bodyUsesMermaid(source: string): boolean {
  return /```\s*mermaid\b/m.test(source) || /class="mermaid"/.test(source)
}
