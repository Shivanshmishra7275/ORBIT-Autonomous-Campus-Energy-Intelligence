interface Props {
  status: 'idle' | 'running' | 'done' | 'error';
  source?: 'deterministic_engine' | 'agent';
  errorMessage?: string;
}

const labels: Record<string, string> = {
  idle: 'Ready to Analyze',
  running: 'Evaluating Strategies…',
  done: 'Analysis Complete',
  error: 'Analysis Error',
};

export function StatusBadge({ status, source, errorMessage }: Props) {
  return (
    <div
      className={`analysis-status ${status}`}
      role="status"
      aria-live="polite"
    >
      <span className="status-dot" aria-hidden="true" />
      <span>
        {labels[status]}
        {status === 'done' && source && (
          <span style={{ opacity: 0.85, fontWeight: 400, marginLeft: '4px' }}>
            ({source === 'deterministic_engine' ? 'Deterministic Engine' : 'Autonomous Agent'})
          </span>
        )}
      </span>
      {status === 'error' && errorMessage && (
        <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)', marginLeft: 'auto' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
