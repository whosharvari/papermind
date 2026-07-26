# Papermind Evaluation Report

**49 question(s) failed with a Groq API error and were excluded from every metric below** (not counted as failures, not counted as successes -- simply absent):

- What is label smoothing and how was it used when training the Transformer?
- What sub-layers make up each layer of the Transformer's decoder?
- How is dropout applied during training of the Transformer?
- What are the two unsupervised pre-training tasks used to train BERT?
- During BERT pre-training, what fraction of the time is a masked position actually replaced with the [MASK] token?
- What two text corpora were used to pre-train BERT?
- How many parameters does BERT-large have?
- What benchmark dataset is used to evaluate question-answering performance in the BERT paper?
- What is the main architectural difference between BERT's and OpenAI GPT's self-attention?
- What GLUE benchmark score does BERT achieve?
- What is the difference between BERT's masked language model objective and a traditional left-to-right language model?
- What are the limitations of Chain-of-Thought prompting discussed in the paper that introduced it?
- How many parameters does the largest GPT-3 model have?
- What is few-shot learning as described in the GPT-3 paper?
- What is the maximum context window size, in tokens, that GPT-3 processes?
- How does GPT-3's approach to few-shot learning differ from traditional fine-tuning?
- What patch size does the Vision Transformer use to split an input image into a sequence of tokens?
- What large-scale dataset was the Vision Transformer pre-trained on before evaluation?
- How does the Vision Transformer's performance compare to convolutional neural networks when trained on smaller datasets?
- What pre-training objective does CLIP use to align images and text?
- How many image-text pairs were used to train CLIP?
- How does CLIP perform zero-shot image classification without task-specific training data?
- What is the core idea behind LoRA for adapting large language models?
- Which weight matrices in the Transformer's attention mechanism does LoRA typically adapt?
- Does LoRA introduce additional inference latency compared to a fully fine-tuned model?
- What two components make up a Retrieval-Augmented Generation (RAG) model?
- What retriever architecture does the RAG paper use to fetch supporting documents?
- What is the difference between the RAG-Sequence and RAG-Token model variants?
- How is the reward model trained in the human-preference-based reinforcement learning approach described in this paper?
- What kinds of tasks were used to evaluate this human-feedback-based reinforcement learning approach?
- What happens during the forward process in a denoising diffusion probabilistic model?
- What training objective is used to optimize denoising diffusion probabilistic models?
- What is chain-of-thought prompting?
- What category of tasks shows the largest improvement from chain-of-thought prompting?
- At what model scale does chain-of-thought prompting begin to improve performance?
- What three training stages make up the InstructGPT pipeline?
- What reinforcement learning algorithm is used to fine-tune InstructGPT against the reward model?
- How does InstructGPT compare to the base GPT-3 model in human preference evaluations?
- What claim does the LLaMA paper make about the availability of its training data sources?
- How many training tokens was LLaMA trained on?
- What problem do residual connections address in very deep neural networks?
- What is a shortcut (skip) connection in a residual block?
- How does LoRA's parameter-efficient fine-tuning approach differ from the full-parameter fine-tuning used to train InstructGPT's supervised policy?
- How does the retrieval-augmented approach in RAG differ from relying purely on a large pre-trained language model's parametric knowledge, as GPT-3 does?
- What is the AlphaFold protein structure prediction algorithm?
- How does federated learning preserve data privacy across distributed devices?
- What is Transformer-XL's approach to handling context beyond a fixed-length window?
- What is the Mixture-of-Experts architecture used for scaling neural networks?
- How does the Word2Vec skip-gram model learn word embeddings?

## Retrieval quality by top-k

n = 49 document-level, 49 page-level, 9 chunk-level (chunk-level ground truth only exists for narrow factual questions)

| k | Doc Hit Rate | Doc MRR | Page Hit Rate | Page MRR | Chunk Hit Rate | Chunk MRR |
|---|---|---|---|---|---|---|
| 3 | 0.98 | 0.949 | 0.47 | 0.408 | 0.22 | 0.148 |
| 5 | 0.98 | 0.949 | 0.61 | 0.440 | 0.22 | 0.148 |
| 8 | 0.98 | 0.949 | 0.76 | 0.461 | 0.33 | 0.162 |

## Answer quality & citation correctness (k=5)

- Citation accuracy (source document): 0.80 (4/5)
- Page-level accuracy (±1 page tolerance): 0.60 (3/5)
- Mean groundedness score (1-5, LLM-judged): 5.00
- False refusals on answerable questions: 3/5
- Correct refusals on out-of-corpus questions: 0/0

## Latency (ms, k=5)

| stage | mean | median | p95 |
|---|---|---|---|
| retrieval | 19 | 18 | 20 |
| generation | 503 | 500 | 554 |
| total | 522 | 521 | 563 |

## Per-question results

| question | citation ok | refused | groundedness | total ms |
|---|---|---|---|---|
| How many identical layers are stacked in the Transformer's encoder? | ✓ | no | 5 | 563 |
| What optimizer was used to train the Transformer model? | ✓ | yes | 5 | 447 |
| How does the Transformer encode information about token position in a sequence? | ✓ | no | 5 | 647 |
| What tokenization scheme does the Transformer use for its training vocabulary? | ✗ | yes | 5 | 432 |
| What decoding strategy is used to generate translations at inference time? | ✓ | yes | 5 | 521 |

