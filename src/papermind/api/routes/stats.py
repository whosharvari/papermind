from fastapi import APIRouter, Request

from papermind.api.schemas.stats import StatsResponse
from papermind.core.config import get_settings

router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
def stats(http_request: Request) -> StatsResponse:
    settings = get_settings()
    retriever = http_request.app.state.retriever

    return StatsResponse(
        status="ready" if retriever is not None else "not_ready",
        paper_count=retriever.indexed_paper_count if retriever is not None else 0,
        chunk_count=retriever.indexed_chunk_count if retriever is not None else 0,
        embedding_model=settings.embedding_model,
        groq_model=settings.groq_model,
    )
