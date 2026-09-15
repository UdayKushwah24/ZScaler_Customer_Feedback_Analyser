# Decisions

This document was written incrementally, alongside the commits that implement each decision — see `git log` for the order things actually happened in, including the bugs caught and fixed along the way.

## Product scope chosen

Option 3 — Customer Feedback Analyzer. Core flow only: paste/load feedback → classify (theme, sentiment, urgency) → table + dashboard + PM insight summary. No auth, no persistence beyond the running process, no polish beyond what's needed to demonstrate the flow.

## User flow

Single page, top to bottom, numbered so the order is self-evident:

1. **How to test this (Simulated AI)** — read first, on purpose. Since there's no real API to probe, this panel (sourced live from `GET /api/feedback/rules`) tells the reviewer exactly what input produces what output before they touch anything, on both the canned and rule-based tiers.
2. **Add feedback** — paste comments (one per line) or load the 10 sample comments, then Analyze. Reset clears the store for repeatable testing.
3. **Classified feedback** — every stored item with its theme/sentiment/urgency/source badges and a plain-language rationale.
4. **Summary dashboard** — counts by theme/sentiment/urgency/source.
5. **PM-ready insight summary** — top pain points, urgent items, churn/rollout risk, sentiment distribution, prioritization suggestion.

No routing/pages — a single fetch-driven page was enough for a "paste → see results" tool, and multiple pages would just add navigation overhead a PM doing a quick triage doesn't need. Submitting new comments doesn't clear old ones; they accumulate in the same store until Reset, so the tool can be used the way a PM actually would — feeding in feedback from different sources over the course of a session.

## Tech stack decision

MERN in name, but with two deliberate substitutions the user asked for:

