import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-fg-muted">{label}</label>
      {children}
      {error && (
        <span className="text-[11.5px] text-red-400 flex items-center gap-1">
          <I.alert size={10} className="shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (tab === 'signup' && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await authApi.login(email, password);
      } else {
        res = await authApi.signup(name, email, password);
      }
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setGlobalError('');
  };

  const inputCls = (field) =>
    `w-full h-9 bg-ink-800 border ${errors[field] ? 'border-red-500/60' : 'border-ink-500'} rounded-md text-[13px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors px-3`;

  return (
    <div className="min-h-screen bg-ink-900 grid-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.10),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shadow-glow-brand">
            <I.logo size={20} className="text-brand-400" />
          </div>
          <span className="text-[21px] font-semibold text-fg tracking-tight">TaskFlow</span>
        </div>

        <div className="bg-ink-700/80 backdrop-blur-sm border border-ink-500/80 rounded-xl p-6 shadow-panel">
          {/* Tab switcher */}
          <div className="flex bg-ink-800/80 rounded-lg p-1 mb-6">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 h-7 rounded-md text-[12.5px] font-medium transition-colors ${
                  tab === t ? 'bg-ink-600 text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {globalError && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-[12.5px] text-red-400 flex items-center gap-2">
              <I.alert size={13} className="shrink-0" />
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {tab === 'signup' && (
              <Field label="Full name" error={errors.name}>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  className={inputCls('name')}
                  autoComplete="name"
                />
              </Field>
            )}

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                className={inputCls('email')}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  className={`${inputCls('password')} pr-10`}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg-muted transition-colors"
                >
                  {showPw ? <I.eyeOff size={15} /> : <I.eye size={15} />}
                </button>
              </div>
              {tab === 'login' && !errors.password && (
                <button
                  type="button"
                  className="self-end text-[11.5px] text-brand-400 hover:text-brand-300 transition-colors mt-0.5"
                >
                  Forgot password?
                </button>
              )}
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-10 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-ink-900 font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                tab === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-ink-500/60" />
            <span className="text-[11px] text-fg-dim">or continue with</span>
            <div className="flex-1 h-px bg-ink-500/60" />
          </div>

          {/* SSO buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button className="h-9 flex items-center justify-center gap-2 rounded-md bg-ink-800 border border-ink-500 hover:border-ink-400 text-[12.5px] text-fg-muted hover:text-fg transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="h-9 flex items-center justify-center gap-2 rounded-md bg-ink-800 border border-ink-500 hover:border-ink-400 text-[12.5px] text-fg-muted hover:text-fg transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        <p className="text-center text-[11.5px] text-fg-dim mt-5">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            {tab === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
