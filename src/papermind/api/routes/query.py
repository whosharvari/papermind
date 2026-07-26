from fastapi import APIRouter, HTTPException, Request

from papermind.api.schemas.query import QueryRequest, QueryResponse
from papermind.core.logging import get_logger
from papermind.generation.llm import LLMError
from papermind.generation.qa import answer_question

logger = get_logger(__name__)

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
def query(request: QueryRequest, http_request: Request) -> QueryResponse:
    retriever = http_request.app.state.retriever
    llm = http_request.app.state.llm

    if retriever is None or llm is None:
        raise HTTPException(status_code=503, detail="Service not ready: index or LLM not loaded.")

    try:
        answer = answer_question(request.question, retriever, llm, k=request.k)
    except LLMError as exc:
        logger.error("Groq request failed: %s", exc)
        raise HTTPException(
            status_code=502, detail="The language model service is unavailable."
        ) from exc

    return QueryResponse.from_answer(answer)
