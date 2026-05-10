#!/usr/bin/env bash
#
# Run ON THE SERVER (e.g. ~/anthro). Walks the full chain so you can see where 404 starts.
#
#   chmod +x scripts/deep-diagnose-anthro.sh
#   ./scripts/deep-diagnose-anthro.sh
#   ./scripts/deep-diagnose-anthro.sh https://anthrotech.ae
#
# Optional: sudo ./scripts/deep-diagnose-anthro.sh   (includes host nginx config snippets)
#
set -uo pipefail

PUBLIC_URL="${1:-https://anthrotech.ae}"
APP_DIR="${APP_DIR:-$HOME/anthro}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

hr() {
  printf '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  printf '%s\n' "$1"
  printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
}

safe_curl_code() {
  local url="$1"
  curl -s -o /dev/null -w "%{http_code}" --connect-timeout 4 --max-time 12 "$url" 2>/dev/null || printf '000'
}

safe_curl_head() {
  local url="$1"
  curl -sI --connect-timeout 4 --max-time 12 "$url" 2>/dev/null || true
}

body_snippet() {
  local url="$1"
  curl -s --connect-timeout 4 --max-time 12 "$url" 2>/dev/null | head -c 120 | tr '\n' ' '
  printf '\n'
}

if [ ! -d "$APP_DIR/.git" ]; then
  printf 'ERROR: Repo not found at %s (set APP_DIR)\n' "$APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR" || exit 1

hr "0) Context"
printf 'APP_DIR=%s\nCOMPOSE_FILE=%s\nPUBLIC_URL=%s\n' "$APP_DIR" "$COMPOSE_FILE" "$PUBLIC_URL"
printf 'Date: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
command -v hostname >/dev/null 2>&1 && printf 'Host: %s\n' "$(hostname)"

hr "1) DNS (does this machine match public DNS?)"
host_ip="$(getent ahosts anthrotech.ae 2>/dev/null | awk '/STREAM/{print $1; exit}')"
printf 'getent anthrotech.ae → %s\n' "${host_ip:-lookup failed}"
for iface in $(ip -4 -o addr show scope global 2>/dev/null | awk '{print $4}' | cut -d/ -f1); do
  printf 'this host IPv4: %s\n' "$iface"
done

hr "2) Who listens on 80 / 443 / common Anthro ports"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp 2>/dev/null | grep -E '(:80 |:443 |:9080 |:9443 )' || printf '(no matches or ss needs root for -p)\n'
else
  printf 'ss not installed\n'
fi

hr "3) Docker: compose ps"
if docker compose version >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" ps 2>&1 || true
else
  printf 'docker compose not available\n'
fi

hr "4) Detect Caddy → host port (container internal :80)"
HOST_PORT=""
map_line="$(docker compose -f "$COMPOSE_FILE" port caddy 80 2>/dev/null | head -1)"
if [ -n "$map_line" ]; then
  printf 'docker compose port caddy 80 → %s\n' "$map_line"
  HOST_PORT="${map_line##*:}"
fi
if [ -z "$HOST_PORT" ]; then
  HOST_PORT="${ANTHRO_HTTP_PORT:-9080}"
  printf 'fallback ANTHRO_HTTP_PORT → TCP %s\n' "$HOST_PORT"
fi

UPSTREAM_ROOT="http://127.0.0.1:${HOST_PORT}"

hr "5) Layer A — curl inside server to Anthro (must be OK before blaming nginx)"
printf 'GET %s/\n' "$UPSTREAM_ROOT"
code_root="$(safe_curl_code "$UPSTREAM_ROOT/")"
printf 'HTTP %s\n' "$code_root"
safe_curl_head "$UPSTREAM_ROOT/" | sed -n '1,18p'

printf '\nFirst bytes of body (expect <!doctype html …):\n'
body_snippet "$UPSTREAM_ROOT/"

if [ "$code_root" != "200" ]; then
  printf '\n*** FAIL: upstream root is not HTTP 200. Fix Docker first:\n'
  printf '    docker compose -f %s logs --tail=80 caddy frontend\n' "$COMPOSE_FILE"
