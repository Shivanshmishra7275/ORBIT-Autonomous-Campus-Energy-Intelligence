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

  // Verify backend health and fetch initial buildings
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

  // When changing building, clear previous analysis to avoid stale results
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

  const selectedBuildingDailyCost = selectedBuilding
    ? selectedBuilding.daily_kwh_baseline * selectedBuilding.tariff_inr_per_kwh
    : 0;

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
            title={apiOnline === 'ok' ? 'FastAPI Backend Live' : 'Backend Unreachable'}
          >
            {apiOnline === 'ok' ? 'API Connected' : apiOnline === 'err' ? 'API Offline' : 'Connecting…'}
          </span>
          <span className="badge-sim" title="All campus building metrics are synthetically generated">
            Simulated Data
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        {/* Compact Hero Banner with Real-Time Asset Intelligence Strip */}
        <section className="hero" aria-label="Campus Energy Intelligence Overview">
          <div className="hero-content">
            <h1 className="hero-title">
              Understand your campus. <span>Optimize its energy.</span>
            </h1>
            <p className="hero-sub">
              Evaluate conservation interventions, protect occupant comfort, and generate explainable energy optimization recommendations.
            </p>
          </div>

          {/* Compact Asset Intelligence Summary (API Data Only) */}
          {selectedBuilding && (
            <div className="asset-summary-strip" aria-label="Active Asset Energy Snapshot">
              <div className="summary-chip">
                <span className="summary-chip-label">Active Facility</span>
                <span className="summary-chip-val" style={{ color: 'var(--accent-cyan)' }}>
                  {selectedBuilding.name}
                </span>
              </div>

              <div className="summary-divider" aria-hidden="true" />

              <div className="summary-chip">
                <span className="summary-chip-label">Baseline Demand</span>
                <span className="summary-chip-val">
                  {selectedBuilding.daily_kwh_baseline.toLocaleString('en-IN')} kWh/d
                </span>
              </div>

              <div className="summary-divider" aria-hidden="true" />

              <div className="summary-chip">
                <span className="summary-chip-label">Est. Daily Cost</span>
                <span className="summary-chip-val">
                  ₹{selectedBuildingDailyCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/d
                </span>
              </div>

              <div className="summary-divider" aria-hidden="true" />

              <div className="summary-chip">
                <span className="summary-chip-label">Schedule & Tariff</span>
                <span className="summary-chip-val" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {selectedBuilding.operating_hours.start}–{selectedBuilding.operating_hours.end} • ₹{selectedBuilding.tariff_inr_per_kwh.toFixed(2)}/kWh
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 2-Column Command Grid */}
        <div className="grid-2">
          {/* Left Column: Control Station */}
          <aside className="control-panel" aria-label="Energy Control Panel">
            {/* Building Selection Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">1. Select Campus Asset</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {buildings.length} Available
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
                rows={2}
              />

              {/* Quick Preset Chips */}
              <div style={{ marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Quick Presets:
                </span>
                <div className="preset-chips-container">
                  {OBJECTIVE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`preset-chip-btn ${objective === preset ? 'active' : ''}`}
                      onClick={() => setObjective(preset)}
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
                    <span>Evaluating Scenarios…</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Run Energy Analysis</span>
                  </>
                )}
              </button>

              <div style={{ marginTop: 'var(--sp-2)' }}>
                <StatusBadge
                  status={status}
                  source={result?.source}
                  errorMessage={error}
                />
              </div>

              <div style={{ marginTop: 'var(--sp-2)', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                Deterministic Python simulation engine. Local uAgent available via backend.
              </div>
            </div>
          </aside>

          {/* Right Column: Visual Hierarchy Ordered Results */}
          <section className="results-area" aria-label="Energy Intelligence Results">
            {/* Error Notification with Retry */}
            {status === 'error' && (
              <div className="error-panel" role="alert">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <div>
                  <h4 className="error-title">Unable to complete analysis</h4>
                  <p className="error-message">{error}</p>
                  <button
                    type="button"
                    className="btn-retry"
                    onClick={onRunAnalysis}
                  >
                    🔄 Retry Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Visual Hierarchy: When result is available, show Recommendation FIRST */}
            {result && (
              <RecommendationPanel result={result} />
            )}

            {/* Comparison Visualization: Centerpiece Comparison Chart */}
            <ComparisonChart
              data={result}
              loading={status === 'running'}
            />

            {/* Candidate Strategy Breakdown Cards */}
            {result && (
              <StrategyCards
                strategies={result.strategies}
                recommendedId={result.recommended_strategy_id}
              />
            )}

            {/* Baseline Context KPI Cards: Primary context before analysis, Supporting context after analysis */}
            <KpiCards
              building={selectedBuilding}
              result={result}
              loading={buildingsLoading}
              isSecondaryContext={Boolean(result)}
            />

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
          All values are simulated scenario models. No physical equipment control.
        </div>
      </footer>
    </div>
  );
}
