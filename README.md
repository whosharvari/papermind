# Papermind

A production-quality Retrieval-Augmented Generation (RAG) question-answering system over a
collection of AI research papers.

## Architecture

```
Ingestion (offline, batch)
  PDFs -> Loader -> Cleaner -> Chunker -> Embedder -> FAISS index

Query (online, per-request)
  Question -> Embedder -> Retriever (FAISS top-k) -> Prompt Builder -> Groq LLM -> Answer + citations
```

| Layer | Package | Responsibility |
|---|---|---|
| Ingestion | `papermind.ingestion` | Extract text + metadata from PDFs |
| Chunking | `papermind.chunking` | Split cleaned text into retrieval-sized units |
| Embeddings | `papermind.embeddings` | Text -> vector, via Sentence Transformers |
| Vector store | `papermind.vectorstore` | Persist/query vectors via FAISS |
| Retrieval | `papermind.retrieval` | Query -> top-k relevant chunks |
| Generation | `papermind.generation` | Build grounded prompts, call Groq |
| API | `papermind.api` | FastAPI HTTP interface |
| Evaluation | `papermind.evaluation` | Retrieval + answer quality metrics |
| Core | `papermind.core` | Config, logging, shared types |

## Setup

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env   # then fill in GROQ_API_KEY
```

## Run

```bash
uvicorn papermind.api.main:app --reload
# -> http://127.0.0.1:8000/health
```

## Test

```bash
pytest
```

## Status

Project scaffold only — ingestion, chunking, embedding, retrieval, and generation pipelines are
built incrementally, one milestone at a time. See `docs/` for design notes as they're added.
