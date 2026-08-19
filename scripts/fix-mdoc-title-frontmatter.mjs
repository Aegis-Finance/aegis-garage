#!/usr/bin/env node
/** Keystatic slug fields serialize as a plain string (name) in frontmatter, not { slug, name }. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml, dump as dumpYaml } from 'js-yaml'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'articles')

for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const path = join(ROOT, dir.name, 'index.mdoc')
  const raw = readFileSync(path, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    console.warn(`Skip (no frontmatter): ${dir.name}`)
    continue
  }

  const meta = loadYaml(match[1])
  const body = match[2]

  if (typeof meta.title === 'object' && meta.title && 'name' in meta.title) {
    meta.title = meta.title.name
  }

  const frontmatter = dumpYaml(meta, {
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
  }).trimEnd()

  writeFileSync(path, `---\n${frontmatter}\n---\n\n${body.trimStart()}`)
  console.log(`Fixed title frontmatter: ${dir.name}`)
}
