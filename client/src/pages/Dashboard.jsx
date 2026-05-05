import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../components/common/icons';
import { Avatar } from '../components/common/Avatar';
import { PriorityBadge, StatusPill } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useStats, useMyTasks } from '../hooks/useDashboard';
import { useProjects } from '../hooks/useProjects';
import { formatDate, isOverdue, PROJ_STATUS, PROJECT_COLORS } from '../data/meta';

function StatCard({ label, value, icon, accent = 'neutral', sub }) {
  const accents = {
    neutral: 'text-fg-muted',
    brand:   'text-brand-400',
    warning: 'text-yellow-400',
    danger:  'text-red-400',
  };
  const bgs = {
    neutral: 'bg-ink-700/40',
    brand:   'bg-brand-500/5',
    warning: 'bg-yellow-500/5',
    danger:  'bg-red-500/5',
  };
  return (
    <div className={`${bgs[accent]} border border-ink-500/60 rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${accents[accent]}`}>{icon}</span>
        {sub && <span className="text-[11px] text-fg-dim">{sub}</span>}
      </div>
      <div className="text-[28px] font-bold text-fg num leading-none mb-1">{value ?? '—'}</div>
      <div className="text-[12px] text-fg-muted">{label}</div>
    </div>
  );
}

function ProjectMiniCard({ project, index }) {
  const navigate = useNavigate();
  const ps = PROJ_STATUS[project.status] || PROJ_STATUS.active;
  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-700/60 transition-colors text-left"
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: PROJECT_COLORS[index % PROJECT_COLORS.length] }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-fg truncate">{project.name}</div>
        <div className="text-[11px] text-fg-dim">{project.task_count ?? 0} tasks</div>
      </div>
      <span className={`text-[10.5px] font-medium ${ps.text}`}>{ps.label}</span>
    </button>
  );
}

const FILTER_TABS = ['All', 'To Do', 'In Progress', 'Overdue'];
const STATUS_MAP = { 'To Do': 'todo', 'In Progress': 'in_progress' };

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: myTasks = [], isLoading: tasksLoading } = useMyTasks();
  const { data: projects = [], isLoading: projLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const filteredTasks = myTasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overdue') return isOverdue(t.due_date) && t.status !== 'done';
    return t.status === STATUS_MAP[activeFilter];
  });

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">Here's what's happening across your workspace.</p>
      </div>

      <div className="flex gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-ink-700/40 border border-ink-500/60 rounded-xl p-5">
                  <Skeleton className="h-4 w-4 mb-3" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            ) : (
              <>
                <StatCard label="Total tasks" value={stats?.total} icon={<I.square size={16} />} />
                <StatCard label="In progress" value={stats?.in_progress} icon={<I.inProgress size={16} />} accent="brand" />
                <StatCard label="Overdue" value={stats?.overdue} icon={<I.alert size={16} />} accent="danger" />
                <StatCard label="Projects" value={stats?.projectCount} icon={<I.folder size={16} />} accent="warning" />
              </>
            )}
          </div>

          {/* My Tasks table */}
          <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600/60">
              <h2 className="text-[14px] font-semibold">My Tasks</h2>
              <div className="flex gap-1">
                {FILTER_TABS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors ${
                      activeFilter === f
                        ? 'bg-ink-600 text-fg'
                        : 'text-fg-muted hover:text-fg hover:bg-ink-700/70'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {tasksLoading ? (
              <div className="divide-y divide-ink-600/40">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-fg-dim">No tasks found.</div>
            ) : (
              <div className="divide-y divide-ink-600/40">
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.due_date) && task.status !== 'done';
                  return (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/projects/${task.project_id}`)}
                      className={`w-full flex items-center gap-4 px-5 py-3 hover:bg-ink-700/40 transition-colors text-left ${
                        overdue ? 'border-l-2 border-l-red-500/60' : ''
                      }`}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="text-[13px] text-fg font-medium truncate block">{task.title}</span>
                        <span className="text-[11.5px] text-fg-dim">{task.project_name}</span>
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <StatusPill status={task.status} />
                      <span className={`text-[12px] num ${overdue ? 'text-red-400' : 'text-fg-dim'}`}>
                        {formatDate(task.due_date)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="w-[280px] shrink-0 hidden xl:block space-y-4">
          <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-600/60">
              <h3 className="text-[13px] font-semibold">Recent Projects</h3>
            </div>
            <div className="py-1">
              {projLoading ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-fg-dim">No projects yet.</div>
              ) : (
                projects.slice(0, 6).map((p, i) => (
                  <ProjectMiniCard key={p.id} project={p} index={i} />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
