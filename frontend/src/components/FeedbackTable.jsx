function sentimentBadgeClass(sentiment) {
  return `badge badge-${sentiment.toLowerCase()}`;
}

function urgencyBadgeClass(urgency) {
  return `badge badge-${urgency.toLowerCase()}`;
}

function sourceBadgeClass(source) {
  return `badge badge-${source}`;
}

function FeedbackTable({ feedback }) {
  return (
    <section>
      <h2>2. Classified feedback ({feedback.length})</h2>

      {feedback.length === 0 ? (
        <p className="muted">No feedback yet — load the sample set or paste your own above.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Comment</th>
                <th>Theme</th>
                <th>Sentiment</th>
                <th>Urgency</th>
                <th>Source</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item._id}>
                  <td>{item.text}</td>
                  <td>{item.theme}</td>
                  <td><span className={sentimentBadgeClass(item.sentiment)}>{item.sentiment}</span></td>
                  <td><span className={urgencyBadgeClass(item.urgency)}>{item.urgency}</span></td>
                  <td><span className={sourceBadgeClass(item.source)}>{item.source}</span></td>
                  <td className="muted">{item.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default FeedbackTable;
