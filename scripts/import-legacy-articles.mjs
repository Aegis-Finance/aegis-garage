#!/usr/bin/env node
/**
 * Import legacy essays from Aegis-contracts/docs/articles/ into Keystatic format.
 * Run from frontend-garage/: npm run import:legacy
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GARAGE_ROOT = join(__dirname, '..')
const LEGACY_ROOT = join(GARAGE_ROOT, '..', 'Aegis-contracts', 'docs', 'articles')
const ARTICLES_DIR = join(GARAGE_ROOT, 'content', 'articles')
const CATEGORIES_DIR = join(GARAGE_ROOT, 'content', 'categories')

const MAIN_ESSAYS = [
  'freedoms-engine.md',
  'inventing-a-republic.md',
  'libertys-load-bearing-structures.md',
  'cross-border-cash-euro-pound-dollar.md',
  'sound-money-and-sovereign-coordination.md',
]

const DRAFT_ESSAYS = [
  'articles/reddit-soft-money-selective-proof.md',
  'articles/devto-draft-public-ledgers-private-lives.md',
]

function slugFromFilename(file) {
  return basename(file, '.md').replace(/_/g, '-')
}

function titleFromContent(md) {
  const match = md.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function stripTitle(md) {
  return md.replace(/^#\s+.+\n+/, '').trimStart()
}

function descriptionFromBody(body) {
  const para = body.split(/\n\n+/).find((p) => p.trim() && !p.startsWith('#'))
  if (!para) return ''
  return para.replace(/\s+/g, ' ').trim().slice(0, 200)
}

function writeCategory() {
  mkdirSync(CATEGORIES_DIR, { recursive: true })
  const path = join(CATEGORIES_DIR, 'philosophy.yaml')
  if (existsSync(path)) return
  writeFileSync(
    path,
    `name: Philosophy
description: Essays on liberty, sound money, property rights, and voluntary cooperation.
`,
  )
  console.log('Created category: philosophy')
}

function writeArticle(relPath, draft) {
  const fullPath = join(LEGACY_ROOT, relPath)
  if (!existsSync(fullPath)) {
    console.warn(`Skip missing: ${relPath}`)
    return
  }
  const raw = readFileSync(fullPath, 'utf8')
  const slug = slugFromFilename(relPath)
  const title = titleFromContent(raw) ?? slug
  const body = stripTitle(raw)
  const description = descriptionFromBody(body)
  const outDir = join(ARTICLES_DIR, slug)
  mkdirSync(outDir, { recursive: true })

  const indexPath = join(outDir, 'index.yaml')
  if (existsSync(indexPath)) {
    console.log(`Skip existing: ${slug}`)
    return
  }

  const publishDate = draft ? '2026-01-01' : '2026-07-01'
  writeFileSync(
    indexPath,
    `title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
publishDate: ${publishDate}
category: philosophy
draft: ${draft}
`,
  )
  writeFileSync(join(outDir, 'content.mdoc'), body + '\n')
  console.log(`Imported: ${slug}${draft ? ' (draft)' : ''}`)
}

mkdirSync(ARTICLES_DIR, { recursive: true })
writeCategory()

for (const file of MAIN_ESSAYS) writeArticle(file, false)
for (const file of DRAFT_ESSAYS) writeArticle(file, true)

console.log('Done.')
