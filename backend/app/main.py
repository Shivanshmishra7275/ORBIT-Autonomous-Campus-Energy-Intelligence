import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


def _cors_origins() -> list[str]:
    origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


app = FastAPI(
    title="ORBIT Autonomous Campus Energy Intelligence API",
    description="Simulated deterministic energy strategy analysis API for campus facilities teams.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)
