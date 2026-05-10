#!/usr/bin/env bash
# Run on the KVM. Prints whether Anthro containers and host nginx are wired correctly.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/anthro}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
UPSTREAM_PORT="${ANTHRO_HTTP_PORT:-9080}"

cd "$APP_DIR" 2>/dev/null || {
  printf 'Repo not found at %s\n' "$APP_DIR" >&2
  exit 1
}

echo "=== docker compose ps ($COMPOSE_FILE) ==="
docker compose -f "$COMPOSE_FILE" ps

echo
echo "=== Direct to Anthro stack (expect 200 + X-Anthro-Served: 1) ==="
curl -sI --connect-timeout 3 --max-time 10 "http://127.0.0.1:${UPSTREAM_PORT}/" | sed -n '1,20p'

echo
echo "=== SPA deep link (expect 200, not 404) ==="
curl -sI --connect-timeout 3 --max-time 10 "http://127.0.0.1:${UPSTREAM_PORT}/team/test" | sed -n '1,15p'

echo
echo "=== Optional: public HTTPS (may fail from restricted networks) ==="
curl -sI --connect-timeout 5 --max-time 15 "https://anthrotech.ae/" | sed -n '1,15p' || true

echo
echo "If direct upstream is OK but the public URL is 404, fix /etc/nginx sites for anthrotech.ae"
echo "(proxy_pass http://127.0.0.1:${UPSTREAM_PORT}; — no trailing slash on the port URL)."
