from pydantic import BaseModel, Field

from papermind.generation.schemas import Answer


class QueryRequest(BaseModel):
    question: str = Field(min_length=1)
    k: int = Field(default=5, ge=1, le=20)


class CitationOut(BaseModel):
    source_file: str
    page_number: int


class RetrievedChunkOut(BaseModel):
    text: str
    source_file: str
    page_number: int
    score: float


class QueryResponse(BaseModel):
    question: str
    answer: str
    citations: list[CitationOut]
    retrieved_chunks: list[RetrievedChunkOut]

    @classmethod
    def from_answer(cls, answer: Answer) -> "QueryResponse":
        return cls(
            question=answer.question,
            answer=answer.text,
            citations=[
                CitationOut(source_file=c.source_file, page_number=c.page_number)
                for c in answer.citations
            ],
            retrieved_chunks=[
                RetrievedChunkOut(
                    text=r.chunk.text,
                    source_file=r.chunk.source_file,
                    page_number=r.chunk.page_number,
                    score=r.score,
                )
                for r in answer.retrieved_chunks
            ],
        )
