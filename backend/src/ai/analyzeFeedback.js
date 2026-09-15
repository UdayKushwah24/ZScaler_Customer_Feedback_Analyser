const { lookupCanned } = require('./cannedResponses');
const { classify } = require('./ruleBasedClassifier');

// Single entry point for "run AI on this feedback text." Tries the
// canned exact-match tier first, falls back to the rule-based classifier.
// Every result carries `source` so callers (and the UI) can tell which
// tier produced it — this is the transparency mechanism the assignment
// asks for when there's no real AI to inspect.
function analyzeText(text) {
  const canned = lookupCanned(text);
  if (canned) {
    return { text, ...canned, source: 'canned' };
  }
  const classified = classify(text);
  return { text, ...classified, source: 'rule-based' };
}

function analyzeBatch(texts) {
  return texts.map(analyzeText);
}

module.exports = { analyzeText, analyzeBatch };
