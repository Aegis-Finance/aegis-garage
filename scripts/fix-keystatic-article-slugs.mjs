#!/usr/bin/env node
/** One-time fix: legacy imports used human titles in slug field; Keystatic expects { slug, name }. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml, dump as dumpYaml } from 'js-yaml'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'articles')

for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const slug = dir.name
  const indexPath = join(ROOT, slug, 'index.yaml')
  const meta = loadYaml(readFileSync(indexPath, 'utf8'))
  const currentTitle = meta.title

  if (typeof currentTitle === 'object' && currentTitle?.slug) {
    console.log(`Skip (already fixed): ${slug}`)
    continue
  }

  if (typeof currentTitle !== 'string') {
    console.warn(`Skip unexpected title in ${slug}`)
    continue
  }

  meta.title = { slug, name: currentTitle }
  writeFileSync(
    indexPath,
    dumpYaml(meta, { lineWidth: 120, quotingType: '"', forceQuotes: false }).trimEnd() + '\n',
  )
  console.log(`Fixed: ${slug}`)
}
