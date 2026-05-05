import { PRIORITY, STATUS } from '../../data/meta';

const tones = {
  neutral: 'bg-ink-500/40 text-fg-muted',
  brand:   'bg-brand-500/10 text-brand-400',
  warning: 'bg-yellow-500/10 text-yellow-400',
  danger:  'bg-red-500/10 text-red-400',
  info:    'bg-blue-500/10 text-blue-400',
};

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.low;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${p.bg} ${p.text}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.dot }} />
      {p.label}
    </span>
  );
}

export function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.todo;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
