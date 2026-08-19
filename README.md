# Aegis Garage

Public article site for [garage.aegisprotocol.org](https://garage.aegisprotocol.org) — essays and research from the Aegis team.

## Stack

| Layer | Technology |
|-------|------------|
| App | Astro 5 + React (Keystatic admin) |
| Content | Git-backed Markdoc in `content/` |
| Search | Pagefind (build-time index) |
| Styling | Tailwind CSS |
| Runtime | Node.js 22 (`@astrojs/node` standalone) |
| Edge | Cloudflare Worker reverse proxy |
| Origin | VPS @ `169.40.32.81:4321` |

---

## Production architecture

Garage moved from **Cloudflare Pages** to a **VPS + Cloudflare Worker** setup because Keystatic GitHub admin (OAuth, repo read/write) does not work reliably on Cloudflare’s edge runtime.

```
                    ┌─────────────────────────────────────┐
  Browser ────────► │ Cloudflare DNS + Worker             │
                    │ garage.aegisprotocol.org/*          │
                    │ Worker: aegis-garage-proxy          │
                    └──────────────┬──────────────────────┘
                                   │ HTTP (DNS-only origin)
                                   ▼
                    ┌─────────────────────────────────────┐
                    │ VPS 169.40.32.81                    │
                    │ origin-garage.aegisprotocol.org:4321│
                    │ systemd: aegis-garage.service       │
                    │ Node: dist/server/entry.mjs         │
                    └──────────────┬──────────────────────┘
                                   │ GitHub API (Keystatic)
                                   ▼
                    ┌─────────────────────────────────────┐
                    │ GitHub Aegis-Finance/aegis-garage   │
                    │ content/articles/, content/categories/│
                    └─────────────────────────────────────┘
```

### Why a Worker (not direct DNS → VPS)?

Ports **80/443 on the VPS are used by xray** (VPN). nginx cannot bind there. The Worker terminates public HTTPS and forwards to the Node app on **4321**.

The Worker also:

- Sets `X-Forwarded-Host` / `X-Forwarded-Proto` so Keystatic builds correct OAuth URLs
- Rewrites `origin-garage.aegisprotocol.org` → `garage.aegisprotocol.org` in redirect responses
- Adds `scope=public_repo` to GitHub OAuth authorize URLs (needed for repo access)

### Cloudflare inventory (Garage only)

| Resource | Name | Status | Purpose |
|----------|------|--------|---------|
| **Worker** | `aegis-garage-proxy` | **Keep** | Routes `garage.aegisprotocol.org/*` → VPS:4321 |
| **DNS** | `garage` | Proxied (orange) | Public hostname; hits Worker route |
| **DNS** | `origin-garage` | DNS-only (grey) | Origin hostname for Worker → VPS fetch |
| **Pages** | `aegis-garage` | **Deleted** | Was Cloudflare Pages; replaced by VPS |

Other Aegis sites (unchanged, still on Cloudflare Pages):

| Pages project | Domain |
|---------------|--------|
| `aegis-landing` | aegisprotocol.org, www |
| `aegis-docs` | doc.aegisprotocol.org |
| `aegis-app` | app.aegisprotocol.org |
| `aegis-tge` | tge.aegisprotocol.org |

Only **one Worker** exists in the account (`aegis-garage-proxy`). No extra Workers to remove.

### VPS layout

| Path / service | Purpose |
|----------------|---------|
| `/var/www/aegis-garage` | Git clone of `Aegis-Finance/aegis-garage` |
| `/var/www/aegis-garage/.env` | Keystatic secrets (not in git) |
| `aegis-garage.service` | systemd unit — runs Node standalone |
| `deploy/deploy.sh` | Pull, build, restart |
| `deploy/bootstrap-vps.sh` | First-time Node/nginx/certbot setup |

nginx config exists (`deploy/nginx-garage.conf`) but is **not used for public traffic** while xray holds 80/443.

---

## Local development

```bash
npm ci
npm run dev
```

- Site: [http://localhost:4321](http://localhost:4321)
- Admin: [http://localhost:4321/keystatic](http://localhost:4321/keystatic) (local storage — no GitHub)

## Build

```bash
npm run build   # → dist/client/ + dist/server/
npm start       # production server locally
```

---

## Deploy to VPS

```bash
bash deploy/deploy.sh
```

On the VPS (first time):

```bash
bash deploy/bootstrap-vps.sh
```

Build uses `NODE_OPTIONS=--max-old-space-size=1536` (1 GB RAM VPS + swap).

### Worker deploy (after editing `deploy/cloudflare-worker-proxy.js`)

```bash
cd deploy
npx wrangler deploy --config wrangler-garage-proxy.toml
```

---

## Keystatic admin (why articles may not show)

The public site reads articles from **Git** at build time. The admin UI at `/keystatic` reads/writes **live via GitHub’s API**.

**You need a GitHub App** (not the old classic OAuth App “Aegis Garage”). A classic OAuth App can log you in but cannot list or edit repo content in Keystatic.

### Fix: create & install the Keystatic GitHub App

1. From `deploy/`, serve the setup helper:
   ```bash
   python -m http.server 8765
   ```
2. Open [http://127.0.0.1:8765/keystatic-github-app-setup.html](http://127.0.0.1:8765/keystatic-github-app-setup.html)
3. Click **Create GitHub App for Aegis-Finance** (requires org owner / GitHub App manager)
4. **Install** the app on `Aegis-Finance/aegis-garage` ([install URL](https://github.com/apps/aegis-finance-keystatic/installations/new) — slug may differ)
5. From the app settings page, copy to VPS `/var/www/aegis-garage/.env`:
   ```
   KEYSTATIC_GITHUB_CLIENT_ID=
   KEYSTATIC_GITHUB_CLIENT_SECRET=   # Generate new client secret
   KEYSTATIC_SECRET=               # openssl rand -base64 32
   PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=aegis-finance-keystatic
   ```
6. Restart: `sudo systemctl restart aegis-garage`
7. Log out and back in at `/keystatic` — articles should appear

**Callback URL:** `https://garage.aegisprotocol.org/api/keystatic/github/oauth/callback`

**Permissions:** Contents read/write, Metadata read, Pull requests read.

You can remove the old classic OAuth App at [GitHub OAuth settings](https://github.com/settings/developers) once the GitHub App works.

---

## Publishing workflow

1. Edit at `https://garage.aegisprotocol.org/keystatic`
2. Save — commits to `main` on GitHub
3. On VPS: `bash deploy/deploy.sh` (or add a GitHub Action/webhook later)
4. Public site updates after rebuild

---

## Environment variables (VPS `.env`)

See `.env.example`. Required for production admin:

| Variable | Description |
|----------|-------------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | From **GitHub App** (not OAuth App) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `KEYSTATIC_SECRET` | Random 32+ chars (`openssl rand -base64 32`) |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | App slug (e.g. `aegis-finance-keystatic`) |
| `HOST` | `0.0.0.0` |
| `PORT` | `4321` |

---

## Repo layout

```
aegis-garage/
├── content/              # Articles & categories (Keystatic + build input)
├── deploy/               # VPS + Cloudflare configs
│   ├── cloudflare-worker-proxy.js
│   ├── wrangler-garage-proxy.toml
│   ├── aegis-garage.service
│   ├── deploy.sh
│   ├── bootstrap-vps.sh
│   └── keystatic-github-app-setup.html
├── public/               # Static assets + article images
├── src/                  # Astro pages & content-fs reader
├── keystatic.config.ts
└── astro.config.mjs      # Node adapter, env schema, allowedHosts
```

---

## Import legacy essays

One-time import from `Aegis-contracts/docs/articles/`:

```bash
npm run import:legacy
```

Article YAML uses Keystatic slug format (`title.slug` + `title.name`). Run `node scripts/fix-keystatic-article-slugs.mjs` if older imports used plain title strings.

---

## Related

Standalone mirror of monorepo `frontend-garage/`. See `SIBLING_REPO.md` in the Aegis monorepo.
