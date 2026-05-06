import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Avatar, AvatarStack } from '../components/common/Avatar';
import Skeleton from '../components/common/Skeleton';
import KanbanColumn from '../components/tasks/KanbanColumn';
import KanbanCard from '../components/tasks/KanbanCard';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { useProject, useAddMember, useRemoveMember } from '../hooks/useProjects';
import { useSearchUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { useTasks, useUpdateTask, useReorderTasks } from '../hooks/useTasks';
import { usePermissions } from '../hooks/usePermissions';
import { PROJ_STATUS, formatDate, isOverdue, PROJECT_ROLES } from '../data/meta';
import { PriorityBadge, StatusPill, Badge } from '../components/common/Badge';

const MEMBER_ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager', desc: 'Can manage project & all tasks' },
  { value: 'member',  label: 'Member',  desc: 'Can work on assigned tasks' },
];

function AddMemberModal({ projectId, currentMembers = [], onClose }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('member');
  const { data: results = [], isFetching } = useSearchUsers(q);
  const { mutateAsync: addMember, isPending } = useAddMember();

  // Filter out users already in the project
  const memberIds = new Set(currentMembers.map((m) => m.id));
  const filtered = results.filter((u) => !memberIds.has(u.id));

  const handleSubmit = async () => {
    if (!selected) return;
    await addMember({ projectId, userId: selected.id, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm fade-in">
      <div className="bg-ink-800 border border-ink-500 rounded-xl shadow-panel w-full max-w-[460px] scale-in">
        <div className="flex items-center justify-between px-5 h-12 border-b border-ink-600">
          <h3 className="text-[14px] font-semibold">Add member to project</h3>
          <button onClick={onClose} className="text-fg-muted hover:text-fg transition-colors">
            <I.x size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Input
            label="Search by name or email"
            icon={<I.search size={13} />}
            placeholder="e.g. Alex Chen"
            value={q}
            onChange={(e) => { setQ(e.target.value); setSelected(null); }}
            autoFocus
          />

          {q.length >= 2 && (
            <div className="bg-ink-700 border border-ink-500/60 rounded-lg max-h-40 overflow-y-auto">
              {isFetching ? (
                <div className="p-3 space-y-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-9 rounded" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12.5px] text-fg-dim">
                  {results.length === 0 ? 'No users found.' : 'All matching users are already members.'}
                </div>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setSelected(u); setQ(u.name); }}
                    className={`w-full flex items-center gap-3 px-3 h-11 hover:bg-ink-600 text-left transition-colors ${selected?.id === u.id ? 'bg-ink-600' : ''}`}
                  >
                    <Avatar name={u.name} size={26} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-fg">{u.name}</div>
                      <div className="text-[11px] text-fg-dim">{u.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-fg-muted block mb-1.5">Project role</label>
            <div className="grid grid-cols-2 gap-2">
              {MEMBER_ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${role === opt.value ? 'border-brand-500 bg-brand-500/10' : 'border-ink-500 hover:border-ink-400'}`}
                >
                  <div className="text-[12px] font-semibold text-fg">{opt.label}</div>
                  <div className="text-[10.5px] text-fg-dim mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 h-12 border-t border-ink-600">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" disabled={!selected || isPending} onClick={handleSubmit}>
            {isPending ? 'Adding…' : 'Add to project'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const VIEW_TABS = ['Board', 'List'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading: projLoading } = useProject(id);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(id);
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: reorderTasks } = useReorderTasks();
  const [activeTask, setActiveTask] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [view, setView] = useState('Board');
  const [showAddMember, setShowAddMember] = useState(false);
  const { user } = useAuth();

  const projectRole = project?.members?.find((m) => m.id === user?.id)?.project_role || null;
  const { canAddProjectMembers } = usePermissions(projectRole);
  const projStatus = project ? PROJ_STATUS[project.status] : null;
  const memberNames = (project?.members || []).map((m) => m.name);

  // Local copy of tasks for optimistic drag updates
  const [localTasks, setLocalTasks] = useState(null);
  const displayTasks = localTasks ?? tasks;
  // Store the ORIGINAL container on drag start — prevents the onDragOver status
  // update from confusing onDragEnd's cross-column detection
  const originContainerRef = useRef(null);

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = displayTasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findContainer = useCallback(
    (itemId) => {
      if (STATUSES.includes(itemId)) return itemId;
      // Look up in displayTasks for accurate status
      const task = displayTasks.find((t) => t.id === itemId);
      return task?.status || null;
    },
    [displayTasks]
  );

  const handleDragStart = ({ active }) => {
    const task = displayTasks.find((t) => t.id === active.id);
    setActiveDrag(task || null);
    originContainerRef.current = task?.status || null;
    setLocalTasks([...displayTasks]);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const overContainer = STATUSES.includes(over.id)
      ? over.id
      : displayTasks.find((t) => t.id === over.id)?.status;
    const origContainer = originContainerRef.current;
    if (!overContainer || !origContainer || overContainer === origContainer) return;

    // Optimistically move the card visually to the new column
    setLocalTasks((prev) => {
      const cur = prev ?? displayTasks;
      return cur.map((t) =>
        t.id === active.id ? { ...t, status: overContainer } : t
      );
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveDrag(null);
    const origContainer = originContainerRef.current;
    originContainerRef.current = null;

    if (!over || !origContainer) { setLocalTasks(null); return; }

    const overContainer = STATUSES.includes(over.id)
      ? over.id
      : displayTasks.find((t) => t.id === over.id)?.status;

    if (!overContainer) { setLocalTasks(null); return; }

    if (origContainer !== overContainer) {
      // Cross-column drop — persist the status change
      try {
        await updateTask({ projectId: id, taskId: active.id, status: overContainer });
      } catch (err) {
        console.error('Failed to update task status:', err);
        setLocalTasks(null);
      }
      setLocalTasks(null);
      return;
    }

    // Same-column reorder — use displayTasks which has the visual order
    const finalTasks = localTasks ?? displayTasks;
    const columnTasks = finalTasks.filter((t) => t.status === origContainer);
    const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
    const newIndex = columnTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      setLocalTasks(null);
      return;
    }

    const reordered = arrayMove(columnTasks, oldIndex, newIndex);
    const orderedIds = reordered.map((t) => t.id);

    setLocalTasks(
      finalTasks.map((t) => {
        const idx = orderedIds.indexOf(t.id);
        return idx === -1 ? t : { ...t, order_index: idx };
      })
    );

    try {
      await reorderTasks({ projectId: id, status: origContainer, orderedIds });
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
    }
    setLocalTasks(null);
  };

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
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-0 border-b border-ink-600/60 shrink-0">
        <div className="flex items-start justify-between gap-3 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ background: project.color || '#6366F1' }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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

          <div className="flex items-center gap-2 shrink-0">
            <AvatarStack names={memberNames} size={28} max={5} />
            {canAddProjectMembers && (
              <Button
                variant="secondary"
                size="sm"
                icon={<I.plus size={12} />}
                onClick={() => setShowAddMember(true)}
              >
                <span className="hidden sm:inline">Add member</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`h-8 px-3 text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                view === tab
                  ? 'border-brand-500 text-fg'
                  : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {view === 'Board' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 px-4 sm:px-6 py-5 h-full min-w-max">
              {tasksLoading ? (
                STATUSES.map((s) => (
                  <div key={s} className="w-[300px] space-y-2">
                    <Skeleton className="h-5 w-24 mb-3" />
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
                    onCardClick={(task) =>
                      setActiveTask({ ...task, project_key: project.key, project_color: project.color })
                    }
                  />
                ))
              )}
            </div>
          </div>

          <DragOverlay>
            {activeDrag && (
              <div className="rotate-1 scale-105 opacity-90">
                <KanbanCard task={activeDrag} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {view === 'List' && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-ink-600/60 bg-ink-800/40">
                  <th className="text-left pl-5 pr-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[90px]">Key</th>
                  <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider">Title</th>
                  <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[110px]">Status</th>
                  <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[100px]">Priority</th>
                  <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[120px]">Assignee</th>
                  <th className="text-left px-2 h-9 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[110px]">Due</th>
                </tr>
              </thead>
              <tbody>
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[13px] text-fg-dim">No tasks yet.</td>
                  </tr>
                ) : displayTasks.map((task) => {
                  const overdue = isOverdue(task.due_date) && task.status !== 'done';
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setActiveTask({ ...task, project_key: project.key, project_color: project.color })}
                      className="border-b border-ink-600/30 last:border-0 hover:bg-ink-700/40 cursor-pointer transition-colors"
                    >
                      <td className="pl-5 pr-2 py-3 align-middle">
                        <span className="text-[11.5px] font-mono text-fg-dim">{task.task_key || '—'}</span>
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <span className="text-[13px] text-fg font-medium">{task.title}</span>
                      </td>
                      <td className="px-2 py-3 align-middle"><StatusPill status={task.status} /></td>
                      <td className="px-2 py-3 align-middle"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-2 py-3 align-middle">
                        {task.assignee_name ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={task.assignee_name} size={20} />
                            <span className="text-[12.5px] text-fg-muted">{task.assignee_name}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-fg-dim">—</span>
                        )}
                      </td>
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
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          currentMembers={project.members || []}
          onClose={() => setShowAddMember(false)}
        />
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
