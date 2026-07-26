import pytest
from pydantic import ValidationError

from papermind.api.schemas.query import QueryRequest, QueryResponse
from papermind.chunking.schemas import Chunk
from papermind.generation.schemas import Answer, Citation
from papermind.retrieval.schemas import RetrievedChunk


def test_query_request_rejects_empty_question() -> None:
    with pytest.raises(ValidationError):
        QueryRequest(question="")


def test_query_request_rejects_k_out_of_range() -> None:
    with pytest.raises(ValidationError):
        QueryRequest(question="hi", k=0)
    with pytest.raises(ValidationError):
        QueryRequest(question="hi", k=21)


def test_query_request_defaults_k_to_five() -> None:
    assert QueryRequest(question="hi").k == 5


def test_query_response_from_answer_maps_all_fields() -> None:
    chunk = Chunk(
        id="a.pdf::0000", text="chunk text", source_file="a.pdf", page_number=3, chunk_index=0
    )
    answer = Answer(
        question="What is X?",
        text="X is a thing.",
        citations=[Citation(source_file="a.pdf", page_number=3)],
        retrieved_chunks=[RetrievedChunk(chunk=chunk, score=0.87)],
    )

    response = QueryResponse.from_answer(answer)

    assert response.question == "What is X?"
    assert response.answer == "X is a thing."
    assert [c.model_dump() for c in response.citations] == [
        {"source_file": "a.pdf", "page_number": 3}
    ]
    assert response.retrieved_chunks[0].text == "chunk text"
    assert response.retrieved_chunks[0].score == 0.87
