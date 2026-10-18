from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class OperatingHours(BaseModel):
    start: str
    end: str
    days: list[str]


class Building(BaseModel):
    building_id: str
    name: str
    is_simulated: Literal[True] = True
    daily_kwh_baseline: float = Field(..., ge=0)
    tariff_inr_per_kwh: float = Field(..., ge=0)
    operating_hours: OperatingHours
    hvac_share_pct: float = Field(..., ge=0, le=100)
    lighting_share_pct: float = Field(..., ge=0, le=100)
    other_share_pct: float = Field(..., ge=0, le=100)
    occupancy_profile: str
    comfort_constraints: list[str]

    @field_validator("other_share_pct")
    @classmethod
    def validate_total_share(cls, other_share_pct: float, info):
        hvac = info.data.get("hvac_share_pct", 0.0)
        lighting = info.data.get("lighting_share_pct", 0.0)
        total = round(hvac + lighting + other_share_pct, 6)
        if total != 100.0:
            raise ValueError("hvac_share_pct + lighting_share_pct + other_share_pct must equal 100")
        return other_share_pct


class ComfortImpact(str, Enum):
    none = "none"
    low = "low"
    moderate = "moderate"


class StrategyResult(BaseModel):
    strategy_id: str
    name: str
    description: str
    projected_kwh: float
    projected_cost_inr: float
    kwh_saved: float
    cost_saved_inr: float
    pct_saved: float
    comfort_impact: ComfortImpact
    feasibility_notes: str
    assumptions: list[str]


class AnalysisRequest(BaseModel):
    building_id: str
    objective: str = Field(..., min_length=5)


class Baseline(BaseModel):
    daily_kwh: float
    daily_cost_inr: float


class AnalysisResponse(BaseModel):
    building: Building
    objective: str
    baseline: Baseline
    strategies: list[StrategyResult]
    recommended_strategy_id: str
    rationale: str
    assumptions: list[str]
    limitations: list[str]
    is_simulated: Literal[True] = True
    source: Literal["deterministic_engine", "agent"] = "deterministic_engine"
    generated_at: datetime


class AgentTask(AnalysisRequest):
    pass


class AgentResult(AnalysisResponse):
    pass


class AgentError(BaseModel):
    error_code: str
    message: str
