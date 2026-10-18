interface Props {
  assumptions?: string[];
  limitations?: string[];
}

export function AssumptionsPanel({ assumptions = [], limitations = [] }: Props) {
  return (
    <details className="assumptions-details" open>
      <summary className="assumptions-summary">
        <span style={{ fontSize: '1.1rem' }}>🛡️</span>
        <span>Transparency, Modeling Assumptions & Known Limitations</span>
        <span className="summary-chevron" aria-hidden="true">▼</span>
      </summary>

      <div className="assumptions-body">
        {/* Left: Assumptions & Methodology */}
        <div className="assumption-section">
          <h4>Modeling Methodology & Assumptions</h4>
          <ul className="assumption-list">
            {assumptions.map((item, index) => (
              <li key={`assumption-${index}`}>{item}</li>
            ))}
            <li>
              <strong>Deterministic Formulation:</strong> Energy conservation formulas are executed in Python without LLM hallucinations in the calculation path.
            </li>
            <li>
              <strong>Tariff Benchmark:</strong> Electricity rates reflect representative campus commercial/institutional utility tariffs in INR (₹) per kWh.
            </li>
          </ul>
        </div>

        {/* Right: Known Limitations & Governance */}
        <div className="assumption-section">
          <h4>Scope & Governance Limitations</h4>
          <ul className="assumption-list limitation-list">
            {limitations.map((item, index) => (
              <li key={`limitation-${index}`}>{item}</li>
            ))}
            <li>
              <strong>Non-Actuating:</strong> ORBIT is an advisory decision-support prototype. It does not issue control commands to physical BMS, chillers, or switchgear.
            </li>
            <li>
              <strong>Static Weather Model:</strong> Current release does not ingest live meteorological feeds or dynamic wet-bulb temperature variations.
            </li>
          </ul>
        </div>
      </div>
    </details>
  );
}
