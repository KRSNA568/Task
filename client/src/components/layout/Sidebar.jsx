import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { I } from '../common/icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { PROJECT_COLORS } from '../../data/meta';

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors ${
          isActive
            ? 'bg-ink-600 text-fg'
            : 'text-fg-muted hover:text-fg hover:bg-ink-700/70'
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <aside className="w-[240px] shrink-0 h-screen bg-ink-800 border-r border-ink-600/60 flex flex-col overflow-hidden">
      {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-3 h-[56px] border-b border-ink-600/60 shrink-0">
        <div className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center">
          <I.logo size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-fg truncate">TaskFlow</div>
          <div className="text-[10.5px] text-fg-dim">Workspace</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          onClick={() => {}}
          className="w-full h-8 flex items-center gap-2 px-2.5 rounded-md bg-ink-700/60 border border-ink-500/60 hover:border-ink-400 text-[12.5px] text-fg-dim hover:text-fg-muted transition-colors"
        >
          <I.search size={13} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="px-1 py-0.5 rounded bg-ink-600 text-[10px] text-fg-dim font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 shrink-0">
        <NavItem to="/dashboard" icon={<I.home size={14} />} label="Dashboard" />
        <NavItem to="/my-tasks" icon={<I.square size={14} />} label="My Tasks" />
        <NavItem to="/projects" icon={<I.folder size={14} />} label="Projects" />
      </nav>

      <div className="h-px bg-ink-600/60 mx-3 my-3 shrink-0" />

      {/* Projects list */}
      <div className="px-3 shrink-0">
        <button
          onClick={() => setProjectsOpen((v) => !v)}
          className="w-full flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-fg-dim uppercase tracking-widest hover:text-fg-muted transition-colors"
        >
          <span className={`transition-transform ${projectsOpen ? 'rotate-90' : ''}`}>
            <I.chevRight size={10} />
          </span>
          Projects
        </button>

        {projectsOpen && (
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {projects.slice(0, 8).map((p, i) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 h-7 px-2 rounded-md text-[12.5px] transition-colors ${
                    isActive ? 'bg-ink-600 text-fg' : 'text-fg-muted hover:text-fg hover:bg-ink-700/70'
                  }`
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: PROJECT_COLORS[i % PROJECT_COLORS.length] }}
                />
                <span className="truncate font-medium">{p.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Admin section */}
      {user?.role === 'admin' && (
        <>
          <div className="h-px bg-ink-600/60 mx-3 my-3 shrink-0" />
          <div className="px-3 shrink-0">
            <div className="text-[11px] font-semibold text-fg-dim uppercase tracking-widest mb-1.5">Admin</div>
            <nav className="space-y-0.5">
              <NavItem to="/admin/members" icon={<I.users size={14} />} label="Members" />
              <NavItem to="/admin/settings" icon={<I.settings size={14} />} label="Settings" />
            </nav>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User card */}
      <div className="px-3 py-3 border-t border-ink-600/60 shrink-0">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2.5 h-9 px-2 rounded-md hover:bg-ink-700/70 transition-colors"
        >
          <Avatar name={user?.name || ''} size={26} />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12.5px] font-medium text-fg truncate">{user?.name}</div>
            <div className="text-[10.5px] text-fg-dim truncate">{user?.email}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
