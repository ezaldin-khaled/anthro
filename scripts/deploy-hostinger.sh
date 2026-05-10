#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-$HOME/anthro}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

log() {
  printf '[deploy] %s\n' "$1"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$1" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

require_cmd git
require_cmd docker
require_cmd curl

if [ ! -d "$APP_DIR/.git" ]; then
  fail "Repo not found at $APP_DIR"
fi

cd "$APP_DIR"

log "Deploying branch '$BRANCH' in $APP_DIR"
git fetch origin "$BRANCH"

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current_branch" != "$BRANCH" ]; then
  log "Switching from '$current_branch' to '$BRANCH'"
  git checkout "$BRANCH"
fi

log "Updating repository (fast-forward only)"
git pull --ff-only origin "$BRANCH"

if [ ! -x "./start-shared.sh" ]; then
  fail "start-shared.sh is missing or not executable"
fi

log "Building and starting containers"
./start-shared.sh --build

log "Container status"
docker compose -f "$COMPOSE_FILE" ps

UPSTREAM_PORT="${ANTHRO_HTTP_PORT:-9080}"
log "Smoke test upstream (expect HTTP 200 + X-Anthro-Served): http://127.0.0.1:${UPSTREAM_PORT}/"
http_code=""
for _ in $(seq 1 45); do
  http_code="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 8 "http://127.0.0.1:${UPSTREAM_PORT}/" || true)"
  if [ "$http_code" = "200" ]; then
    break
  fi
  sleep 2
done
if [ "$http_code" != "200" ]; then
  fail "Upstream returned HTTP ${http_code:-000} (expected 200). Is host nginx proxy_pass set to 127.0.0.1:${UPSTREAM_PORT}? Try: docker compose -f \"$COMPOSE_FILE\" logs --tail=80"
fi
if ! curl -sI --max-time 8 "http://127.0.0.1:${UPSTREAM_PORT}/" | grep -qi '^X-Anthro-Served:'; then
  fail "Missing X-Anthro-Served header from frontend — traffic may not be reaching the Anthro nginx container."
fi

log "Deploy completed successfully"
