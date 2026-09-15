import { useEffect, useState } from 'react';
import { listFeedback } from './api/feedbackApi';

// App-level state lives here and gets passed down to feature components as
// they're added (FeedbackInput, FeedbackTable, SummaryDashboard,
// InsightSummary, HowToTestPanel). Kept as plain useState — no state
// library — since this is a single-page tool with one shared dataset and
// no cross-route state to coordinate.
function App() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listFeedback()
      .then((data) => setFeedback(data.feedback))
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

      {!loading && !error && (
        <section>
          <p className="muted">
            Backend connected. {feedback.length} feedback item{feedback.length === 1 ? '' : 's'} currently stored.
          </p>
        </section>
      )}
    </div>
  );
}

export default App;
