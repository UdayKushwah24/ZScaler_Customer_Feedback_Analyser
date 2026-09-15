# Architecture note: the simulated AI workflow

This covers how the "AI" in this app actually works, since it's simulated rather than a real model call. See [DECISIONS.md](DECISIONS.md) for the reasoning behind these choices, and [AI_USAGE.md](AI_USAGE.md) for how a real AI tool (Claude) was used to build this codebase — those are two different things and this file is about the former.

## Where AI is used

A single call site: `analyzeText(text)` in `backend/src/ai/analyzeFeedback.js`, invoked once per comment when a batch is submitted via `POST /api/feedback/analyze`. Nothing else in the app calls out to any classification logic — the dashboard and insight summary are pure aggregation over already-classified data (see "How outputs are grounded" below).

## What the workflow does

For each feedback comment, in order:

1. **Tier 1 — canned lookup** (`ai/cannedResponses.js`). Normalizes the text (trim, lowercase, collapse whitespace) and checks it against a fixed map of the 10 assignment sample comments, each with a hand-authored `theme`/`sentiment`/`urgency`/`rationale`. Exact match only.
2. **Tier 2 — rule-based classifier** (`ai/ruleBasedClassifier.js`), only if tier 1 misses. Scores the text against three independent keyword tables (theme, sentiment, urgency) and returns the highest-scoring/first-matching label per table, plus a rationale string naming which table drove each decision.

Every result carries `source: "canned" | "rule-based"` so the decision of which tier fired is never hidden from the caller or the UI.

## What tools/functions the "agent" has access to

There is no agent loop, no tool-calling, and no multi-step planning — this is intentionally a single deterministic function, not an agentic system, because the assignment's core requirement (theme/sentiment/urgency/summary) doesn't need one. The only "tool" is the keyword-table lookup itself; there's no external API, file system, or database access from within the classification step. The repository (mock DB) is written to *after* classification completes, by the controller, not by the classifier.

## How the system decides what to do next

Purely sequential, no branching beyond "did tier 1 match": `analyzeText` → try canned lookup → if found, return it → else run the rule-based classifier → return that. There's no retry, no re-ranking, no confidence threshold that changes the code path — every input deterministically takes one of exactly two paths, every time, which is what makes it testable and explainable to a reviewer with no access to the actual code.

## How outputs are grounded / verified

- **Tier 1** is grounded by construction: it's a lookup table of pre-verified answers, not a generative step, so it can't produce anything other than what was hand-approved.
- **Tier 2** is grounded in the literal keyword content of the input text — every field in the result traces back to a specific keyword match, and the `rationale` string names which table produced it. Nothing is inferred beyond what a keyword search can support.
- **The dashboard and insight summary** (`services/dashboard.js`, `services/insightSummary.js`) add no new AI-derived claims — they only count, filter, and rank the fields already attached to each item by tiers 1/2. The PM-ready summary text is template-generated from those counts, not written by a generative step, so it cannot state anything the underlying feedback doesn't support (directly satisfying the assignment's "avoid overclaiming beyond the feedback provided" requirement).

## When human review is required

By design, always — this is explicitly a *simulated* AI for a portfolio/demo context, not a production classifier, and the UI says so directly (see the "How to test this" panel). More specifically:

- **Tier 2 results are lower-confidence than tier 1 by construction.** The `source` badge in the UI is the human-review signal: a `rule-based` result is a first-pass triage suggestion, not a verified classification, and should be spot-checked by a PM before being acted on — especially near-tie theme scores or comments with no matching keywords at all (which fall through to `"General"` theme / `"Neutral"` sentiment).
- **Mixed-sentiment or sarcastic text will be misread.** The classifier counts keyword hits; it has no model of negation, sarcasm, or relative emphasis (e.g. "not bad" would count as negative via "bad"). This is a known, stated limitation, not a hidden one.
- **The churn/rollout-risk and pain-point rankings are explicit heuristics** (documented in DECISIONS.md), not certainties — they're a starting point for PM triage, not a final verdict.

## How hallucination is prevented

There is no generative model in this pipeline, so hallucination in the LLM sense (fabricating a fact not present in the input) is architecturally impossible — every output field is either a literal lookup (tier 1) or a keyword match against the literal input text (tier 2). The tradeoff, stated plainly: this buys perfect explainability and zero hallucination risk at the cost of the nuance a real language model would bring (sarcasm, negation, implied meaning). That tradeoff is the actual point of building it this way for this assignment — see [DECISIONS.md](DECISIONS.md) "Key product decisions."
