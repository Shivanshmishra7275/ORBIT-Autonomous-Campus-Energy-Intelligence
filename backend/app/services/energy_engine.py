from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import json

from app.schemas.contracts import AnalysisResponse, Baseline, Building, ComfortImpact, StrategyResult


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "buildings.json"
COMFORT_PENALTY = {
    ComfortImpact.none: 0.0,
    ComfortImpact.low: 1.2,
    ComfortImpact.moderate: 3.5,
}


@dataclass(frozen=True)
class StrategyConfig:
    strategy_id: str
    name: str
    description: str
    comfort_impact: ComfortImpact
    assumptions: list[str]
    feasibility_notes: str


def load_buildings() -> dict[str, Building]:
    raw = json.loads(DATA_PATH.read_text())
    buildings: dict[str, Building] = {}
    for item in raw:
        building = Building.model_validate(item)
        buildings[building.building_id] = building
    return buildings


def calculate_baseline(building: Building) -> Baseline:
    baseline_kwh = building.daily_kwh_baseline
    baseline_cost = baseline_kwh * building.tariff_inr_per_kwh
    return Baseline(daily_kwh=baseline_kwh, daily_cost_inr=round(baseline_cost, 2))


def _build_result(
    building: Building,
    config: StrategyConfig,
    savings_fraction: float,
) -> StrategyResult:
    baseline_kwh = building.daily_kwh_baseline
    savings_kwh = max(0.0, min(baseline_kwh * savings_fraction, baseline_kwh))
    projected_kwh = max(0.0, min(baseline_kwh - savings_kwh, baseline_kwh))
    pct_saved = (savings_kwh / baseline_kwh * 100) if baseline_kwh > 0 else 0.0
    projected_cost = projected_kwh * building.tariff_inr_per_kwh
    baseline_cost = baseline_kwh * building.tariff_inr_per_kwh
    return StrategyResult(
        strategy_id=config.strategy_id,
        name=config.name,
        description=config.description,
        projected_kwh=round(projected_kwh, 2),
        projected_cost_inr=round(projected_cost, 2),
        kwh_saved=round(savings_kwh, 2),
        cost_saved_inr=round(baseline_cost - projected_cost, 2),
        pct_saved=round(pct_saved, 2),
        comfort_impact=config.comfort_impact,
        feasibility_notes=config.feasibility_notes,
        assumptions=config.assumptions,
    )


def evaluate_schedule_optimization(building: Building) -> StrategyResult:
    config = StrategyConfig(
        strategy_id="schedule_optimization",
        name="Schedule Optimization",
        description="Trim low-value operating windows outside occupancy peaks.",
        comfort_impact=ComfortImpact.low,
        assumptions=[
            "Assumed 12% reduction applied to the 'other load' share through operating schedule tuning.",
            "Independent strategy mode: savings are measured against untouched baseline.",
        ],
        feasibility_notes="Best suited for buildings with predictable occupancy windows.",
    )
    fraction = (building.other_share_pct / 100.0) * 0.12
    return _build_result(building, config, fraction)


def evaluate_hvac_adjustment(building: Building) -> StrategyResult:
    config = StrategyConfig(
        strategy_id="hvac_setpoint_adjustment",
        name="HVAC Setpoint & Schedule Adjustment",
        description="Apply modest setpoint widening and schedule shifts for HVAC systems.",
        comfort_impact=ComfortImpact.moderate,
        assumptions=[
            "Assumed 11% reduction on HVAC-attributable load using midpoint estimate within an 8-15% illustrative range.",
            "Independent strategy mode: savings are measured against untouched baseline.",
        ],
        feasibility_notes="Requires facility team oversight to keep thermal comfort within policy limits.",
    )
    fraction = (building.hvac_share_pct / 100.0) * 0.11
    return _build_result(building, config, fraction)


def evaluate_lighting_optimization(building: Building) -> StrategyResult:
    config = StrategyConfig(
        strategy_id="lighting_schedule_optimization",
        name="Lighting Schedule Optimization",
        description="Use occupancy-aware dimming and schedule policies for lighting loads.",
        comfort_impact=ComfortImpact.none,
        assumptions=[
            "Assumed 18% reduction on lighting-attributable load via occupancy-based controls.",
            "Independent strategy mode: savings are measured against untouched baseline.",
        ],
        feasibility_notes="High feasibility where room-level control policies already exist.",
    )
    fraction = (building.lighting_share_pct / 100.0) * 0.18
    return _build_result(building, config, fraction)


def rank_strategies(strategies: list[StrategyResult]) -> list[StrategyResult]:
    return sorted(
        strategies,
        key=lambda item: item.pct_saved - COMFORT_PENALTY[item.comfort_impact],
        reverse=True,
    )


def analyze_building(building: Building, objective: str, source: str = "deterministic_engine") -> AnalysisResponse:
    baseline = calculate_baseline(building)
    strategies = [
        evaluate_schedule_optimization(building),
        evaluate_hvac_adjustment(building),
        evaluate_lighting_optimization(building),
    ]
    ranked = rank_strategies(strategies)
    top = ranked[0]

    return AnalysisResponse(
        building=building,
        objective=objective,
        baseline=baseline,
        strategies=ranked,
        recommended_strategy_id=top.strategy_id,
        rationale=(
            "Strategies are ranked with score = pct_saved - comfort_penalty, where comfort penalties are "
            "none=0.0, low=1.2, moderate=3.5 to balance savings and occupant comfort."
        ),
        assumptions=[
            "All figures are simulated scenario estimates and not measured campus savings.",
            "Tariff and baseline values are synthetic inputs intended for demonstration.",
            "Independent strategy mode is used; strategies are not stacked to avoid double-counting.",
        ],
        limitations=[
            "No live BMS/IoT integration; recommendations are advisory only.",
            "No weather, occupancy sensor stream, or equipment-level calibration in this MVP.",
        ],
        source=source,  # type: ignore[arg-type]
        generated_at=datetime.now(timezone.utc),
    )
