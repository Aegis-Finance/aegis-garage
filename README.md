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

Keystatic requires a **GitHub App** (with Contents read/write), not a classic OAuth App. A classic OAuth App can log you in but cannot read or write repo content (`public_repo` scope missing).

**One-time setup (recommended):**

1. On your machine, temporarily remove `KEYSTATIC_GITHUB_CLIENT_ID` and `KEYSTATIC_GITHUB_CLIENT_SECRET` from `.env`.
2. Run `npm run dev` and open [http://localhost:4321/keystatic/setup](http://localhost:4321/keystatic/setup).
3. Enter deployed URL `https://garage.aegisprotocol.org` and org `Aegis-Finance`, then **Create GitHub App**.
4. Install the app on `Aegis-Finance/aegis-garage` (all repositories or selected).
5. Copy from the generated `.env` to the VPS `/var/www/aegis-garage/.env`:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
6. Restart: `sudo systemctl restart aegis-garage`

**Manual GitHub App** (if setup UI is unavailable): create at GitHub → Developer settings → GitHub Apps with:

- Callback: `https://garage.aegisprotocol.org/api/keystatic/github/oauth/callback`
- Permissions: Contents **Read and write**, Metadata **Read-only**, Pull requests **Read-only**
- Request user authorization (OAuth) during installation: **enabled**
- Install on `Aegis-Finance/aegis-garage`

Then set the four env vars above on the VPS.

### Deploy

```bash
bash deploy/deploy.sh
```

First-time server setup: `bash deploy/bootstrap-vps.sh` (see `deploy/` for nginx + systemd configs).

**Production routing:** Cloudflare Worker `aegis-garage-proxy` forwards `garage.aegisprotocol.org` to the VPS Node app on port 4321 (ports 80/443 on the VPS are used by xray). Origin hostname: `origin-garage.aegisprotocol.org` (DNS-only A record).

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
