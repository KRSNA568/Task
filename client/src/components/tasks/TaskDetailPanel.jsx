import { useState, useEffect } from 'react';
import { I } from '../common/icons';
import { Avatar } from '../common/Avatar';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Dropdown from '../common/Dropdown';
import { PriorityBadge, StatusPill } from '../common/Badge';
import { useUpdateTask, useDeleteTask, useAddComment } from '../../hooks/useTasks';
import { PRIORITY, STATUS, formatDate } from '../../data/meta';

const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([value, p]) => ({ value, label: p.label }));
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }));

function ActivityItem({ item }) {
  const isComment = item.action === 'comment';
  if (isComment) {
    return (
      <div className="flex gap-3">
        <Avatar name={item.actor_name || 'U'} size={26} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[12.5px] font-medium text-fg">{item.actor_name}</span>
            <span className="text-[11px] text-fg-dim">{formatDate(item.created_at)}</span>
          </div>
          <div className="bg-ink-700/60 border border-ink-500/40 rounded-lg px-3 py-2 text-[12.5px] text-fg-muted leading-relaxed">
            {item.body}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[12px] text-fg-dim">
      <Avatar name={item.actor_name || 'U'} size={18} className="shrink-0" />
      <span>
        <span className="text-fg-muted font-medium">{item.actor_name}</span> {item.body}
      </span>
      <span className="ml-auto shrink-0">{formatDate(item.created_at)}</span>
    </div>
  );
}

export default function TaskDetailPanel({ task, projectId, members = [], onClose }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [comment, setComment] = useState('');
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: deleteTask, isPending: deleting } = useDeleteTask();
  const { mutateAsync: addComment, isPending: commenting } = useAddComment();

  useEffect(() => {
    setTitle(task.title);
  }, [task]);

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== task.title) {
      await updateTask({ projectId, taskId: task.id, title: title.trim() });
    }
  };

  const handleFieldChange = async (field, value) => {
    await updateTask({ projectId, taskId: task.id, [field]: value });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await deleteTask({ projectId, taskId: task.id });
    onClose();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment({ projectId, taskId: task.id, body: comment.trim() });
    setComment('');
  };

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...(members || []).map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] z-50 bg-ink-800 border-l border-ink-600/60 flex flex-col shadow-panel slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600/60 shrink-0">
          <div className="text-[11.5px] text-fg-dim font-mono">
            {task.project_key && `${task.project_key}-${task.id?.slice(-4).toUpperCase()}`}
          </div>
          <div className="flex items-center gap-1">
            <IconButton onClick={handleDelete} disabled={deleting} className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
              <I.trash size={14} />
            </IconButton>
            <IconButton onClick={onClose}>
              <I.x size={15} />
            </IconButton>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            {/* Inline-editable title */}
            {editingTitle ? (
              <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTitleSave(); } }}
                className="w-full text-[18px] font-semibold text-fg bg-transparent focus:outline-none resize-none leading-snug"
                rows={2}
              />
            ) : (
              <h2
                className="text-[18px] font-semibold text-fg leading-snug cursor-text hover:bg-ink-700/40 rounded px-1 -mx-1 py-0.5 transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Properties */}
          <div className="px-5 border-t border-ink-600/40 py-4 space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center">
              <span className="text-[12px] text-fg-dim font-medium">Status</span>
              <Dropdown
                value={task.status}
                options={STATUS_OPTIONS}
                onChange={(v) => handleFieldChange('status', v)}
                renderValue={(opt) => <StatusPill status={opt.value} />}
              />

              <span className="text-[12px] text-fg-dim font-medium">Priority</span>
              <Dropdown
                value={task.priority}
                options={PRIORITY_OPTIONS}
                onChange={(v) => handleFieldChange('priority', v)}
                renderValue={(opt) => <PriorityBadge priority={opt.value} />}
              />

              <span className="text-[12px] text-fg-dim font-medium">Assignee</span>
              <Dropdown
                value={task.assignee_id || ''}
                options={assigneeOptions}
                onChange={(v) => handleFieldChange('assignee_id', v || null)}
                renderValue={(opt) =>
                  opt.value ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={opt.label} size={18} />
                      <span className="text-[12.5px] text-fg">{opt.label}</span>
                    </div>
                  ) : (
                    <span className="text-[12.5px] text-fg-dim">Unassigned</span>
                  )
                }
              />

              <span className="text-[12px] text-fg-dim font-medium">Due date</span>
              <input
                type="date"
                defaultValue={task.due_date?.slice(0, 10) || ''}
                onBlur={(e) => handleFieldChange('due_date', e.target.value || null)}
                className="h-8 px-2.5 rounded-md bg-ink-700/60 border border-ink-500/60 hover:border-ink-400 text-[12.5px] text-fg focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4 border-t border-ink-600/40">
            <div className="text-[12px] font-medium text-fg-dim mb-2">Description</div>
            <textarea
              defaultValue={task.description || ''}
              placeholder="Add a description..."
              rows={4}
              onBlur={(e) => {
                if (e.target.value !== (task.description || ''))
                  handleFieldChange('description', e.target.value);
              }}
              className="w-full bg-ink-700/40 border border-ink-500/40 hover:border-ink-500 rounded-lg px-3 py-2 text-[13px] text-fg-muted placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-colors"
            />
          </div>

          {/* Activity */}
          <div className="px-5 py-4 border-t border-ink-600/40">
            <div className="text-[12px] font-medium text-fg-dim mb-3">Activity</div>
            <div className="space-y-3">
              {(task.activity || []).length === 0 && (
                <p className="text-[12.5px] text-fg-dim">No activity yet.</p>
              )}
              {(task.activity || []).map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Comment composer */}
        <div className="px-5 py-4 border-t border-ink-600/60 shrink-0">
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 px-3 rounded-lg bg-ink-700/60 border border-ink-500/60 hover:border-ink-400 text-[13px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<I.send size={13} />}
              disabled={!comment.trim() || commenting}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