- **Mongo → in-memory repository.** No real MongoDB connection. See "Data model / storage approach" below.
- **AI → simulated classifier.** No real LLM API call. See [AI_USAGE.md](AI_USAGE.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

Backend: Express (plain, no framework like Nest — overkill for this scope). Frontend: React via Vite (fast local dev, no need for Next.js's routing/SSR since this is a single-page tool).

## Data model / storage approach

`backend/src/repository/feedbackRepository.js` implements a small async CRUD interface (`create`, `find`, `findAll`, `clear`) shaped like how a Mongoose model would be called from a controller. The concrete storage is a JS array held in module scope (a singleton, since Node caches modules).

**Why this shape, not just a plain array in the controller:** the entire "this isn't real Mongo" decision is isolated to one file. If a real database is added later, only this file changes — swap it for a Mongoose model with the same method names, and nothing in the controllers, routes, or classifier needs to change. This is the actual senior-level tradeoff being demonstrated: simulate at the interface boundary, not by sprinkling mock logic through the codebase.

**Tradeoff accepted:** data is lost on server restart. Acceptable for a local demo tool where a reset endpoint is actually useful for repeatable testing (see below).

## Key product decisions

- **Simulated AI is two-tier (canned + rule-based), not random.** Tier 1 exact-matches the assignment's 10 sample comments to hand-authored, PM-quality classifications with a written rationale per item. Tier 2 runs any other text through a deterministic keyword/heuristic classifier. This mirrors how you'd mock a real AI API in tests — fixture responses for known inputs, a fallback for the rest — and means every classification is explainable and reproducible, never hallucinated. Every result is tagged `source: "canned" | "rule-based"` so a reviewer can see which path produced it.
- **"Pain points" are ranked by urgency-weighted score, not raw negative-sentiment count.** Caught during manual testing: ranking by a plain count of Negative-sentiment items per theme let a single low-stakes complaint (dashboard load time) tie with, and beat, actual blockers (a broken invite email, an SSO requirement blocking a company-wide rollout) because those were phrased neutrally rather than angrily. Fixed by scoring each item's contribution to its theme as `urgencyWeight(High=3/Medium=2/Low=1)`, excluding only Positive-sentiment items — so a calmly-worded blocker still counts as pain. This is a stated, visible assumption (in `insightSummary.js` and here), not a hidden heuristic.
- **Churn/rollout risk = High urgency + non-positive sentiment.** A simple, explicit, documented definition rather than a vague "sounds bad" judgment — every item flagged as churn risk can be traced back to those two fields.
- **Insight summary is derived, not generated.** `insightSummary.js` builds the PM-ready summary purely from fields already present on each classified item (theme/sentiment/urgency). There's no separate "write a paragraph" AI step, so nothing in the summary can state something the underlying data doesn't support — directly addressing the assignment's "avoid overclaiming beyond the feedback provided" requirement.

## Key technical decisions

- **Repository pattern in one file** (see "Data model" above) — isolates the mock-Mongo decision so a real DB swap doesn't ripple through the app.
- **Rule tables are exported, not just used internally.** `ruleBasedClassifier.js` exports its keyword lists via `GET /api/feedback/rules`. The frontend's "how to test" panel renders these live instead of a hand-written description, so the UI can never drift out of sync with the actual logic.
- **`asyncHandler` middleware wraps every async controller.** Express 4 does not forward a rejected promise from an async handler to the error middleware on its own — without this wrapper, a thrown error would hang the request instead of returning a 500.
- **Keyword lists must not contain substrings of each other.** Matching uses `.includes()`, so e.g. having both `"report"` and `"reports"` in the same list double-counts a single occurrence and skews theme scoring. Found via a real bug during manual testing (an iPhone crash report was misclassified as "Export & Reporting" instead of "Mobile"); fixed by deduplicating to root forms, and documented as a standing invariant in a comment above the rule tables.
- **Input validation lives in the controller, not the service layer.** The HTTP boundary (`POST /api/feedback/analyze`) is where untrusted input enters the system, so that's where it's rejected (non-array body, empty comments, per-comment length cap, per-request batch size cap) — the classifier and repository below it can assume clean input.
- **No frontend state library, no component library.** Plain `useState`/`useEffect` in `App.jsx`, passed down as props. There's one shared dataset and no cross-route state to coordinate, so Redux/Zustand/Context would be pure ceremony. Same reasoning for CSS — hand-written, no Tailwind/MUI, since the assignment explicitly does not score visual polish.
- **Vite dev proxy (`/api` → `:4000`) instead of a hardcoded API base URL.** Keeps the frontend free of environment-specific config for local dev; documented in README for what changes in a real deployment.
- **UI verification used Playwright directly, not `chromium-cli`.** The `run` skill's default tool wasn't available in this Windows environment; fell back to a small driver script (`{ chromium } = require('playwright')`, browsers already cached by a prior `npx playwright install`) to load the app, click through the real flow, and screenshot the result — the same "drive it, don't just launch it" bar, just a different tool.

## Bugs caught by testing before they shipped

Kept as one list because together they're the actual evidence of a build → test → fix loop, not just a claim of one (full detail in the corresponding commit messages):

1. **Keyword double-counting.** `"report"` and `"reports"` both in the same theme's keyword list meant one occurrence of "reports" counted twice, wrongly outranking "Mobile" for an iPhone crash report. Found by running the classifier against real sentences before committing it. Fixed by deduplicating every keyword list to root forms, with an invariant comment left in place to stop it recurring.
2. **Pain-point ranking flaw.** Ranking "top pain points" by a raw count of Negative-sentiment comments per theme let a 1-comment page-load complaint beat actual blockers (broken invite email, SSO gating a rollout) that happened to be phrased neutrally. Found by running the full 10-sample set through the real endpoint and reading the output, not just unit-level checks. Fixed with an urgency-weighted pain score.
3. **Textarea contrast bug.** The textarea rendered white-on-black under a dark OS theme despite `color-scheme: light` on `:root`. Found via a Playwright screenshot taken under a forced dark color scheme — would not have been caught by only reading the CSS. Fixed with an explicit background/color on the textarea instead of relying on inherited `color-scheme`.
4. **Missing negative keyword.** The "How to test" panel's own worked example ("The app crashes on my phone, this is urgent.") was verified against the live classifier before being written into the UI, and didn't match — `crash` was in the urgency keyword list but missing from the negative-sentiment list, so the sentiment came back Neutral instead of Negative. Fixed the word list, then re-verified through the actual browser UI (not just the function) that the documented example and the real output now agree.

## What you intentionally skipped

- Authentication — single-user local tool, out of scope.
- Real persistence — explicitly asked to simulate Mongo; a restart-clears-data store is an accepted tradeoff for a demo.
- A real AI/LLM call — explicitly asked to mock it.
- Automated test suite — the assignment's "not looking for" list explicitly excludes production-grade rigor; verification here is manual/functional against the assignment's own test cases (documented in ARCHITECTURE.md / README.md).
- Pagination, file upload parsing, CSV export — not required by the core flow.

## What you would improve with more time

- Swap the repository implementation for real Mongoose + MongoDB (the interface is already shaped for this).
- Swap the rule-based classifier for a real LLM call behind the same `analyzeFeedback` function signature, with the canned/rule-based tiers becoming a test-fixture fallback for offline dev.
- Add automated tests for the classifier's rule logic and `insightSummary.js` (both are pure and deterministic, so they're the highest-value place to add coverage first — the manual test cases used during this build would translate directly into unit tests).
- CSV/file upload for feedback input, and pagination once the stored feedback list grows past what's comfortable to render in one table.
- A confidence score or "needs human review" flag on rule-based (not canned) results with weak keyword matches — see ARCHITECTURE.md.
