from app.schemas.contracts import Building
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
    try:
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
    except Exception:
        assert True
    else:
        raise AssertionError("Expected validation error")
