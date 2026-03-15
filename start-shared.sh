#!/usr/bin/env bash
# Use this when port 80/443 are used by other containers. Anthro will listen on 8080 and 8443.
set -e
cd "$(dirname "$0")"
docker compose -f docker-compose.prod.yml -f docker-compose.prod.shared.yml up -d "$@"
