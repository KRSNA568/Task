/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0A0A0B',
          800: '#111113',
          700: '#18181B',
          600: '#1F1F23',
          500: '#27272A',
          400: '#3F3F46',
        },
        fg: {
          DEFAULT: '#FAFAFA',
          muted: '#A1A1AA',
          dim: '#71717A',
        },
        brand: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.5)',
        'glow-brand': '0 0 32px rgba(16,185,129,0.18)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'slide-in-right': 'slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.15s ease',
        'scale-in': 'scaleIn 0.15s ease',
      },
    },
  },
  plugins: [],
};
