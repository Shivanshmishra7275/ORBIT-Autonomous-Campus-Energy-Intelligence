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
      <div className="card chart-panel" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="btn-spinner" style={{ width: '26px', height: '26px', marginBottom: 'var(--sp-2)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Evaluating conservation strategies against baseline…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card chart-panel empty-state">
        <span className="empty-icon">📊</span>
        <h4 className="empty-title">Strategy Comparison Visualizer</h4>
        <p className="empty-sub">
          Select a facility and click <strong>Run Energy Analysis</strong> to generate comparative consumption and cost projections.
        </p>
      </div>
    );
  }

  const chartData = [
    {
      id: 'baseline',
      name: 'Baseline Reference',
      shortName: 'Baseline (Ref)',
      kwh: data.baseline.daily_kwh,
      cost: data.baseline.daily_cost_inr,
      isRecommended: false,
      isBaseline: true,
      kwhSaved: 0,
      costSaved: 0,
      pctSaved: 0,
      comfortImpact: 'Reference',
    },
    ...data.strategies.map((strategy) => {
      let shortLabel = strategy.name;
      if (strategy.strategy_id === 'schedule_optimization') shortLabel = 'Schedule Opt.';
      else if (strategy.strategy_id === 'hvac_setpoint_adjustment') shortLabel = 'HVAC Setpoint';
      else if (strategy.strategy_id === 'lighting_schedule_optimization') shortLabel = 'Lighting Opt.';

      return {
        id: strategy.strategy_id,
        name: strategy.name,
        shortName: shortLabel,
        kwh: strategy.projected_kwh,
        cost: strategy.projected_cost_inr,
        isRecommended: strategy.strategy_id === data.recommended_strategy_id,
        isBaseline: false,
        kwhSaved: strategy.kwh_saved,
        costSaved: strategy.cost_saved_inr,
        pctSaved: strategy.pct_saved,
        comfortImpact: strategy.comfort_impact,
      };
    }),
  ];

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;

    return (
      <div className="chart-tooltip">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
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
          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)' }}>
              <span>Est. Daily Savings:</span>
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
          <h3 className="chart-title">Energy & Cost Comparison Visualizer</h3>
          <p className="chart-subtitle">
            Daily projections for {data.building.name} (Independent scenario mode)
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-elevated)', padding: '2px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
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
              padding: '3px 8px',
              fontSize: '0.72rem',
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
              padding: '3px 8px',
              fontSize: '0.72rem',
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
            Cost (₹) Only
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.08)" vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              interval={0}
              dy={8}
            />
            <YAxis
              yAxisId="kwh"
              stroke="var(--text-muted)"
              fontSize={10}
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
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit=" ₹"
              />
            )}
            {viewMode === 'cost' && (
              <YAxis
                yAxisId="cost"
                stroke="var(--text-muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit=" ₹"
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '0.72rem' }}
            />

            {(viewMode === 'both' || viewMode === 'kwh') && (
              <Bar
                yAxisId="kwh"
                dataKey="kwh"
                name="Projected Energy (kWh/d)"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
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
                maxBarSize={44}
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#475569' }} /> Reference Baseline
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'var(--accent-cyan)' }} /> Recommended Strategy
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'rgba(34, 211, 238, 0.45)' }} /> Alternative Options
          </span>
        </div>
        <span>* Tariff: ₹{data.building.tariff_inr_per_kwh.toFixed(2)}/kWh</span>
      </div>
    </div>
  );
}
