#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${PROJECT_ROOT}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2
  exit 1
fi

wait_for_healthy() {
  local service="$1"
  local timeout_seconds="$2"
  local start_seconds
  start_seconds="$(date +%s)"

  while true; do
    local container_id
    local health
    container_id="$(docker compose ps -q "${service}")"
    if [[ -n "${container_id}" ]]; then
      health="$(docker inspect \
        --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
        "${container_id}")"
      if [[ "${health}" == "healthy" || "${health}" == "running" ]]; then
        echo "${service} is ${health}."
        return 0
      fi
      if [[ "${health}" == "unhealthy" || "${health}" == "exited" || "${health}" == "dead" ]]; then
        docker compose logs --tail=120 "${service}" >&2
        return 1
      fi
    fi

    if (( "$(date +%s)" - start_seconds >= timeout_seconds )); then
      echo "Timed out waiting for ${service}." >&2
      docker compose logs --tail=120 "${service}" >&2
      return 1
    fi
    sleep 5
  done
}

echo "Stopping runtime services before isolated unit tests..."
docker compose stop web core agent oceanbase redis >/dev/null 2>&1 || true

echo "Building test images..."
docker compose --profile test build core-test agent-test web-e2e

echo "Running Core authorization tests and Agent health tests..."
docker compose --profile test run --rm core-test
docker compose --profile test run --rm agent-test

echo "Building and starting Xanze phase 1..."
docker compose up --build --detach

wait_for_healthy oceanbase 600
wait_for_healthy redis 120
wait_for_healthy core 240
wait_for_healthy agent 120
wait_for_healthy web 120

echo "Checking service health, database, Redis and OpenAPI..."
core_health="$(docker compose exec -T core \
  curl --fail --silent http://localhost:8080/actuator/health)"
grep -q '"status":"UP"' <<<"${core_health}"
grep -q '"db"' <<<"${core_health}"
grep -q '"redis"' <<<"${core_health}"
docker compose exec -T agent python -c \
  "import urllib.request; assert b'\"status\":\"UP\"' in urllib.request.urlopen('http://localhost:8000/health').read()"
docker compose exec -T web wget --quiet --output-document=- http://127.0.0.1/health \
  | grep -q '"status":"UP"'
docker compose exec -T core curl --fail --silent http://localhost:8080/v3/api-docs \
  | grep -q '"openapi"'

echo "Creating a real employee through the administrator API..."
docker compose --profile test run --rm acceptance-api prepare

echo "Restarting OceanBase and Core to verify database-backed persistence..."
docker compose restart oceanbase
wait_for_healthy oceanbase 600
docker compose restart core
wait_for_healthy core 240
docker compose --profile test run --rm acceptance-api verify

echo "Running Playwright login journeys..."
docker compose --profile test run --rm web-e2e

echo "Xanze phase 1 acceptance passed."
