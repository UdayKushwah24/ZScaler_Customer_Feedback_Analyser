# Commit messages

Reference for pushing this project to GitHub — one entry per commit, in the order they were made locally (`git log --reverse`), with the exact message used and which files it touched. If you're pushing this history as-is (`git push`), you don't need this file — it's here in case you're re-creating the commits manually (e.g. via the GitHub web UI) and need the message text per batch of files.

Each commit below carries a `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer in the real git history, reflecting that Claude Code was used to build this (see [AI_USAGE.md](AI_USAGE.md)) — keep that trailer if you're recreating commits manually and want the history to stay accurate.

---

### 1. `chore: scaffold repo (gitignore, README/DECISIONS skeletons, backend package.json)`

**Files:** `.gitignore`, `DECISIONS.md`, `README.md`, `backend/package.json`

```
chore: scaffold repo (gitignore, README/DECISIONS skeletons, backend package.json)

Sets up project structure per DECISIONS.md build plan: MERN stack with
simulated Mongo and simulated AI, documented incrementally as features land.
```

---

### 2. `feat(backend): add in-memory feedback repository and sample data`

**Files:** `backend/src/data/sampleFeedback.js`, `backend/src/repository/feedbackRepository.js`

```
feat(backend): add in-memory feedback repository and sample data

Simulated Mongo lives behind a Mongoose-shaped async CRUD interface
(create/insertMany/findAll/findById/clear) in a single file so a real
DB can be swapped in later without touching controllers. Sample data
is the assignment's 10 feedback strings, kept verbatim for exact-match
canned-response lookups in the classifier (next commit).
```

---

### 3. `feat(backend): add two-tier simulated AI classifier`

**Files:** `backend/src/ai/analyzeFeedback.js`, `backend/src/ai/cannedResponses.js`, `backend/src/ai/ruleBasedClassifier.js`

```
feat(backend): add two-tier simulated AI classifier

Tier 1 (cannedResponses.js): hand-authored PM-quality theme/sentiment/
urgency for the 10 assignment sample comments, exact-match lookup with
a rationale per item.

Tier 2 (ruleBasedClassifier.js): deterministic keyword/heuristic
classifier for any other text, so the tool doesn't break on novel
input. Exports its rule tables so the frontend transparency panel and
API can reflect the exact logic instead of a hand-written description
that could drift.

analyzeFeedback.js orchestrates: canned lookup first, rule-based
fallback, every result tagged `source` so the UI can show which tier
produced it.

Caught and fixed a keyword-list bug via manual testing before
committing: several keywords were substrings of others in the same
list (e.g. "report"/"reports", "complex"/"too complex"), which
double-counted a single occurrence and skewed theme scoring (an iPhone
crash report was misclassified as "Export & Reporting" instead of
"Mobile"). Deduplicated all keyword lists to root forms only.
```

---

### 4. `feat(backend): wire Express API (analyze/list/reset/rules)`

**Files:** `backend/package-lock.json`, `backend/server.js`, `backend/src/app.js`, `backend/src/controllers/feedbackController.js`, `backend/src/middleware/asyncHandler.js`, `backend/src/routes/feedbackRoutes.js`

```
feat(backend): wire Express API (analyze/list/reset/rules)

app.js: CORS, JSON body parsing (1mb cap), health check, 404 handler,
centralized error handler. server.js boots it on PORT (default 4000).

Controller validates input defensively (must be a string array,
non-empty after trim, request size and per-comment length capped)
since this is the actual external boundary of the app.

Added asyncHandler middleware: Express 4 doesn't forward rejected
promises from async route handlers to the error middleware on its
own, so without this a thrown error in a controller would hang the
request instead of returning a 500.

Manually smoke-tested: health check, analyze (both canned and
rule-based paths), list, reset, and the empty-comments validation
path — all behave as expected.
```

---

### 5. `feat(backend): add dashboard summary and PM-ready insight summary`

**Files:** `backend/src/controllers/feedbackController.js`, `backend/src/routes/feedbackRoutes.js`, `backend/src/services/dashboard.js`, `backend/src/services/insightSummary.js`

```
feat(backend): add dashboard summary and PM-ready insight summary

dashboard.js: pure function producing counts by theme/sentiment/
urgency/source from an already-classified feedback list.

