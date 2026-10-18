import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { AnalysisResponse } from '../types/contracts';

interface Props {
  data?: AnalysisResponse;
}

export function ComparisonChart({ data }: Props) {
  if (!data) {
    return <div className="panel">Run analysis to view baseline vs strategy comparison chart.</div>;
  }

  const chartData = [
    { name: 'Baseline', kwh: data.baseline.daily_kwh, cost: data.baseline.daily_cost_inr },
    ...data.strategies.map((item) => ({ name: item.name, kwh: item.projected_kwh, cost: item.projected_cost_inr })),
  ];

  return (
    <div className="panel chart-panel">
      <h3>Energy & Cost Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#214164" />
          <XAxis dataKey="name" stroke="#b8d8ff" />
          <YAxis stroke="#b8d8ff" />
          <Tooltip />
          <Legend />
          <Bar dataKey="kwh" fill="#46b8ff" name="kWh" />
          <Bar dataKey="cost" fill="#52e1c4" name="Cost (INR)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
