"""FastAPI application entry point.

Only a health check lives here for now — query/ingestion routes are added
in later milestones once the retrieval and generation pipelines exist.
"""

from fastapi import FastAPI

from papermind import __version__

app = FastAPI(
    title="Papermind",
    description="RAG question-answering system over AI research papers.",
    version=__version__,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
