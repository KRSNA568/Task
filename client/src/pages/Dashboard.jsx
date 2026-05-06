import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../components/common/icons';
import { Avatar } from '../components/common/Avatar';
import { PriorityBadge, StatusPill } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useStats, useMyTasks } from '../hooks/useDashboard';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, PROJ_STATUS } from '../data/meta';

function StatCard({ label, value, icon, accent = 'neutral', delta }) {
  const colors = {
    neutral: { bg: 'bg-ink-700/40', border: 'border-ink-500/60', icon: 'bg-ink-600 text-fg-muted', num: 'text-fg' },
    brand:   { bg: 'bg-brand-500/5', border: 'border-brand-500/20', icon: 'bg-brand-500/15 text-brand-400', num: 'text-fg' },
    warning: { bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', icon: 'bg-yellow-500/15 text-yellow-400', num: 'text-fg' },
    danger:  { bg: 'bg-red-500/5', border: 'border-red-500/20', icon: 'bg-red-500/15 text-red-400', num: 'text-fg' },
  };
  const c = colors[accent];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {delta != null && (
          <span className={`text-[11px] font-medium ${delta >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div>
        <div className={`text-[28px] font-bold num leading-none mb-0.5 ${c.num}`}>{value ?? '—'}</div>
        <div className="text-[12px] text-fg-muted">{label}</div>
      </div>
    </div>
  );
}

function ProjectMiniCard({ project }) {
  const navigate = useNavigate();
  const ps = PROJ_STATUS[project.status] || PROJ_STATUS.active;
  const color = project.color || '#6366F1';
  const total = (project.task_count ?? 0);
  const done = (project.done_count ?? 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-700/60 transition-colors text-left group"
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[13px] font-medium text-fg truncate">{project.name}</span>
          <span className={`text-[10.5px] font-medium shrink-0 ${ps.text}`}>{ps.label}</span>
        </div>
        <div className="h-1 bg-ink-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <div className="text-[10.5px] text-fg-dim mt-1">{total} task{total !== 1 ? 's' : ''} · {pct}% done</div>
      </div>
    </button>
  );
}

const FILTER_TABS = [
  { key: 'All', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue', label: 'Overdue' },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: myTasks = [], isLoading: tasksLoading } = useMyTasks();
  const { data: projects = [], isLoading: projLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] || 'there';

  const tabCounts = {
    All: myTasks.length,
    todo: myTasks.filter((t) => t.status === 'todo').length,
    in_progress: myTasks.filter((t) => t.status === 'in_progress').length,
    overdue: myTasks.filter((t) => isOverdue(t.due_date) && t.status !== 'done').length,
  };

  const filteredTasks = myTasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'overdue') return isOverdue(t.due_date) && t.status !== 'done';
    return t.status === activeFilter;
  });

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-[1200px] mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Good {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-[13px] text-fg-muted mt-0.5">
          Here's what's on your plate today.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-ink-700/40 border border-ink-500/60 rounded-xl p-5">
                  <div className="flex justify-between mb-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-14 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  label="Total tasks"
                  value={stats?.total ?? 0}
                  icon={<I.square size={16} />}
                  accent="neutral"
                />
                <StatCard
                  label="In progress"
                  value={stats?.in_progress ?? 0}
                  icon={<I.inProgress size={16} />}
                  accent="brand"
                />
                <StatCard
                  label="Overdue"
                  value={stats?.overdue ?? 0}
                  icon={<I.alert size={16} />}
                  accent="danger"
                />
                <StatCard
                  label="Projects"
                  value={stats?.projectCount ?? 0}
                  icon={<I.folder size={16} />}
                  accent="warning"
                />
              </>
            )}
          </div>

          {/* My Tasks */}
          <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3.5 border-b border-ink-600/60">
              <h2 className="text-[14px] font-semibold shrink-0">My Tasks</h2>
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      activeFilter === key
                        ? 'bg-ink-600 text-fg'
                        : 'text-fg-muted hover:text-fg hover:bg-ink-700/70'
                    }`}
                  >
                    {label}
                    <span className={`text-[10.5px] tabular-nums ${activeFilter === key ? 'text-fg-dim' : 'text-fg-dim/60'}`}>
                      {tabCounts[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {tasksLoading ? (
              <div className="divide-y divide-ink-600/40">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div className="w-10 h-10 rounded-full bg-ink-600 flex items-center justify-center mx-auto mb-3">
                  <I.check size={18} className="text-brand-400" />
                </div>
                <p className="text-[13px] font-medium text-fg mb-1">All caught up!</p>
                <p className="text-[12px] text-fg-dim">No tasks match this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-ink-600/40">
                    <th className="text-left pl-5 pr-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[90px]">Key</th>
                    <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider">Task</th>
                    <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[100px]">Priority</th>
                    <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[110px]">Status</th>
                    <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[110px]">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const overdue = isOverdue(task.due_date) && task.status !== 'done';
                    return (
                      <tr
                        key={task.id}
                        onClick={() => navigate(`/projects/${task.project_id}`)}
                        className={`border-b border-ink-600/30 last:border-0 hover:bg-ink-700/40 cursor-pointer transition-colors ${
                          overdue ? 'border-l-2 border-l-red-500/60' : ''
                        }`}
                      >
                        <td className="pl-5 pr-2 py-3 align-middle">
                          {task.task_key ? (
                            <span className="text-[11.5px] font-mono text-fg-dim">{task.task_key}</span>
                          ) : (
                            <span className="text-[11.5px] font-mono text-fg-dim/40">—</span>
                          )}
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] text-fg font-medium line-clamp-1">{task.title}</span>
                            <div className="flex items-center gap-1.5">
                              {task.project_color && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: task.project_color }}
                                />
                              )}
                              <span className="text-[11px] text-fg-dim">{task.project_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <StatusPill status={task.status} />
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <span className={`text-[12px] num ${overdue ? 'text-red-400' : 'text-fg-dim'}`}>
                            {overdue && <I.alert size={10} className="inline mr-1" />}
                            {formatDate(task.due_date)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="w-[280px] shrink-0 hidden xl:block space-y-4">
          <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-600/60">
              <h3 className="text-[13px] font-semibold">Recent Projects</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-[11.5px] text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="py-1.5 px-1.5">
              {projLoading ? (
                <div className="space-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[60px] rounded-lg" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-fg-dim">No projects yet.</div>
              ) : (
                projects.slice(0, 5).map((p) => (
                  <ProjectMiniCard key={p.id} project={p} />
                ))
              )}
            </div>
          </div>

          {/* Quick tip */}
          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <I.search size={13} className="text-brand-400" />
              <span className="text-[12.5px] font-semibold text-fg">Quick navigation</span>
            </div>
            <p className="text-[11.5px] text-fg-muted leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-ink-600 border border-ink-500 text-[10px] font-mono">⌘K</kbd> to open the command palette and jump anywhere instantly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
