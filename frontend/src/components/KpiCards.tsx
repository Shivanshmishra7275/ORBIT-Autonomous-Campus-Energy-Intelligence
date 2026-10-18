import type { AnalysisResponse, Building } from '../types/contracts';

interface Props {
  building?: Building;
  result?: AnalysisResponse;
  loading?: boolean;
}

export function KpiCards({ building, result, loading }: Props) {
  if (loading) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card kpi-skeleton">
            <span className="kpi-label">Loading metric…</span>
            <div className="kpi-value" />
            <span className="kpi-sub">Fetching scenario parameters</span>
          </div>
        ))}
      </div>
    );
  }

  if (!building) {
    return (
      <div className="card empty-state" style={{ padding: 'var(--sp-6)' }}>
        <p className="empty-title">No building selected</p>
        <p className="empty-sub">Choose a campus building from the directory to inspect its baseline energy profile.</p>
      </div>
    );
  }

  const baselineCost = building.daily_kwh_baseline * building.tariff_inr_per_kwh;
  const recommendedStrategy = result?.strategies.find(
    (s) => s.strategy_id === result.recommended_strategy_id
  );

  return (
    <div className="kpi-grid">
      {/* 1. Daily Baseline Energy */}
      <div className="kpi-card">
        <span className="kpi-label">Est. Baseline Energy</span>
        <div className="kpi-value">
          {building.daily_kwh_baseline.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
          <span className="kpi-unit"> kWh/day</span>
        </div>
        <span className="kpi-sub">Synthetic daily model</span>
        <div className="kpi-bar" title={`Baseline: ${building.daily_kwh_baseline} kWh`}>
          <div className="kpi-bar-fill" style={{ width: '100%' }} />
        </div>
      </div>

      {/* 2. Daily Baseline Cost */}
      <div className="kpi-card">
        <span className="kpi-label">Est. Baseline Cost</span>
        <div className="kpi-value">
          ₹{baselineCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="kpi-unit"> /day</span>
        </div>
        <span className="kpi-sub">Rate: ₹{building.tariff_inr_per_kwh.toFixed(2)}/kWh (simulated)</span>
        <div className="kpi-bar">
          <div
            className="kpi-bar-fill"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-teal))',
            }}
          />
        </div>
      </div>

      {/* 3. Load Breakdown */}
      <div className="kpi-card">
        <span className="kpi-label">Load Composition</span>
        <div className="kpi-value">
          {building.hvac_share_pct}%
          <span className="kpi-unit"> HVAC / {building.lighting_share_pct}% Light</span>
        </div>
        <span className="kpi-sub">Other equipment: {building.other_share_pct}%</span>
        <div
          className="kpi-bar"
          style={{ display: 'flex', gap: '2px', background: 'transparent' }}
          title={`HVAC: ${building.hvac_share_pct}%, Lighting: ${building.lighting_share_pct}%, Other: ${building.other_share_pct}%`}
        >
          <div
            style={{
              width: `${building.hvac_share_pct}%`,
              background: 'var(--chart-hvac)',
              height: '100%',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: `${building.lighting_share_pct}%`,
              background: 'var(--chart-lighting)',
              height: '100%',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: `${building.other_share_pct}%`,
              background: 'var(--chart-schedule)',
              height: '100%',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>

      {/* 4. Potential Impact or Optimization Status */}
      <div className="kpi-card">
        <span className="kpi-label">
          {recommendedStrategy ? 'Max Est. Savings' : 'Optimization Status'}
        </span>
        {recommendedStrategy ? (
          <>
            <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>
              {recommendedStrategy.pct_saved.toFixed(2)}%
              <span className="kpi-unit"> (₹{recommendedStrategy.cost_saved_inr.toFixed(2)}/d)</span>
            </div>
            <span className="kpi-sub">Via {recommendedStrategy.name}</span>
            <div className="kpi-bar">
              <div
                className="kpi-bar-fill"
                style={{
                  width: `${Math.min(100, recommendedStrategy.pct_saved * 5)}%`,
                  background: 'var(--accent-green)',
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="kpi-value" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              Ready to Analyze
            </div>
            <span className="kpi-sub">Click Run Analysis below</span>
            <div className="kpi-bar">
              <div className="kpi-bar-fill" style={{ width: '0%' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
