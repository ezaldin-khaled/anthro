#!/usr/bin/env bash
# Use when port 80/443 are taken. Anthro listens on 9080 and 9443 (override with ANTHRO_HTTP_PORT/ANTHRO_HTTPS_PORT).
set -e
cd "$(dirname "$0")"
export ANTHRO_HTTP_PORT="${ANTHRO_HTTP_PORT:-9080}"
export ANTHRO_HTTPS_PORT="${ANTHRO_HTTPS_PORT:-9443}"
docker compose -f docker-compose.prod.yml up -d "$@"
