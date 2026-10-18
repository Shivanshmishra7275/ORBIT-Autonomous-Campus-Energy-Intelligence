from __future__ import annotations

import logging

from app.schemas.contracts import AgentError, AgentResult, AgentTask
from app.services.energy_engine import analyze_building, load_buildings

logger = logging.getLogger("orbit_agent")
logging.basicConfig(level=logging.INFO)

try:
    from uagents import Agent, Context, Model

    class AgentTaskModel(Model):
        building_id: str
        objective: str

    class AgentResultModel(Model):
        payload: dict

    class AgentErrorModel(Model):
        error_code: str
        message: str

    def create_uagent() -> Agent:
        agent = Agent(name="orbit-agent", seed="orbit-agent-local-seed", port=8001, endpoint=["http://127.0.0.1:8001/submit"])

        @agent.on_message(model=AgentTaskModel)
        async def handle_task(ctx: Context, sender: str, msg: AgentTaskModel):
            result = process_agent_task(AgentTask(building_id=msg.building_id, objective=msg.objective))
            logger.info("Agent received: %s | returning: %s", msg.model_dump(), result.model_dump())
            if isinstance(result, AgentResult):
                await ctx.send(sender, AgentResultModel(payload=result.model_dump(mode="json")))
            else:
                await ctx.send(sender, AgentErrorModel(error_code=result.error_code, message=result.message))

        return agent

except Exception:  # pragma: no cover - fallback path for environments without uagents
    Agent = None
    create_uagent = None


def process_agent_task(task: AgentTask) -> AgentResult | AgentError:
    buildings = load_buildings()
    building = buildings.get(task.building_id)
    if building is None:
        return AgentError(error_code="building_not_found", message=f"Unknown building_id: {task.building_id}")
    try:
        result = analyze_building(building, task.objective, source="agent")
        logger.info("Local agent task=%s result_recommendation=%s", task.model_dump(), result.recommended_strategy_id)
        return AgentResult.model_validate(result.model_dump())
    except Exception as exc:  # pragma: no cover - unexpected errors
        logger.exception("Agent processing failed")
        return AgentError(error_code="analysis_failed", message=str(exc))


if __name__ == "__main__" and create_uagent:
    create_uagent().run()
