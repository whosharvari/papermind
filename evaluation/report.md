# Papermind Evaluation Report

**53 question(s) failed with a Groq API error and were excluded from every metric below** (not counted as failures, not counted as successes -- simply absent):

- What optimizer was used to train the Transformer model?
- How does the Transformer encode information about token position in a sequence?
- What tokenization scheme does the Transformer use for its training vocabulary?
- What decoding strategy is used to generate translations at inference time?
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
| 3 | 0.98 | 0.918 | 0.53 | 0.405 | 0.00 | 0.000 |
| 5 | 0.98 | 0.918 | 0.63 | 0.428 | 0.00 | 0.000 |
| 8 | 0.98 | 0.918 | 0.78 | 0.450 | 0.11 | 0.014 |

## Answer quality & citation correctness (k=5)

- Citation accuracy (source document): 1.00 (1/1)
- Page-level accuracy (±1 page tolerance): 1.00 (1/1)
- Mean groundedness score (1-5, LLM-judged): 5.00
- False refusals on answerable questions: 0/1
- Correct refusals on out-of-corpus questions: 0/0

## Latency (ms, k=5)

| stage | mean | median | p95 |
|---|---|---|---|
| retrieval | 17 | 17 | 17 |
| generation | 398 | 398 | 398 |
| total | 415 | 415 | 415 |

## Per-question results

| question | citation ok | refused | groundedness | total ms |
|---|---|---|---|---|
| How many identical layers are stacked in the Transformer's encoder? | ✓ | no | 5 | 415 |

## Generation-side data is not usable this session (1/54)

Groq's daily quota (see Session 6) had partially recovered -- a probe call succeeded -- but was
exhausted again after a single question. This is expected: the quota is shared across the whole
project and Session 6 already spent most of a day's budget just before this run. **Every
conclusion below comes from the retrieval sweep only**, which is unaffected (FAISS is local, no
Groq calls) and is this session's actual object of study per the brief.

## Before / after: Session 6 (token-only) vs. Session 7 (section-aware)

Same 13-paper corpus, same embedding model, same chunk_size/overlap, same retriever, same 49
answerable questions (the 9 chunk-level `expected_chunk_id` values were re-verified and updated
against the new chunk boundaries before this run -- chunk IDs are not stable across a re-chunk,
and re-using stale IDs would have silently scored the wrong text).

| k | Doc HR | Doc MRR | Page HR | Page MRR | Chunk HR | Chunk MRR |
|---|---|---|---|---|---|---|
| **Session 6** k=3 | 0.98 | 0.949 | 0.47 | 0.408 | 0.22 | 0.148 |
| **Session 7** k=3 | 0.98 | 0.918 | 0.53 | 0.405 | 0.00 | 0.000 |
| **Session 6** k=5 | 0.98 | 0.949 | 0.61 | 0.440 | 0.22 | 0.148 |
| **Session 7** k=5 | 0.98 | 0.918 | 0.63 | 0.428 | 0.00 | 0.000 |
| **Session 6** k=8 | 0.98 | 0.949 | 0.76 | 0.461 | 0.33 | 0.162 |
| **Session 7** k=8 | 0.98 | 0.918 | 0.78 | 0.450 | 0.11 | 0.014 |

**Chunk count:** 2,278 -> 2,349 (+3%), from forced splits at section boundaries, as predicted
before implementation.

## Analysis: mixed result, not a clean win -- and the chunk-level number needed real investigation

**Document-level: flat, as predicted.** 0.98 both sessions. This change targets fine-grained
precision, not coarse document discrimination, so no reason to expect movement here, and none
occurred.

**Page-level: modest, genuine improvement.** Hit Rate up at every k (0.47->0.53, 0.61->0.63,
0.76->0.78); MRR essentially flat to marginally down (within noise at n=49). This is the most
reliable signal in this comparison -- page-level ground truth doesn't depend on picking one
"best" chunk, just landing within a page that contains multiple chunks, so it's robust to exactly
the kind of chunk-boundary churn a re-chunk introduces.

