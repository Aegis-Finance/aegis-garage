#!/usr/bin/env node
/** Merge index.yaml + content.mdoc into Keystatic-compatible index.mdoc (frontmatter + body). */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dump as dumpYaml } from 'js-yaml'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'articles')

for (const dir of readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const slug = dir.name
  const dirPath = join(ROOT, slug)
  const indexMdoc = join(dirPath, 'index.mdoc')
  if (existsSync(indexMdoc)) {
    console.log(`Skip (already migrated): ${slug}`)
    continue
  }

  const yamlPath = join(dirPath, 'index.yaml')
  const bodyPath = join(dirPath, 'content.mdoc')
  if (!existsSync(yamlPath) || !existsSync(bodyPath)) {
    console.warn(`Skip missing files: ${slug}`)
    continue
  }

  const metaYaml = readFileSync(yamlPath, 'utf8').trimEnd()
  const body = readFileSync(bodyPath, 'utf8').trimStart()
  const merged = `---\n${metaYaml}\n---\n\n${body}`
  writeFileSync(indexMdoc, merged.endsWith('\n') ? merged : merged + '\n')

  unlinkSync(yamlPath)
  unlinkSync(bodyPath)
  console.log(`Migrated: ${slug}`)
}
