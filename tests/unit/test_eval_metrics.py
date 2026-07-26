from unittest.mock import MagicMock

from papermind.chunking.schemas import Chunk
from papermind.evaluation.metrics import evaluate_retrieval, hit_rate, mean_reciprocal_rank
from papermind.evaluation.schemas import EvalExample, RetrievalResult
from papermind.retrieval.schemas import RetrievedChunk


def _retrieved(source_file: str, index: int) -> RetrievedChunk:
    chunk = Chunk(
        id=f"{source_file}::{index:04d}",
        text="text",
        source_file=source_file,
        page_number=1,
        chunk_index=index,
    )
    return RetrievedChunk(chunk=chunk, score=1.0 - index * 0.1)


def test_evaluate_retrieval_reports_hit_and_rank() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [
        _retrieved("wrong.pdf", 0),
        _retrieved("expected.pdf", 1),
        _retrieved("wrong.pdf", 2),
    ]
    example = EvalExample(question="Q", expected_source="expected.pdf")

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.hit is True
    assert result.rank == 2


def test_evaluate_retrieval_reports_miss() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [_retrieved("wrong.pdf", 0)]
    example = EvalExample(question="Q", expected_source="expected.pdf")

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.hit is False
    assert result.rank is None


def test_hit_rate_computes_fraction_of_hits() -> None:
    results = [
        RetrievalResult(question="a", k=5, hit=True, rank=1),
        RetrievalResult(question="b", k=5, hit=False, rank=None),
        RetrievalResult(question="c", k=5, hit=True, rank=3),
        RetrievalResult(question="d", k=5, hit=False, rank=None),
    ]

    assert hit_rate(results) == 0.5


def test_hit_rate_of_empty_results_is_zero() -> None:
    assert hit_rate([]) == 0.0


def test_mrr_rewards_higher_ranked_hits() -> None:
    results = [
        RetrievalResult(question="a", k=5, hit=True, rank=1),
        RetrievalResult(question="b", k=5, hit=True, rank=4),
    ]

    assert mean_reciprocal_rank(results) == (1 / 1 + 1 / 4) / 2


def test_mrr_counts_misses_as_zero() -> None:
    results = [
        RetrievalResult(question="a", k=5, hit=True, rank=1),
        RetrievalResult(question="b", k=5, hit=False, rank=None),
    ]

    assert mean_reciprocal_rank(results) == 0.5
