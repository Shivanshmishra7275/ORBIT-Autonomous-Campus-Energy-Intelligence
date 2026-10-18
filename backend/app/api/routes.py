from fastapi import APIRouter, HTTPException

from app.schemas.contracts import AnalysisRequest, AnalysisResponse, Building
from app.services.energy_engine import analyze_building, load_buildings

router = APIRouter()


@router.get("/health", summary="Health check", description="Liveness check for ORBIT backend.")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/buildings", response_model=list[Building], summary="List buildings", description="Returns all synthetic buildings used by the ORBIT simulator.")
def get_buildings() -> list[Building]:
    return list(load_buildings().values())


@router.get("/buildings/{building_id}", response_model=Building, summary="Get building details", description="Returns one synthetic building by building_id.")
def get_building(building_id: str) -> Building:
    buildings = load_buildings()
    if building_id not in buildings:
        raise HTTPException(status_code=404, detail="Building not found")
    return buildings[building_id]


@router.post("/analyze", response_model=AnalysisResponse, summary="Analyze energy strategies", description="Runs deterministic strategy evaluation and returns ranked recommendations.")
def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    buildings = load_buildings()
    building = buildings.get(payload.building_id)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return analyze_building(building, payload.objective)
