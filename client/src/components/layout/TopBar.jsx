import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../common/icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { authApi } from '../../api/authApi';

export default function TopBar({ breadcrumbs = [], onMenuClick }) {
  const { user, logout } = useAuth();
  const { raw } = useApi();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(raw); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[56px] bg-ink-800/80 backdrop-blur-sm border-b border-ink-600/60 flex items-center px-4 gap-3 sticky top-0 z-30 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-fg-dim hover:text-fg hover:bg-ink-700 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <I.menu size={18} />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <I.chevRight size={12} className="text-fg-dim" />}
            {crumb.href ? (
              <button
                onClick={() => navigate(crumb.href)}
                className="text-[13px] text-fg-muted hover:text-fg transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-[13px] text-fg font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        <button className="w-8 h-8 flex items-center justify-center rounded-md text-fg-dim hover:text-fg hover:bg-ink-700 transition-colors">
          <I.bell size={15} />
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenu((v) => !v)}
            className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-ink-700 transition-colors"
          >
            <Avatar name={user?.name || ''} size={24} />
            <span className="text-[12.5px] text-fg font-medium hidden sm:block">{user?.name}</span>
            <I.chevDown size={12} className="text-fg-dim hidden sm:block" />
          </button>

          {userMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-ink-700 border border-ink-500 rounded-lg shadow-panel overflow-hidden scale-in z-50"
              onMouseLeave={() => setUserMenu(false)}
            >
              <div className="px-3 py-2.5 border-b border-ink-600">
                <div className="text-[12.5px] font-medium text-fg">{user?.name}</div>
                <div className="text-[11px] text-fg-dim">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 h-9 text-[12.5px] text-red-400 hover:bg-ink-600 transition-colors"
              >
                <I.logout size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
