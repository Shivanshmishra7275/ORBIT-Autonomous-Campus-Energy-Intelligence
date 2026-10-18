import { useEffect, useMemo, useState } from 'react';

import { ComparisonChart } from '../components/ComparisonChart';
import { KpiCards } from '../components/KpiCards';
import { StatusBadge } from '../components/StatusBadge';
import { getBuildings, runAnalysis } from '../services/api';
import type { AnalysisResponse, Building } from '../types/contracts';

export function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState('');
  const [objective, setObjective] = useState('Reduce electricity costs while maintaining acceptable comfort.');
  const [result, setResult] = useState<AnalysisResponse | undefined>();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    getBuildings()
      .then((items) => {
        setBuildings(items);
        if (items.length) setBuildingId(items[0].building_id);
      })
      .catch((err) => {
        setError(`Failed to load buildings: ${String(err.message ?? err)}`);
        setStatus('error');
      });
  }, []);

  const selectedBuilding = useMemo(() => buildings.find((item) => item.building_id === buildingId), [buildings, buildingId]);

  async function onRunAnalysis() {
    if (!buildingId || objective.trim().length < 5) {
      setError('Select a building and enter an objective with at least 5 characters.');
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
      setError(`Analysis failed: ${String((err as Error).message)}`);
      setStatus('error');
    }
  }

  const recommended = result?.strategies.find((item) => item.strategy_id === result.recommended_strategy_id);

  return (
    <main className="app-shell">
      <header className="header panel">
        <div>
          <h1>ORBIT — Autonomous Campus Energy Intelligence</h1>
          <p>Decision support for synthetic campus energy scenarios.</p>
        </div>
        <span className="badge">Simulated Data</span>
      </header>

      <div className="panel controls">
        <label>
          Building
          <select value={buildingId} onChange={(event) => setBuildingId(event.target.value)}>
            {buildings.map((building) => (
              <option key={building.building_id} value={building.building_id}>{building.name}</option>
            ))}
          </select>
        </label>

        <label>
          Objective
          <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={3} />
        </label>

        <button onClick={onRunAnalysis} disabled={status === 'running'}>
          {status === 'running' ? 'Running…' : 'Run analysis again'}
        </button>

        <StatusBadge status={status} source={result?.source} />
      </div>

      {status === 'idle' && !result && <div className="panel">Choose a building and run an analysis to compare strategy outcomes.</div>}
      {status === 'error' && <div className="panel error">{error}</div>}

      <KpiCards building={selectedBuilding} />
      <ComparisonChart data={result} />

      {status === 'running' && <div className="panel">Analyzing strategies…</div>}

      {result && (
        <>
          <section className="panel">
            <h3>Strategy Comparison</h3>
            <div className="strategy-grid">
              {result.strategies.map((strategy) => (
                <article key={strategy.strategy_id} className="strategy-card">
                  <h4>{strategy.name}</h4>
                  <p>{strategy.description}</p>
                  <ul>
                    <li>Savings: {strategy.pct_saved}%</li>
                    <li>Cost Saved: ₹{strategy.cost_saved_inr.toFixed(2)}</li>
                    <li>Comfort Impact: {strategy.comfort_impact}</li>
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Recommendation Summary</h3>
            {recommended ? (
              <>
                <p><strong>{recommended.name}</strong> is currently ranked highest.</p>
                <p>{result.rationale}</p>
              </>
            ) : (
              <p>No recommendation available.</p>
            )}
          </section>

          <details className="panel">
            <summary>Assumptions & Limitations</summary>
            <h4>Assumptions</h4>
            <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
            <h4>Limitations</h4>
            <ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
          </details>
        </>
      )}
    </main>
  );
}
