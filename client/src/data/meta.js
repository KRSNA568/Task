export const PRIORITY = {
  critical: { label: 'Critical', dot: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  high:     { label: 'High',     dot: '#F97316', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium:   { label: 'Medium',   dot: '#EAB308', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low:      { label: 'Low',      dot: '#71717A',  bg: 'bg-ink-500/30',   text: 'text-fg-dim',     border: 'border-ink-500/30' },
};

export const STATUS = {
  todo:        { label: 'To Do',       dot: '#71717A',  bg: 'bg-ink-500/30',    text: 'text-fg-dim' },
  in_progress: { label: 'In Progress', dot: '#3B82F6',  bg: 'bg-blue-500/10',   text: 'text-blue-400' },
  review:      { label: 'In Review',   dot: '#A855F7',  bg: 'bg-purple-500/10', text: 'text-purple-400' },
  done:        { label: 'Done',        dot: '#10B981',  bg: 'bg-brand-500/10',  text: 'text-brand-400' },
};

export const PROJ_STATUS = {
  active:    { label: 'Active',    bg: 'bg-brand-500/10',   text: 'text-brand-400',   dot: '#10B981' },
  on_hold:   { label: 'On Hold',   bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  dot: '#EAB308' },
  completed: { label: 'Completed', bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: '#3B82F6' },
  archived:  { label: 'Archived',  bg: 'bg-ink-500/30',     text: 'text-fg-dim',      dot: '#71717A' },
};

export const PROJECT_COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#F97316','#EAB308',
  '#10B981','#3B82F6','#14B8A6','#F43F5E','#84CC16',
];

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(iso) {
  if (!iso) return false;
  return new Date(iso) < new Date() ;
}
