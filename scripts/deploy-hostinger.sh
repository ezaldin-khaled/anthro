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

log "Deploy completed successfully"
