import { useState } from 'react';

function KeywordList({ label, words }) {
  return (
    <p style={{ margin: '4px 0' }}>
      <strong>{label}:</strong> {words.map((w) => <code key={w} style={{ marginRight: 4 }}>{w}</code>)}
    </p>
  );
}

// This is the tester-facing explanation of how the simulated AI actually
// works. It exists because there's no real API to probe — the assignment
// requires making it clear what a reviewer should try and what to expect,
// so this pulls the LIVE rule tables from GET /api/feedback/rules instead
// of a hand-written description that could silently drift from the code.
function HowToTestPanel({ rules }) {
  const [expanded, setExpanded] = useState(true);
  const { themeKeywords, positiveSentimentKeywords, negativeSentimentKeywords, highUrgencyKeywords, mediumUrgencyKeywords, lowUrgencyKeywords } = rules.ruleBasedClassifier;

  return (
    <section style={{ background: '#fffbea', borderColor: '#e8d68a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>How to test this (Simulated AI — no real API call)</h2>
        <button type="button" className="secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {expanded && (
        <div>
          <p>
            There is no real AI/LLM behind this tool — every classification comes from one of two deterministic paths,
            and the API tags each result with which path produced it (see the "Source" column in the table below).
          </p>

          <h3>Path 1 — Canned (exact match)</h3>
          <p>
            The {rules.sampleFeedback.length} sample comments below always return the same hand-authored, PM-reviewed
            answer, verbatim, no matter how many times you submit them. Click "Load sample feedback" to test this path.
          </p>
          <ul className="muted">
            {rules.sampleFeedback.map((s) => <li key={s}>{s}</li>)}
          </ul>

          <h3>Path 2 — Rule-based (anything else)</h3>
          <p>
            Any other text is scored against fixed keyword lists — the exact ones the backend uses, shown live here so
            this panel can't drift out of sync with the code. To test it, paste a new sentence containing some of
            these words and predict the result before submitting:
          </p>

          <p className="muted" style={{ marginBottom: 4 }}><strong>Theme</strong> — highest keyword-match count wins (defaults to "General" if nothing matches):</p>
          {themeKeywords.map((t) => <KeywordList key={t.theme} label={t.theme} words={t.keywords} />)}

          <p className="muted" style={{ marginBottom: 4, marginTop: 12 }}><strong>Sentiment</strong> — more positive-word hits than negative = Positive, and vice versa; a tie or no hits = Neutral:</p>
          <KeywordList label="Positive" words={positiveSentimentKeywords} />
          <KeywordList label="Negative" words={negativeSentimentKeywords} />

          <p className="muted" style={{ marginBottom: 4, marginTop: 12 }}><strong>Urgency</strong> — checked in order, first match wins; falls back to Medium (Negative sentiment) or Low (otherwise) if nothing matches:</p>
          <KeywordList label="High" words={highUrgencyKeywords} />
          <KeywordList label="Medium" words={mediumUrgencyKeywords} />
          <KeywordList label="Low" words={lowUrgencyKeywords} />

          <p className="muted" style={{ marginTop: 12 }}>
            Example you can paste to see the fallback path: <em>"The app crashes on my phone, this is urgent."</em> → expect
            theme <strong>Mobile</strong>, sentiment <strong>Negative</strong>, urgency <strong>High</strong>, source <strong>rule-based</strong>.
          </p>
        </div>
      )}
    </section>
  );
}

export default HowToTestPanel;
