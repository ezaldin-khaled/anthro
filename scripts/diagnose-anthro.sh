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
echo "=== Bundled /assets from homepage HTML (each line should end with HTTP 200) ==="
doc="$(curl -sS --connect-timeout 3 --max-time 15 "http://127.0.0.1:${UPSTREAM_PORT}/" || true)"
paths="$(echo "$doc" | grep -oE '/assets/[^"<> ]+' | sort -u || true)"
if [ -z "$paths" ]; then
  echo "(no /assets/ refs — homepage HTML may be wrong or empty)"
else
  for path in $paths; do
    code="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 15 "http://127.0.0.1:${UPSTREAM_PORT}${path}" || true)"
    [ -z "$code" ] && code="000"
    printf '%s -> HTTP %s\n' "$path" "$code"
  done
fi

echo
echo "Browser console 404 on /assets/* after deploy → hard refresh (Ctrl+Shift+R) or wait for"
echo "new nginx cache headers; rebuild: docker compose -f $COMPOSE_FILE build --no-cache frontend"
echo "Plain-text body '404 page not found' is usually Gin (backend): traffic is hitting :4000 or /api only."
echo
echo "If direct upstream is OK but public HTTPS is 404, either:"
echo "  A) Fix host nginx: proxy_pass http://127.0.0.1:${UPSTREAM_PORT}; (no trailing slash on the URL)"
echo "  B) Docker-only TLS: free :80 and :443, then: ./scripts/start-public-docker.sh"
echo "     (Caddy gets certs; stop/disable conflicting nginx on those ports first.)"
echo
echo "Full layered report (run on server): ./scripts/deep-diagnose-anthro.sh"
