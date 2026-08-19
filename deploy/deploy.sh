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
npm run build

echo "==> Restarting service..."
sudo systemctl restart "$SERVICE"

echo "==> Done. Check: sudo systemctl status $SERVICE"
