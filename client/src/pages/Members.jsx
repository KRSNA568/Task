import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useUsers, useSearchUsers, useUpdateUserRole } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { formatDate, GLOBAL_ROLES } from '../data/meta';

const ROLE_OPTIONS = [
  { value: 'admin',           label: 'Admin',           desc: 'Full system access' },
  { value: 'project_manager', label: 'Project Manager', desc: 'Can create & manage projects' },
  { value: 'member',          label: 'Member',          desc: 'Access to assigned projects only' },
];

const TONE = { admin: 'brand', project_manager: 'warning', member: 'neutral' };

function RoleDropdown({ userId, currentRole, disabled }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const { mutateAsync, isPending } = useUpdateUserRole();
  const info = GLOBAL_ROLES[currentRole] || GLOBAL_ROLES.member;

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 4, left: r.left });
    }
    setOpen(true);
  };

  if (disabled) return <Badge tone={TONE[currentRole] || 'neutral'}>{info.label}</Badge>;

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md hover:bg-ink-600 text-[12.5px] text-fg transition-colors"
      >
        <Badge tone={TONE[currentRole] || 'neutral'}>{info.label}</Badge>
        <I.chevDown size={11} className="text-fg-dim" />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-56 bg-ink-700 border border-ink-500 rounded-lg shadow-panel py-1 scale-in"
            style={{ top: coords.top, left: coords.left }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={async () => {
                  setOpen(false);
                  await mutateAsync({ userId, role: opt.value });
                }}
                className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-ink-600 transition-colors ${opt.value === currentRole ? 'opacity-50 cursor-default' : ''}`}
              >
                <div className="flex-1">
                  <div className="text-[12.5px] font-medium text-fg">{opt.label}</div>
                  <div className="text-[11px] text-fg-dim">{opt.desc}</div>
                </div>
                {opt.value === currentRole && <I.check size={12} className="text-brand-400 mt-1 shrink-0" />}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function InviteModal({ onClose }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('member');
  const { data: results = [], isFetching } = useSearchUsers(q);
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole();

  const handleSubmit = async () => {
    if (!selected) return;
    await updateRole({ userId: selected.id, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm fade-in">
      <div className="bg-ink-800 border border-ink-500 rounded-xl shadow-panel w-full max-w-[480px] scale-in overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-ink-600">
          <h3 className="text-[14px] font-semibold">Add member</h3>
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
            <div className="bg-ink-700 border border-ink-500/60 rounded-lg max-h-48 overflow-y-auto">
              {isFetching ? (
                <div className="p-3 space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-9 rounded" />)}
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
                    <Badge tone={TONE[u.role] || 'neutral'}>{GLOBAL_ROLES[u.role]?.label || u.role}</Badge>
                  </button>
                ))
              )}
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-fg-muted block mb-1.5">Assign global role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => (
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
            {isPending ? 'Saving...' : 'Assign role'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [q, setQ] = useState('');
  const { data: users = [], isLoading } = useUsers();
  const { user: me } = useAuth();
  const [showInvite, setShowInvite] = useState(false);

  const filtered = users.filter((u) =>
    !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const pmCount = users.filter((u) => u.role === 'project_manager').length;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Members</h1>
          <p className="text-[13px] text-fg-muted mt-0.5">
            {users.length} people · {adminCount} admin{adminCount !== 1 ? 's' : ''} · {pmCount} project manager{pmCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            icon={<I.search size={13} />}
            placeholder="Search members…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 sm:w-64"
          />
          <Button variant="primary" size="md" icon={<I.plus size={13} />} onClick={() => setShowInvite(true)}>
            <span className="hidden sm:inline">Add member</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="border-b border-ink-600/60 bg-ink-800/40">
              <th className="text-left pl-5 pr-2 h-10 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider">Member</th>
              <th className="text-left px-2 h-10 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider">Email</th>
              <th className="text-left px-2 h-10 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[180px]">Global Role</th>
              <th className="text-left px-2 h-10 text-[10.5px] font-semibold text-fg-dim uppercase tracking-wider w-[120px]">Joined</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-ink-600/40">
                  <td className="pl-5 pr-2 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </td>
                  <td className="px-2 py-3"><Skeleton className="h-3 w-40" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-3 w-20" /></td>
                  <td />
                </tr>
              ))
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-b border-ink-600/40 last:border-0 hover:bg-ink-700/30 transition-colors group">
                <td className="pl-5 pr-2 py-0 h-12 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={30} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-fg">{u.name}</span>
                        {u.id === me?.id && (
                          <span className="text-[10px] px-1.5 h-4 rounded bg-ink-600 text-fg-dim">you</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 align-middle">
                  <span className="text-[12.5px] font-mono text-fg-muted">{u.email}</span>
                </td>
                <td className="px-2 align-middle">
                  <RoleDropdown
                    userId={u.id}
                    currentRole={u.role}
                    disabled={u.id === me?.id}
                  />
                </td>
                <td className="px-2 align-middle">
                  <span className="text-[12px] text-fg-dim num">{formatDate(u.created_at)}</span>
                </td>
                <td className="pr-4 align-middle text-right">
                  {u.id !== me?.id && (
                    <button className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11.5px] text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                      <I.trash size={11} /> Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-fg-dim">No members match your search.</div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
