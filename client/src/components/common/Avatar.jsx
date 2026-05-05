const COLORS = [
  ['#6366F1','#EEF2FF'],['#8B5CF6','#F5F3FF'],['#EC4899','#FDF2F8'],
  ['#F97316','#FFF7ED'],['#10B981','#ECFDF5'],['#3B82F6','#EFF6FF'],
  ['#14B8A6','#F0FDFA'],['#F43F5E','#FFF1F2'],['#84CC16','#F7FEE7'],
  ['#A855F7','#FAF5FF'],
];

function colorFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function Avatar({ name = '', size = 28, className = '' }) {
  const [bg, fg] = colorFor(name);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const fontSize = Math.max(9, Math.round(size * 0.38));
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-semibold select-none ${className}`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize }}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ names = [], size = 24, max = 3 }) {
  const shown = names.slice(0, max);
  const extra = names.length - max;
  return (
    <div className="flex -space-x-1.5">
      {shown.map((name, i) => (
        <div key={i} className="ring-2 ring-ink-800 rounded-full">
          <Avatar name={name} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="ring-2 ring-ink-800 rounded-full bg-ink-600 text-fg-muted flex items-center justify-center shrink-0 font-medium"
          style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.36)) }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
