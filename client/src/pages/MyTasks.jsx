import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../components/common/icons';
import { PriorityBadge, StatusPill } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useMyTasks } from '../hooks/useDashboard';
import { formatDate, isOverdue } from '../data/meta';

const FILTER_TABS = [
  { key: 'All', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
  { key: 'overdue', label: 'Overdue' },
];

export default function MyTasks() {
  const { data: tasks = [], isLoading } = useMyTasks();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const tabCounts = {
    All: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => isOverdue(t.due_date) && t.status !== 'done').length,
  };

  const filtered = tasks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'overdue') return isOverdue(t.due_date) && t.status !== 'done';
    return t.status === activeFilter;
  });

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-[960px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">My Tasks</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-5 border-b border-ink-600/60 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`h-9 px-3 text-[12.5px] font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeFilter === key
                ? 'border-brand-500 text-fg'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            {label}
            <span className="text-[10.5px] text-fg-dim/70">{tabCounts[key]}</span>
          </button>
        ))}
      </div>

      <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-ink-600/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
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
              <tr className="border-b border-ink-600/60 bg-ink-800/40">
                <th className="text-left pl-5 pr-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[90px]">Key</th>
                <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider">Task</th>
                <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[100px]">Priority</th>
                <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[115px]">Status</th>
                <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[110px]">Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
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
                      <span className="text-[11.5px] font-mono text-fg-dim">{task.task_key || '—'}</span>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] text-fg font-medium">{task.title}</span>
                        <div className="flex items-center gap-1.5">
                          {task.project_color && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: task.project_color }} />
                          )}
                          <span className="text-[11px] text-fg-dim">{task.project_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 align-middle"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-2 py-3 align-middle"><StatusPill status={task.status} /></td>
                    <td className="px-2 py-3 align-middle">
                      <span className={`text-[12px] num ${overdue ? 'text-red-400' : 'text-fg-dim'}`}>
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
  );
}
