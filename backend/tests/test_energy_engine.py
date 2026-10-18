import pytest
from pydantic import ValidationError

from app.schemas.contracts import Building, ComfortImpact, StrategyResult
from app.services.energy_engine import (
    analyze_building,
    calculate_baseline,
    evaluate_hvac_adjustment,
    evaluate_lighting_optimization,
    evaluate_schedule_optimization,
    load_buildings,
    rank_strategies,
)


def test_baseline_calculation_matches_tariff_math():
    building = load_buildings()["ENG-01"]
    baseline = calculate_baseline(building)
    assert baseline.daily_kwh == building.daily_kwh_baseline
    assert baseline.daily_cost_inr == round(building.daily_kwh_baseline * building.tariff_inr_per_kwh, 2)


def test_each_strategy_bounds_and_percentages():
    building = load_buildings()["LIB-01"]
    for strategy in [
        evaluate_schedule_optimization(building),
        evaluate_hvac_adjustment(building),
        evaluate_lighting_optimization(building),
    ]:
        assert 0 <= strategy.kwh_saved <= building.daily_kwh_baseline
        assert 0 <= strategy.projected_kwh <= building.daily_kwh_baseline
        if building.daily_kwh_baseline > 0:
            assert strategy.pct_saved == round((strategy.kwh_saved / building.daily_kwh_baseline) * 100, 2)


def test_ranking_penalizes_comfort_impact():
    building = load_buildings()["ADM-01"]
    ranked = rank_strategies(
        [
            evaluate_hvac_adjustment(building),
            evaluate_lighting_optimization(building),
            evaluate_schedule_optimization(building),
        ]
    )
    assert ranked[0].strategy_id != "hvac_setpoint_adjustment"


def test_ranking_uses_savings_and_comfort_penalty_rule():
    ranked = rank_strategies(
        [
            StrategyResult(
                strategy_id="high_savings_moderate_impact",
                name="A",
                description="",
                projected_kwh=0,
                projected_cost_inr=0,
                kwh_saved=0,
                cost_saved_inr=0,
                pct_saved=8.0,
                comfort_impact=ComfortImpact.moderate,
                feasibility_notes="",
                assumptions=[],
            ),
            StrategyResult(
                strategy_id="lower_savings_no_impact",
                name="B",
                description="",
                projected_kwh=0,
                projected_cost_inr=0,
                kwh_saved=0,
                cost_saved_inr=0,
                pct_saved=6.2,
                comfort_impact=ComfortImpact.none,
                feasibility_notes="",
                assumptions=[],
            ),
        ]
    )
    assert ranked[0].strategy_id == "lower_savings_no_impact"


def test_zero_tariff_is_handled_without_crash():
    building = Building.model_validate(
        {
            "building_id": "ZERO-01",
            "name": "Zero Tariff Demo",
            "daily_kwh_baseline": 1000,
            "tariff_inr_per_kwh": 0,
            "operating_hours": {"start": "09:00", "end": "17:00", "days": ["Mon"]},
            "hvac_share_pct": 30,
            "lighting_share_pct": 30,
            "other_share_pct": 40,
            "occupancy_profile": "test",
            "comfort_constraints": ["none"],
        }
    )
    result = analyze_building(building, "Reduce costs")
    assert result.baseline.daily_cost_inr == 0
    assert all(strategy.projected_cost_inr == 0 for strategy in result.strategies)


def test_invalid_negative_values_rejected_by_validation():
    with pytest.raises(ValidationError):
        Building.model_validate(
            {
                "building_id": "BAD-01",
                "name": "Invalid",
                "daily_kwh_baseline": -1,
                "tariff_inr_per_kwh": 5,
                "operating_hours": {"start": "09:00", "end": "17:00", "days": ["Mon"]},
                "hvac_share_pct": 30,
                "lighting_share_pct": 30,
                "other_share_pct": 40,
                "occupancy_profile": "test",
                "comfort_constraints": ["none"],
            }
        )


@pytest.mark.parametrize(
    "payload",
    [
        {
            "building_id": "BAD-02",
            "name": "Invalid Tariff",
            "daily_kwh_baseline": 1000,
            "tariff_inr_per_kwh": -0.1,
            "operating_hours": {"start": "09:00", "end": "17:00", "days": ["Mon"]},
            "hvac_share_pct": 30,
            "lighting_share_pct": 30,
            "other_share_pct": 40,
            "occupancy_profile": "test",
            "comfort_constraints": ["none"],
        },
        {
            "building_id": "BAD-03",
            "name": "Invalid Share",
            "daily_kwh_baseline": 1000,
            "tariff_inr_per_kwh": 8.0,
            "operating_hours": {"start": "09:00", "end": "17:00", "days": ["Mon"]},
            "hvac_share_pct": 60,
            "lighting_share_pct": 50,
            "other_share_pct": 10,
            "occupancy_profile": "test",
            "comfort_constraints": ["none"],
        },
    ],
)
def test_invalid_numeric_inputs_rejected(payload):
    with pytest.raises(ValidationError):
        Building.model_validate(payload)
