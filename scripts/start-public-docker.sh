#!/usr/bin/env bash
# TLS entirely in Docker (Caddy on host 80/443). Use when host nginx returns 404/misroutes anthrotech.ae.
# You MUST free ports 80/443 (disable conflicting nginx vhosts or stop nginx if this server is only Anthro).
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PUBLIC_OVERRIDE="${PUBLIC_OVERRIDE:-docker-compose.public.yml}"

if command -v ss >/dev/null 2>&1; then
  if ss -tlnH 2>/dev/null | grep -qE '(:80 |:443 )'; then
    printf '\n[warn] Something is already listening on :80 and/or :443. Caddy needs both for HTTP-01 + HTTPS.\n'
    printf '       Show listeners: ss -tlnp | grep -E ":80|:443"\n'
    printf '       On Ubuntu/Debian host nginx: disable the site or stop nginx before continuing.\n\n'
  fi
fi

printf '[start-public-docker] Using %s + %s\n' "$COMPOSE_FILE" "$PUBLIC_OVERRIDE"
docker compose -f "$COMPOSE_FILE" -f "$PUBLIC_OVERRIDE" up -d --build

printf '\nSmoke test (expect HTTP 200; Host header required for name-based Caddy):\n'
sleep 2
curl -sI --max-time 15 -H "Host: anthrotech.ae" "http://127.0.0.1/" | sed -n '1,15p' || true

printf '\nHTTPS (after certs issue, may take a minute):\n'
curl -sIk --max-time 15 "https://anthrotech.ae/" | sed -n '1,15p' || true

printf '\nDone.\n'
