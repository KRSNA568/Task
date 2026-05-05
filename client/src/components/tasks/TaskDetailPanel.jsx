import { useState, useEffect, useRef } from 'react';
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

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function ActivityItem({ item }) {
  const isComment = item.action === 'comment';
  if (isComment) {
    return (
      <div className="flex gap-3">
        <Avatar name={item.actor_name || 'U'} size={26} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[12.5px] font-medium text-fg">{item.actor_name}</span>
            <span className="text-[10.5px] text-fg-dim">{formatTimestamp(item.created_at)}</span>
          </div>
          <div className="bg-ink-700/60 border border-ink-500/40 rounded-lg px-3 py-2.5 text-[12.5px] text-fg-muted leading-relaxed">
            {item.body}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[11.5px] text-fg-dim">
      <Avatar name={item.actor_name || 'U'} size={18} className="shrink-0" />
      <span>
        <span className="text-fg-muted font-medium">{item.actor_name}</span>{' '}
        {item.body}
      </span>
      <span className="ml-auto shrink-0 text-[10.5px]">{formatTimestamp(item.created_at)}</span>
    </div>
  );
}

function TagsField({ tags = [], onChange }) {
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const addTag = (val) => {
    const tag = val.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="flex items-start gap-2 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-600 border border-ink-500/60 text-[11.5px] text-fg-muted group"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="text-fg-dim hover:text-fg transition-colors ml-0.5"
          >
            <I.x size={9} />
          </button>
        </span>
      ))}
      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
            if (e.key === 'Escape') { setEditing(false); setInput(''); }
          }}
          onBlur={() => { addTag(input); setEditing(false); }}
          placeholder="Tag name..."
          className="h-6 px-2 rounded-full bg-ink-600 border border-brand-500/50 text-[11.5px] text-fg placeholder:text-fg-dim focus:outline-none w-28"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-dashed border-ink-500 text-[11.5px] text-fg-dim hover:text-fg hover:border-ink-400 transition-colors"
        >
          <I.plus size={9} /> Add tag
        </button>
      )}
    </div>
  );
}

export default function TaskDetailPanel({ task, projectId, members = [], onClose }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState(task.tags || []);
  const { mutateAsync: updateTask, isPending: updating } = useUpdateTask();
  const { mutateAsync: deleteTask, isPending: deleting } = useDeleteTask();
  const { mutateAsync: addComment, isPending: commenting } = useAddComment();

  useEffect(() => {
    setTitle(task.title);
    setTags(task.tags || []);
  }, [task.id]);

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== task.title) {
      await updateTask({ projectId, taskId: task.id, title: title.trim() });
    }
  };

  const handleFieldChange = async (field, value) => {
    await updateTask({ projectId, taskId: task.id, [field]: value });
  };

  const handleTagsChange = async (newTags) => {
    setTags(newTags);
    await updateTask({ projectId, taskId: task.id, tags: newTags });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
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
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-600/60 shrink-0">
          {task.project_color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: task.project_color }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {task.task_key && (
                <span className="text-[11px] font-mono text-fg-dim">{task.task_key}</span>
              )}
              {task.project_name && (
                <>
                  <span className="text-fg-dim/40 text-[10px]">·</span>
                  <span className="text-[11px] text-fg-dim truncate">{task.project_name}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <IconButton onClick={onClose}>
              <I.x size={15} />
            </IconButton>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="px-5 pt-5 pb-3">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); }
                  if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); }
                }}
                className="w-full text-[18px] font-semibold text-fg bg-transparent focus:outline-none border-b border-brand-500/60 pb-0.5 leading-snug"
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
          <div className="px-5 pb-4 border-b border-ink-600/40">
            <div className="grid grid-cols-[110px_1fr] gap-y-3 items-center">
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

              <span className="text-[12px] text-fg-dim font-medium">Tags</span>
              <TagsField tags={tags} onChange={handleTagsChange} />
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4 border-b border-ink-600/40">
            <div className="text-[12px] font-medium text-fg-dim mb-2">Description</div>
            <textarea
              key={task.id}
              defaultValue={task.description || ''}
              placeholder="Add a description..."
              rows={4}
              onBlur={(e) => {
                if (e.target.value !== (task.description || ''))
                  handleFieldChange('description', e.target.value);
              }}
              className="w-full bg-ink-700/40 border border-ink-500/40 hover:border-ink-500 rounded-lg px-3 py-2.5 text-[13px] text-fg-muted placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-colors"
            />
          </div>

          {/* Activity */}
          <div className="px-5 py-4">
            <div className="text-[12px] font-medium text-fg-dim mb-4">Activity</div>
            <div className="space-y-4">
              {(task.activity || []).length === 0 && (
                <p className="text-[12px] text-fg-dim">No activity yet.</p>
              )}
              {(task.activity || []).map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Comment composer */}
        <div className="px-5 py-3 border-t border-ink-600/60 shrink-0">
          <form onSubmit={handleComment}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleComment(e);
              }}
              className="w-full bg-ink-700/60 border border-ink-500/60 hover:border-ink-400 rounded-lg px-3 py-2 text-[13px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-colors mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-fg-dim">⌘↵ to send</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                >
                  <I.trash size={12} />
                  Delete task
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!comment.trim() || commenting}
                >
                  {commenting ? 'Sending…' : 'Comment'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
