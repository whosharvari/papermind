from pydantic import BaseModel

from papermind.chunking.schemas import Chunk


class RetrievedChunk(BaseModel):
    chunk: Chunk
    score: float
