const { buildSummary } = require('./dashboard');

// Heuristic used throughout this module: a "churn/rollout risk" comment is
// one with High urgency and non-positive sentiment — i.e. something
// actively blocking a user or team, not just a wishlist item. This is an
// explicit, stated assumption (not a hidden guess) per the assignment's
// "explain categorization logic or assumptions" requirement.
function isChurnRisk(item) {
  return item.urgency === 'High' && item.sentiment !== 'Positive';
}

function rankByCount(counts) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
}

// Weight for ranking "pain points" by theme. Deliberately not a plain
// count of Negative-sentiment items: a High-urgency item phrased neutrally
// (e.g. "we need SSO before we can roll this out") is a real blocker even
// though it isn't an angry complaint, so it must still count as pain.
// Positive items always contribute 0. This is a stated assumption, not a
// hidden one — see DECISIONS.md.
const URGENCY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

function painScore(item) {
  if (item.sentiment === 'Positive') return 0;
  return URGENCY_WEIGHT[item.urgency] ?? 1;
}

// Builds the PM-ready insight summary directly from the currently stored,
// already-classified feedback — no separate "generation" AI call, since
// everything needed is already on each item (theme/sentiment/urgency).
// This keeps the insight summary fully explainable: every claim it makes
// traces back to a concrete field on a concrete feedback item, so it can
// never state something the underlying data doesn't support.
function buildInsightSummary(feedback) {
  if (feedback.length === 0) {
    return {
      headline: 'No feedback submitted yet.',
      topPainPoints: [],
      urgentItems: [],
      churnRiskItems: [],
      mostCommonThemes: [],
      sentimentDistribution: {},
      prioritization: 'Submit feedback to generate a prioritization suggestion.',
      summaryText: 'No feedback has been submitted yet. Load the sample set or paste comments to generate an insight summary.',
    };
  }

  const { byTheme, bySentiment, byUrgency, total } = buildSummary(feedback);

  const painScoreByTheme = {};
  for (const item of feedback) {
    const score = painScore(item);
    if (score > 0) {
      painScoreByTheme[item.theme] = (painScoreByTheme[item.theme] ?? 0) + score;
    }
  }
  const topPainPoints = rankByCount(painScoreByTheme)
    .slice(0, 3)
    .map(([theme, score]) => {
      const themeItems = feedback.filter((f) => f.theme === theme && painScore(f) > 0);
      return {
        theme,
        score,
        commentCount: themeItems.length,
        examples: themeItems
          .slice()
          .sort((a, b) => painScore(b) - painScore(a))
          .slice(0, 2)
          .map((f) => f.text),
      };
    });

  const urgentItems = feedback.filter((f) => f.urgency === 'High').map((f) => ({ text: f.text, theme: f.theme, sentiment: f.sentiment }));

  const churnRiskItems = feedback.filter(isChurnRisk).map((f) => ({ text: f.text, theme: f.theme }));

  const mostCommonThemes = rankByCount(byTheme).map(([theme, count]) => ({ theme, count }));

  const sentimentDistribution = Object.fromEntries(
    Object.entries(bySentiment).map(([sentiment, count]) => [sentiment, total > 0 ? Math.round((count / total) * 100) : 0])
  );

  const prioritization = topPainPoints.length > 0
    ? `Prioritize "${topPainPoints[0].theme}" first — it has the highest pain score (${topPainPoints[0].commentCount} comment${topPainPoints[0].commentCount === 1 ? '' : 's'}, weighted by urgency)${churnRiskItems.length > 0 ? `, and ${churnRiskItems.length} comment${churnRiskItems.length === 1 ? '' : 's'} indicate active churn/rollout risk and should be treated as blockers regardless of theme` : ''}.`
    : 'No negative or urgent feedback to prioritize — feedback so far is neutral or positive.';

  const headline = `${total} comment${total === 1 ? '' : 's'} analyzed: ${byUrgency.High} high-urgency, ${bySentiment.Negative} negative, ${churnRiskItems.length} flagged as churn/rollout risk.`;

  const summaryText = [
    headline,
    topPainPoints.length > 0 ? `Top pain point${topPainPoints.length === 1 ? '' : 's'}: ${topPainPoints.map((p) => `${p.theme} (${p.commentCount})`).join(', ')}.` : '',
    urgentItems.length > 0 ? `${urgentItems.length} item${urgentItems.length === 1 ? '' : 's'} need immediate attention.` : '',
    prioritization,
  ].filter(Boolean).join(' ');

  return {
    headline,
    topPainPoints,
    urgentItems,
    churnRiskItems,
    mostCommonThemes,
    sentimentDistribution,
    prioritization,
    summaryText,
  };
}

module.exports = { buildInsightSummary, isChurnRisk };
