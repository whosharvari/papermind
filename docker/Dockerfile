# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder

WORKDIR /app

# A normal (non-editable) install into a throwaway venv, copied whole into the
# runtime stage below -- keeps build tools and the wheel cache out of the
# final image, and sidesteps the editable-install fragility this project hit
# repeatedly in local dev (see README Troubleshooting).
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml README.md ./
COPY src/ src/

# sentence-transformers depends on torch. On Linux, PyPI's default torch wheel
# is the CUDA build, which drags in several GB of unused nvidia-* runtime
# libraries -- this container has no GPU to use them. Installing the CPU-only
# build from PyTorch's own index first means the later `pip install .` finds
# torch already satisfied and never touches the CUDA variant.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch
RUN pip install --no-cache-dir .

# Dev target: editable install so a bind-mounted ./src (see docker-compose.yml's
# `dev` profile) is actually picked up by uvicorn --reload. A plain --reload
# flag on top of the runtime stage's non-editable install wouldn't see host
# edits at all, since the installed package would still be the build-time copy.
# Inherits pyproject.toml/README.md/src/ from the `builder` stage above.
FROM builder AS dev
RUN pip install --no-cache-dir -e ".[dev]"
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "papermind.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/src"]

FROM python:3.12-slim AS runtime

RUN useradd --create-home --shell /usr/sbin/nologin appuser

WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY scripts/ scripts/
COPY evaluation/eval_set.json evaluation/eval_set.json

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    API_HOST=0.0.0.0 \
    API_PORT=8000

# Populated via a mounted volume (see docker-compose.yml) -- the image ships
# code only, never PDFs or an index (see .dockerignore and README).
RUN mkdir -p data/raw data/processed vector_store && chown -R appuser:appuser /app
VOLUME ["/app/vector_store"]

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${API_PORT}/health', timeout=3)" || exit 1

CMD ["sh", "-c", "exec uvicorn papermind.api.main:app --host ${API_HOST} --port ${API_PORT}"]
