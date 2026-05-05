import { I } from '../common/icons';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/Badge';
import { formatDate, isOverdue } from '../../data/meta';

export default function KanbanCard({ task, onClick }) {
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  return (
    <div
      onClick={onClick}
      className="bg-ink-700/60 border border-ink-500/60 rounded-lg p-3 cursor-pointer hover:border-ink-400/60 hover:bg-ink-700 transition-colors group"
    >
      {/* Drag handle */}
      <div className="flex items-start gap-2">
        <span className="text-fg-dim opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab">
          <I.drag size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-fg leading-snug mb-2">{task.title}</p>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <PriorityBadge priority={task.priority} />
            {task.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-ink-500/50 text-[10.5px] text-fg-dim">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-fg-dim text-[11.5px]">
              {task.due_date && (
                <span className={`flex items-center gap-1 ${overdue ? 'text-red-400' : ''}`}>
                  <I.calendar size={11} />
                  {formatDate(task.due_date)}
                </span>
              )}
              {task.comment_count > 0 && (
                <span className="flex items-center gap-1">
                  <I.message size={11} />
                  {task.comment_count}
                </span>
              )}
            </div>
            {task.assignee_name && (
              <Avatar name={task.assignee_name} size={20} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
