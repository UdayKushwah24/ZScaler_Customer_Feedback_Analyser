function CountList({ counts }) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  if (entries.length === 0) return <p className="muted">None yet.</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {entries.map(([label, count]) => (
        <li key={label}>{label}: <strong>{count}</strong></li>
      ))}
    </ul>
  );
}

function SummaryDashboard({ summary }) {
  if (!summary || summary.total === 0) {
    return (
      <section>
        <h2>3. Summary dashboard</h2>
        <p className="muted">No feedback yet — counts will appear here once you analyze some.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>3. Summary dashboard</h2>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="value">{summary.total}</div>
          <div className="muted">Total comments</div>
        </div>
        <div className="stat-box">
          <div className="muted" style={{ marginBottom: 4 }}>By theme</div>
          <CountList counts={summary.byTheme} />
        </div>
        <div className="stat-box">
          <div className="muted" style={{ marginBottom: 4 }}>By sentiment</div>
          <CountList counts={summary.bySentiment} />
        </div>
        <div className="stat-box">
          <div className="muted" style={{ marginBottom: 4 }}>By urgency</div>
          <CountList counts={summary.byUrgency} />
        </div>
        <div className="stat-box">
          <div className="muted" style={{ marginBottom: 4 }}>By AI source</div>
          <CountList counts={summary.bySource} />
        </div>
      </div>
    </section>
  );
}

export default SummaryDashboard;
