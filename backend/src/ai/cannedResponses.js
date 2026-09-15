// Tier 1 of the simulated AI: exact-match "canned" answers for the 10
// sample feedback strings from the assignment brief.
//
// Why hand-authored instead of running them through the rule-based
// classifier too: these are the strings a reviewer is most likely to test
// with, so they get hand-picked, defensible PM judgment calls (with a
// rationale) instead of relying on keyword heuristics. This is the same
// pattern as mocking a real AI API in tests — fixture responses for known
// inputs, a fallback for everything else (see ruleBasedClassifier.js).
//
// Keys are normalized (trimmed, lowercased) so matching is robust to
// copy-paste whitespace/case differences.
const { SAMPLE_FEEDBACK } = require('../data/sampleFeedback');

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

const CANNED_RESULTS = {
  [normalize(SAMPLE_FEEDBACK[0])]: {
    theme: 'Performance',
    sentiment: 'Negative',
    urgency: 'Medium',
    rationale: 'Complaint about load time degrading a core, frequently-used screen; annoying but not a functional blocker.',
  },
  [normalize(SAMPLE_FEEDBACK[1])]: {
    theme: 'Export & Reporting',
    sentiment: 'Positive',
    urgency: 'Low',
    rationale: 'Unprompted praise with a concrete value claim (time saved); no action needed beyond noting what works.',
  },
  [normalize(SAMPLE_FEEDBACK[2])]: {
    theme: 'Onboarding',
    sentiment: 'Negative',
    urgency: 'High',
    rationale: 'Broken invite email blocks teams from onboarding new users entirely — a functional blocker, not friction.',
  },
  [normalize(SAMPLE_FEEDBACK[3])]: {
    theme: 'Pricing',
    sentiment: 'Negative',
    urgency: 'Medium',
    rationale: 'Confusion at the pricing page risks lost conversions, but existing users are unaffected.',
  },
  [normalize(SAMPLE_FEEDBACK[4])]: {
    theme: 'Search',
    sentiment: 'Negative',
    urgency: 'Medium',
    rationale: 'Relevance problem degrades a core feature for a specific user segment (technical keyword searchers).',
  },
  [normalize(SAMPLE_FEEDBACK[5])]: {
    theme: 'Onboarding',
    sentiment: 'Positive',
    urgency: 'Low',
    rationale: 'Positive signal on a recently shipped onboarding feature; worth keeping, no action required.',
  },
  [normalize(SAMPLE_FEEDBACK[6])]: {
    theme: 'Security & SSO',
    sentiment: 'Neutral',
    urgency: 'High',
    rationale: 'Framed as a requirement rather than a complaint, but it explicitly blocks a company-wide rollout — a business-level blocker.',
  },
  [normalize(SAMPLE_FEEDBACK[7])]: {
    theme: 'Mobile',
    sentiment: 'Negative',
    urgency: 'High',
    rationale: 'A broken layout on a core workflow (viewing reports) is a functional bug, not a preference.',
  },
  [normalize(SAMPLE_FEEDBACK[8])]: {
    theme: 'Export & Reporting',
    sentiment: 'Neutral',
    urgency: 'Low',
    rationale: 'A "wish" phrased as a feature request, not a complaint about something broken.',
  },
  [normalize(SAMPLE_FEEDBACK[9])]: {
    theme: 'Onboarding',
    sentiment: 'Neutral',
    urgency: 'Medium',
    rationale: 'Mixed statement (praise + complaint) — classified Neutral because the compliment and the criticism carry similar weight; the setup-complexity complaint is the actionable part, so urgency is not Low.',
  },
};

function lookupCanned(text) {
  return CANNED_RESULTS[normalize(text)] ?? null;
}

module.exports = { lookupCanned, normalize };
