# 🛰️ ORBIT — Autonomous Campus Energy Intelligence

> **Built for Fetch-A-Thon 3.0 · GCET Edition — AI Agent Hackathon**

ORBIT helps campus facility managers explore energy-saving strategies for their buildings — without being a data scientist. Pick a building, describe your goal, and ORBIT instantly ranks strategies with transparent reasoning.

> ⚠️ **All data is simulated.** ORBIT uses synthetic building profiles for demonstration. It does **not** connect to real equipment, does **not** control anything, and does **not** use real campus measurements. Every output is a scenario estimate — clearly labeled as such.

---

## 📋 Table of Contents

1. [What ORBIT Does](#-what-orbit-does)
2. [Architecture](#-architecture)
3. [Quick Start](#-quick-start)
4. [Environment Variables](#-environment-variables)
5. [API Reference](#-api-reference)
6. [Running Tests](#-running-tests)
7. [Deployment](#-deployment)
8. [Troubleshooting](#-troubleshooting)
9. [Known Limitations](#-known-limitations)
10. [Credits & License](#-credits--license)

---

## 🎯 What ORBIT Does

A campus energy manager selects a building, types a plain-English goal (e.g. *"Reduce electricity costs while keeping classrooms comfortable"*), and ORBIT:

1. Calculates a **baseline** — daily kWh consumption and cost
2. Evaluates **3 candidate strategies** — schedule optimization, HVAC adjustment, lighting optimization
3. **Ranks** them by a weighted score that balances savings vs. occupant comfort impact
4. Returns a **plain-English recommendation** with all assumptions and limitations stated up front

The whole flow runs in under a second. No AI black box — every number is traceable back to a formula.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Dashboard (Vite)          │
│  • Building selector + KPI cards        │
│  • Bar chart: baseline vs strategies    │
│  • Recommendation + assumptions panel   │
└────────────┬────────────────────────────┘
             │  GET /buildings · POST /analyze
             ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend (Python)        │
│  • Pydantic v2 request/response schemas │
│  • /health · /buildings · /analyze      │
└────────────┬────────────────────────────┘
             │  imports
             ▼
┌─────────────────────────────────────────┐
│       energy_engine.py (core math)      │
│  • Zero external dependencies           │
│  • Deterministic, 100% test coverage    │
│  • Baseline calc + 3 strategy funcs     │
│  • Comfort-weighted ranking             │
└─────────────────────────────────────────┘
             ▲
             │  same engine, same contracts
┌─────────────────────────────────────────┐
│    Fetch.ai uAgent (orbit_agent.py)     │
│  • Local agent wrapping the same engine │
│  • Graceful fallback on Python 3.13+    │
└─────────────────────────────────────────┘
```

**Key principle:** The deterministic engine is always the trust-critical path. The app is fully usable with zero external AI services configured.

---

## 🚀 Quick Start

You only need **Python 3.11+** and **Node.js 18+** installed. Nothing else.

### Step 1 — Clone the repo

```bash
git clone https://github.com/Shivanshmishra7275/ORBIT-Autonomous-Campus-Energy-Intelligence.git
cd ORBIT-Autonomous-Campus-Energy-Intelligence
```

### Step 2 — Start the backend

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

**Windows PowerShell:**
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Mac/Linux:**
```bash
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify it's running:
```bash
curl http://127.0.0.1:8000/health
# → {"status":"ok"}
```

### Step 3 — Start the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
npm run dev
```

Then open **http://localhost:5173** in your browser. 🎉

> **That's it!** Select a building, type a goal, click "Run analysis again" — you'll see real backend-computed results in under a second.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | What it does | Required? | Default |
|---|---|---|---|
| `FRONTEND_ORIGINS` | Which browser origins can call the API (CORS) | Yes | `http://localhost:5173,http://127.0.0.1:5173` |
| `ORBIT_AGENT_SEED` | Seed phrase for the local Fetch.ai uAgent | Only if running the live agent loop | `replace-with-local-agent-seed` |

### Frontend (`frontend/.env`)

| Variable | What it does | Required? | Default |
|---|---|---|---|
| `VITE_API_BASE_URL` | Where the frontend looks for the backend API | Yes | `http://127.0.0.1:8000` |

> 💡 The core demo works with the default values. You only need to change these for deployment or custom ports.

---

## 📡 API Reference

Interactive docs with a built-in "Try it out" button:
**→ http://127.0.0.1:8000/docs**

### Endpoints at a glance

| Method | Path | What it returns |
|---|---|---|
| `GET` | `/health` | `{"status":"ok"}` — liveness check |
| `GET` | `/buildings` | List of all 4 synthetic buildings |
| `GET` | `/buildings/{id}` | One building's details |
| `POST` | `/analyze` | Full ranked strategy analysis |

### Example — Run an analysis

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "ENG-01",
    "objective": "Reduce electricity costs while maintaining acceptable comfort"
  }'
```

**Response (key fields):**
```json
{
  "recommended_strategy_id": "lighting_schedule_optimization",
  "rationale": "Strategies are ranked with score = pct_saved - comfort_penalty ...",
  "is_simulated": true,
  "source": "deterministic_engine",
  "baseline": { "daily_kwh": 1200.0, "daily_cost_inr": 9480.0 },
  "strategies": [
    {
      "strategy_id": "lighting_schedule_optimization",
      "name": "Lighting Schedule Optimization",
      "pct_saved": 3.96,
      "cost_saved_inr": 375.41,
      "comfort_impact": "none"
    }
  ],
  "assumptions": ["All figures are simulated scenario estimates ..."],
  "limitations": ["No live BMS/IoT integration ..."]
}
```

> `is_simulated` is **always `true`** — this field is present in every response so the synthetic nature of the data is never hidden.

---

## 🧪 Running Tests

```bash
cd backend
# Windows PowerShell:
python -m pytest tests/ -v --cov=app.services.energy_engine --cov-report=term-missing

# Mac/Linux:
PYTHONPATH=. pytest tests/ -v --cov=app.services.energy_engine --cov-report=term-missing
```

**Latest verified results (2026-10-18):**

```
17 passed, 1 skipped
energy_engine.py  →  100% coverage
```

The 1 skipped test (`test_create_uagent_requires_seed`) is intentional — it's skipped when `uagents` isn't installed (Python 3.13 environment). It runs normally under Python 3.12 with `uagents` installed.

**Frontend production build:**
```bash
cd frontend
npm run build
# → 0 errors ✅
```

---

## ☁️ Deployment

ORBIT is deployed live in the cloud:
- **Live Backend (Render):** [`https://orbit-autonomous-campus-energy.onrender.com`](https://orbit-autonomous-campus-energy.onrender.com)
  - Health check: `https://orbit-autonomous-campus-energy.onrender.com/health` (Verified: `{"status":"ok"}`)
  - Buildings: `https://orbit-autonomous-campus-energy.onrender.com/buildings` (Verified: 4 assets)
  - API Swagger Docs: `https://orbit-autonomous-campus-energy.onrender.com/docs`
- **Frontend Dashboard:** Deployable to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) in 30 seconds.

### Deploying Frontend to Vercel (30 Seconds)

1. Go to **[vercel.com](https://vercel.com/)** → **Add New Project** → Import this repository.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** `Vite` (auto-detected)
3. Environment Variable:
   - `VITE_API_BASE_URL` = `https://orbit-autonomous-campus-energy.onrender.com`
4. Click **Deploy**. Your dashboard will be live at `https://<your-project>.vercel.app`!

### Verify After Deployment

```bash
curl https://orbit-autonomous-campus-energy.onrender.com/health
# → {"status":"ok"}
```

---

## 🔧 Troubleshooting

**CORS error in browser console**
→ The frontend origin isn't in the backend's `FRONTEND_ORIGINS`. Add it (comma-separated) and restart the backend.

**Frontend shows "Failed to load buildings"**
→ Check `frontend/.env` — `VITE_API_BASE_URL` must point to where the backend is actually running. After changing it, restart Vite (`npm run dev`).

**Port already in use**
→ Change the port in the start command and update the matching env var. Backend default: `8000`. Frontend default: `5173`.

**`pip install` fails / uagents error**
→ The `uagents` package is commented out in `requirements.txt` — this is intentional. `uagents ≥ 0.21` requires Python ≤ 3.12. All other ORBIT packages install cleanly on Python 3.13. If you want the live agent loop, use Python 3.12 and uncomment `uagents==0.22.10` in `requirements.txt`.

**`npm install` or `npm run build` fails**
→ Make sure you're running Node 18+. Run `node --version` to check.

**`PYTHONPATH` errors on Windows**
→ Use `python -m uvicorn ...` instead of `uvicorn ...` directly (this sets PYTHONPATH automatically).

---

## ⚠️ Known Limitations

- All building data and energy outputs are **synthetic scenario estimates** — not real campus measurements.
- ORBIT **recommends only** — it never controls physical equipment.
- Strategies are evaluated independently (no stacking/combining in default mode).
- No database, no user accounts, no authentication — this is a hackathon MVP.
- Agentverse cloud deployment for the Fetch.ai uAgent is not verified in this version.

---

## 🏆 Credits & License

**Built for** [Fetch-A-Thon 3.0](https://fetch.ai) — GCET Edition AI Agent Hackathon

**Stack:** React 18 · TypeScript · Vite · Recharts · FastAPI · Pydantic v2 · Fetch.ai uAgents · pytest

**Team:** Shivanshmishra7275

**License:** MIT — see `LICENSE` file (add one before public release)

---

> 💬 Questions? Open an issue on [GitHub](https://github.com/Shivanshmishra7275/ORBIT-Autonomous-Campus-Energy-Intelligence). ORBIT is a hackathon demo — feedback is welcome!
