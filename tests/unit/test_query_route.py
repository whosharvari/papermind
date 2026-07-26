from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from papermind.api.main import app
from papermind.chunking.schemas import Chunk
from papermind.generation.llm import LLMError
from papermind.generation.schemas import Answer, Citation
from papermind.retrieval.schemas import RetrievedChunk


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def _answer() -> Answer:
    chunk = Chunk(
        id="a.pdf::0000", text="chunk text", source_file="a.pdf", page_number=3, chunk_index=0
    )
    return Answer(
        question="What is X?",
        text="X is a thing.",
        citations=[Citation(source_file="a.pdf", page_number=3)],
        retrieved_chunks=[RetrievedChunk(chunk=chunk, score=0.87)],
    )


def test_query_returns_grounded_answer(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    app.state.retriever = MagicMock()
    app.state.llm = MagicMock()
    monkeypatch.setattr("papermind.api.routes.query.answer_question", lambda *a, **kw: _answer())

    response = client.post("/query", json={"question": "What is X?"})

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "X is a thing."
    assert body["citations"] == [{"source_file": "a.pdf", "page_number": 3}]
    assert body["retrieved_chunks"][0]["score"] == 0.87


def test_query_rejects_empty_question(client: TestClient) -> None:
    app.state.retriever = MagicMock()
    app.state.llm = MagicMock()

    response = client.post("/query", json={"question": ""})

    assert response.status_code == 422


def test_query_returns_503_when_not_ready(client: TestClient) -> None:
    app.state.retriever = None
    app.state.llm = None

    response = client.post("/query", json={"question": "What is X?"})

    assert response.status_code == 503


def test_query_returns_502_on_llm_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    app.state.retriever = MagicMock()
    app.state.llm = MagicMock()

    def raise_llm_error(*args: object, **kwargs: object) -> Answer:
        raise LLMError("groq is down")

    monkeypatch.setattr("papermind.api.routes.query.answer_question", raise_llm_error)

    response = client.post("/query", json={"question": "What is X?"})

    assert response.status_code == 502


def test_health_is_reachable_even_when_not_ready(client: TestClient) -> None:
    app.state.retriever = None
    app.state.llm = None

    response = client.get("/health")

    assert response.status_code == 200
