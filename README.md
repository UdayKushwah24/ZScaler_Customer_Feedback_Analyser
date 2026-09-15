# Customer Feedback Analyzer

> Status: in progress. This README is filled in incrementally as features land — see [DECISIONS.md](DECISIONS.md) for the reasoning behind each choice and the build history in `git log`.

A PM-facing tool that takes raw customer feedback (pasted text or the built-in sample set) and turns it into themes, sentiment, urgency, a summary dashboard, and a PM-ready insight summary — built as a scoped portfolio project, not a production system.

## Why this exists

Product teams collect feedback from many channels and struggle to quickly see themes, sentiment, urgency, and what to prioritize. This tool simulates that triage step.

## Tech stack

- **Backend:** Node.js + Express
- **Frontend:** React (Vite)
- **"Database":** simulated in-memory store behind a Mongo-shaped repository interface (see [DECISIONS.md](DECISIONS.md)) — no real MongoDB connection
- **AI:** simulated, not a real API call — see [AI_USAGE.md](AI_USAGE.md) and [ARCHITECTURE.md](ARCHITECTURE.md) for exactly how classification works and how to test it

## Run it locally

Full instructions land here once both the backend and frontend are scaffolded (see build progress in commit history).

## Known limitations

Tracked as they're introduced — see [DECISIONS.md](DECISIONS.md) "What you intentionally skipped."
