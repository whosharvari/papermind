from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from papermind.core.config import get_settings

router = APIRouter()


@router.get("/papers/{filename}")
def get_paper(filename: str) -> FileResponse:
    # Path(...).name strips any directory components (e.g. "../../etc/passwd"
    # becomes "passwd"), so the resolved path can never escape raw_pdf_dir.
    safe_name = Path(filename).name
    path = get_settings().raw_pdf_dir / safe_name

    if path.suffix.lower() != ".pdf" or not path.is_file():
        raise HTTPException(status_code=404, detail="Paper not found.")

    return FileResponse(path, media_type="application/pdf", filename=safe_name)
