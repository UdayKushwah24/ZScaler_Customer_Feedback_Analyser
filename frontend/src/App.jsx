import { useCallback, useEffect, useState } from 'react';
import { getRules, listFeedback } from './api/feedbackApi';
import FeedbackInput from './components/FeedbackInput';
import FeedbackTable from './components/FeedbackTable';

// App-level state lives here and gets passed down to feature components as
// they're added (FeedbackTable, SummaryDashboard, InsightSummary,
// HowToTestPanel). Kept as plain useState — no state library — since this
// is a single-page tool with one shared dataset and no cross-route state
// to coordinate.
function App() {
  const [feedback, setFeedback] = useState([]);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFeedback = useCallback(async () => {
    const data = await listFeedback();
    setFeedback(data.feedback);
  }, []);

  useEffect(() => {
    Promise.all([listFeedback(), getRules()])
      .then(([feedbackData, rulesData]) => {
        setFeedback(feedbackData.feedback);
        setRules(rulesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header>
        <h1>Customer Feedback Analyzer</h1>
        <p className="muted">
          Paste customer feedback or load the sample set to see theme, sentiment, and urgency classification, a
          summary dashboard, and a PM-ready insight summary — powered by a simulated (mocked) AI, not a real API call.
        </p>
      </header>

      {error && <div className="error-banner">Could not reach the backend: {error}. Is it running on port 4000?</div>}

      {loading && !error && <p className="muted">Loading…</p>}

      {!loading && !error && rules && (
        <FeedbackInput
          sampleFeedback={rules.sampleFeedback}
          hasStoredFeedback={feedback.length > 0}
          onSubmitted={refreshFeedback}
          onReset={refreshFeedback}
        />
      )}

      {!loading && !error && <FeedbackTable feedback={feedback} />}
    </div>
  );
}

export default App;
