# Graph Report - frontend-garage  (2026-08-19)

## Corpus Check
- 15 files · ~2,664 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 89 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f04f37bd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ../layouts/BaseLayout.astro
- import-legacy-articles.mjs
- dependencies
- package.json
- Aegis Garage
- devDependencies
- [slug].astro
- compilerOptions

## God Nodes (most connected - your core abstractions)
1. `../layouts/BaseLayout.astro` - 8 edges
2. `Aegis Garage` - 7 edges
3. `scripts` - 5 edges
4. `writeArticle()` - 5 edges
5. `../components/SiteNav.astro` - 5 edges
6. `../components/ArticleCard.astro` - 4 edges
7. `compilerOptions` - 3 edges
8. `slugFromFilename()` - 2 edges
9. `titleFromContent()` - 2 edges
10. `stripTitle()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "../layouts/BaseLayout.astro"
Cohesion: 0.12
Nodes (12): ../lib/content-fs, ../lib/site, ../styles/global.css, ../components/ArticleCard.astro, ../components/SiteNav.astro, categories, ../layouts/BaseLayout.astro, article (+4 more)

### Community 1 - "import-legacy-articles.mjs"
Cohesion: 0.19
Nodes (12): ARTICLES_DIR, CATEGORIES_DIR, descriptionFromBody(), __dirname, DRAFT_ESSAYS, GARAGE_ROOT, LEGACY_ROOT, MAIN_ESSAYS (+4 more)

### Community 2 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, astro, @astrojs/cloudflare, @astrojs/markdoc, @astrojs/react, js-yaml, @keystatic/astro, @keystatic/core (+3 more)

### Community 3 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, import:legacy, preview, type (+1 more)

### Community 4 - "Aegis Garage"
Cohesion: 0.22
Nodes (8): Aegis Garage, Build, Cloudflare Pages, Import legacy essays, Keystatic GitHub mode (production admin), Local development, Publishing workflow, Stack

### Community 5 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, @astrojs/tailwind, autoprefixer, pagefind, tailwindcss, @tailwindcss/typography, typescript

### Community 6 - "[slug].astro"
Cohesion: 0.40
Nodes (3): articles, category, categoryMap

### Community 7 - "compilerOptions"
Cohesion: 0.40
Nodes (4): compilerOptions, jsx, jsxImportSource, extends

## Knowledge Gaps
- **50 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `../layouts/BaseLayout.astro` connect `../layouts/BaseLayout.astro` to `[slug].astro`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `../layouts/BaseLayout.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._