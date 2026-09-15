# Decisions

This document is written incrementally, alongside the commits that implement each decision. It will be finalized once the build is complete.

## Product scope chosen

Option 3 — Customer Feedback Analyzer. Core flow only: paste/load feedback → classify (theme, sentiment, urgency) → table + dashboard + PM insight summary. No auth, no persistence beyond the running process, no polish beyond what's needed to demonstrate the flow.

## User flow

TBD as frontend is built.

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

TBD as classifier and frontend land.

## Key technical decisions

TBD — filled in as each backend/frontend piece is committed.

## What you intentionally skipped

- Authentication — single-user local tool, out of scope.
- Real persistence — explicitly asked to simulate Mongo; a restart-clears-data store is an accepted tradeoff for a demo.
- A real AI/LLM call — explicitly asked to mock it.
- Automated test suite — the assignment's "not looking for" list explicitly excludes production-grade rigor; verification here is manual/functional against the assignment's own test cases (documented in ARCHITECTURE.md / README.md).
- Pagination, file upload parsing, CSV export — not required by the core flow.

## What you would improve with more time

- Swap the repository implementation for real Mongoose + MongoDB (the interface is already shaped for this).
- Swap the rule-based classifier for a real LLM call behind the same `analyzeFeedback` function signature, with the canned/rule-based tiers becoming a test-fixture fallback for offline dev.
- Add automated tests for the classifier's rule logic (it's pure and deterministic, so it's the highest-value place to add coverage first).