insightSummary.js: builds the PM-ready summary (top pain points, urgent
items, churn/rollout-risk items, most common themes, sentiment
distribution %, prioritization suggestion) entirely from fields already
on each feedback item — no separate generation step, so every claim
traces back to real data instead of being open to hallucination.

Wired both into GET /api/feedback/summary and GET /api/feedback/insight.

Caught a product-judgment bug by testing against all 10 sample
comments before committing: ranking "top pain points" by a raw count
of Negative-sentiment items per theme let a 1-comment page-load
complaint tie with and beat actual blockers (a broken invite email, an
SSO requirement gating a company-wide rollout) because those were
phrased neutrally rather than angrily. Fixed by scoring pain per theme
as urgency-weighted (High=3/Medium=2/Low=1) and excluding only
Positive-sentiment items, so a calmly-worded blocker still counts as
pain. Documented as an explicit assumption in the code, not hidden.
```

---

### 6. `docs: record backend product/technical decisions in DECISIONS.md`

**Files:** `DECISIONS.md`

```
docs: record backend product/technical decisions in DECISIONS.md

Written alongside the backend commits while the reasoning (and the two
bugs caught and fixed during manual testing) is still fresh, rather
than reconstructed at the end.
```

---

### 7. `feat(frontend): scaffold Vite/React app, API client, base layout`

**Files:** `frontend/.gitignore`, `frontend/.oxlintrc.json`, `frontend/index.html`, `frontend/package-lock.json`, `frontend/package.json`, `frontend/public/favicon.svg`, `frontend/src/App.jsx`, `frontend/src/api/feedbackApi.js`, `frontend/src/index.css`, `frontend/src/main.jsx`, `frontend/vite.config.js`

```
feat(frontend): scaffold Vite/React app, API client, base layout

Vite + React (plain JS, no TS — kept lean for scope), stripped of
template boilerplate (default CSS/assets/README) that wasn't needed.
Minimal hand-written CSS only, no component library — UI polish is
explicitly out of scope per the assignment brief.

