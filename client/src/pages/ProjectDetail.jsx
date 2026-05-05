import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import { AvatarStack } from '../components/common/Avatar';
import Skeleton from '../components/common/Skeleton';
import KanbanColumn from '../components/tasks/KanbanColumn';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { useProject } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { PROJECT_COLORS, PROJ_STATUS } from '../data/meta';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const VIEW_TABS = ['Board', 'List', 'Timeline', 'Overview'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, isLoading: projLoading } = useProject(id);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(id);
  const [activeTask, setActiveTask] = useState(null);
  const [view, setView] = useState('Board');

  const isAdmin = user?.role === 'admin';
  const projStatus = project ? PROJ_STATUS[project.status] : null;
  const memberNames = (project?.members || []).map((m) => m.name);

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  if (projLoading) {
    return (
      <div className="px-6 py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-[300px] h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-6 py-12 text-center text-fg-dim">
        Project not found.{' '}
        <button onClick={() => navigate('/projects')} className="text-brand-400 hover:underline">
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="px-6 pt-5 pb-4 border-b border-ink-600/60 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: PROJECT_COLORS[0] }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-semibold text-fg">{project.name}</h1>
                {project.key && (
                  <span className="px-1.5 py-0.5 rounded bg-ink-600 text-[11px] font-mono text-fg-dim">
                    {project.key}
                  </span>
                )}
                {projStatus && (
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${projStatus.bg} ${projStatus.text}`}>
                    {projStatus.label}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-[12.5px] text-fg-muted mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AvatarStack names={memberNames} size={26} max={5} />
            {isAdmin ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<I.users size={12} />}
                onClick={() => navigate('/admin/members')}
              >
                Manage team
              </Button>
            ) : (
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-ink-500/60 text-[12px] text-fg-dim cursor-default">
                <I.lock size={11} />
                Members only
              </button>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 mt-4">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`h-7 px-2.5 rounded-md text-[12.5px] font-medium transition-colors ${
                view === tab
                  ? 'bg-ink-600 text-fg'
                  : 'text-fg-muted hover:text-fg hover:bg-ink-700/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {view === 'Board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 px-6 py-5 h-full min-w-max">
            {tasksLoading ? (
              STATUSES.map((s) => (
                <div key={s} className="w-[300px] space-y-2">
                  <Skeleton className="h-5 w-24" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ))
            ) : (
              STATUSES.map((s) => (
                <KanbanColumn
                  key={s}
                  status={s}
                  tasks={tasksByStatus[s]}
                  projectId={id}
                  onCardClick={(task) => setActiveTask({ ...task, project_key: project.key })}
                />
              ))
            )}
          </div>
        </div>
      )}

      {view !== 'Board' && (
        <div className="flex-1 flex items-center justify-center text-fg-dim text-[14px]">
          {view} view coming soon.
        </div>
      )}

      {/* Task detail panel */}
      {activeTask && (
        <TaskDetailPanel
          task={activeTask}
          projectId={id}
          members={project.members || []}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
