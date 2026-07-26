from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from papermind import __version__
from papermind.api.routes.query import router as query_router
from papermind.core.config import get_settings
from papermind.core.logging import configure_logging, get_logger
from papermind.generation.llm import GroqLLM
from papermind.retrieval.retriever import Retriever
from papermind.vectorstore.faiss_store import VectorStoreError

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    settings = get_settings()
    app.state.retriever = None
    app.state.llm = None

    if not settings.groq_api_key:
        logger.error("GROQ_API_KEY is not set. /query will return 503 until it's configured.")
    else:
        app.state.llm = GroqLLM(api_key=settings.groq_api_key, model=settings.groq_model)

    try:
        app.state.retriever = Retriever.from_disk(
            settings.vector_store_dir, settings.embedding_model
        )
        logger.info(
            "Papermind API ready (%d chunks indexed)", app.state.retriever.indexed_chunk_count
        )
    except VectorStoreError:
        logger.error(
            "No FAISS index found at %s. Run scripts/ingest.py first; /query will return 503 "
            "until then.",
            settings.vector_store_dir,
        )

    yield


app = FastAPI(
    title="Papermind",
    description="RAG question-answering system over AI research papers.",
    version=__version__,
    lifespan=lifespan,
)

app.include_router(query_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
