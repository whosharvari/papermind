# Papermind Evaluation Report

## Retrieval quality by top-k

| k | Hit Rate | MRR | n |
|---|---|---|---|
| 3 | 1.00 | 0.958 | 16 |
| 5 | 1.00 | 0.958 | 16 |
| 8 | 1.00 | 0.958 | 16 |

## Answer quality & citation correctness (k=5)

- Citation accuracy (source document): 1.00 (18/18)
- Page-level accuracy (±1 page tolerance): 0.81 (13/16)
- Mean groundedness score (1-5, LLM-judged): 5.00
- False refusals on answerable questions: 2/16
- Correct refusals on out-of-corpus questions: 2/2

## Latency (ms, k=5)

| stage | mean | median | p95 |
|---|---|---|---|
| retrieval | 132 | 84 | 348 |
| generation | 3944 | 5492 | 6598 |
| total | 4077 | 5601 | 6687 |

## Per-question results

| question | citation ok | refused | groundedness | total ms |
|---|---|---|---|---|
| How many identical layers are stacked in the Transformer's encoder? | ✓ | no | 5 | 452 |
| What optimizer was used to train the Transformer model? | ✓ | yes | 5 | 431 |
| How does the Transformer encode information about token position in a sequence? | ✓ | no | 5 | 713 |
| What tokenization scheme does the Transformer use for its training vocabulary? | ✓ | yes | 5 | 665 |
| What decoding strategy is used to generate translations at inference time? | ✓ | no | 5 | 991 |
| What is label smoothing and how was it used when training the Transformer? | ✓ | no | 5 | 768 |
| What sub-layers make up each layer of the Transformer's decoder? | ✓ | no | 5 | 5925 |
| How is dropout applied during training of the Transformer? | ✓ | no | 5 | 5938 |
| What are the two unsupervised pre-training tasks used to train BERT? | ✓ | no | 5 | 3781 |
| During BERT pre-training, what fraction of the time is a masked position actually replaced with the [MASK] token? | ✓ | no | 5 | 6687 |
| What two text corpora were used to pre-train BERT? | ✓ | no | 5 | 6183 |
| How many parameters does BERT-large have? | ✓ | no | 5 | 5686 |
| What benchmark dataset is used to evaluate question-answering performance in the BERT paper? | ✓ | no | 5 | 6769 |
| What is the main architectural difference between BERT's and OpenAI GPT's self-attention? | ✓ | no | 5 | 4790 |
| What GLUE benchmark score does BERT achieve? | ✓ | no | 5 | 5515 |
| What is the difference between BERT's masked language model objective and a traditional left-to-right language model? | ✓ | no | 5 | 6145 |
| What are the limitations of Chain-of-Thought prompting? | ✓ | yes | 5 | 5981 |
| How does Reinforcement Learning from Human Feedback (RLHF) work? | ✓ | yes | 5 | 5963 |

## Observed failure modes

Two genuine failures out of 18 questions, both investigated down to a root cause rather than
left as unexplained misses:

**1. Chunk-level retrieval miss, masked by document-level hit rate** ("What optimizer was used
to train the Transformer model?"). The correct sentence ("We used the Adam optimizer [20] with
β1 = 0.9...") exists in chunk `attention_is_all_you_need.pdf::0030`, page 7 — but that chunk
also contains the preceding "5.2 Hardware and Schedule" subsection (GPU count, training step
timing) crammed in with "5.3 Optimizer" because our chunker splits on token count, not section
boundaries. Directly measured: this chunk's similarity to the query is 0.349, ranking **19th out
of 165 chunks** — nowhere near k=5, or even k=8. The topic-mixing diluted the chunk's embedding
enough to push a genuinely relevant chunk far down the ranking. This is exactly the "context
dilution" failure mode predicted going into this session, now with a concrete, measured example
— and it's invisible to our hit-rate metric, which only checks *document*-level presence in the
top-k (the *document* was trivially found; the specific *chunk* needed for this narrow factual
question was not).

**2. Over-cautious refusal despite adequate context** ("What tokenization scheme does the
Transformer use?"). The model's retrieved context and even its own answer explicitly named
"WordPiece tokens" — then refused anyway, saying the excerpts don't "provide details on the
tokenization scheme itself." The information needed was present and cited; the model was simply
too conservative in what it considered sufficient. This is the direct flip side of the
anti-hallucination prompt instruction working as designed — a small amount of over-caution is
the expected cost of a prompt that deliberately biases toward refusal over fabrication, but a
2-out-of-16 rate suggests it's currently tuned slightly too conservative.

## Limitations of this evaluation

Being upfront about what today's numbers do and don't prove, rather than overstating them:

- **The k-sweep is inconclusive by construction, not because top-k doesn't matter.** With only 2
  documents indexed, document-level hit rate is already 1.00 at k=3 — there's no headroom left
  for k=5 or k=8 to improve on. This eval set cannot yet distinguish a good top-k from a great
  one; it can only confirm retrieval isn't currently broken at the document level. A meaningful
  k-sweep needs a larger, more confusable corpus (see recommendations).
- **Latency numbers are inflated by client-side rate-limiting**, not representative of a single
  query's real latency. Firing 18 back-to-back questions against Groq's free tier triggered
  automatic retry-with-backoff on roughly half the requests (visible as `Retrying request`
  messages during the run), which is why median total latency here (~5.6s) is notably higher
  than the ~2s observed for isolated single queries in Session 4's manual testing. The retrieval
  stage's own latency (132ms mean) is unaffected and reliable, since it never touches Groq.
- **A mean groundedness score of exactly 5.00 across all 18 examples, including the two known
  failures, is itself a finding: the judge lacks discriminative power on this eval set.** The
  refusal in failure #2 is arguably still "grounded" (it doesn't contradict the excerpts), which
  is defensible, but a judge that can't distinguish a fully-answered question from an
  unnecessarily-refused one isn't yet a useful tuning signal. Treat citation accuracy and the
  manually-inspected failure cases as the reliable signal from today, not the groundedness score.
- **Citation accuracy (source-document level) is a weak signal on a 2-document corpus** — with
  only two possible documents, a mediocre retriever could still score close to 1.00 by getting a
  binary choice right most of the time. Page-level accuracy (0.81) is the more informative number
  here precisely because it's harder to get right by chance.

## Recommendations

In priority order, each tied to the specific evidence above rather than intuition:

1. **Expand the corpus before doing any further tuning.** Both the k-sweep ceiling effect and the
   weak document-level citation signal trace back to the same root cause: 2 documents is too few
   to stress-test retrieval. This should happen before chunk-size or top-k changes, since right
   now we can't actually measure whether those changes help.
2. **Chunk on section boundaries where detectable, not pure token count** — directly motivated by
   the Adam-optimizer failure. arXiv papers reliably number their subsections ("5.2", "5.3"); a
   cheap improvement is treating a line matching that pattern as a hard split point before the
   token-based recursive splitter runs, so a chunk never silently spans two subsections. This is
   a targeted fix for an observed failure, not a speculative resize of chunk_size/overlap.
3. **Soften the refusal instruction slightly**, informed by the 2/16 false-refusal rate — e.g.
   explicitly telling the model that a *paraphrase* of relevant terminology found in the excerpts
   counts as sufficient grounding, not just an exact restatement of the question's phrasing.
4. **Not recommended right now: changing chunk_size or chunk_overlap globally.** Today's evidence
   points at a chunking *boundary* problem (recommendation 2), not a chunk *size* problem — there's
   no evidence in this data that a global resize would fix the optimizer-chunk failure, and
   changing it blind would be exactly the speculative change this session was scoped to avoid.
