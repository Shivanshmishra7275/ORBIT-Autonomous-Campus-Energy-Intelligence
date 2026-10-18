import type { AnalysisResponse } from '../types/contracts';

interface Props {
  result: AnalysisResponse;
}

export function RecommendationPanel({ result }: Props) {
  const recommended = result.strategies.find(
    (item) => item.strategy_id === result.recommended_strategy_id
  );

  if (!recommended) {
    return null;
  }

  // Calculate annual projections purely based on returned daily math (daily * 365)
  const annualSavingsInr = recommended.cost_saved_inr * 365;
  const annualKwhSaved = recommended.kwh_saved * 365;

  return (
    <section className="card card-elevated rec-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>🎯</span>
          <span className="card-title" style={{ color: 'var(--accent-cyan)' }}>
            Primary Optimization Recommendation
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-sim">Simulated Estimate</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Engine: {result.source}
          </span>
        </div>
      </div>

      <h3 className="rec-headline">
        Deploy {recommended.name} for {result.building.name}
      </h3>

      <p className="rec-rationale">{result.rationale}</p>

      {/* Impact Stat Highlights */}
      <div className="rec-stats">
        <div>
          <div className="rec-stat-label">Daily Savings</div>
          <div className="rec-stat-value">
            {recommended.pct_saved.toFixed(2)}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            ₹{recommended.cost_saved_inr.toFixed(2)} / day
          </span>
        </div>

        <div>
          <div className="rec-stat-label">Daily Energy Reduction</div>
          <div className="rec-stat-value" style={{ color: 'var(--accent-teal)' }}>
            {recommended.kwh_saved.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>kWh</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            From {result.baseline.daily_kwh} kWh baseline
          </span>
        </div>

        <div>
          <div className="rec-stat-label">Annual Scenario Projection</div>
          <div className="rec-stat-value" style={{ color: 'var(--accent-green)' }}>
            ₹{annualSavingsInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            ~{annualKwhSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kWh/yr (est. 365d)
          </span>
        </div>

        <div>
          <div className="rec-stat-label">Occupant Comfort Impact</div>
          <div style={{ marginTop: '4px' }}>
            <span className={`comfort-badge comfort-${recommended.comfort_impact}`}>
              {recommended.comfort_impact} impact
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Penalty weight: {recommended.comfort_impact === 'none' ? '0.0' : recommended.comfort_impact === 'low' ? '1.2' : '3.5'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-4)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>ℹ️</span>
        <span>
          <strong>Why this won:</strong> This intervention maximizes percentage savings while honoring occupant comfort constraints ({result.building.comfort_constraints.join(', ')}).
        </span>
      </div>
    </section>
  );
}
