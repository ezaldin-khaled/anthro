#!/usr/bin/env bash
#
# Restore the Anthro edge (Caddy). Use when `docker compose ps` shows only backend+frontend
# or deep-diagnose reports HTTP 000 to :9080 / missing caddy.
#
# Modes:
#   ./scripts/repair-anthro-stack.sh              # Caddy on 9080/9443 (host nginx can proxy here)
#   ANTHRO_PUBLIC=1 ./scripts/repair-anthro-stack.sh   # Caddy on 80/443 with TLS (requires ports free)
#
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PUBLIC_FILE="${PUBLIC_FILE:-docker-compose.public.yml}"

hr() { printf '\n=== %s ===\n' "$1"; }

hr "Containers currently publishing 80 or 443 (who owns the edge?)"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null | head -30 || true

hr "This project (before)"
docker compose -f "$COMPOSE_FILE" ps -a 2>/dev/null || true

if [ "${ANTHRO_PUBLIC:-0}" = "1" ] || [ "${ANTHRO_PUBLIC:-}" = "true" ]; then
  if [ ! -f "$PUBLIC_FILE" ]; then
    printf 'ERROR: %s not found\n' "$PUBLIC_FILE" >&2
    exit 1
  fi
  hr "Starting with Docker TLS on 80/443 ($COMPOSE_FILE + $PUBLIC_FILE)"
  docker compose -f "$COMPOSE_FILE" -f "$PUBLIC_FILE" up -d --build
else
  hr "Starting shared mode: Caddy on 9080/9443 (export ANTHRO_HTTP_PORT/ANTHRO_HTTPS_PORT to override)"
  export ANTHRO_HTTP_PORT="${ANTHRO_HTTP_PORT:-9080}"
  export ANTHRO_HTTPS_PORT="${ANTHRO_HTTPS_PORT:-9443}"
  docker compose -f "$COMPOSE_FILE" up -d --build
fi

hr "This project (after)"
docker compose -f "$COMPOSE_FILE" ps -a

hr "Caddy port mapping"
docker compose -f "$COMPOSE_FILE" port caddy 80 2>/dev/null || printf 'ERROR: caddy service has no port mapping — is the caddy container running?\n'

hr "Quick curl (shared mode expects :9080 = HTML + X-Anthro-Served)"
PORT="$(docker compose -f "$COMPOSE_FILE" port caddy 80 2>/dev/null | head -1 | awk -F: '{print $NF}')"
if [ -n "$PORT" ]; then
  curl -sI --max-time 10 "http://127.0.0.1:${PORT}/" | sed -n '1,12p' || true
else
  printf 'Skip curl — could not detect host port for caddy:80\n'
fi

printf '\nNext: ./scripts/deep-diagnose-anthro.sh\n'
