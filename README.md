# ORBIT — Autonomous Campus Energy Intelligence

ORBIT is a **simulated** campus energy decision-support MVP that ranks energy-saving strategies for a selected building; it is **not** a live BMS controller and does not use real campus telemetry.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [API Reference + Example](#api-reference--example)
5. [Running Tests](#running-tests)
6. [Deployment Notes](#deployment-notes)
7. [Troubleshooting](#troubleshooting)
8. [Known Limitations](#known-limitations)
9. [Hackathon Context, Credits, License](#hackathon-context-credits-license)

## Architecture Overview

```text
React (Vite, TypeScript)
   │  fetch /buildings, /analyze
   ▼
FastAPI backend (validated contracts)
   │
   ├─ deterministic energy_engine.py (baseline + strategy math + ranking)
   │
   └─ local Fetch.ai uAgent wrapper (same contracts, same engine)
```

Core principle: deterministic Python calculations are always the trust-critical path; the app remains fully usable without optional external AI services.

### Agent integration status (honest behavior)

- The dashboard currently calls deterministic `POST /analyze` directly.
- This route reports `source: "deterministic_engine"` and is not labeled as an agent execution.
- The local uAgent exists as a separate backend capability in `backend/app/agents/orbit_agent.py` and must be started explicitly if you want local agent message handling.

## Quick Start

### 1) Backend

```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend health check:

```bash
curl http://127.0.0.1:8000/health
```

### 2) Frontend

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open `http://127.0.0.1:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Name | Purpose | Required? | Example |
|---|---|---|---|
| `FRONTEND_ORIGINS` | Comma-separated allowed CORS origins | Yes (for browser access) | `http://localhost:5173,http://127.0.0.1:5173` |
| `ORBIT_AGENT_SEED` | Local seed required to start `orbit_agent.py` | Required only for running local uAgent | `replace-with-local-agent-seed` |

### Frontend (`frontend/.env`)

| Name | Purpose | Required? | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Base URL for FastAPI backend | Yes | `http://127.0.0.1:8000` |

## API Reference + Example

Swagger docs are available at:

- `http://127.0.0.1:8000/docs`

Example `POST /analyze` request:

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "ENG-01",
    "objective": "Reduce electricity costs while maintaining acceptable comfort"
  }'
```

Example response excerpt:

```json
{
  "recommended_strategy_id": "lighting_schedule_optimization",
  "is_simulated": true,
  "source": "deterministic_engine"
}
```

## Running Tests

```bash
cd backend
PYTHONPATH=. pytest --cov=app.services.energy_engine --cov-report=term-missing
```

Latest verified run in this PR:

- `18 passed, 1 warning`
- `app/services/energy_engine.py` coverage: `100%`

Frontend production build verification:

```bash
cd frontend
npm run build
```

Latest verified run in this PR: build succeeded with 0 errors (single chunk-size warning from Vite reporter).

## Deployment Notes

No live deployment is currently verified from this environment.

### Required commands

- Frontend build: `cd frontend && npm install && npm run build`
- Backend start: `cd backend && PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000`

### What remains for deployment

1. Deploy backend with `FRONTEND_ORIGINS` set to your frontend host.
2. Deploy frontend with `VITE_API_BASE_URL` set to backend URL.
3. Verify:
   - `curl <backend-url>/health`
   - one real `POST /analyze` from deployed frontend.

## Troubleshooting

- **CORS errors**: ensure deployed frontend origin is listed in `FRONTEND_ORIGINS`.
- **Wrong API base URL**: check `frontend/.env` (`VITE_API_BASE_URL`) and rebuild/restart frontend.
- **Port conflicts**: run backend/frontend on alternate ports and update env vars accordingly.
- **Missing env vars**: copy `.env.example` to `.env` in both backend and frontend.
- **Dependency install failures**: use Python 3.11+ and modern Node/npm; retry `pip install -r requirements.txt` and `npm install`.

## Known Limitations

- All building data and savings outputs are scenario estimates from synthetic inputs.
- No real BMS/IoT integration, no automatic control of physical equipment.
- Strategy comparison uses independent baseline mode (no stacked strategy execution).
- Agentverse mailbox deployment is not verified in this run; local agent module is implemented.

## Hackathon Context, Credits, License

- Built for Fetch-A-Thon 3.0 (GCET Edition).
- ORBIT MVP implements deterministic simulation + transparent recommendation workflow.
- License: add your preferred open-source license file before public release.

See also:
- `backend/app/data/ASSUMPTIONS.md`
- `docs/DEMO_SCRIPT.md`
- `PROGRESS.md`
