# ORBIT Synthetic Data Assumptions

All values in `buildings.json` are simulated for demo purposes and do not represent measured campus data.

- Tariff assumptions (`₹7.9-₹8.75/kWh`) represent illustrative institutional electricity rates.
- Daily baseline kWh values are synthetic building profiles chosen to create distinct strategy outcomes.
- Load split assumptions follow `HVAC + lighting + other = 100%` for every building.
- Strategy reduction factors are scenario assumptions:
  - Schedule optimization: 12% cut on other loads.
  - HVAC adjustment: 11% cut on HVAC loads (midpoint of illustrative 8-15% range).
  - Lighting optimization: 18% cut on lighting loads.
- Ranking uses `score = pct_saved - comfort_penalty` with comfort penalties: none `0.0`, low `1.2`, moderate `3.5`.
