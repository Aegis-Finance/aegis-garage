# Aegis Garage

Public article site for [garage.aegisprotocol.org](https://garage.aegisprotocol.org) — essays and research from the Aegis team.

## Stack

- **Astro 5** — magazine layout (prerendered public pages)
- **Keystatic** — GitHub-authenticated admin at `/keystatic`
- **Pagefind** — client-side search
- **Tailwind CSS** — Aegis brand styling
- **Node.js + nginx** — production hosting on VPS

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:4321](http://localhost:4321). Admin UI: [http://localhost:4321/keystatic](http://localhost:4321/keystatic) (local storage mode, no GitHub login).

## Build

```bash
npm run build
npm start
```

Output: `dist/client/` (static pages + Pagefind index), `dist/server/` (Node entry).

## Production (VPS)

| Setting | Value |
|---------|-------|
| Server | VPS with Node 22, nginx, certbot |
| App path | `/var/www/aegis-garage` |
| systemd | `aegis-garage.service` |
| Domain | `garage.aegisprotocol.org` |

### Keystatic GitHub mode (production admin)

1. Create a [GitHub OAuth App](https://github.com/settings/developers):
   - Homepage URL: `https://garage.aegisprotocol.org`
   - Authorization callback URL: `https://garage.aegisprotocol.org/api/keystatic/github/oauth/callback`
2. Copy `.env.example` to `.env` on the server and set:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET` — generate with `openssl rand -base64 32` (min 32 chars)

### Deploy

```bash
bash deploy/deploy.sh
```

First-time server setup: `bash deploy/bootstrap-vps.sh` (see `deploy/` for nginx + systemd configs).

## Publishing workflow

1. Go to `https://garage.aegisprotocol.org/keystatic`
2. Sign in with GitHub
3. Create categories, then articles (title, kicker, category, optional `.webp` hero, body with links)
4. Publish — commits to `main`, then run `deploy/deploy.sh` on the VPS (or set up a GitHub webhook later)

## Import legacy essays

One-time import from `Aegis-contracts/docs/articles/`:

```bash
npm run import:legacy
```

## Related repo

Standalone mirror of the monorepo `frontend-garage/` folder. See `SIBLING_REPO.md` in the Aegis monorepo for cross-links.
