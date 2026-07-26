from pydantic import BaseModel


class EvalExample(BaseModel):
    question: str
    expected_source: str | None = None
    expected_page: int | None = None
    # Only set for narrow factual/hyperparameter questions with one genuine correct chunk --
    # a conceptual question's answer can legitimately span several chunks, so this is left
    # unset there rather than forced. See evaluation/README or Session 6 report for rationale.
    expected_chunk_id: str | None = None
    should_refuse: bool = False
    notes: str | None = None


class RetrievalResult(BaseModel):
    question: str
    k: int
    document_hit: bool
    document_rank: int | None
    page_hit: bool | None  # None when the example has no expected_page
    page_rank: int | None
    chunk_hit: bool | None  # None when the example has no expected_chunk_id
    chunk_rank: int | None


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
