import pytest

from app.agents import orbit_agent
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


def test_agent_returns_typed_error_on_processing_failure(monkeypatch):
    def _boom(*args, **kwargs):
        raise RuntimeError("analysis engine failed")

    monkeypatch.setattr("app.agents.orbit_agent.analyze_building", _boom)
    result = process_agent_task(AgentTask(building_id="ENG-01", objective="Reduce cost while preserving comfort"))
    assert isinstance(result, AgentError)
    assert result.error_code == "analysis_failed"
    assert "analysis engine failed" in result.message


def test_create_uagent_requires_seed(monkeypatch):
    if orbit_agent.create_uagent is None:
        pytest.skip("uagents unavailable in test environment")
    monkeypatch.delenv("ORBIT_AGENT_SEED", raising=False)
    with pytest.raises(RuntimeError, match="ORBIT_AGENT_SEED"):
        orbit_agent.create_uagent()
