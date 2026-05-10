#!/usr/bin/env bash
# Same as ./scripts/deploy-up.sh — Traefik merge is automatic when network "edge" exists.
# Kept for backwards compatibility; fails fast if edge is missing (optional guard).
set -euo pipefail
cd "$(dirname "$0")/.."

NET="${TRAEFIK_NETWORK:-edge}"
if ! docker network inspect "$NET" >/dev/null 2>&1; then
  printf 'ERROR: Docker network "%s" does not exist — Traefik overlay cannot attach.\n' "$NET" >&2
  exit 1
fi

export ANTHRO_HTTP_PORT="${ANTHRO_HTTP_PORT:-9080}"
export ANTHRO_HTTPS_PORT="${ANTHRO_HTTPS_PORT:-9443}"

exec ./scripts/deploy-up.sh -d --build "$@"
