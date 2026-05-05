export default function Input({
  label,
  hint,
  error,
  icon,
  className = '',
  inputClassName = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[12px] font-medium text-fg-muted">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-dim">
            {icon}
          </span>
        )}
        <input
          className={`w-full h-9 bg-ink-800 border ${error ? 'border-red-500/60' : 'border-ink-500'} rounded-md text-[13px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors ${icon ? 'pl-8 pr-3' : 'px-3'} ${inputClassName}`}
          {...rest}
        />
      </div>
      {error && <span className="text-[11.5px] text-red-400">{error}</span>}
      {hint && !error && <span className="text-[11.5px] text-fg-dim">{hint}</span>}
    </div>
  );
}
