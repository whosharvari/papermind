from pathlib import Path

import fitz
import pytest

from papermind.ingestion.loader import PDFLoader, PDFLoadError


def _make_pdf(path: Path, page_texts: list[str]) -> None:
    doc = fitz.open()
    for text in page_texts:
        page = doc.new_page()
        page.insert_text((72, 72), text)
    doc.save(path)
    doc.close()


@pytest.fixture
def sample_pdf(tmp_path: Path) -> Path:
    path = tmp_path / "sample.pdf"
    _make_pdf(path, ["Page one content.", "Page two content."])
    return path


def test_load_file_extracts_text_per_page(sample_pdf: Path) -> None:
    pages = PDFLoader().load_file(sample_pdf)

    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert "Page one content" in pages[0].text
    assert pages[1].page_number == 2
    assert "Page two content" in pages[1].text
    assert all(p.source_file == "sample.pdf" for p in pages)


def test_load_file_raises_on_missing_file(tmp_path: Path) -> None:
    with pytest.raises(PDFLoadError):
        PDFLoader().load_file(tmp_path / "does_not_exist.pdf")


def test_load_file_raises_on_corrupt_pdf(tmp_path: Path) -> None:
    bad_pdf = tmp_path / "corrupt.pdf"
    bad_pdf.write_bytes(b"not a real pdf")

    with pytest.raises(PDFLoadError):
        PDFLoader().load_file(bad_pdf)


def test_load_directory_skips_corrupt_files_and_loads_the_rest(tmp_path: Path) -> None:
    _make_pdf(tmp_path / "good.pdf", ["Valid content."])
    (tmp_path / "bad.pdf").write_bytes(b"not a real pdf")

    results = PDFLoader().load_directory(tmp_path)

    assert "good.pdf" in results
    assert "bad.pdf" not in results


def test_load_directory_returns_empty_dict_for_empty_directory(tmp_path: Path) -> None:
    assert PDFLoader().load_directory(tmp_path) == {}
