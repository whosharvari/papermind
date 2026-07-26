from papermind.evaluation.schemas import EvalExample, RetrievalResult
from papermind.retrieval.retriever import Retriever


def evaluate_retrieval(example: EvalExample, retriever: Retriever, k: int) -> RetrievalResult:
    retrieved = retriever.retrieve(example.question, k=k)
    for rank, item in enumerate(retrieved, start=1):
        if item.chunk.source_file == example.expected_source:
            return RetrievalResult(question=example.question, k=k, hit=True, rank=rank)
    return RetrievalResult(question=example.question, k=k, hit=False, rank=None)


def hit_rate(results: list[RetrievalResult]) -> float:
    if not results:
        return 0.0
    return sum(r.hit for r in results) / len(results)


def mean_reciprocal_rank(results: list[RetrievalResult]) -> float:
    if not results:
        return 0.0
    return sum((1 / r.rank) if r.rank else 0.0 for r in results) / len(results)
