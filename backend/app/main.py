import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


def _cors_origins() -> list[str]:
    origins = os.getenv("FRONTEND_ORIGINS", "*")
    if not origins or origins.strip() == "*":
        return ["*"]
    return [o.strip() for o in origins.split(",") if o.strip()]


app = FastAPI(
    title="ORBIT Autonomous Campus Energy Intelligence API",
    description="Simulated deterministic energy strategy analysis API for campus facilities teams.",
    version="1.0.0",
)

_origins = _cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r".*" if "*" not in _origins else None,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
