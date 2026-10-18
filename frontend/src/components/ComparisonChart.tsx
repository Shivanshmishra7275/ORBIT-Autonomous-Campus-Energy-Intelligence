import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { AnalysisResponse } from '../types/contracts';

interface Props {
  data?: AnalysisResponse;
  loading?: boolean;
}

type ViewMode = 'both' | 'kwh' | 'cost';

export function ComparisonChart({ data, loading }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  if (loading) {
    return (
      <div className="card chart-panel" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="btn-spinner" style={{ width: '28px', height: '28px', marginBottom: 'var(--sp-3)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Computing energy strategy projections…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card chart-panel empty-state">
        <span className="empty-icon">📊</span>
        <h4 className="empty-title">Strategy Comparison Visualizer</h4>
        <p className="empty-sub">
          Submit an optimization objective above to generate side-by-side consumption and cost projections across all candidate strategies.
        </p>
      </div>
    );
  }

  const chartData = [
    {
      id: 'baseline',
      name: 'Baseline',
      shortName: 'Baseline',
      kwh: data.baseline.daily_kwh,
      cost: data.baseline.daily_cost_inr,
      isRecommended: false,
      isBaseline: true,
      kwhSaved: 0,
      costSaved: 0,
      pctSaved: 0,
      comfortImpact: 'baseline',
    },
    ...data.strategies.map((strategy) => ({
      id: strategy.strategy_id,
      name: strategy.name,
      shortName: strategy.name.replace(' Optimization', '').replace(' Adjustment', ''),
      kwh: strategy.projected_kwh,
      cost: strategy.projected_cost_inr,
      isRecommended: strategy.strategy_id === data.recommended_strategy_id,
      isBaseline: false,
      kwhSaved: strategy.kwh_saved,
      costSaved: strategy.cost_saved_inr,
      pctSaved: strategy.pct_saved,
      comfortImpact: strategy.comfort_impact,
    })),
  ];

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;

    return (
      <div className="chart-tooltip">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <span className="tooltip-label">{item.name}</span>
          {item.isRecommended && (
            <span className="strategy-recommended-badge">★ Recommended</span>
          )}
          {item.isBaseline && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reference</span>
          )}
        </div>

        <div className="tooltip-row">
          <span className="tooltip-dot" style={{ background: 'var(--accent-cyan)' }} />
          <span>Projected Energy:</span>
          <strong style={{ marginLeft: 'auto', color: 'var(--text-primary)' }}>
            {item.kwh.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kWh/d
          </strong>
        </div>

        <div className="tooltip-row">
          <span className="tooltip-dot" style={{ background: 'var(--accent-teal)' }} />
          <span>Projected Cost:</span>
          <strong style={{ marginLeft: 'auto', color: 'var(--text-primary)' }}>
            ₹{item.cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/d
          </strong>
        </div>

        {!item.isBaseline && (
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)' }}>
              <span>Est. Savings:</span>
              <strong>{item.pctSaved.toFixed(2)}% (₹{item.costSaved.toFixed(2)}/d)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <span>Comfort Impact:</span>
              <strong style={{ textTransform: 'capitalize' }}>{item.comfortImpact}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card chart-panel">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Energy & Cost Comparison</h3>
          <p className="chart-subtitle">
            Baseline versus candidate interventions (Independent scenario mode)
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: viewMode === 'both' ? 'var(--bg-overlay)' : 'transparent',
              color: viewMode === 'both' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: viewMode === 'both' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              boxShadow: 'none',
              maxWidth: 'none',
            }}
          >
            All Metrics
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kwh')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: viewMode === 'kwh' ? 'var(--bg-overlay)' : 'transparent',
              color: viewMode === 'kwh' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: viewMode === 'kwh' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              boxShadow: 'none',
              maxWidth: 'none',
            }}
          >
            kWh Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cost')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: viewMode === 'cost' ? 'var(--bg-overlay)' : 'transparent',
              color: viewMode === 'cost' ? 'var(--accent-teal)' : 'var(--text-muted)',
              border: viewMode === 'cost' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              boxShadow: 'none',
              maxWidth: 'none',
            }}
          >
            Cost (₹)
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.08)" vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              interval={0}
              dy={10}
            />
            <YAxis
              yAxisId="kwh"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit=" kWh"
              hide={viewMode === 'cost'}
            />
            {viewMode === 'both' && (
              <YAxis
                yAxisId="cost"
                orientation="right"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit=" ₹"
              />
            )}
            {viewMode === 'cost' && (
              <YAxis
                yAxisId="cost"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit=" ₹"
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '0.75rem' }}
            />

            {(viewMode === 'both' || viewMode === 'kwh') && (
              <Bar
                yAxisId="kwh"
                dataKey="kwh"
                name="Projected Energy (kWh/d)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`kwh-cell-${entry.id}`}
                    fill={
                      entry.isBaseline
                        ? '#475569'
                        : entry.isRecommended
                        ? 'var(--accent-cyan)'
                        : 'rgba(34, 211, 238, 0.45)'
                    }
                  />
                ))}
              </Bar>
            )}

            {(viewMode === 'both' || viewMode === 'cost') && (
              <Bar
                yAxisId="cost"
                dataKey="cost"
                name="Projected Cost (₹/d)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cost-cell-${entry.id}`}
                    fill={
                      entry.isBaseline
                        ? '#64748b'
                        : entry.isRecommended
                        ? 'var(--accent-teal)'
                        : 'rgba(45, 212, 191, 0.45)'
                    }
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#475569' }} /> Reference Baseline
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-cyan)' }} /> Recommended Strategy
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(34, 211, 238, 0.45)' }} /> Alternative Strategies
          </span>
        </div>
        <span>* Modeled independently against baseline; no double-counting</span>
      </div>
    </div>
  );
}
