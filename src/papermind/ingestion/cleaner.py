"""Text cleaning and normalization for pages extracted from PDFs."""

import re
import unicodedata

_BARE_PAGE_NUMBER = re.compile(r"^\s*\d{1,4}\s*$")
_HYPHEN_LINEBREAK = re.compile(r"(\w)-\n(\w)")
_SOFT_LINEBREAK = re.compile(r"(?<!\n)\n(?!\n)")
_EXCESS_BLANK_LINES = re.compile(r"\n{3,}")
_REPEATED_SPACES = re.compile(r"[ \t]{2,}")


def clean_page_text(text: str) -> str:
    """Normalize one page's raw extracted text for chunking and embedding.

    Steps, in order:
      1. NFKC unicode normalization -- collapses typographic ligatures (e.g.
         the single "fi" glyph U+FB01) into plain ASCII letters, so search
         terms match regardless of how the PDF encoded the glyph.
      2. Drop bare page-number lines (a common footer artifact).
      3. Rejoin hyphenated line-wraps: "down-\\nstream" -> "downstream". This
         is a heuristic, not a dictionary lookup -- it will occasionally
         over-merge a genuine compound word that happens to wrap at its own
         hyphen (e.g. "well-\\nknown" -> "wellknown"). That's an accepted
         trade-off: for embedding-based retrieval, a rare merged compound
         costs less than systematically fragmented words failing to match
         queries for their unhyphenated form.
      4. Collapse single line-wrap newlines into spaces, while preserving
         blank-line paragraph breaks.
      5. Collapse repeated whitespace.
    """
    text = unicodedata.normalize("NFKC", text)

    lines = [line for line in text.split("\n") if not _BARE_PAGE_NUMBER.match(line)]
    text = "\n".join(lines)

    text = _HYPHEN_LINEBREAK.sub(r"\1\2", text)
    text = _SOFT_LINEBREAK.sub(" ", text)
    text = _EXCESS_BLANK_LINES.sub("\n\n", text)
    text = _REPEATED_SPACES.sub(" ", text)

    return text.strip()
