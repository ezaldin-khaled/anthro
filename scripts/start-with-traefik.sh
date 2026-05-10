#!/usr/bin/env bash
# Attach Anthro Caddy to your Traefik edge network (fixes public 404 while http://127.0.0.1:9080 works).
set -euo pipefail
cd "$(dirname "$0")/.."

TRAEFIK_OVERRIDE="${TRAEFIK_COMPOSE_FILE:-docker-compose.traefik.yml}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

NET="${TRAEFIK_NETWORK:-edge}"
if ! docker network inspect "$NET" >/dev/null 2>&1; then
  printf 'ERROR: Docker network "%s" does not exist.\n' "$NET" >&2
  printf 'List networks: docker network ls\n' >&2
  printf 'Traefik stacks usually expose a shared network (often named "edge").\n' >&2
  exit 1
fi

docker compose -f "$COMPOSE_FILE" -f "$TRAEFIK_OVERRIDE" up -d --build

printf '\nTraefik should pick up labels within ~10–30s. Test:\n'
printf '  curl -sIk https://anthrotech.ae/ | grep -i X-Anthro\n'