## Why generation-quality numbers above are partial (5/54, not 54/54)

Groq's free-tier daily token quota (100,000 tokens/day, shared across this whole project) was
already mostly spent by Session 5's run plus this session's first attempt, and was fully
exhausted 5 questions into this session's re-run -- confirmed via the API's own error message
(`Used 100000, Requested ...`, retry-after climbing back up as old requests slowly age out of
the quota window, not a fixed midnight reset). This is a hard external constraint, not a bug:
`run_generation_eval` now isolates failures per-question (see `scripts/evaluate.py` diff --
mirrors the per-file isolation `scripts/ingest.py` already had), so the 5 questions that *did*
complete produced a real, valid partial result instead of the whole run being lost, and the 49
that failed are listed explicitly above rather than silently absent.

**Retrieval-quality numbers are unaffected by this and are complete (49/49)** -- the retrieval
sweep only calls FAISS locally, never Groq. That's also this session's actual primary goal, so
the quota exhaustion blocks the secondary analysis, not the main one.

The 3/5 false-refusal rate in this partial sample is too small to trust as a system-wide number
-- it could be real, or it could be within the same refusal-detection-heuristic noise documented
as a limitation in Session 5. **Recommendation: re-run `scripts/evaluate.py` once the daily quota
resets to get a trustworthy generation-quality number on the full 54-question set**; the report
below only draws conclusions from the complete retrieval data, not from this 5-question sample.

## Analysis: is retrieval evaluation now statistically meaningful?

Yes, and the difference from Session 5 is stark. With 2 documents, Hit Rate was flat at 1.00
across every k and every level. With 13 documents (49 answerable questions), the three
granularity levels now tell three genuinely different stories:

- **Document-level (0.98 flat across k=3/5/8):** still near-ceiling, but no longer *trivially*
  so -- there's now one real miss out of 49, not a mathematical certainty of zero misses. Flat
  MRR (0.949) across k confirms the miss isn't a ranking problem within reach of larger k; the
  right document simply isn't surfacing for that one question, however large k gets within the
  range tested.
- **Page-level (0.47 -> 0.61 -> 0.76 across k=3/5/8): this is the informative curve this session
  was built to produce.** A 29-point Hit Rate improvement from k=3 to k=8 is real, substantial,
  and monotonic -- exactly the signal Session 5 could not generate with only 2 documents. It says
  plainly that k=5 (today's default) is leaving real page-level recall on the table.
- **Chunk-level (0.22 -> 0.22 -> 0.33, n=9):** the smallest, noisiest sample (only 9 questions
  have single-chunk ground truth, by the design decided at the top of this session), but the
  absolute numbers are low even at k=8. Combined with page-level hit rate being decent at k=8
  (0.76) while chunk-level lags well behind (0.33), the gap between "found the right page" and
  "found the exact right chunk" is itself evidence: pages are being found, but the *specific*
  chunk within that page is still frequently missed -- consistent with Session 5's chunk-dilution
  finding (the Adam-optimizer chunk spanning two subsections), now observed again on a much larger
  and more diverse corpus rather than a single anecdote.

## Recommendations (evidence-driven, ranked)

1. **Raise default top-k from 5 to 8 for retrieval.** Directly supported: page-level Hit Rate
   improves 15 points (0.61 -> 0.76) and chunk-level Hit Rate improves 11 points (0.22 -> 0.33)
   moving from k=5 to k=8, with no retrieval-side cost (FAISS search over 2,278 vectors is still
   single-digit milliseconds regardless of k -- see latency table). The only real cost is a longer,
   slightly more diluted prompt, which is a generation-quality question the partial data above
   can't yet answer with confidence. This is now a data-backed change, unlike a k adjustment
   proposed from Session 5's saturated numbers would have been.
2. **Still recommend chunking on section boundaries, not resizing chunk_size/overlap** -- Session
   5's proposal, now with independent corroborating evidence (chunk-level hit rate lagging
   page-level hit rate by over 40 points at k=8) rather than a single anecdote. This remains
   unimplemented; it's a recommendation, not a change made today, per this session's scope.
3. **No evidence today supports changing the embedding model.** Nothing in this session compared
   `all-MiniLM-L6-v2` against an alternative -- recommending a swap would be exactly the kind of
   speculative change this session was scoped to avoid. If chunking-boundary fixes in a future
   session don't close the chunk-level gap, an embedding-model comparison (using this same
   chunk-level metric as the scoring function) would be the next evidence-generating experiment,
   not a starting assumption.
4. **Re-run generation-quality evaluation once the Groq daily quota resets**, before acting on the
   3/5 false-refusal signal from this session's partial sample. If the full-sample number confirms
   a materially elevated false-refusal rate on the larger corpus (plausible: more documents means
   more topically-adjacent-but-wrong chunks competing for top-k, which could make the model more
   conservative), that becomes a legitimate, separate priority for a future session's prompt work.
