import type { Building } from '../types/contracts';

interface Props {
  building?: Building;
}

export function KpiCards({ building }: Props) {
  if (!building) {
    return <div className="panel">Select a building to view baseline KPI cards.</div>;
  }

  const cost = building.daily_kwh_baseline * building.tariff_inr_per_kwh;

  return (
    <div className="kpi-grid">
      <div className="panel"><h3>Daily Baseline kWh</h3><p>{building.daily_kwh_baseline.toFixed(0)}</p></div>
      <div className="panel"><h3>Daily Baseline Cost</h3><p>₹{cost.toFixed(2)}</p></div>
      <div className="panel"><h3>HVAC Share</h3><p>{building.hvac_share_pct}%</p></div>
      <div className="panel"><h3>Lighting Share</h3><p>{building.lighting_share_pct}%</p></div>
    </div>
  );
}
