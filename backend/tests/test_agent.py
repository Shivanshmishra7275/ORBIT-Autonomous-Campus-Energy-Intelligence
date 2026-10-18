from app.agents.orbit_agent import process_agent_task
from app.schemas.contracts import AgentError, AgentTask


def test_agent_valid_task():
    result = process_agent_task(AgentTask(building_id="ENG-01", objective="Reduce cost while preserving comfort"))
    assert result.source == "agent"
    assert result.recommended_strategy_id


def test_agent_invalid_task():
    result = process_agent_task(AgentTask(building_id="UNKNOWN", objective="Reduce cost while preserving comfort"))
    assert isinstance(result, AgentError)
    assert result.error_code == "building_not_found"
