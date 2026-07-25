.PHONY: install run test lint format

install:
	python3.12 -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -e ".[dev]"

run:
	.venv/bin/uvicorn papermind.api.main:app --reload

test:
	.venv/bin/pytest

lint:
	.venv/bin/ruff check src tests

format:
	.venv/bin/black src tests