fi

hr "6) Layer B — hashed JS/CSS under /assets (404 here = stale browser cache or bad deploy)"
doc="$(curl -sS --connect-timeout 5 --max-time 20 "$UPSTREAM_ROOT/" 2>/dev/null || true)"
paths="$(echo "$doc" | grep -oE '/assets/[^"<> ]+' | sort -u || true)"
if [ -z "$paths" ]; then
  printf '*** No /assets/ in HTML — homepage may not be the Vite build output.\n'
else
  failed=0
  for path in $paths; do
    c="$(safe_curl_code "${UPSTREAM_ROOT}${path}")"
    printf '%s → HTTP %s\n' "$path" "$c"
    [ "$c" = "200" ] || failed=1
  done
  [ "$failed" -eq 1 ] && printf '\n*** Rebuild frontend on server: docker compose -f %s build --no-cache frontend && docker compose -f %s up -d\n' "$COMPOSE_FILE" "$COMPOSE_FILE"
fi

hr "7) Layer C — SPA deep link on upstream"
code_deep="$(safe_curl_code "${UPSTREAM_ROOT}/team/test")"
printf '/team/test → HTTP %s (expect 200)\n' "$code_deep"

hr "8) Layer D — public URL (what the browser hits)"
pub_code="$(safe_curl_code "$PUBLIC_URL/")"
printf '%s → HTTP %s\n' "$PUBLIC_URL/" "$pub_code"
safe_curl_head "$PUBLIC_URL/" | sed -n '1,22p'
printf 'Body snippet if error:\n'
body_snippet "$PUBLIC_URL/"

if [ "$code_root" = "200" ] && [ "$pub_code" != "200" ]; then
  printf '\n*** Upstream OK but public URL not 200 → problem is OUTSIDE Docker:\n'
  printf '    host nginx / reverse proxy / Cloudflare → wrong upstream or wrong Host.\n'
  printf '    Expected proxy_pass http://127.0.0.1:%s;  (no trailing slash after port)\n' "$HOST_PORT"
fi

hr "9) Host nginx (optional — run with sudo if files are root-only)"
if [ "${EUID:-0}" -eq 0 ]; then
  SUDO=()
elif sudo -n true 2>/dev/null; then
  SUDO=(sudo)
else
  SUDO=()
  printf 'No passwordless sudo — showing only world-readable vhosts.\n'
fi

if [ -d /etc/nginx/sites-enabled ]; then
  found=0
  shopt -s nullglob
  for f in /etc/nginx/sites-enabled/*; do
    [ -f "$f" ] || continue
    if grep -qE 'anthrotech|anthro\.ae' "$f" 2>/dev/null; then
      found=1
      printf '--- %s ---\n' "$f"
      if [ "${#SUDO[@]}" -gt 0 ]; then
        "${SUDO[@]}" grep -E 'server_name|listen |proxy_pass|location' "$f" 2>/dev/null || printf '(cannot read)\n'
      else
        grep -E 'server_name|listen |proxy_pass|location' "$f" 2>/dev/null || printf '(cannot read — try sudo)\n'
      fi
    fi
  done
  shopt -u nullglob
  [ "$found" -eq 0 ] && printf 'No site file mentioning anthrotech.ae under sites-enabled.\n'
else
  printf '/etc/nginx/sites-enabled not found (nginx may use conf.d only).\n'
fi

if [ "${#SUDO[@]}" -eq 0 ]; then
  printf '\nTo include unreadable vhosts:\n  sudo %s/scripts/deep-diagnose-anthro.sh %s\n' "$APP_DIR" "$PUBLIC_URL"
fi

hr "10) Quick interpretation"
printf '%s\n' "- Gin plain-text '404 page not found' → request reached Go backend on wrong path/port."
printf '%s\n' "- /assets/… 404 with upstream 200 on / → old index.html in browser or incomplete deploy."
printf '%s\n' "- Upstream 200, public 404 → fix host nginx or use scripts/start-public-docker.sh on free :80/:443."

printf '\nDone.\n'
