# 📊 ORBIT — Data Assumptions & Synthetic Values

> **All numbers in this project are made up for demonstration purposes.**
> They are not real campus measurements, not calibrated from energy audits, and not derived from published research.
> Their purpose is to create four *meaningfully different* building profiles so strategy comparisons are interesting and explainable.

---

## Why Synthetic Data?

Building a campus energy tool with real BMS/IoT data would require institutional access, privacy agreements, and sensor infrastructure. For this hackathon MVP, we use carefully constructed synthetic profiles that:

- Are **internally consistent** (cost = kWh × tariff, shares sum to 100%)
- Have **distinct characters** (the hostel feels different from the library)
- Produce **different winning strategies** across buildings (so the demo isn't boring)

---

## Building Profiles

### ENG-01 — Engineering Block
| Field | Value | Why |
|---|---|---|
| `daily_kwh_baseline` | 1,200 kWh | Labs + HVAC + long weekday hours |
| `tariff_inr_per_kwh` | ₹7.90 | Mid-range institutional rate |
| `hvac_share_pct` | 45% | Heavy cooling/ventilation for labs |
| `lighting_share_pct` | 22% | Standard classroom/corridor lighting |
| `other_share_pct` | 33% | Lab equipment, computers, servers |

### LIB-01 — Central Library
| Field | Value | Why |
|---|---|---|
| `daily_kwh_baseline` | 820 kWh | Long hours including evenings/weekends |
| `tariff_inr_per_kwh` | ₹8.20 | Slightly higher rate assumed |
| `hvac_share_pct` | 35% | Stable temperature needed for study |
| `lighting_share_pct` | 41% | Reading spaces need good lighting |
| `other_share_pct` | 24% | Computers, printers, security systems |

### HST-01 — Boys' Hostel
| Field | Value | Why |
|---|---|---|
| `daily_kwh_baseline` | 580 kWh | Residential, evening/night peak |
| `tariff_inr_per_kwh` | ₹7.50 | Lower institutional residential rate |
| `hvac_share_pct` | 28% | Lower HVAC — natural ventilation common |
| `lighting_share_pct` | 29% | Room + common area lighting |
| `other_share_pct` | 43% | Appliances, phone charging, common rooms |

### ADM-01 — Admin Block
| Field | Value | Why |
|---|---|---|
| `daily_kwh_baseline` | 410 kWh | Standard 9-to-5 office pattern |
| `tariff_inr_per_kwh` | ₹8.75 | Higher commercial rate assumed |
| `hvac_share_pct` | 38% | Central AC for offices |
| `lighting_share_pct` | 28% | Office + corridor lighting |
| `other_share_pct` | 34% | Computers, printers, reception |

> ✅ For every building: `hvac_share_pct + lighting_share_pct + other_share_pct = 100`. Verified by Pydantic field validator.
> ✅ For every building: `daily_cost_inr = daily_kwh_baseline × tariff_inr_per_kwh`. Enforced in `calculate_baseline()`.

---

## Strategy Reduction Assumptions

These percentages are **illustrative ranges chosen for the demo** — not derived from peer-reviewed energy studies.

| Strategy | Load targeted | Assumed reduction | Comfort impact |
|---|---|---|---|
| Schedule Optimization | Other loads | **12%** of other-load share | Low |
| HVAC Setpoint Adjustment | HVAC loads | **11%** of HVAC share (midpoint of an 8–15% illustrative range) | Moderate |
| Lighting Schedule Optimization | Lighting loads | **18%** of lighting share | None |

All savings are clamped so that:
- `kwh_saved` is never negative
- `projected_kwh` is never below 0 or above baseline

---

## Ranking Formula

```
score = pct_saved - comfort_penalty
```

| Comfort impact | Penalty |
|---|---|
| None | 0.0 |
| Low | 1.2 |
| Moderate | 3.5 |

The penalty values were chosen so that a strategy with **moderate** comfort disruption needs to save at least 3.5 percentage points more than a zero-disruption alternative to rank higher. This is a design choice — not a result from occupant surveys.

---

## What This Means for Interpreting Results

- A result saying "Lighting saves 3.96%/day" means: *if occupancy-based dimming cut lighting load by 18% as assumed, the daily saving would be approximately this amount.*
- It does **not** mean: *we measured this on your campus and it will definitely happen.*
- Always treat ORBIT outputs as a starting point for a conversation with your facilities team, not a guarantee.
