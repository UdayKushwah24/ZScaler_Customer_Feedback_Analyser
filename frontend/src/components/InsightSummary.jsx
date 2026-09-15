function InsightSummary({ insight }) {
  if (!insight || insight.topPainPoints === undefined) return null;

  const hasData = insight.headline && !insight.headline.startsWith('No feedback');

  return (
    <section>
      <h2>4. PM-ready insight summary</h2>

      <p>{insight.summaryText}</p>

      {hasData && (
        <>
          <h3>Top pain points</h3>
          {insight.topPainPoints.length === 0 ? (
            <p className="muted">None — no negative or urgent feedback.</p>
          ) : (
            <ul>
              {insight.topPainPoints.map((p) => (
                <li key={p.theme}>
                  <strong>{p.theme}</strong> — {p.commentCount} comment{p.commentCount === 1 ? '' : 's'} (pain score {p.score})
                  <ul>
                    {p.examples.map((ex) => <li key={ex} className="muted">"{ex}"</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <h3>Most common themes</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {insight.mostCommonThemes.map(({ theme, count }) => (
              <li key={theme}>{theme}: <strong>{count}</strong></li>
            ))}
          </ul>

          <h3>Urgent items ({insight.urgentItems.length})</h3>
          {insight.urgentItems.length === 0 ? (
            <p className="muted">None flagged High urgency.</p>
          ) : (
            <ul>
              {insight.urgentItems.map((item) => (
                <li key={item.text}>[{item.theme}] {item.text}</li>
              ))}
            </ul>
          )}

          <h3>Churn / rollout risk ({insight.churnRiskItems.length})</h3>
          <p className="muted">Definition used: High urgency + non-positive sentiment.</p>
          {insight.churnRiskItems.length === 0 ? (
            <p className="muted">None flagged.</p>
          ) : (
            <ul>
              {insight.churnRiskItems.map((item) => (
                <li key={item.text}>[{item.theme}] {item.text}</li>
              ))}
            </ul>
          )}

          <h3>Sentiment distribution</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {Object.entries(insight.sentimentDistribution).map(([sentiment, pct]) => (
              <li key={sentiment}>{sentiment}: {pct}%</li>
            ))}
          </ul>

          <h3>Prioritization suggestion</h3>
          <p>{insight.prioritization}</p>
        </>
      )}
    </section>
  );
}

export default InsightSummary;
