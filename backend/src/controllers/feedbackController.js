const repository = require('../repository/feedbackRepository');
const { analyzeBatch } = require('../ai/analyzeFeedback');
const { THEME_RULES, POSITIVE_WORDS, NEGATIVE_WORDS, HIGH_URGENCY_WORDS, MEDIUM_URGENCY_WORDS, LOW_URGENCY_WORDS } = require('../ai/ruleBasedClassifier');
const { SAMPLE_FEEDBACK } = require('../data/sampleFeedback');
const { buildSummary } = require('../services/dashboard');
const { buildInsightSummary } = require('../services/insightSummary');

const MAX_COMMENTS_PER_REQUEST = 200;
const MAX_COMMENT_LENGTH = 2000;

// POST /api/feedback/analyze
async function analyze(req, res) {
  const { comments } = req.body ?? {};

  if (!Array.isArray(comments)) {
    return res.status(400).json({ error: 'Request body must include "comments" as an array of strings.' });
  }

  const cleaned = comments
    .filter((c) => typeof c === 'string')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: 'No non-empty comments provided.' });
  }

  if (cleaned.length > MAX_COMMENTS_PER_REQUEST) {
    return res.status(400).json({ error: `Too many comments in one request (max ${MAX_COMMENTS_PER_REQUEST}).` });
  }

  const tooLong = cleaned.find((c) => c.length > MAX_COMMENT_LENGTH);
  if (tooLong) {
    return res.status(400).json({ error: `A comment exceeds the ${MAX_COMMENT_LENGTH} character limit.` });
  }

  const analyzed = analyzeBatch(cleaned);
  const saved = await repository.insertMany(analyzed);
  return res.status(201).json({ feedback: saved });
}

// GET /api/feedback
async function list(req, res) {
  const feedback = await repository.findAll();
  return res.json({ feedback });
}

// GET /api/feedback/summary
async function summary(req, res) {
  const feedback = await repository.findAll();
  return res.json(buildSummary(feedback));
}

// GET /api/feedback/insight
async function insight(req, res) {
  const feedback = await repository.findAll();
  return res.json(buildInsightSummary(feedback));
}

// POST /api/feedback/reset
async function reset(req, res) {
  await repository.clear();
  return res.status(204).send();
}

// GET /api/feedback/rules
// Exposes the exact tier-1/tier-2 logic driving the simulated AI, plus the
// sample inputs, so the frontend "How to test" panel and any API caller
// can see precisely what will happen for a given input instead of trusting
// a hand-written description.
async function rules(req, res) {
  return res.json({
    sampleFeedback: SAMPLE_FEEDBACK,
    ruleBasedClassifier: {
      themeKeywords: THEME_RULES,
      positiveSentimentKeywords: POSITIVE_WORDS,
      negativeSentimentKeywords: NEGATIVE_WORDS,
      highUrgencyKeywords: HIGH_URGENCY_WORDS,
      mediumUrgencyKeywords: MEDIUM_URGENCY_WORDS,
      lowUrgencyKeywords: LOW_URGENCY_WORDS,
    },
  });
}

module.exports = { analyze, list, summary, insight, reset, rules };
