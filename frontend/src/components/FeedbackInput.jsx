import { useState } from 'react';
import { analyzeFeedback, resetFeedback } from '../api/feedbackApi';

// One comment per line — simplest possible input contract for a paste box,
// and matches how the assignment presents its sample feedback (a numbered
// list). No file upload / CSV parsing: out of scope, see DECISIONS.md.
function parseComments(rawText) {
  return rawText
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim()) // tolerate "1. " / "1) " list prefixes if pasted verbatim
    .filter((line) => line.length > 0);
}

function FeedbackInput({ sampleFeedback, onSubmitted, onReset, hasStoredFeedback }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const comments = parseComments(text);

  function loadSample() {
    setText(sampleFeedback.join('\n'));
    setLocalError(null);
  }

  async function handleSubmit() {
    if (comments.length === 0) {
      setLocalError('Paste at least one non-empty line of feedback, or click "Load sample feedback."');
      return;
    }
    setSubmitting(true);
    setLocalError(null);
    try {
      const result = await analyzeFeedback(comments);
      await onSubmitted(result.feedback);
      setText('');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setLocalError(null);
    try {
      await resetFeedback();
      await onReset();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <section>
      <h2>1. Add feedback</h2>
      <p className="muted">One comment per line. Use the sample set to exercise the pre-built ("canned") classifications, or paste your own text to exercise the rule-based fallback — see the "How to test" panel below for what each path does.</p>

      {localError && <div className="error-banner">{localError}</div>}

      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste one feedback comment per line…"
        disabled={submitting}
      />

      <p className="muted">{comments.length} comment{comments.length === 1 ? '' : 's'} ready to submit.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="secondary" onClick={loadSample} disabled={submitting}>
          Load sample feedback ({sampleFeedback.length})
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting || comments.length === 0}>
          {submitting ? 'Analyzing…' : `Analyze ${comments.length || ''} comment${comments.length === 1 ? '' : 's'}`}
        </button>
        <button type="button" className="secondary" onClick={handleReset} disabled={resetting || !hasStoredFeedback}>
          {resetting ? 'Resetting…' : 'Reset all stored feedback'}
        </button>
      </div>
    </section>
  );
}

export default FeedbackInput;
