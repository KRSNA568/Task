import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { I } from '../common/icons';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/Badge';
import { formatDate, isOverdue } from '../../data/meta';

export default function KanbanCard({ task, onClick, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-ink-700/60 border border-ink-500/50 rounded-lg p-3 cursor-pointer hover:border-ink-400/70 hover:bg-ink-700 transition-colors group ${isSortableDragging ? 'shadow-panel' : ''}`}
    >
      {/* Drag handle + task key row */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          {...attributes}
          {...listeners}
          className="text-fg-dim opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <I.drag size={13} />
        </span>
        {task.task_key && (
          <span className="text-[10.5px] font-mono text-fg-dim/70">{task.task_key}</span>
        )}
        <span className="flex-1" />
        {task.comment_count > 0 && (
          <span className="flex items-center gap-0.5 text-[11px] text-fg-dim">
            <I.message size={10} />
            {task.comment_count}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        className="text-[13px] font-medium text-fg leading-snug mb-2.5"
        onClick={onClick}
      >
        {task.title}
      </p>

      {/* Tags / priority */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5" onClick={onClick}>
        <PriorityBadge priority={task.priority} />
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="px-1.5 py-0.5 rounded bg-ink-500/50 text-[10.5px] text-fg-dim">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between" onClick={onClick}>
        <div className="flex items-center gap-2 text-fg-dim text-[11px]">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${overdue ? 'text-red-400' : ''}`}>
              <I.calendar size={10} />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
        {task.assignee_name && (
          <Avatar name={task.assignee_name} size={20} />
        )}
      </div>
    </div>
  );
}
