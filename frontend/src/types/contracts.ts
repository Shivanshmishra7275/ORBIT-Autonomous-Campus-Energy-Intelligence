export interface OperatingHours {
  start: string;
  end: string;
  days: string[];
}

export interface Building {
  building_id: string;
  name: string;
  is_simulated: true;
  daily_kwh_baseline: number;
  tariff_inr_per_kwh: number;
  operating_hours: OperatingHours;
  hvac_share_pct: number;
  lighting_share_pct: number;
  other_share_pct: number;
  occupancy_profile: string;
  comfort_constraints: string[];
}

export type ComfortImpact = 'none' | 'low' | 'moderate';

export interface StrategyResult {
  strategy_id: string;
  name: string;
  description: string;
  projected_kwh: number;
  projected_cost_inr: number;
  kwh_saved: number;
  cost_saved_inr: number;
  pct_saved: number;
  comfort_impact: ComfortImpact;
  feasibility_notes: string;
  assumptions: string[];
}

export interface AnalysisRequest {
  building_id: string;
  objective: string;
}

export interface AnalysisResponse {
  building: Building;
  objective: string;
  baseline: { daily_kwh: number; daily_cost_inr: number };
  strategies: StrategyResult[];
  recommended_strategy_id: string;
  rationale: string;
  assumptions: string[];
  limitations: string[];
  is_simulated: true;
  source: 'deterministic_engine' | 'agent';
  generated_at: string;
}
