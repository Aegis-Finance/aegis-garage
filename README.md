# Aegis Garage

Public article site for [garage.aegisprotocol.org](https://garage.aegisprotocol.org) — essays and research from the Aegis team.

## Stack

- **Astro 5** — static magazine layout
- **Keystatic** — GitHub-authenticated admin at `/keystatic`
- **Pagefind** — client-side search
- **Tailwind CSS** — Aegis brand styling

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:4321](http://localhost:4321). Admin UI: [http://localhost:4321/keystatic](http://localhost:4321/keystatic) (local storage mode).

## Build

```bash
npm run build
```

Output: `dist/` (includes Pagefind index).

## Cloudflare Pages

| Setting | Value |
|---------|-------|
| Project | `aegis-garage` |
| Root directory | `frontend-garage` (or repo root if standalone mirror) |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Node | 22 |

**Custom domain:** `garage.aegisprotocol.org`

### Keystatic GitHub mode (production admin)

1. Create a [GitHub OAuth App](https://github.com/settings/developers):
   - Homepage URL: `https://garage.aegisprotocol.org`
   - Callback URL: `https://garage.aegisprotocol.org/keystatic/api/github/oauth/callback`
2. Set Cloudflare Pages environment variables:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_GITHUB_REPO` — e.g. `Aegis-Finance/aegis-garage`

## Publishing workflow

1. Go to `https://garage.aegisprotocol.org/keystatic`
2. Sign in with GitHub
3. Create categories, then articles (title, category, optional `.webp` hero, markdown body with links)
4. Publish — commits to `main`, Cloudflare rebuilds automatically

## Import legacy essays

One-time import from `Aegis-contracts/docs/articles/`:

```bash
npm run import:legacy
```

See `docs/ops/frontends_clouadflare.md` for the full five-site cross-link checklist.
