const variants = {
  primary:        'bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold',
  secondary:      'bg-ink-600 hover:bg-ink-500 text-fg border border-ink-400/60',
  ghost:          'bg-transparent hover:bg-ink-700 text-fg-muted hover:text-fg',
  danger:         'bg-red-600 hover:bg-red-700 text-white font-semibold',
  'danger-outline':'border border-red-500/40 hover:border-red-500/70 text-red-400 hover:bg-red-500/5',
};

const sizes = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5',
  md: 'h-8 px-3 text-[12.5px] gap-1.5',
  lg: 'h-9 px-4 text-[13px] gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {icon && icon}
      {children}
    </button>
  );
}