**Chunk-level: looks like a severe regression (0.22 -> 0.00 at k=3/5), but the real story is more
specific than "section-aware chunking made retrieval worse."** I checked this rather than
reporting the raw number, per this session's "do not assume success" instruction -- and found two
distinct causes, not one:

1. **A genuine, predicted trade-off materializing.** The Adam-optimizer chunk (this whole
   session's motivating example) is now purely about the optimizer -- exactly as designed -- but
   at 461 characters it's now short enough that its embedding may lack the surrounding
   conversational framing ("we trained our models... For our big models...") that happened to
   overlap well with how the eval question was phrased. Direct check: its cosine similarity to
   "What optimizer was used to train the Transformer model?" is 0.365, ranking 97th of 2,349 --
   nowhere near top-8. The chunk is topically *purer* and unambiguously *correct* if retrieved,
   but is currently ranking lower for this specific query phrasing than the diluted version did.
   This is the trade-off named explicitly before implementation ("a short section... could hurt
   retrieval in the other direction") -- now confirmed, not hypothetical.
2. **A pre-existing ground-truth annotation weakness, exposed rather than caused by this
   session's change.** `vit_image_16x16_words.pdf::0000` -- Session 6's annotated target for "What
   patch size does the Vision Transformer use?" -- turns out to be the paper's **title and author
   block** ("AN IMAGE IS WORTH 16X16 WORDS: TRANSFORMERS FOR..."), not an explanation of the
   patch-splitting method. It only matched Session 6's keyword grep because "16x16" appears in the
   *title*. The actual methodology lives in chunks `::0004` and `::0014` (Section 3.1). Under
   token-only chunking this title block was likely merged with adjacent explanatory content,
   masking the annotation's imprecision; section-aware chunking correctly isolated the front
   matter into its own chunk, and the annotation's weakness became visible. Retrieval ranking the
   title block low for a methodology question is arguably *correct* behavior, not a failure.

Verified via direct rank lookup (not inferred from the aggregate) that neither of these is a
pipeline bug: `attention_is_all_you_need.pdf::0033` ranks 97/2349, `vit_image_16x16_words.pdf::0000`
ranks 20th (outside k=20) -- consistent with the reported Hit Rate, and the one chunk-level hit at
k=8 (`rag_knowledge_intensive.pdf::0007`, rank 8) matches the reported Chunk MRR@8 (0.014 =
(1/8)/9) exactly.

**Honest conclusion: chunk-level Hit Rate at n=9 is not a trustworthy metric on its own this
session** -- it's small enough that one annotation-quality issue swings it by 11 percentage
points, and this session's investigation surfaced exactly that. It should not be read as "chunking
got worse"; it should be read as "the chunk-level ground truth needs re-verification with the same
rigor applied to the Adam-optimizer case, before trusting this specific number."

## Recommendations (evidence-driven)

1. **Keep section-aware chunking.** Page-level Hit Rate -- the most annotation-robust metric in
   this comparison -- genuinely improved at every k, chunk purity is now verifiably correct
   (Adam-optimizer chunk no longer mixes topics), and document-level is unaffected. The chunk-level
   number is not a reason to revert; it's a reason to fix the metric's ground truth.
2. **Re-verify all 9 `expected_chunk_id` values for semantic correctness, not just keyword
   presence, before trusting chunk-level Hit Rate again.** The ViT case shows a keyword-grep
   annotation can point at prose that merely *contains* the right term rather than *explains* it.
   This is eval-set maintenance, not a chunker change.
3. **Do not chase the Adam-optimizer chunk's specific rank further** (e.g. by re-inflating chunk
   size, which would undo this session's fix) **without first re-running generation-quality
   evaluation** once Groq's quota resets. A chunk ranking 97th but being topically pure might still
   produce a *better* final answer than a diluted chunk ranking 19th, if it's retrieved at all
   within a practical k -- that's a generation-quality question this session's data can't answer,
   only a retrieval-quality question it can.
4. **No evidence today supports an embedding-model change** -- same conclusion as Session 6, for
   the same reason: nothing this session compared against an alternative model.
