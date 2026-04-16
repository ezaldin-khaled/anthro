#!/usr/bin/env bash
set -Eeuo pipefail

# Installs nginx vhost from repo template for shared-host setup.
# Run on server with sudo/root privileges.

REPO_DIR="${REPO_DIR:-$HOME/anthro}"
TEMPLATE_REL="${TEMPLATE_REL:-docs/main-proxy-anthrotech.example.conf}"
TARGET_NAME="${TARGET_NAME:-anthrotech-acme}"
WEBROOT="${WEBROOT:-/var/www/html}"

SOURCE_FILE="$REPO_DIR/$TEMPLATE_REL"
TARGET_FILE="/etc/nginx/sites-available/$TARGET_NAME"
LINK_FILE="/etc/nginx/sites-enabled/$TARGET_NAME"

log() {
  printf '[nginx-install] %s\n' "$1"
}

fail() {
  printf '[nginx-install] ERROR: %s\n' "$1" >&2
  exit 1
}

if [ ! -f "$SOURCE_FILE" ]; then
  fail "Template not found: $SOURCE_FILE"
fi

if ! command -v nginx >/dev/null 2>&1; then
  fail "nginx command not found"
fi

mkdir -p "$WEBROOT/.well-known/acme-challenge"

log "Installing $SOURCE_FILE -> $TARGET_FILE"
install -m 0644 "$SOURCE_FILE" "$TARGET_FILE"

log "Enabling site symlink: $LINK_FILE"
ln -sfn "$TARGET_FILE" "$LINK_FILE"

log "Testing nginx configuration"
nginx -t

log "Reloading nginx"
systemctl reload nginx

log "Done. Next: run certbot if certificates are not yet present."
