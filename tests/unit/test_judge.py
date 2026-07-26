from unittest.mock import MagicMock

from papermind.chunking.schemas import Chunk
from papermind.evaluation.judge import score_groundedness
from papermind.retrieval.schemas import RetrievedChunk


def _retrieved() -> list[RetrievedChunk]:
    chunk = Chunk(
        id="a.pdf::0000", text="the sky is blue", source_file="a.pdf", page_number=1, chunk_index=0
    )
    return [RetrievedChunk(chunk=chunk, score=0.9)]


def test_score_groundedness_parses_digit_response() -> None:
    llm = MagicMock()
    llm.complete.return_value = "5"

    score = score_groundedness(llm, "What color is the sky?", _retrieved(), "The sky is blue.")

    assert score == 5


def test_score_groundedness_extracts_digit_from_verbose_response() -> None:
    llm = MagicMock()
    llm.complete.return_value = "I would rate this a 4 out of 5."

    score = score_groundedness(llm, "Q", _retrieved(), "answer")

    assert score == 4


def test_score_groundedness_returns_zero_when_unparseable() -> None:
    llm = MagicMock()
    llm.complete.return_value = "unable to determine"

    score = score_groundedness(llm, "Q", _retrieved(), "answer")

    assert score == 0
