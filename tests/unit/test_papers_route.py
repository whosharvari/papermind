from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from papermind.api.main import app
from papermind.core.config import get_settings


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_settings_cache() -> Iterator[None]:
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_get_paper_serves_existing_pdf(
    client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("RAW_PDF_DIR", str(tmp_path))
    (tmp_path / "sample.pdf").write_bytes(b"%PDF-1.4 fake pdf content")

    response = client.get("/papers/sample.pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content == b"%PDF-1.4 fake pdf content"


def test_get_paper_404_for_missing_file(
    client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("RAW_PDF_DIR", str(tmp_path))

    response = client.get("/papers/does_not_exist.pdf")

    assert response.status_code == 404


def test_get_paper_rejects_non_pdf_files(
    client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("RAW_PDF_DIR", str(tmp_path))
    (tmp_path / "secret.txt").write_text("not a pdf")

    response = client.get("/papers/secret.txt")

    assert response.status_code == 404


def test_get_paper_path_traversal_cannot_escape_raw_pdf_dir(
    client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("RAW_PDF_DIR", str(tmp_path))
    outside = tmp_path.parent / "outside_secret.pdf"
    outside.write_bytes(b"should never be served")

    response = client.get("/papers/..%2Foutside_secret.pdf")

    assert response.status_code in (400, 404)
