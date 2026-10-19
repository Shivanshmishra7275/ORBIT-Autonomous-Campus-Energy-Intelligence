<div align="center">

<img src="https://img.shields.io/badge/ORBIT-Autonomous%20Campus%20Energy%20Intelligence-00d4ff?style=for-the-badge&logo=satellite&logoColor=white" alt="ORBIT"/>

<br/>

[![Live Dashboard](https://img.shields.io/badge/🚀%20Live%20Dashboard-Vercel-black?style=for-the-badge&logo=vercel)](https://orbit-autonomous-campus-energy-inte.vercel.app/)
[![Live API](https://img.shields.io/badge/⚙️%20Live%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://orbit-autonomous-campus-energy.onrender.com/docs)
[![API Health](https://img.shields.io/badge/API%20Status-Online-22c55e?style=for-the-badge&logo=statuspage)](https://orbit-autonomous-campus-energy.onrender.com/health)

<br/>

[![Tests](https://img.shields.io/badge/Tests-18%20passed%201%20skipped-22c55e?style=for-the-badge&logo=pytest)](./backend/tests/)
[![Coverage](https://img.shields.io/badge/energy__engine.py-100%25%20coverage-22c55e?style=for-the-badge&logo=codecov)](./backend/app/services/energy_engine.py)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

<br/>

> **Built for Fetch-A-Thon 3.0 · GCET Edition — AI Agent Hackathon**

**ORBIT** helps campus facility managers explore energy-saving strategies — without being a data scientist.  
Pick a building → describe your goal → get instant ranked strategies with full transparent reasoning.

</div>

---

## 🌐 Live Links

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Dashboard** | [orbit-autonomous-campus-energy-inte.vercel.app](https://orbit-autonomous-campus-energy-inte.vercel.app/) | ✅ Live |
| ⚙️ **Backend API** | [orbit-autonomous-campus-energy.onrender.com](https://orbit-autonomous-campus-energy.onrender.com) | ✅ Live |
| 📖 **API Docs (Swagger)** | [/docs](https://orbit-autonomous-campus-energy.onrender.com/docs) | ✅ Live |
| 💓 **Health Check** | [/health](https://orbit-autonomous-campus-energy.onrender.com/health) | `{"status":"ok"}` |

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

1. 📊 Calculates a **baseline** — daily kWh consumption and cost
2. 🔍 Evaluates **3 candidate strategies** — schedule optimization, HVAC adjustment, lighting optimization
3. 🏆 **Ranks** them by a weighted score that balances savings vs. occupant comfort impact
4. 💬 Returns a **plain-English recommendation** with all assumptions and limitations stated up front

> The whole flow runs in **under a second**. No AI black box — every number is traceable back to a formula.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Dashboard (Vite)          │  ← https://orbit-autonomous-campus-energy-inte.vercel.app/
│  • Building selector + KPI cards        │
│  • Bar chart: baseline vs strategies    │
│  • Recommendation + assumptions panel   │
└────────────┬────────────────────────────┘
             │  GET /buildings · POST /analyze
             ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend (Python)        │  ← https://orbit-autonomous-campus-energy.onrender.com
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
```

**Windows PowerShell:**
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Mac/Linux:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
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
cp .env.example .env     # Mac/Linux
# copy .env.example .env  # Windows
npm run dev
```

Then open **http://localhost:5173** in your browser. 🎉

> **That's it!** Select a building, describe a goal, click **Run Energy Analysis** — you'll see backend-computed results in under a second.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | What it does | Default |
|---|---|---|
| `FRONTEND_ORIGINS` | Browser origins allowed to call the API (CORS). Use `*` to allow all. | `*` |
| `ORBIT_AGENT_SEED` | Seed phrase for the Fetch.ai uAgent (only needed for live agent loop) | — |

### Frontend (`frontend/.env`)

| Variable | What it does | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Where the frontend looks for the backend API | `http://127.0.0.1:8000` |

> 💡 For local dev, the defaults work out of the box. For cloud deployment, set `VITE_API_BASE_URL` to your backend URL.

---

## 📡 API Reference

Interactive Swagger docs with **"Try it out"** buttons:  
**→ [orbit-autonomous-campus-energy.onrender.com/docs](https://orbit-autonomous-campus-energy.onrender.com/docs)**

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check → `{"status":"ok"}` |
| `GET` | `/buildings` | List all 4 synthetic campus buildings |
| `GET` | `/buildings/{id}` | Single building details |
| `POST` | `/analyze` | Full ranked strategy analysis |

### Example — Run an analysis

```bash
curl -X POST https://orbit-autonomous-campus-energy.onrender.com/analyze \
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
  "baseline": { "daily_kwh": 3200.0, "daily_cost_inr": 28000.0 },
  "strategies": [
    {
      "strategy_id": "lighting_schedule_optimization",
      "name": "Lighting Schedule Optimization",
      "pct_saved": 3.96,
      "cost_saved_inr": 1109.0,
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

# Windows PowerShell
python -m pytest tests/ -v --cov=app.services.energy_engine --cov-report=term-missing

# Mac/Linux
pytest tests/ -v --cov=app.services.energy_engine --cov-report=term-missing
```

**Latest verified results:**

```
18 passed, 1 skipped
energy_engine.py  →  100% coverage
```

> The 1 skipped test (`test_create_uagent_requires_seed`) is intentional — skipped when `uagents` isn't installed (Python 3.13 environment). Runs normally under Python 3.12 with `uagents` installed.

**Frontend production build:**
```bash
cd frontend
npm run build
# → 603 modules, 0 errors ✅
```

---

## ☁️ Deployment

ORBIT is deployed live:

| | URL |
|---|---|
| 🖥️ **Frontend** | [orbit-autonomous-campus-energy-inte.vercel.app](https://orbit-autonomous-campus-energy-inte.vercel.app/) |
| ⚙️ **Backend** | [orbit-autonomous-campus-energy.onrender.com](https://orbit-autonomous-campus-energy.onrender.com) |

### Deploy Your Own Frontend to Vercel (30 seconds)

1. Go to **[vercel.com](https://vercel.com/)** → **Add New Project** → Import this repository
2. Set **Root Directory:** `frontend`, **Framework:** `Vite` (auto-detected)
3. Add environment variable: `VITE_API_BASE_URL` = `https://orbit-autonomous-campus-energy.onrender.com`
4. Click **Deploy** ✅

### Deploy Backend to Render

1. Go to **[render.com](https://render.com/)** → **New Web Service** → Connect this repository
2. Set **Root Directory:** `backend`
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `FRONTEND_ORIGINS` = `*`
6. Click **Deploy** ✅

> `render.yaml` and `frontend/vercel.json` are already included for one-click deployment configuration.

---

## 🔧 Troubleshooting

**`Failed to connect to backend: Failed to fetch`**  
→ Check that `VITE_API_BASE_URL` points to the correct backend URL. For Vercel deployments, set it in the Vercel dashboard under *Environment Variables*, then redeploy.

**`400 Disallowed CORS origin` in Render logs**  
→ In the Render service **Environment** tab, set `FRONTEND_ORIGINS` to `*`. Save changes — Render restarts automatically.

**Frontend shows `0 Available` buildings**  
→ The backend isn't reachable. Open `/health` on your backend URL in the browser to confirm it's running.

**`pip install` fails / uagents error**  
→ `uagents` is commented out in `requirements.txt` by design. `uagents ≥ 0.21` requires Python ≤ 3.12. All other ORBIT packages install cleanly on Python 3.13+.

**`npm install` or `npm run build` fails**  
→ Ensure Node.js 18+ is installed. Run `node --version` to check.

**`PYTHONPATH` errors on Windows**  
→ Use `python -m uvicorn ...` instead of bare `uvicorn ...` (this sets `PYTHONPATH` automatically).

---

## ⚠️ Known Limitations

- All building data and energy outputs are **synthetic scenario estimates** — not real campus measurements
- ORBIT **recommends only** — it never controls physical equipment
- Strategies are evaluated independently (no stacking/combining in default mode)
- No database, no user accounts, no authentication — this is a hackathon MVP
- Agentverse cloud deployment for the Fetch.ai uAgent is not verified in this version

---

## 🏆 Credits & License

<div align="center">

**Built for [Fetch-A-Thon 3.0](https://fetch.ai) — GCET Edition AI Agent Hackathon**

**Stack:**

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=flat-square&logo=pydantic&logoColor=white)
![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

**Team:** [@Shivanshmishra7275](https://github.com/Shivanshmishra7275)

**License:** MIT

</div>

---

<div align="center">

💬 Questions? Open an issue on [GitHub](https://github.com/Shivanshmishra7275/ORBIT-Autonomous-Campus-Energy-Intelligence).  
ORBIT is a hackathon demo — feedback is welcome!

</div>
