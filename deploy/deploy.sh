#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/aegis-garage"
SERVICE="aegis-garage"

cd "$APP_DIR"

echo "==> Pulling latest main..."
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies..."
npm ci

echo "==> Building..."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env" 2>/dev/null || true
set +a
export KEYSTATIC_STORAGE="${KEYSTATIC_STORAGE:-local}"
npm run build

echo "==> Setting permissions..."
chown -R www-data:www-data "$APP_DIR"

echo "==> Restarting service..."
sudo systemctl restart "$SERVICE"

echo "==> Done. Check: sudo systemctl status $SERVICE"
