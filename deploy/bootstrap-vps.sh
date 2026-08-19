#!/usr/bin/env bash
# One-time VPS bootstrap for Ubuntu/Debian.
# Run as root on a fresh server: bash deploy/bootstrap-vps.sh
set -euo pipefail

APP_DIR="/var/www/aegis-garage"
REPO="git@github.com:Aegis-Finance/aegis-garage.git"

echo "==> Installing packages..."
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

echo "==> Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "==> Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Cloning repository..."
mkdir -p /var/www
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
fi

chown -R www-data:www-data "$APP_DIR"

echo "==> Installing nginx site..."
cp "$APP_DIR/deploy/nginx-garage.conf" /etc/nginx/sites-available/garage.aegisprotocol.org
ln -sf /etc/nginx/sites-available/garage.aegisprotocol.org /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> Installing systemd service..."
cp "$APP_DIR/deploy/aegis-garage.service" /etc/systemd/system/aegis-garage.service
systemctl daemon-reload
systemctl enable aegis-garage

echo ""
echo "Next steps:"
echo "  1. Create $APP_DIR/.env (see .env.example) with Keystatic secrets"
echo "  2. cd $APP_DIR && npm ci && npm run build"
echo "  3. systemctl start aegis-garage"
echo "  4. certbot --nginx -d garage.aegisprotocol.org"
echo "  5. Point DNS garage.aegisprotocol.org -> this server IP"