vite.config.js proxies /api/* to the Express backend on :4000 in dev,
so the frontend never hardcodes a host. feedbackApi.js wraps all
backend calls with consistent error handling.

App.jsx sets up the shared state shell (feedback/loading/error) that
FeedbackInput/FeedbackTable/SummaryDashboard/InsightSummary/
HowToTestPanel will plug into in upcoming commits, and proves
end-to-end connectivity (fetches the stored feedback list on mount).

Verified manually: `npm run dev` on both backend and frontend, backend
health check + proxied /api/feedback both return 200 through Vite.
```

---

### 8. `feat(frontend): add FeedbackInput (paste/load sample/analyze/reset)`

**Files:** `frontend/src/App.jsx`, `frontend/src/components/FeedbackInput.jsx`, `frontend/src/index.css`

```
feat(frontend): add FeedbackInput (paste/load sample/analyze/reset)

One comment per line, tolerant of pasted "1. "/"1) " list prefixes.
"Load sample feedback" fills the textarea from the backend's /rules
endpoint (single source of truth, not duplicated frontend copy) so a
reviewer can exercise the canned-answer tier directly. Analyze/Reset
call the backend then trigger App's refreshFeedback.

Verified in a real browser with Playwright (chromium-cli wasn't
available in this environment, so used a driver script against the
same Vite dev server + Express backend): loaded the 10 samples,
analyzed them, confirmed the stored count updates and no console
errors.

That pass caught a real contrast bug — the textarea rendered black
text on a black background under a dark OS theme, because `color-
scheme: light` on :root did not reliably force light form-control
rendering in this Chromium build despite computing correctly. Fixed
by giving the textarea an explicit background/color instead of
depending on inherited color-scheme, and verified the fix with a
screenshot under a forced-dark browser context.
```

---

### 9. `feat(frontend): add FeedbackTable showing per-item classification`

**Files:** `frontend/src/App.jsx`, `frontend/src/components/FeedbackTable.jsx`

```
feat(frontend): add FeedbackTable showing per-item classification

Renders every stored item's comment, theme, sentiment/urgency/source
badges, and the rationale explaining why it was classified that way —
satisfies the assignment's "show individual feedback classification"
and "explain categorization logic" requirements directly in the UI.

Verified in browser via Playwright: loaded and analyzed the 10 sample
comments, screenshotted the resulting table, confirmed all 10 rows
render with correct badges and no console errors.
```

---

### 10. `feat(frontend): add SummaryDashboard and PM-ready InsightSummary`

**Files:** `frontend/src/App.jsx`, `frontend/src/components/InsightSummary.jsx`, `frontend/src/components/SummaryDashboard.jsx`

```
feat(frontend): add SummaryDashboard and PM-ready InsightSummary

SummaryDashboard renders counts by theme/sentiment/urgency/AI-source
from GET /api/feedback/summary.

InsightSummary renders the full PM-ready output from GET
/api/feedback/insight: top pain points (with example quotes), urgent
items, churn/rollout-risk items (with the exact definition used shown
inline), most-common themes, sentiment distribution %, and the
prioritization suggestion — directly answering all six required test
cases from the assignment brief.

App.jsx now fetches feedback/summary/insight together via a single
refreshAll(), called after every analyze/reset so the three views
never drift out of sync.

Verified in browser via Playwright: loaded and analyzed the 10 sample
comments, screenshotted the full page, confirmed every section
renders with correct data and no console errors.
```

---

### 11. `feat(frontend): add HowToTestPanel + fix missing "crash" negative keyword`

**Files:** `backend/src/ai/ruleBasedClassifier.js`, `frontend/src/App.jsx`, `frontend/src/components/HowToTestPanel.jsx`

```
feat(frontend): add HowToTestPanel + fix missing "crash" negative keyword

HowToTestPanel is the direct answer to "since it's simulated AI giving
pre-built answers, the UI must clearly say what to test": it renders,
live from GET /api/feedback/rules, the 10 canned sample inputs and the
exact keyword tables driving the rule-based fallback, plus a worked
example with a predicted result — so a reviewer can predict the output
before submitting, on both tiers, without guessing. Placed above the
input section so it's read before testing starts. Collapsible so it
doesn't dominate the page once a reviewer already knows it.

Caught during verification: the worked example I wrote ("The app
crashes on my phone, this is urgent.") didn't actually produce the
sentiment I claimed. Root cause was a real classifier gap, not just a
doc error — "crash" was in HIGH_URGENCY_WORDS but missing from
NEGATIVE_WORDS, so a crash report scored Neutral sentiment instead of
Negative. Fixed the word list (not the example text) and re-verified
via a Playwright run that fills the textarea with that exact sentence
through the real UI and reads back the resulting table row, confirming
it now matches the panel's documented prediction exactly.
```

---

### 12. `docs: finalize README, DECISIONS, add ARCHITECTURE and AI_USAGE`

**Files:** `AI_USAGE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `README.md`

```
docs: finalize README, DECISIONS, add ARCHITECTURE and AI_USAGE

README: real run instructions (two dev servers, no env vars needed),
assumptions, known limitations, project structure.

DECISIONS: filled in the remaining "user flow" section, added
frontend-specific technical decisions (no state/component library,
Vite proxy, Playwright verification approach), and consolidated the
four bugs caught during manual/browser testing into one list as
concrete evidence of the build->test->fix loop, not just a claim of one.

ARCHITECTURE (new): the required architecture note for the simulated-
AI workflow — where it's used, the two-tier decision logic, what
"grounds" each output, and an explicit statement of when human review
is required and why hallucination is architecturally impossible here
(no generative step) at the cost of nuance a real model would have.

AI_USAGE (new): honest log of how Claude Code was used to build this
project, including the four bugs it introduced and caught through
actual execution (not code review) before they were committed.
```

---

### 13. `fix(frontend): render "most common themes" in insight summary`

**Files:** `frontend/src/components/InsightSummary.jsx`

```
fix(frontend): render "most common themes" in insight summary

Final verification pass against the assignment's required test cases
found the backend already computed mostCommonThemes (ranked by
frequency) in GET /api/feedback/insight, but InsightSummary.jsx never
rendered it — "what themes appear most often" had no direct answer in
the UI (the dashboard's theme counts exist but aren't frequency-
sorted). Added the missing section and re-verified through the
browser that it renders correctly, ranked highest-first.
```

---

## Simplest path: push the real history as-is

All 13 commits above already exist, in this order, on the local `main` branch. Once you're authenticated to the right GitHub account, from the project root:

```bash
git push -u origin main
```

This uploads the actual commit history (with real timestamps and the AI co-author trailer intact) rather than requiring you to recreate it — recommended over manually re-uploading files through the GitHub web UI, which would lose the incremental history entirely.
