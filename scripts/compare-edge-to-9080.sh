#!/usr/bin/env bash
# Run on the server. Proves whether public HTTPS reaches Anthro or something else (e.g. Gin 404).
set -uo pipefail
PORT="${ANTHRO_HTTP_PORT:-9080}"

echo "=== Local Anthro (http://127.0.0.1:${PORT}/) — expect X-Anthro-Served and HTTP 200 ==="
curl -sI --max-time 15 "http://127.0.0.1:${PORT}/" | sed -n '1,18p' || true

echo ""
echo "=== Public https://anthrotech.ae — if NO X-Anthro-Served, Traefik/nginx is not routing here ==="
curl -sIk --max-time 20 "https://anthrotech.ae/" | sed -n '1,18p' || true

echo ""
echo "=== Public body (first 60 chars) — '404 page not found' = wrong backend (often Gin) ==="
curl -sk --max-time 20 "https://anthrotech.ae/" | head -c 60; echo

echo ""
echo "If local is OK but public is 404: add Traefik labels (./scripts/start-with-traefik.sh) or"
echo "point your main proxy to http://127.0.0.1:${PORT} for this Host."
