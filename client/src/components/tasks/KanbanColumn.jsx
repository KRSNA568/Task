import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { I } from '../common/icons';
import KanbanCard from './KanbanCard';
import { useCreateTask } from '../../hooks/useTasks';
import { STATUS } from '../../data/meta';

export default function KanbanColumn({ status, tasks = [], projectId, onCardClick }) {
  const s = STATUS[status];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { mutateAsync, isPending } = useCreateTask();

  const { setNodeRef, isOver } = useDroppable({ id: status });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await mutateAsync({ projectId, title: title.trim(), status });
    setTitle('');
    setAdding(false);
  };

  return (
    <div className="w-[300px] shrink-0 flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s?.dot }} />
        <span className="text-[13px] font-semibold text-fg">{s?.label}</span>
        <span className="px-1.5 py-0.5 rounded bg-ink-600 text-[11px] text-fg-dim num">{tasks.length}</span>
        <button
          onClick={() => setAdding(true)}
          className="ml-auto w-6 h-6 flex items-center justify-center rounded-md text-fg-dim hover:text-fg hover:bg-ink-700 transition-colors"
          title="Add task"
        >
          <I.plus size={13} />
        </button>
      </div>

      {/* Cards drop area */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 border rounded-xl p-2 space-y-2 min-h-[120px] overflow-y-auto transition-colors ${
            isOver
              ? 'border-brand-500/50 bg-brand-500/5'
              : 'border-ink-500/40 bg-ink-800/40'
          }`}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
            />
          ))}

          {tasks.length === 0 && !adding && (
            <div className="flex items-center justify-center h-16 text-[12px] text-fg-dim/50 select-none">
              Drop tasks here
            </div>
          )}

          {/* Inline add form */}
          {adding && (
            <form
              onSubmit={handleAdd}
              className="bg-ink-700 border border-ink-500 rounded-lg p-2.5 space-y-2"
            >
              <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                rows={2}
                className="w-full bg-transparent text-[13px] text-fg placeholder:text-fg-dim resize-none focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(e); }
                  if (e.key === 'Escape') { setAdding(false); setTitle(''); }
                }}
              />
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={isPending || !title.trim()}
                  className="h-7 px-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-ink-900 text-[12px] font-semibold transition-colors disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setTitle(''); }}
                  className="h-7 px-2.5 rounded-md text-fg-muted hover:text-fg hover:bg-ink-600 text-[12px] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </SortableContext>

      {/* Persistent add button at bottom */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 w-full flex items-center gap-1.5 h-8 px-2 rounded-lg text-[12px] text-fg-dim hover:text-fg hover:bg-ink-700/60 transition-colors"
        >
          <I.plus size={12} />
          Add task
        </button>
      )}
    </div>
  );
}
