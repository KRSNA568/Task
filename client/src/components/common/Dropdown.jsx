import { useState, useRef, useEffect } from 'react';
import { I } from './icons';

export default function Dropdown({
  value,
  options = [],
  onChange,
  renderValue,
  renderOption,
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-2.5 flex items-center gap-1.5 rounded-md bg-ink-700/60 border border-ink-500/60 hover:border-ink-400 text-[12.5px] text-fg transition-colors w-full"
      >
        <span className="flex-1 text-left truncate">
          {selected ? (renderValue ? renderValue(selected) : selected.label) : (
            <span className="text-fg-dim">{placeholder}</span>
          )}
        </span>
        <I.chevDown size={12} className="text-fg-dim shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-full z-50 bg-ink-700 border border-ink-500 rounded-lg shadow-panel overflow-hidden scale-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange?.(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 h-8 text-[12.5px] text-left hover:bg-ink-600 transition-colors ${opt.value === value ? 'text-brand-400' : 'text-fg'}`}
            >
              {renderOption ? renderOption(opt) : opt.label}
              {opt.value === value && <I.check size={12} className="ml-auto text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
