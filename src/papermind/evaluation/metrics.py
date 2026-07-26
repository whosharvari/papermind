from typing import Literal

from papermind.evaluation.schemas import EvalExample, RetrievalResult
from papermind.retrieval.retriever import Retriever

Level = Literal["document", "page", "chunk"]

PAGE_TOLERANCE = 1  # matches evaluation.citations.check_page_match's default


def evaluate_retrieval(
    example: EvalExample, retriever: Retriever, k: int, page_tolerance: int = PAGE_TOLERANCE
) -> RetrievalResult:
    retrieved = retriever.retrieve(example.question, k=k)

    document_hit, document_rank = False, None
    page_hit, page_rank = (None, None) if example.expected_page is None else (False, None)
    chunk_hit, chunk_rank = (None, None) if example.expected_chunk_id is None else (False, None)

    for rank, item in enumerate(retrieved, start=1):
        right_document = item.chunk.source_file == example.expected_source

        if right_document and not document_hit:
            document_hit, document_rank = True, rank

        if (
            page_hit is False
            and right_document
            and abs(item.chunk.page_number - example.expected_page) <= page_tolerance
        ):
            page_hit, page_rank = True, rank

        if chunk_hit is False and item.chunk.id == example.expected_chunk_id:
            chunk_hit, chunk_rank = True, rank

    return RetrievalResult(
        question=example.question,
        k=k,
        document_hit=document_hit,
        document_rank=document_rank,
        page_hit=page_hit,
        page_rank=page_rank,
        chunk_hit=chunk_hit,
        chunk_rank=chunk_rank,
    )


def hit_rate(results: list[RetrievalResult], level: Level = "document") -> float:
    applicable = [r for r in results if getattr(r, f"{level}_hit") is not None]
    if not applicable:
        return 0.0
    return sum(getattr(r, f"{level}_hit") for r in applicable) / len(applicable)


def mean_reciprocal_rank(results: list[RetrievalResult], level: Level = "document") -> float:
    applicable = [r for r in results if getattr(r, f"{level}_hit") is not None]
    if not applicable:
        return 0.0
    ranks = (getattr(r, f"{level}_rank") for r in applicable)
    return sum((1 / rank) if rank else 0.0 for rank in ranks) / len(applicable)
