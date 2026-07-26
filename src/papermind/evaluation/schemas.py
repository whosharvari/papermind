from pydantic import BaseModel


class EvalExample(BaseModel):
    question: str
    expected_source: str | None = None
    expected_page: int | None = None
    should_refuse: bool = False
    notes: str | None = None


class RetrievalResult(BaseModel):
    question: str
    k: int
    hit: bool
    rank: int | None  # 1-indexed rank of the first correct hit, None if absent from top-k


class GenerationResult(BaseModel):
    question: str
    answer_text: str
    should_refuse: bool
    refused: bool
    citation_correct: bool
    page_match: bool | None  # None when not applicable (refusal or no expected page)
    groundedness_score: int  # 1-5, 0 if the judge response was unparseable
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
