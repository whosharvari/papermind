.PHONY: install run test lint format ingest query evaluate docker-build docker-up docker-down docker-dev

install:
	python3.12 -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -e ".[dev]"

run:
	.venv/bin/uvicorn papermind.api.main:app --reload

test:
	.venv/bin/pytest

lint:
	.venv/bin/ruff check src tests scripts

format:
	.venv/bin/black src tests scripts

ingest:
	.venv/bin/python scripts/ingest.py

query:
	.venv/bin/python scripts/query.py

evaluate:
	.venv/bin/python scripts/evaluate.py

docker-build:
	docker build -f docker/Dockerfile --target runtime -t papermind:latest .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-dev:
	docker compose --profile dev up api-dev
