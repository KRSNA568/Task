import { useState } from 'react';
import { I } from '../components/common/icons';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/meta';

const ROLE_COLORS = {
  admin: 'brand',
  member: 'neutral',
};

function AddMemberModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('This feature requires backend integration.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm fade-in">
      <div className="bg-ink-700 border border-ink-500 rounded-xl shadow-panel w-full max-w-sm scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-600">
          <h2 className="text-[15px] font-semibold">Invite member</h2>
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
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-fg-muted">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 px-2.5 rounded-md bg-ink-800 border border-ink-500 text-[13px] text-fg focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={loading}>
              Send invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const { data: users = [], isLoading } = useUsers();
  const { user: me } = useAuth();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="px-6 py-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Members</h1>
          <p className="text-[13px] text-fg-muted mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''} in your workspace.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<I.plus size={13} />}
          onClick={() => setShowInvite(true)}
        >
          Add member
        </Button>
      </div>

      <div className="bg-ink-700/30 border border-ink-500/60 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-ink-600/60">
          <span className="flex-1 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Member</span>
          <span className="w-20 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Role</span>
          <span className="w-32 text-[11.5px] font-semibold text-fg-dim uppercase tracking-wide">Joined</span>
          <span className="w-8" />
        </div>

        {isLoading ? (
          <div className="divide-y divide-ink-600/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-ink-600/40">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3 hover:bg-ink-700/30 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={u.name} size={32} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-fg truncate flex items-center gap-1.5">
                      {u.name}
                      {u.id === me?.id && (
                        <span className="text-[10px] text-fg-dim bg-ink-600 px-1 rounded">you</span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-fg-dim truncate">{u.email}</div>
                  </div>
                </div>
                <div className="w-20">
                  <Badge tone={ROLE_COLORS[u.role] || 'neutral'}>{u.role}</Badge>
                </div>
                <div className="w-32 text-[12px] text-fg-dim num">{formatDate(u.created_at)}</div>
                <div className="w-8 flex justify-end">
                  {u.id !== me?.id && (
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/70 hover:text-red-400">
                      <I.trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInvite && <AddMemberModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
