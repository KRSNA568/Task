export default function IconButton({ size = 'sm', className = '', children, ...rest }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <button
      className={`${dim} flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-ink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
