import { useEffect, useMemo, useState } from 'react';
import { AssumptionsPanel } from '../components/AssumptionsPanel';
import { BuildingSelector } from '../components/BuildingSelector';
import { ComparisonChart } from '../components/ComparisonChart';
import { KpiCards } from '../components/KpiCards';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { StatusBadge } from '../components/StatusBadge';
import { StrategyCards } from '../components/StrategyCards';
import { checkHealth, getBuildings, runAnalysis } from '../services/api';
import type { AnalysisResponse, Building } from '../types/contracts';

const OBJECTIVE_PRESETS = [
  'Reduce electricity costs while maintaining acceptable comfort.',
  'Optimize evening peak demand without disrupting study activities.',
  'Minimize lighting load waste across unoccupied corridors and rooms.',
];

export function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState('');
  const [objective, setObjective] = useState(OBJECTIVE_PRESETS[0]);
  const [result, setResult] = useState<AnalysisResponse | undefined>();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<'ok' | 'err' | 'checking'>('checking');

  // Verify backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline('ok'))
      .catch(() => setApiOnline('err'));

    getBuildings()
      .then((items) => {
        setBuildings(items);
        if (items.length > 0) {
          setBuildingId(items[0].building_id);
        }
        setBuildingsLoading(false);
      })
      .catch((err) => {
        setError(`Failed to connect to backend: ${String(err.message ?? err)}`);
        setStatus('error');
        setApiOnline('err');
        setBuildingsLoading(false);
      });
  }, []);

  const selectedBuilding = useMemo(
    () => buildings.find((item) => item.building_id === buildingId),
    [buildings, buildingId]
  );

  // When changing building, clear previous result to avoid stale visual data
  const handleSelectBuilding = (id: string) => {
    setBuildingId(id);
    setResult(undefined);
    setStatus('idle');
    setError('');
  };

  async function onRunAnalysis() {
    if (!buildingId || objective.trim().length < 5) {
      setError('Select a building and enter an objective of at least 5 characters.');
      setStatus('error');
      return;
    }

    setStatus('running');
    setError('');

    try {
      const analysis = await runAnalysis({ building_id: buildingId, objective });
      setResult(analysis);
      setStatus('done');
    } catch (err) {
      setError(`Analysis calculation failed: ${String((err as Error).message)}`);
      setStatus('error');
    }
  }

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon" aria-hidden="true">🛰️</div>
          <div>
            <div className="brand-name">ORBIT</div>
            <div className="brand-tagline">Autonomous Campus Energy Intelligence</div>
          </div>
        </div>

        <div className="topbar-right">
          <span
            className={`badge-api ${apiOnline}`}
            title={apiOnline === 'ok' ? 'FastAPI Backend Connected' : 'Backend Unreachable'}
          >
            {apiOnline === 'ok' ? 'API Online' : apiOnline === 'err' ? 'API Offline' : 'Connecting…'}
          </span>
          <span className="badge-sim" title="All campus building metrics are synthetically generated">
            Simulated Data
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">
            Understand your campus. <span>Optimize its energy.</span>
          </h1>
          <p className="hero-sub">
            Evaluate conservation strategies, protect occupant comfort, and surface actionable, explainable energy recommendations across your facilities.
          </p>
        </section>

        {/* 2-Column Command Grid */}
        <div className="grid-2">
          {/* Left Column: Control Station */}
          <aside className="control-panel">
            {/* Building Selection Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">1. Select Campus Asset</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {buildings.length} Assets
                </span>
              </div>

              <BuildingSelector
                buildings={buildings}
                selectedId={buildingId}
                onSelect={handleSelectBuilding}
                loading={buildingsLoading}
              />
            </div>

            {/* Objective & Execution Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">2. Energy Objective</span>
              </div>

              <label className="field-label" htmlFor="objective-input">
                Target Facility Goal
              </label>
              <textarea
                id="objective-input"
                className="field-textarea"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe your energy reduction goal…"
                rows={3}
              />

              {/* Quick Preset Chips */}
              <div style={{ marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Presets:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {OBJECTIVE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setObjective(preset)}
                      style={{
                        textAlign: 'left',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-sm)',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        color: objective === preset ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        lineHeight: '1.3',
                        maxWidth: 'none',
                      }}
                    >
                      › {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-run"
                onClick={onRunAnalysis}
                disabled={status === 'running' || buildingsLoading}
              >
                {status === 'running' ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Analyzing Scenarios…</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Run Energy Analysis</span>
                  </>
                )}
              </button>

              <div style={{ marginTop: 'var(--sp-3)' }}>
                <StatusBadge
                  status={status}
                  source={result?.source}
                  errorMessage={error}
                />
              </div>

              <div style={{ marginTop: 'var(--sp-3)', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                Dashboard analysis computes via deterministic Python formulas. Agentverse / uAgent runs as an isolated module.
              </div>
            </div>
          </aside>

          {/* Right Column: Energy Intelligence Views */}
          <section className="results-area">
            {/* Error Notification */}
            {status === 'error' && (
              <div className="error-panel" role="alert">
                <span className="error-icon">⚠️</span>
                <div>
                  <h4 className="error-title">Unable to complete analysis</h4>
                  <p className="error-message">{error}</p>
                  <button
                    type="button"
                    className="btn-retry"
                    onClick={onRunAnalysis}
                  >
                    🔄 Retry Request
                  </button>
                </div>
              </div>
            )}

            {/* KPI Cards Overview */}
            <KpiCards
              building={selectedBuilding}
              result={result}
              loading={buildingsLoading}
            />

            {/* Comparison Visualization */}
            <ComparisonChart
              data={result}
              loading={status === 'running'}
            />

            {/* Dynamic Results: Recommendation + Candidate Cards */}
            {result && (
              <>
                <RecommendationPanel result={result} />
                <StrategyCards
                  strategies={result.strategies}
                  recommendedId={result.recommended_strategy_id}
                />
              </>
            )}

            {/* Transparency, Modeling Assumptions & Limitations */}
            <AssumptionsPanel
              assumptions={result?.assumptions}
              limitations={result?.limitations}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-note">
          <strong>ORBIT v1.0</strong> • Built for Fetch-A-Thon 3.0 (GCET Edition) • Autonomous Campus Energy Intelligence Prototype
        </div>
        <div className="footer-meta">
          All metrics are scenario estimates from synthetic building profiles.
        </div>
      </footer>
    </div>
  );
}
