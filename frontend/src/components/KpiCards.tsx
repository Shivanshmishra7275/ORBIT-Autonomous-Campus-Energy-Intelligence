import type { AnalysisResponse, Building } from '../types/contracts';

interface Props {
  building?: Building;
  result?: AnalysisResponse;
  loading?: boolean;
  isSecondaryContext?: boolean;
}

export function KpiCards({ building, result, loading, isSecondaryContext = false }: Props) {
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
      <div className="card empty-state" style={{ padding: 'var(--sp-4)' }}>
        <p className="empty-title">No campus asset selected</p>
        <p className="empty-sub">Choose a facility from the left directory to inspect its baseline energy model.</p>
      </div>
    );
  }

  const baselineCost = building.daily_kwh_baseline * building.tariff_inr_per_kwh;
  const recommendedStrategy = result?.strategies.find(
    (s) => s.strategy_id === result.recommended_strategy_id
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {isSecondaryContext && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <span className="card-title">Supporting Baseline Energy Profile</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reference Asset Context</span>
        </div>
      )}

      <div className="kpi-grid">
        {/* 1. Daily Baseline Energy */}
        <div className="kpi-card">
          <span className="kpi-label">Baseline Energy</span>
          <div className="kpi-value">
            {building.daily_kwh_baseline.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            <span className="kpi-unit"> kWh/d</span>
          </div>
          <span className="kpi-sub">Synthetic daily model</span>
          <div className="kpi-bar" title={`Baseline: ${building.daily_kwh_baseline} kWh`}>
            <div className="kpi-bar-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* 2. Daily Baseline Cost */}
        <div className="kpi-card">
          <span className="kpi-label">Baseline Cost</span>
          <div className="kpi-value">
            ₹{baselineCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="kpi-unit"> /day</span>
          </div>
          <span className="kpi-sub">Tariff: ₹{building.tariff_inr_per_kwh.toFixed(2)}/kWh</span>
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
          <span className="kpi-label">Load Signature</span>
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

        {/* 4. Potential Impact or Operational Constraints */}
        <div className="kpi-card">
          <span className="kpi-label">
            {recommendedStrategy ? 'Max Est. Savings' : 'Operational Window'}
          </span>
          {recommendedStrategy ? (
            <>
              <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>
                +{recommendedStrategy.pct_saved.toFixed(2)}%
                <span className="kpi-unit"> (₹{recommendedStrategy.cost_saved_inr.toFixed(2)}/d)</span>
              </div>
              <span className="kpi-sub" title={recommendedStrategy.name}>
                Via {recommendedStrategy.name}
              </span>
              <div className="kpi-bar">
                <div
                  className="kpi-bar-fill"
                  style={{
                    width: `${Math.min(100, recommendedStrategy.pct_saved * 6)}%`,
                    background: 'var(--accent-green)',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="kpi-value" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                {building.operating_hours.start}–{building.operating_hours.end}
              </div>
              <span className="kpi-sub" title={building.comfort_constraints.join(', ')}>
                {building.comfort_constraints[0] ?? 'Standard Comfort'}
              </span>
              <div className="kpi-bar">
                <div className="kpi-bar-fill" style={{ width: '40%', background: 'var(--text-muted)' }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
