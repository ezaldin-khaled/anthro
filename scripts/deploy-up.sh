#!/usr/bin/env bash
#
# Canonical compose up for Anthro. Picks compose files so Traefik routing survives restarts.
#
# See scripts/_anthro-compose.sh for merge rules.
#
# Usage:
#   ./scripts/deploy-up.sh -d --build
#
set -euo pipefail
SDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SDIR/_anthro-compose.sh"

ROOT="$(cd "$SDIR/.." && pwd)"
cd "$ROOT"

anthro_compose_args

joined="${ANTHRO_COMPOSE_ARGS[*]}"
case "$joined" in
  *docker-compose.traefik.yml*)
    printf '[deploy-up] Traefik overlay enabled (network %s)\n' "${TRAEFIK_NETWORK:-edge}"
    ;;
  *docker-compose.public.yml*)
    printf '[deploy-up] Public TLS mode (ANTHRO_PUBLIC)\n'
    ;;
  *)
    printf '[deploy-up] Prod only — Traefik merge skipped (ensure network "%s" exists for auto-merge)\n' "${TRAEFIK_NETWORK:-edge}"
    ;;
esac

export ANTHRO_HTTP_PORT="${ANTHRO_HTTP_PORT:-9080}"
export ANTHRO_HTTPS_PORT="${ANTHRO_HTTPS_PORT:-9443}"

exec docker compose "${ANTHRO_COMPOSE_ARGS[@]}" up "$@"
