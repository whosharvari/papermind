from typing import Literal

from pydantic import BaseModel


class StatsResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    paper_count: int
    chunk_count: int
    embedding_model: str
    groq_model: str
