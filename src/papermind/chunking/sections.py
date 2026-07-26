"""Section-boundary detection for arXiv-style research papers.

Biased toward precision over recall: a missed boundary just falls back to
plain token-based chunking (today's behavior), but a false positive would
fragment ordinary prose. Validated against real extracted text from 13
papers before being finalized -- see Session 7 notes for the false-positive
cases this ruled out (bare numbered equation/figure references immediately
before a new sentence, e.g. "as in Eqn.(2). Formally, ...").
"""

import re

_BOUNDARY = r"(?:(?<=[.!?]\s)|(?<=\n\n))"
_HEADER_TOKEN = (
    r"(?:\d{1,2}\.\d{1,3}(?:\.\d{1,3})?\.?"  # 3.2 / 3.2.1, optional trailing "."
    r"|[A-Z]\.\d{1,2}\.?"  # A.1 (appendix)
    r"|Abstract|Introduction|References|Bibliography|Appendix"
    r"|Acknowledgments?|Acknowledgements?|Conclusions?|Related Work)"
)
_SECTION_BOUNDARY = re.compile(rf"{_BOUNDARY}(?={_HEADER_TOKEN}\s+[A-Z])")


def detect_section_boundaries(text: str) -> list[int]:
    """Return character offsets where a new section likely begins, sorted, deduplicated."""
    return sorted({m.start() for m in _SECTION_BOUNDARY.finditer(text)})
