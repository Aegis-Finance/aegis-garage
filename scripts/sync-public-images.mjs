import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const src = join(process.cwd(), 'public', 'images')
const dest = join(process.cwd(), 'dist', 'client', 'images')

if (!existsSync(src)) {
  process.exit(0)
}

function copyTree(from, to) {
  mkdirSync(to, { recursive: true })
  for (const name of readdirSync(from)) {
    const sourcePath = join(from, name)
    const destPath = join(to, name)
    if (statSync(sourcePath).isDirectory()) {
      copyTree(sourcePath, destPath)
    } else {
      cpSync(sourcePath, destPath)
    }
  }
}

copyTree(src, dest)
console.log('Synced public/images → dist/client/images')
