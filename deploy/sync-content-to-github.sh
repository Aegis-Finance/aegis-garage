#!/usr/bin/env bash
# Push content edits made via Keystatic (local storage) from VPS to GitHub.
set -euo pipefail

APP_DIR="/var/www/aegis-garage"
cd "$APP_DIR"

if [[ -z "$(git status --porcelain content public/images/articles)" ]]; then
  echo "No content changes to sync."
  exit 0
fi

git add content public/images/articles
git commit -m "content: sync from Keystatic admin"
git push origin main
echo "Content pushed to GitHub."
