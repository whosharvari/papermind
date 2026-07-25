from papermind.ingestion.cleaner import clean_page_text


def test_normalizes_ligatures() -> None:
    assert clean_page_text("The ﬁrst classiﬁcation") == "The first classification"


def test_rejoins_hyphenated_linewrap() -> None:
    assert clean_page_text("down-\nstream tasks") == "downstream tasks"


def test_drops_bare_page_number_lines() -> None:
    text = "End of section.\n6\nNext section starts here."
    assert "\n6\n" not in clean_page_text(text)


def test_collapses_soft_linebreaks_to_spaces() -> None:
    text = "This sentence wraps\nacross two lines."
    assert clean_page_text(text) == "This sentence wraps across two lines."


def test_preserves_paragraph_breaks() -> None:
    text = "First paragraph.\n\nSecond paragraph."
    assert clean_page_text(text) == "First paragraph.\n\nSecond paragraph."


def test_collapses_repeated_whitespace() -> None:
    assert clean_page_text("Too    many   spaces") == "Too many spaces"


def test_strips_leading_and_trailing_whitespace() -> None:
    assert clean_page_text("  \n padded text \n  ") == "padded text"
