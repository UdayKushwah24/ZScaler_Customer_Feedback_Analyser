# Customer Feedback Analyzer

A PM-facing tool that takes raw customer feedback (pasted text or the built-in sample set) and turns it into themes, sentiment, urgency, a summary dashboard, and a PM-ready insight summary — built as a scoped portfolio project demonstrating product/architecture reasoning, not a production system. See [DECISIONS.md](DECISIONS.md) for the reasoning behind every choice, [ARCHITECTURE.md](ARCHITECTURE.md) for how the simulated AI classification actually works, and [AI_USAGE.md](AI_USAGE.md) for how AI was used to build this.

## Why this exists

Product teams collect feedback from many channels and struggle to quickly see themes, sentiment, urgency, and what to prioritize. This tool simulates that triage step.

## Tech stack

- **Backend:** Node.js + Express
- **Frontend:** React (Vite, plain JS)
- **"Database":** simulated in-memory store behind a Mongo-shaped repository interface (see [DECISIONS.md](DECISIONS.md)) — no real MongoDB connection, data resets when the backend restarts
- **AI:** simulated, not a real API call — a two-tier canned/rule-based classifier, see [ARCHITECTURE.md](ARCHITECTURE.md) for exactly how it works and the in-app "How to test this" panel for how to exercise both tiers

## Run it locally

Requires Node.js 18+ (built and tested on Node 24). Two processes, each in its own terminal:

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend's Vite dev server proxies `/api/*` to the backend on port 4000 (see `frontend/vite.config.js`), so no manual CORS or base-URL configuration is needed in dev.

To reset stored feedback without restarting the backend, use the "Reset all stored feedback" button in the UI (or `POST http://localhost:4000/api/feedback/reset`).

## Environment variables

None required. The backend optionally reads `PORT` (defaults to `4000`) if you need to run it on a different port.

## Assumptions

- One feedback comment per line when pasting — no CSV/file upload.
- Feedback data is meant to be ephemeral for this demo: it lives in memory only and is lost when the backend restarts (this is the "simulated MongoDB" decision — see DECISIONS.md).
- "Churn/rollout risk" is defined as High urgency + non-positive sentiment — an explicit, stated heuristic, not a hidden one (see ARCHITECTURE.md).
- The two-tier classifier prioritizes explainability and reproducibility over nuance — it can't detect sarcasm or negation. This is a deliberate tradeoff for a mocked-AI assignment, documented in ARCHITECTURE.md.

## Known limitations

- No authentication, no persistence beyond the running process, no pagination, no CSV export — all explicitly out of scope for this assignment's core flow (see DECISIONS.md "What you intentionally skipped").
- The rule-based (non-canned) classifier is a keyword heuristic, not a real model — it will misjudge sarcasm, negation, and genuinely ambiguous text. The UI flags every result's source (`canned` vs `rule-based`) so this is never hidden.
- No automated test suite — verification for this build was manual/functional (backend logic exercised with real sample data via `node -e`, frontend flows driven through a real browser with Playwright) rather than a unit/integration test suite, which the assignment's own "not looking for" list explicitly deprioritizes. See DECISIONS.md "What you would improve with more time" for what a real test suite would target first.

## Project structure

```
backend/
  server.js                       # boots Express on PORT (default 4000)
  src/
    app.js                        # Express app: middleware, routes, error handling
    routes/feedbackRoutes.js
    controllers/feedbackController.js
    services/dashboard.js         # counts by theme/sentiment/urgency/source
    services/insightSummary.js    # PM-ready summary, pain points, prioritization
    ai/analyzeFeedback.js         # orchestrates the two-tier classifier
    ai/cannedResponses.js         # tier 1: exact-match sample answers
    ai/ruleBasedClassifier.js     # tier 2: keyword/heuristic fallback
    repository/feedbackRepository.js  # simulated Mongo (in-memory store)
    data/sampleFeedback.js        # the 10 assignment sample comments
    middleware/asyncHandler.js

frontend/
  src/
    App.jsx                       # shared state + layout
    api/feedbackApi.js            # backend fetch wrappers
    components/
      HowToTestPanel.jsx          # tester-facing simulated-AI explanation
      FeedbackInput.jsx           # paste / load sample / analyze / reset
      FeedbackTable.jsx           # per-item classification + rationale
      SummaryDashboard.jsx        # counts dashboard
      InsightSummary.jsx          # PM-ready generated summary
```
