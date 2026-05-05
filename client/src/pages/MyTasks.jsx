import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge, StatusPill } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useMyTasks } from '../hooks/useDashboard';
import { formatDate, isOverdue } from '../data/meta';

const FILTER_TABS = ['All', 'To Do', 'In Progress', 'In Review', 'Done', 'Overdue'];
const STATUS_MAP = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'In Review': 'review',
  'Done': 'done',
};

export default function MyTasks() {
  const { data: tasks = [], isLoading } = useMyTasks();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const filtered = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overdue') return isOverdue(t.due_date) && t.status !== 'done';
    return t.status === STATUS_MAP[activeFilter];
  });

  return (
    <div className="px-6 py-6 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">My Tasks</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 border-b border-ink-600/60">
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`h-9 px-3 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeFilter === f
                ? 'border-brand-500 text-fg'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-ink-600/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-fg-dim">No tasks found.</div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-5 py-2.5 border-b border-ink-600/60">
              <span className="flex-1 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Task</span>
              <span className="w-20 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Priority</span>
              <span className="w-24 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Status</span>
              <span className="w-28 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Due</span>
            </div>
            <div className="divide-y divide-ink-600/40">
              {filtered.map((task) => {
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
                    <span className="w-20"><PriorityBadge priority={task.priority} /></span>
                    <span className="w-24"><StatusPill status={task.status} /></span>
                    <span className={`w-28 text-[12px] num ${overdue ? 'text-red-400' : 'text-fg-dim'}`}>
                      {formatDate(task.due_date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
