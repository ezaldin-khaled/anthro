#!/usr/bin/env bash
#
# Restore the Anthro edge (Caddy). Uses deploy-up.sh so Traefik labels stay attached when edge network exists.
#
# Modes:
#   ./scripts/repair-anthro-stack.sh              # shared ports + auto Traefik merge
#   ANTHRO_PUBLIC=1 ./scripts/repair-anthro-stack.sh   # Caddy on host 80/443 (requires ports free)
#
set -euo pipefail
cd "$(dirname "$0")/.."

SDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SDIR/_anthro-compose.sh"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PUBLIC_FILE="${PUBLIC_FILE:-docker-compose.public.yml}"

hr() { printf '\n=== %s ===\n' "$1"; }

hr "Containers currently publishing 80 or 443 (who owns the edge?)"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null | head -30 || true

anthro_compose_args

hr "This project (before)"
docker compose "${ANTHRO_COMPOSE_ARGS[@]}" ps -a 2>/dev/null || true

if [ "${ANTHRO_PUBLIC:-0}" = "1" ] || [ "${ANTHRO_PUBLIC:-}" = "true" ]; then
  if [ ! -f "$PUBLIC_FILE" ]; then
    printf 'ERROR: %s not found\n' "$PUBLIC_FILE" >&2
    exit 1
  fi
  hr "Starting public TLS ($COMPOSE_FILE + $PUBLIC_FILE)"
else
  hr "Starting (deploy-up merges Traefik automatically if network ${TRAEFIK_NETWORK:-edge} exists)"
  export ANTHRO_HTTP_PORT="${ANTHRO_HTTP_PORT:-9080}"
  export ANTHRO_HTTPS_PORT="${ANTHRO_HTTPS_PORT:-9443}"
fi

./scripts/deploy-up.sh -d --build

anthro_compose_args

hr "This project (after)"
docker compose "${ANTHRO_COMPOSE_ARGS[@]}" ps -a

hr "Caddy port mapping"
docker compose "${ANTHRO_COMPOSE_ARGS[@]}" port caddy 80 2>/dev/null || printf 'ERROR: caddy service has no port mapping — is the caddy container running?\n'

hr "Quick curl (shared mode expects :9080 = HTML + X-Anthro-Served)"
PORT="$(docker compose "${ANTHRO_COMPOSE_ARGS[@]}" port caddy 80 2>/dev/null | head -1 | awk -F: '{print $NF}')"
if [ -n "$PORT" ]; then
  curl -sI --max-time 10 "http://127.0.0.1:${PORT}/" | sed -n '1,12p' || true
else
  printf 'Skip curl — could not detect host port for caddy:80\n'
fi

printf '\nNext: ./scripts/deep-diagnose-anthro.sh\n'
