.PHONY: up down logs test acceptance reset

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

test:
	docker compose --profile test run --rm core-test
	docker compose --profile test run --rm agent-test

acceptance:
	bash scripts/acceptance/phase-01.sh

reset:
	docker compose down --volumes

