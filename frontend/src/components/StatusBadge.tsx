interface Props {
  status: 'idle' | 'running' | 'done' | 'error';
  source?: 'deterministic_engine' | 'agent';
}

const labels = {
  idle: 'Idle',
  running: 'Running',
  done: 'Done',
  error: 'Error',
};

export function StatusBadge({ status, source }: Props) {
  return (
    <div className={`status status-${status}`}>
      Analysis Status: {labels[status]}{status === 'done' && source ? ` (${source})` : ''}
    </div>
  );
}
