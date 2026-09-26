import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import api from '../../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [targetType, setTargetType] = useState('all');
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setError('');
    try {
      const res = await api.get('/admin/logs', { params: { targetType } });
      setLogs(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin logs.');
    }
  };

  useEffect(() => {
    loadLogs();
  }, [targetType]);

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">Audit Logs</h1>
        <p className="text-slate-400 mt-1 font-semibold">Track every moderation, payment, dispute, and user action.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-white/5 flex justify-end">
        <select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All targets</option>
          <option value="User">Users</option>
          <option value="Job">Jobs</option>
          <option value="Payment">Payments</option>
          <option value="Dispute">Disputes</option>
          <option value="System">System</option>
        </select>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div key={log._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-white/[0.03]">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center shrink-0">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-black">{log.message}</p>
                  <p className="text-slate-500 text-xs font-semibold">{log.admin?.name || 'Admin'} • {log.action} • {log.targetType}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
            </div>
          ))}
          {!logs.length && <div className="p-12 text-center text-slate-500 font-bold">No logs yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
