import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { AvatarStack } from '../components/common/Avatar';
import Skeleton from '../components/common/Skeleton';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { usePermissions } from '../hooks/usePermissions';
import { PROJ_STATUS, PROJECT_COLORS } from '../data/meta';

const STATUS_TABS = ['All', 'Active', 'On Hold', 'Completed'];
const STATUS_KEY = { All: null, Active: 'active', 'On Hold': 'on_hold', Completed: 'completed' };

function ProjectCard({ project, index }) {
  const navigate = useNavigate();
  const ps = PROJ_STATUS[project.status] || PROJ_STATUS.active;
  const memberNames = (project.members || []).map((m) => m.name);
  const color = project.color || PROJECT_COLORS[index % PROJECT_COLORS.length];
  const progress = project.task_count
    ? Math.round(((project.done_count || 0) / project.task_count) * 100)
    : 0;

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-ink-700/40 border border-ink-500/60 rounded-xl p-5 text-left hover:border-ink-400/60 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
          <h3 className="text-[14px] font-semibold text-fg group-hover:text-brand-400 transition-colors leading-tight truncate">
            {project.name}
          </h3>
          {project.key && (
            <span className="px-1.5 py-0.5 rounded bg-ink-600 text-[10.5px] font-mono text-fg-dim shrink-0">
              {project.key}
            </span>
          )}
        </div>
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${ps.bg} ${ps.text} shrink-0`}>
          {ps.label}
        </span>
      </div>

      {project.description && (
        <p className="text-[12.5px] text-fg-muted mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-fg-dim mb-1">
          <span>{project.done_count || 0} / {project.task_count || 0} tasks</span>
          <span className="num">{progress}%</span>
        </div>
        <div className="h-1 bg-ink-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AvatarStack names={memberNames} size={22} max={4} />
        <span className="text-[11px] text-fg-dim">
          {(project.members || []).length} member{(project.members || []).length !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}

function CreateProjectModal({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const { mutateAsync, isPending } = useCreateProject();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await mutateAsync({ name, description, key: key.toUpperCase() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm fade-in">
      <div className="bg-ink-700 border border-ink-500 rounded-xl shadow-panel w-full max-w-md scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600">
          <h2 className="text-[15px] font-semibold">New Project</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg transition-colors">
            <I.x size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-[12.5px] text-red-400">
              {error}
            </div>
          )}
          <Input
            label="Project name"
            placeholder="My Project"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!key) setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5));
            }}
            required
          />
          <Input
            label="Project key"
            placeholder="PROJ"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
            hint="Short identifier for task IDs (e.g. PAY-001)"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-fg-muted">Description</label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-ink-800 border border-ink-500 text-[13px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { canCreateProject } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('All');
  const [showCreate, setShowCreate] = useState(searchParams.get('new') === '1');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowCreate(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const tabCounts = {
    All: projects.length,
    Active: projects.filter((p) => p.status === 'active').length,
    'On Hold': projects.filter((p) => p.status === 'on_hold').length,
    Completed: projects.filter((p) => p.status === 'completed').length,
  };

  const filtered = projects.filter((p) => {
    const key = STATUS_KEY[activeTab];
    return !key || p.status === key;
  });

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Projects</h1>
          <p className="text-[13px] text-fg-muted mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace.</p>
        </div>
        {canCreateProject && (
          <Button variant="primary" size="md" icon={<I.plus size={13} />} onClick={() => setShowCreate(true)}>
            <span className="hidden sm:inline">New project</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-ink-600/60 pb-0 overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-9 px-3 text-[13px] font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === tab
                ? 'border-brand-500 text-fg'
                : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            {tab}
            <span className="text-[11px] text-fg-dim/70">{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-ink-700/40 border border-ink-500/60 rounded-xl p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-1 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fg-dim text-[14px]">
          {activeTab === 'All' ? 'No projects yet.' : `No ${activeTab.toLowerCase()} projects.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
