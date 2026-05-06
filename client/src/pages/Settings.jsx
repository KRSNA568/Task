import { useState } from 'react';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useProjects, useUpdateProject, useDeleteProject, useAddMember, useRemoveMember } from '../hooks/useProjects';
import { useSearchUsers } from '../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { PROJECT_ROLES } from '../data/meta';

const MEMBER_ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager', desc: 'Can manage project, add members, create/edit all tasks' },
  { value: 'member',  label: 'Member',  desc: 'Can work on assigned tasks' },
];

function AddMemberModal({ projectId, onClose }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('member');
  const { data: results = [], isFetching } = useSearchUsers(q);
  const { mutateAsync: addMember, isPending } = useAddMember();

  const handleSubmit = async () => {
    if (!selected) return;
    await addMember({ projectId, userId: selected.id, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm fade-in">
      <div className="bg-ink-800 border border-ink-500 rounded-xl shadow-panel w-full max-w-[480px] scale-in overflow-hidden">
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
              ) : results.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12.5px] text-fg-dim">No users found.</div>
              ) : (
                results.map((u) => (
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

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-ink-500'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`}
      />
    </button>
  );
}

function SettingsRow({ title, hint, children, danger = false }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 py-4 ${danger ? '' : 'border-b border-ink-500/40 last:border-0'}`}>
      <div className="min-w-0 max-w-md">
        <div className={`text-[13px] font-semibold ${danger ? 'text-red-400' : 'text-fg'}`}>{title}</div>
        {hint && <div className="text-[12px] text-fg-muted mt-1 leading-relaxed">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'general',  label: 'General',             icon: <I.settings size={13} /> },
  { id: 'members',  label: 'Members & Permissions', icon: <I.users size={13} /> },
  { id: 'danger',   label: 'Danger Zone',          icon: <I.alert size={13} />, danger: true },
];

export default function Settings() {
  const [tab, setTab] = useState('general');
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const { mutateAsync: removeMember } = useRemoveMember();

  const [projectName, setProjectName] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [publicVisible, setPublicVisible] = useState(false);

  const { mutateAsync: updateProject, isPending: saving } = useUpdateProject();
  const { mutateAsync: deleteProject, isPending: deleting } = useDeleteProject();

  const handleSaveName = async () => {
    if (!project || !projectName.trim()) return;
    await updateProject({ id: project.id, name: projectName.trim() });
  };

  const handleDelete = async () => {
    if (!project || confirmText !== project.name) return;
    await deleteProject(project.id);
    navigate('/projects');
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-[1080px] mx-auto">
      <div className="mb-5">
        <div className="text-[11.5px] text-fg-dim font-mono mb-1">Workspace · Admin</div>
        <h1 className="text-[20px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">Manage configuration, permissions, and lifecycle for your projects.</p>
      </div>

      {/* Project selector */}
      {projects.length > 0 && (
        <div className="mb-6">
          <label className="text-[12px] font-medium text-fg-muted block mb-1.5">Select project</label>
          <select
            value={selectedProjectId || project?.id || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-9 px-2.5 rounded-md bg-ink-800 border border-ink-500 text-[13px] text-fg focus:outline-none focus:border-brand-500 transition-colors"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Mini-nav */}
        <nav className="sm:w-[200px] sm:shrink-0 sm:sticky sm:top-6 sm:self-start">
          <div className="flex sm:flex-col gap-1 overflow-x-auto scrollbar-none sm:overflow-visible">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`h-8 sm:w-full flex items-center gap-2 px-2.5 rounded-md text-[12.5px] text-left transition-colors whitespace-nowrap shrink-0 sm:shrink ${
                  tab === n.id
                    ? (n.danger ? 'bg-red-500/10 text-red-400' : 'bg-ink-600 text-fg')
                    : (n.danger ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5' : 'text-fg-muted hover:text-fg hover:bg-ink-700/70')
                }`}
              >
                <span className={tab === n.id && !n.danger ? 'text-brand-400' : ''}>{n.icon}</span>
                <span className="font-medium">{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'general' && (
            <div className="bg-ink-700/40 border border-ink-500/60 rounded-lg px-5">
              <SettingsRow title="Project name" hint="Shown in the sidebar, search results, and breadcrumbs.">
                <div className="flex gap-2">
                  <input
                    value={projectName || project?.name || ''}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-56 h-9 px-3 rounded-md bg-ink-800 border border-ink-500 text-[13px] text-fg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                  />
                  <Button variant="secondary" size="md" onClick={handleSaveName} disabled={saving}>
                    Save
                  </Button>
                </div>
              </SettingsRow>
              <SettingsRow title="Project key" hint="Used as the prefix on all task IDs. Cannot be changed once tasks exist.">
                <input
                  value={project?.key || ''}
                  disabled
                  className="w-24 h-9 px-3 rounded-md bg-ink-800/50 border border-ink-500/40 text-[13px] text-fg-dim cursor-not-allowed font-mono"
                />
              </SettingsRow>
              <SettingsRow title="Notify members on changes" hint="Send in-app notifications when tasks are created, assigned, or moved.">
                <Toggle checked={notifyMembers} onChange={setNotifyMembers} />
              </SettingsRow>
              <SettingsRow title="Auto-archive completed tasks" hint="Tasks moved to Done are archived after 30 days.">
                <Toggle checked={autoArchive} onChange={setAutoArchive} />
              </SettingsRow>
              <SettingsRow title="Public visibility" hint="Anyone in the workspace can view this project (read-only).">
                <Toggle checked={publicVisible} onChange={setPublicVisible} />
              </SettingsRow>
            </div>
          )}

          {tab === 'members' && (
            <div className="bg-ink-700/40 border border-ink-500/60 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[14px] font-semibold">Project members</div>
                  <div className="text-[12px] text-fg-muted mt-0.5">
                    {(project?.members || []).length} people have access to this project.
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon={<I.plus size={13} />}
                  onClick={() => setShowAddMember(true)}
                >
                  Add member
                </Button>
              </div>
              <div className="space-y-1">
                {(project?.members || []).map((u) => {
                  const prole = PROJECT_ROLES[u.project_role] || PROJECT_ROLES.member;
                  return (
                    <div key={u.id} className="flex items-center gap-3 h-11 px-2 rounded-md hover:bg-ink-700/60 transition-colors group">
                      <Avatar name={u.name} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-fg leading-tight">{u.name}</div>
                        <div className="text-[11px] text-fg-dim">{u.email}</div>
                      </div>
                      <Badge tone={prole.tone}>{prole.label}</Badge>
                      <button
                        onClick={() => removeMember({ projectId: project.id, userId: u.id })}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-[11.5px] text-red-400 hover:bg-red-500/10 h-6 px-2 rounded transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {(project?.members || []).length === 0 && (
                  <div className="py-8 text-center text-[12.5px] text-fg-dim">No members yet.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-semibold text-amber-300 flex items-center gap-1.5">
                      <I.alert size={13} /> Archive project
                    </div>
                    <p className="text-[12px] text-fg-muted mt-1.5 max-w-md leading-relaxed">
                      Archived projects are hidden from the sidebar and read-only. You can restore them at any time.
                    </p>
                  </div>
                  <Button variant="secondary" size="md">Archive project</Button>
                </div>
              </div>

              <div className="border border-red-500/40 bg-red-500/5 rounded-lg p-5">
                <div className="text-[13px] font-semibold text-red-400 flex items-center gap-1.5 mb-1">
                  <I.trash size={13} /> Delete project
                </div>
                <p className="text-[12px] text-fg-muted leading-relaxed max-w-lg">
                  Permanently delete{' '}
                  <span className="text-fg font-medium">{project?.name}</span> and all tasks, comments, and attachments.{' '}
                  <span className="text-red-400">This action cannot be undone.</span>
                </p>
                <div className="mt-4 max-w-md">
                  <label className="block text-[11.5px] font-medium text-fg-muted mb-1.5">
                    Type <span className="font-mono text-red-400">{project?.name}</span> to confirm
                  </label>
                  <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Project name"
                    className="w-full h-9 px-3 rounded-md bg-ink-800 border border-red-500/30 hover:border-red-500/50 text-[13px] text-fg font-mono placeholder:text-fg-dim focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="danger"
                    size="md"
                    disabled={confirmText !== project?.name || deleting}
                    icon={<I.trash size={13} />}
                    onClick={handleDelete}
                    className={confirmText !== project?.name ? 'opacity-40 cursor-not-allowed' : ''}
                  >
                    Delete project permanently
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddMember && project && (
        <AddMemberModal
          projectId={project.id}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
}
