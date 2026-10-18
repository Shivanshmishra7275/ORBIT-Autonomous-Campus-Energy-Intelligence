import type { StrategyResult } from '../types/contracts';

interface Props {
  strategies: StrategyResult[];
  recommendedId: string;
}

export function StrategyCards({ strategies, recommendedId }: Props) {
  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Candidate Strategy Breakdown
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulated interventions evaluated against untouched baseline
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {strategies.length} candidate models evaluated
        </span>
      </div>

      <div className="strategy-grid">
        {strategies.map((strategy) => {
          const isRecommended = strategy.strategy_id === recommendedId;

          return (
            <article
              key={strategy.strategy_id}
              className={`strategy-card ${isRecommended ? 'recommended' : ''}`}
            >
              <div className="strategy-top">
                <h4 className="strategy-name">{strategy.name}</h4>
                {isRecommended && (
                  <span className="strategy-recommended-badge">★ Recommended</span>
                )}
              </div>

              <p className="strategy-desc">{strategy.description}</p>

              <div className="strategy-metrics">
                <div className="metric-pill">
                  <div className="metric-pill-label">Est. Savings</div>
                  <div className="metric-pill-value positive">
                    {strategy.pct_saved.toFixed(2)}%
                  </div>
                </div>

                <div className="metric-pill">
                  <div className="metric-pill-label">Cost Saved</div>
                  <div className="metric-pill-value positive">
                    ₹{strategy.cost_saved_inr.toFixed(2)}
                    <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>/d</span>
                  </div>
                </div>

                <div className="metric-pill">
                  <div className="metric-pill-label">Energy Saved</div>
                  <div className="metric-pill-value">
                    {strategy.kwh_saved.toFixed(1)}
                    <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}> kWh/d</span>
                  </div>
                </div>

                <div className="metric-pill">
                  <div className="metric-pill-label">Comfort Impact</div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`comfort-badge comfort-${strategy.comfort_impact}`}>
                      {strategy.comfort_impact}
                    </span>
                  </div>
                </div>
              </div>

              {strategy.feasibility_notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Feasibility: </strong>
                  {strategy.feasibility_notes}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
