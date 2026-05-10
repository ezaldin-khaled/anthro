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
  local out
  out="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 4 --max-time 12 "$url" 2>/dev/null)" || true
  out="$(printf '%s' "$out" | tr -cd '0-9')"
  if [ -z "$out" ]; then
    printf '000'
    return
  fi
  # curl quirks / duplicates → keep first three digits
  if [ "${#out}" -gt 3 ]; then
    out="${out:0:3}"
  fi
  printf '%s' "$out"
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

hr "3) Docker: compose ps (running)"
if docker compose version >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" ps 2>&1 || true
else
  printf 'docker compose not available\n'
fi

hr "3b) Docker: compose ps -a (exited services)"
if docker compose version >/dev/null 2>&1; then
  docker compose -f "$COMPOSE_FILE" ps -a 2>&1 || true
fi

hr "3c) Who publishes host ports 80 / 443 (any stack)"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null | grep -E '(:80->|:443->| [::]:80->|[0-9]+\.80->|[0-9]+\.443->)' || docker ps --format 'table {{.Names}}\t{{.Ports}}' 2>/dev/null | head -25

CADDY_CID=""
if docker compose version >/dev/null 2>&1; then
  CADDY_CID="$(docker compose -f "$COMPOSE_FILE" ps -q caddy 2>/dev/null || true)"
fi
if [ -z "${CADDY_CID:-}" ]; then
  printf '\n*** CRITICAL: service "caddy" is not running in this project.\n'
  printf '    The site needs Caddy in front of nginx. Restore it:\n'
  printf '      %s/scripts/repair-anthro-stack.sh\n' "$APP_DIR"
  printf '    If another container already uses 9080/80/443, stop it or pick another host port.\n\n'
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
  printf 'no caddy port mapping — fallback guess TCP %s (often wrong if Caddy is down)\n' "$HOST_PORT"
fi

UPSTREAM_ROOT="http://127.0.0.1:${HOST_PORT}"

hr "4b) Sanity: raw :80 on this host (whoever owns docker-proxy :80 — may NOT be Anthro)"
printf 'curl -I http://127.0.0.1:80/ with Host: anthrotech.ae\n'
curl -sI --connect-timeout 4 --max-time 12 -H "Host: anthrotech.ae" "http://127.0.0.1:80/" 2>/dev/null | sed -n '1,12p' || printf '(connection failed)\n'
printf 'First bytes:\n'
curl -sS --connect-timeout 3 --max-time 8 -H "Host: anthrotech.ae" "http://127.0.0.1:80/" 2>/dev/null | head -c 100 | tr '\n' ' '
printf '\n(if this says \"404 page not found\" it is Gin — not the React nginx bundle)\n'

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
printf '%s\n' "- docker compose ps without caddy + HTTP 000 to :9080 → Caddy never started or crashed; run repair-anthro-stack.sh."
printf '%s\n' "- Something else on :80/:443 (see 3c) while Anthro has no Caddy → public site is the WRONG container until you fix ports."
printf '%s\n' "- /assets/… 404 with upstream 200 on / → stale index.html or incomplete frontend deploy."
printf '%s\n' "- Upstream 200, public 404 → edge proxy / Cloudflare wrong upstream."

printf '\nDone.\n'
