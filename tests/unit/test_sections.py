from papermind.chunking.sections import detect_section_boundaries


def test_detects_the_session_5_adam_optimizer_boundary() -> None:
    text = (
        "The big models were trained for 300,000 steps (3.5 days). "
        "5.3 Optimizer We used the Adam optimizer [20] with beta values."
    )

    boundaries = detect_section_boundaries(text)

    assert text[boundaries[0] :].startswith("5.3 Optimizer")


def test_detects_consecutive_numbered_subsections() -> None:
    text = (
        "We trained our models on one machine with 8 GPUs. "
        "5.2 Hardware and Schedule We trained the base models for 100,000 steps. "
        "5.3 Optimizer We used the Adam optimizer."
    )

    boundaries = detect_section_boundaries(text)

    starts = [text[b:].split(" We", 1)[0] for b in boundaries]
    assert "5.2 Hardware and Schedule" in starts
    assert "5.3 Optimizer" in starts


def test_detects_trailing_period_numbering_style() -> None:
    text = "Our model processes images channel by channel. 3.3. Network Architectures We tested."

    boundaries = detect_section_boundaries(text)

    assert text[boundaries[0] :].startswith("3.3. Network Architectures")


def test_detects_appendix_letter_numbering() -> None:
    text = "This concludes the main results. A.1 Additional Experiments We also ran further tests."

    boundaries = detect_section_boundaries(text)

    assert text[boundaries[0] :].startswith("A.1 Additional Experiments")


def test_detects_bare_keyword_headers() -> None:
    text = "arXiv preprint, 2017. Introduction Recurrent neural networks have been established."

    boundaries = detect_section_boundaries(text)

    assert text[boundaries[0] :].startswith("Introduction")


def test_does_not_flag_equation_reference_before_new_sentence() -> None:
    text = (
        "The residual function is flexible, as in Eqn.(2). Formally, we consider a building block."
    )

    boundaries = detect_section_boundaries(text)

    assert boundaries == []


def test_does_not_flag_inline_number_mid_sentence() -> None:
    text = "Training requires 2.3 GPUs for a full run of the model."

    boundaries = detect_section_boundaries(text)

    assert boundaries == []


def test_does_not_flag_bare_single_digit_number() -> None:
    # Deliberate precision trade-off: bare "4. Experiments" is indistinguishable from a
    # figure/equation reference without a dot-level, so it's not detected on its own.
    text = "We show results in Fig. 4. Experiments confirm our hypothesis about scaling."

    boundaries = detect_section_boundaries(text)

    assert boundaries == []


def test_no_boundaries_in_plain_prose() -> None:
    text = "This is an ordinary paragraph with no headers or numbers of any kind in it at all."

    assert detect_section_boundaries(text) == []


def test_boundaries_are_sorted_and_deduplicated() -> None:
    text = "End of intro. Introduction repeated twice for this test. Introduction again here."

    boundaries = detect_section_boundaries(text)

    assert boundaries == sorted(set(boundaries))
