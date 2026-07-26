from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from papermind.api.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_stats_reports_not_ready_when_retriever_not_loaded(client: TestClient) -> None:
    app.state.retriever = None

    response = client.get("/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "not_ready"
    assert body["paper_count"] == 0
    assert body["chunk_count"] == 0


def test_stats_reports_counts_when_retriever_loaded(client: TestClient) -> None:
    app.state.retriever = MagicMock(indexed_paper_count=13, indexed_chunk_count=2349)

    response = client.get("/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["paper_count"] == 13
    assert body["chunk_count"] == 2349
    assert "embedding_model" in body
    assert "groq_model" in body
