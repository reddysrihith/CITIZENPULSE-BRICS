import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Search, ShieldCheck, UserCog, XCircle } from 'lucide-react';
import api from '../../services/api';

const badge = {
  client: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  freelancer: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  admin: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');

  const filteredUsers = useMemo(() => users, [users]);

  const loadUsers = async () => {
    setError('');
    try {
      const res = await api.get('/admin/users', { params: { role, status, search } });
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role, status]);

  const runUserAction = async (id, action) => {
    setLoadingId(id);
    setError('');
    try {
      await action();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Admin action failed.');
    } finally {
      setLoadingId('');
    }
  };

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">User Management</h1>
        <p className="text-slate-400 mt-1 font-semibold">Suspend accounts, verify freelancers, and audit roles.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            placeholder="Search by name or email"
            className="w-full bg-slate-900/70 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All roles</option>
          <option value="client">Clients</option>
          <option value="freelancer">Freelancers</option>
          <option value="admin">Admins</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={loadUsers} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest">Search</button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-[2px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <p className="text-white font-black">{user.name}</p>
                    <p className="text-slate-500 text-xs font-semibold">{user.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-xl border text-xs font-black capitalize ${badge[user.role] || badge.client}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-5">
                    {user.isSuspended ? (
                      <span className="inline-flex items-center gap-1 text-rose-300 text-xs font-black"><XCircle className="w-4 h-4" /> Suspended</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-black"><CheckCircle className="w-4 h-4" /> Active</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-black ${user.isVerifiedBadge ? 'text-blue-300' : 'text-slate-500'}`}>
                      {user.isVerifiedBadge ? 'Verified badge' : 'Not verified'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <select
                        value={user.role}
                        disabled={loadingId === user._id}
                        onChange={(e) => runUserAction(user._id, () => api.patch(`/admin/users/${user._id}/role`, { role: e.target.value }))}
                        className="bg-slate-900/70 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="client">Client</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        disabled={loadingId === user._id}
                        onClick={() => runUserAction(user._id, () => api.patch(`/admin/users/${user._id}/verify`, { isVerifiedBadge: !user.isVerifiedBadge }))}
                        className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black hover:bg-blue-500 hover:text-white disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4 inline mr-1" /> {user.isVerifiedBadge ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        disabled={loadingId === user._id}
                        onClick={() => runUserAction(user._id, () => api.patch(`/admin/users/${user._id}/status`, { isSuspended: !user.isSuspended }))}
                        className={`px-3 py-2 rounded-xl border text-xs font-black disabled:opacity-50 ${user.isSuspended ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white'}`}
                      >
                        <UserCog className="w-4 h-4 inline mr-1" /> {user.isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-bold">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
