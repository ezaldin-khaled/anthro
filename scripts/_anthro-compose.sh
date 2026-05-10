# shellcheck shell=bash
# shellcheck disable=SC2034
# Shared by deploy-up.sh, repair-anthro-stack.sh, deploy-hostinger.sh.
# Sets ANTHRO_COMPOSE_ARGS so `docker compose "${ANTHRO_COMPOSE_ARGS[@]}"` matches runtime routing.

anthro_compose_args() {
  local prod="${COMPOSE_FILE:-docker-compose.prod.yml}"
  local traefik="${TRAEFIK_COMPOSE_FILE:-docker-compose.traefik.yml}"
  local public="${PUBLIC_FILE:-docker-compose.public.yml}"
  local net="${TRAEFIK_NETWORK:-edge}"

  ANTHRO_COMPOSE_ARGS=( -f "$prod" )

  if [ "${ANTHRO_PUBLIC:-0}" = "1" ] || [ "${ANTHRO_PUBLIC:-}" = "true" ]; then
    ANTHRO_COMPOSE_ARGS+=( -f "$public" )
  elif docker network inspect "$net" >/dev/null 2>&1 && [ -f "$traefik" ]; then
    ANTHRO_COMPOSE_ARGS+=( -f "$traefik" )
  fi
}
