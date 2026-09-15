// Tier 2 of the simulated AI: a deterministic keyword/heuristic classifier
// used for any feedback text that isn't one of the 10 exact-match canned
// samples (see cannedResponses.js).
//
// Deliberately NOT a random or LLM-backed stub: every output is traceable
// to a keyword match in THEME_RULES / SENTIMENT_RULES / URGENCY_RULES
// below. That makes it 100% reproducible, explainable ("categorization
// logic" per the assignment), and impossible to hallucinate with — the
// tradeoff is it can misjudge nuance a real model would catch. This
// module is exported and used by GET /api/feedback/rules so the frontend
// "How to test" panel shows the reviewer the *exact* same rules driving
// classification, instead of a hand-written description that could drift.

// Invariant: no keyword in any list below may be a substring of another
// keyword in the SAME list (e.g. "report" + "reports") — matching uses
// `.includes()`, so overlapping variants would double-count one occurrence
// and skew scoring. Plural/gerund forms are covered by their root already.
const THEME_RULES = [
  { theme: 'Performance', keywords: ['slow', 'load', 'lag', 'timeout', 'speed', 'performance'] },
  { theme: 'Onboarding', keywords: ['invite', 'onboard', 'setup', 'set up', 'signup', 'sign up', 'getting started', 'welcome'] },
  { theme: 'Security & SSO', keywords: ['sso', 'security', 'login', 'log in', 'password', '2fa', 'authentication', 'permission'] },
  { theme: 'Pricing', keywords: ['price', 'pricing', 'cost', 'billing', 'plan', 'subscription', 'expensive'] },
  { theme: 'Search', keywords: ['search', 'filter', 'results', 'query', 'keyword'] },
  { theme: 'Mobile', keywords: ['mobile', 'phone', 'ios', 'android', 'app store', 'responsive', 'layout'] },
  { theme: 'Export & Reporting', keywords: ['report', 'export', 'dashboard', 'schedule', 'analytics', 'data'] },
  { theme: 'Notifications', keywords: ['email', 'notification', 'notify', 'alert', 'reminder'] },
  { theme: 'Usability', keywords: ['confusing', 'confuse', 'complex', 'complicated', 'difficult', 'unclear', 'hard to', 'intuitive'] },
];

const POSITIVE_WORDS = ['love', 'great', 'helpful', 'easy', 'powerful', 'amazing', 'excellent', 'good', 'nice', 'appreciate', 'saves', 'thank', 'works well'];
const NEGATIVE_WORDS = ['cannot', "can't", 'broken', 'breaks', 'crash', 'confusing', 'slow', 'complex', 'difficult', 'bug', 'issue', 'problem', 'frustrat', 'annoying', 'bad', 'poor', 'fail', 'error', 'never arrives', 'never arrived', 'too long', 'expensive'];

const HIGH_URGENCY_WORDS = ['cannot', "can't", 'block', 'broken', 'breaks', 'crash', 'fail', 'urgent', 'critical', 'down', 'outage', 'data loss', 'churn', 'never arrives', 'never arrived', 'before we can', 'rollout'];
const MEDIUM_URGENCY_WORDS = ['confusing', 'slow', 'difficult', 'complex', 'unclear', 'delay', 'complicated'];
const LOW_URGENCY_WORDS = ['wish', 'would like', 'suggestion', 'nice to have', 'love', 'great', 'helpful'];

function countMatches(lowerText, keywords) {
  return keywords.reduce((count, kw) => (lowerText.includes(kw) ? count + 1 : count), 0);
}

function classifyTheme(lowerText) {
  let best = { theme: 'General', matches: 0 };
  for (const rule of THEME_RULES) {
    const matches = countMatches(lowerText, rule.keywords);
    if (matches > best.matches) {
      best = { theme: rule.theme, matches };
    }
  }
  return best.theme;
}

function classifySentiment(lowerText) {
  const positiveHits = countMatches(lowerText, POSITIVE_WORDS);
  const negativeHits = countMatches(lowerText, NEGATIVE_WORDS);
  if (positiveHits === 0 && negativeHits === 0) return 'Neutral';
  if (positiveHits > negativeHits) return 'Positive';
  if (negativeHits > positiveHits) return 'Negative';
  return 'Neutral';
}

function classifyUrgency(lowerText, sentiment) {
  if (countMatches(lowerText, HIGH_URGENCY_WORDS) > 0) return 'High';
  if (countMatches(lowerText, MEDIUM_URGENCY_WORDS) > 0) return 'Medium';
  if (countMatches(lowerText, LOW_URGENCY_WORDS) > 0) return 'Low';
  // No urgency keyword matched: fall back on sentiment as a weak signal —
  // unflagged negative feedback still deserves a look, unflagged
  // positive/neutral feedback doesn't.
  return sentiment === 'Negative' ? 'Medium' : 'Low';
}

function classify(text) {
  const lowerText = text.trim().toLowerCase();
  const theme = classifyTheme(lowerText);
  const sentiment = classifySentiment(lowerText);
  const urgency = classifyUrgency(lowerText, sentiment);
  return {
    theme,
    sentiment,
    urgency,
    rationale: `Rule-based: theme matched via keyword bucket "${theme}"; sentiment "${sentiment}" from positive/negative word counts; urgency "${urgency}" from urgency keyword match (or sentiment fallback).`,
  };
}

module.exports = {
  classify,
  THEME_RULES,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  HIGH_URGENCY_WORDS,
  MEDIUM_URGENCY_WORDS,
  LOW_URGENCY_WORDS,
};
