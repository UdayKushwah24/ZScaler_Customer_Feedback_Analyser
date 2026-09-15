# AI usage log

This covers how AI was used to *build* this project. See [ARCHITECTURE.md](ARCHITECTURE.md) for how the simulated AI *inside* the product works — different topic.

## Which AI tools were used

Claude Code (Anthropic), model Claude Sonnet 5, used end-to-end for planning, implementation, self-review, and browser-based verification in an agentic loop — not a single "generate the app" prompt. All code in this repo was written by Claude Code under direct instruction and review.

## Example prompts

The real driving prompt (condensed from the actual conversation) was one detailed instruction, not a series of small asks:

> "Build a Customer Feedback Analyzer (MERN stack) as a project, not a product, for a job application. Use mock APIs instead of real APIs. Use complete senior-level reasoning for every logic/architecture decision and write it to DECISIONS.md. Commit every feature to GitHub as it's built. Don't polish the UI — I'm being tested on architecture and decision-making, not frontend design. Since the AI is simulated and returns pre-built answers, the frontend must clearly tell the user what to test. Simulate MongoDB too — don't connect a real one."

Follow-up prompts during the build were plan-mode approval ("approved as-is") and implicit correction via me (Claude) catching and reporting my own bugs mid-build rather than the user needing to point them out — see the "Where AI gave wrong/incomplete output" section below.

## Where AI helped most

- **Turning an ambiguous brief into an explicit architecture decision.** "Simulate MongoDB" and "mock the AI" are underspecified — they could mean a hardcoded JSON file, a random-response stub, or (what was actually built) a Mongoose-shaped repository interface and a two-tier canned/rule-based classifier. Working through *why* each option was better or worse for this specific assignment (testability, explainability, "don't overclaim") happened in the plan before any code was written.
- **Writing the deterministic rule tables.** Drafting keyword lists for theme/sentiment/urgency classification across 9 themes and 3 urgency tiers is exactly the kind of first-draft breadth work AI is fast at; a human would likely take longer to enumerate a reasonably complete set.
- **Catching its own bugs through actual execution, not just code review.** Every backend module was run against real sample data (via `node -e`) and every frontend feature was driven through a real, running browser (Playwright) before being committed — not just read back and assumed correct.

## Where AI gave wrong, vague, or incomplete output — and how it was caught

All four of these were caught by *running the code*, not by re-reading it, and are also logged in [DECISIONS.md](DECISIONS.md) "Bugs caught by testing" and in the commit that fixed each one:

1. **Keyword lists with overlapping substrings** (`"report"` + `"reports"` in the same theme bucket) silently double-counted one keyword occurrence, which flipped a classification result (an iPhone crash report was misfiled as "Export & Reporting" instead of "Mobile"). Caught by running the classifier against a deliberately-chosen adversarial test sentence, not by inspection.
2. **A product-judgment gap, not a code bug**: the first version of "top pain points" ranked by raw negative-sentiment count per theme, which let a minor complaint outrank two real blockers on a tie. This is the kind of mistake that looks completely correct in isolation and only shows up when you run realistic end-to-end data through it and actually read the result with a PM's eye — caught that way, not by a code review pass.
3. **A UI bug invisible in the source**: the textarea was unreadable (white-on-black) under a dark OS color scheme, despite the CSS `color-scheme: light` declaration looking correct on paper. Only surfaced by an actual browser screenshot under a forced dark color scheme.
4. **A worked example in the UI that didn't match the real system.** The "How to test this" panel's example sentence was written, then independently verified against the live classifier before being trusted — and it was wrong (missing `"crash"` from the negative-sentiment keyword list). Writing documentation about AI behavior and then checking it against the actual AI behavior, rather than assuming the two agree, is the general practice this whole log is trying to demonstrate.

## How AI-generated output was verified

- **Backend logic**: every classifier/service function was exercised with `node -e` scripts against real sample and adversarial inputs before being committed, not just read.
- **Frontend behavior**: every UI feature was driven through an actual running browser via Playwright (chromium-cli, the environment's default browser-driving tool, wasn't available on this Windows setup, so a small Playwright driver script was used instead) — real clicks, real form fills, real screenshots inspected visually, and `console --errors`-equivalent checks for JS exceptions, before any frontend commit.
- **Cross-checking documentation against code**, not just writing documentation from memory of what the code does — the bug in item 4 above was only caught because the "How to test" panel's claim was independently tested against the real classifier before shipping.

## AI-related risks/limitations noticed while building this

- **Plausible-looking logic can still be wrong in ways that only show up at runtime.** Every bug listed above compiled fine, looked reasonable on read-through, and was still incorrect — the recurring lesson of this build was that generated logic needs to be *run*, not just reviewed, especially anything involving scoring, ranking, or cross-referencing multiple keyword lists.
- **A confident-sounding rationale string is not the same as a correct classification.** `ruleBasedClassifier.js` always produces a fluent-sounding rationale even when the underlying keyword match is weak or the text is genuinely ambiguous — this is called out explicitly in ARCHITECTURE.md's "when human review is required" section as a reason rule-based (not canned) results need PM spot-checking, and it's a direct analogue of why real LLM output needs the same skepticism regardless of how confident it sounds.
