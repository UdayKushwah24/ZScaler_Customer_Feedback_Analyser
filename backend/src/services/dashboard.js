const THEMES_ORDER = ['Performance', 'Onboarding', 'Security & SSO', 'Pricing', 'Search', 'Mobile', 'Export & Reporting', 'Notifications', 'Usability', 'General'];
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'];
const URGENCIES = ['Low', 'Medium', 'High'];

function countBy(items, key, orderedKeys) {
  const counts = Object.fromEntries(orderedKeys.map((k) => [k, 0]));
  for (const item of items) {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

// Pure function, no I/O — takes the already-classified feedback list and
// returns the counts the summary dashboard needs. Kept separate from the
// controller/repository so it's trivial to unit test later (see
// DECISIONS.md "what you'd improve with more time").
function buildSummary(feedback) {
  const byTheme = countBy(feedback, 'theme', THEMES_ORDER);
  const bySentiment = countBy(feedback, 'sentiment', SENTIMENTS);
  const byUrgency = countBy(feedback, 'urgency', URGENCIES);
  const bySource = countBy(feedback, 'source', ['canned', 'rule-based']);

  return {
    total: feedback.length,
    byTheme,
    bySentiment,
    byUrgency,
    bySource,
  };
}

module.exports = { buildSummary, THEMES_ORDER, SENTIMENTS, URGENCIES };
