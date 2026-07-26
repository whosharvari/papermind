from pydantic import BaseModel

from papermind.retrieval.schemas import RetrievedChunk


class Citation(BaseModel):
    source_file: str
    page_number: int


class Answer(BaseModel):
    question: str
    text: str
    citations: list[Citation]
    retrieved_chunks: list[RetrievedChunk]
