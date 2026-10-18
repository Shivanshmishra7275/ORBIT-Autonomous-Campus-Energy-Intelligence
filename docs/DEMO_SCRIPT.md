# 🎬 ORBIT Demo Script — Under 3 Minutes

> Use this script when presenting to judges. Each beat is timed. Practice it once before the hackathon!

---

## Before You Start (Setup Checklist)

- [ ] Backend running → `http://127.0.0.1:8000/health` returns `{"status":"ok"}`
- [ ] Frontend running → `http://localhost:5173` loads the dark dashboard
- [ ] Browser tab open and maximized
- [ ] No error banners visible on the dashboard

---

## The Script

### ⏱ 0:00 – 0:20 · The Problem (20 sec)

> *"Campus energy bills are huge, and facility managers have no easy way to compare improvement strategies. ORBIT gives them a decision-support tool — pick a building, describe your goal, get a ranked recommendation with honest reasoning."*

👉 Point to the **"Simulated Data"** badge in the top-right corner.

> *"Everything here is clearly labeled as simulated — ORBIT doesn't control real equipment, and it never fakes measurements."*

---

### ⏱ 0:20 – 0:45 · Select a Building (25 sec)

👉 Open the **Building** dropdown → select **"Engineering Block"**

> *"We have four synthetic campus buildings with genuinely different usage profiles."*

👉 Point to the **KPI cards** that appear:

> *"Instantly we see: 1,200 kWh per day, ₹9,480 daily cost — 45% HVAC, 22% lighting, 33% other loads. These are the numbers we're trying to improve."*

---

### ⏱ 0:45 – 1:10 · Run the Analysis (25 sec)

👉 Leave the default objective text (or type): **"Reduce electricity costs while maintaining acceptable comfort"**

👉 Click **"Run analysis again"**

👉 Point to the status badge changing: **idle → running → done**

> *"ORBIT just sent that goal to the backend, which evaluated three intervention strategies against the baseline — all in under a second."*

---

### ⏱ 1:10 – 1:50 · The Chart (40 sec)

👉 Scroll to the **Energy & Cost Comparison** bar chart

> *"This chart shows baseline versus each strategy. The blue bars are kWh, the green bars are cost in rupees."*

👉 Point to the two shortest bars:

> *"Lighting Schedule Optimization saves the most here — about 47 kWh and ₹375 per day. HVAC Adjustment saves slightly more energy but has a moderate comfort impact, so its score is penalized."*

---

### ⏱ 1:50 – 2:25 · The Recommendation (35 sec)

👉 Scroll to **Recommendation Summary**

> *"ORBIT ranks strategies using: score = savings percentage minus a comfort penalty. Penalties are: none = 0, low = 1.2, moderate = 3.5. So a strategy with 5% savings and no comfort disruption beats one with 6% savings that makes people uncomfortable."*

👉 Point to the recommended strategy name:

> *"For Engineering Block, Lighting Schedule Optimization ranks first — solid savings, zero comfort disruption, high feasibility."*

---

### ⏱ 2:25 – 2:50 · Assumptions & Limitations (25 sec)

👉 Click **"Assumptions & Limitations"** to expand the panel

> *"This panel is always here — we don't hide it. The reduction percentages are assumed ranges, not measured study results. The tariff is illustrative. ORBIT is a decision-support tool, not a forecast."*

> *"A facilities manager can take this to their team and say: 'lighting optimization looks promising — let's get a real quote.' That's the right use of this tool."*

---

### ⏱ 2:50 – 3:00 · Close (10 sec)

> *"Today: the dashboard, backend, and local Fetch.ai agent are all working. The energy math is 100% test-covered. Next step would be connecting real BMS data and deploying the Fetch.ai agent to Agentverse for multi-campus coordination. Thank you."*

---

## 💡 Tips

- If the backend is slow to respond, mention: *"The analysis is running on a local server — in production this would be a deployed API."*
- If a judge asks "is this real data?" → *"No — every number is synthetic and the UI clearly says 'Simulated Data'. That's by design."*
- If a judge asks about the agent → *"The Fetch.ai uAgent is implemented and tested locally. It calls the same deterministic engine as the API — so the math is identical regardless of which path the request takes."*
