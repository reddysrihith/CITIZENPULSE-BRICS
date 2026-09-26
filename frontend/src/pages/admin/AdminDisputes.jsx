import { useEffect, useState } from 'react';
import { Scale, Search } from 'lucide-react';
import api from '../../services/api';

const tone = {
  open: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  under_review: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rejected: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const riskTone = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-rose-300',
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [status, setStatus] = useState('all');
  const [risk, setRisk] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadDisputes = async () => {
    setError('');
    try {
      const res = await api.get('/admin/disputes', { params: { status, risk, search } });
      setDisputes(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load disputes.');
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [status, risk]);

  const updateDispute = async (dispute, patch) => {
    setError('');
    try {
      await api.patch(`/admin/disputes/${dispute._id}`, patch);
      await loadDisputes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dispute.');
    }
  };

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">Dispute Resolution</h1>
        <p className="text-slate-400 mt-1 font-semibold">Review payment issues, evidence, risk, and final resolution.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadDisputes()} placeholder="Search disputes" className="w-full bg-slate-900/70 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All risk</option>
          <option value="low">Low risk</option>
          <option value="medium">Medium risk</option>
          <option value="high">High risk</option>
        </select>
        <button onClick={loadDisputes} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest">Search</button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {disputes.map((dispute) => (
          <div key={dispute._id} className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Scale className="w-5 h-5 text-primary-300" />
                  <h2 className="text-xl text-white font-black font-heading">{dispute.reason}</h2>
                  <span className={`px-3 py-1 rounded-xl border text-xs font-black capitalize ${tone[dispute.status]}`}>{dispute.status.replace('_', ' ')}</span>
                  <span className={`text-xs font-black uppercase ${riskTone[dispute.fraudRisk]}`}>{dispute.fraudRisk} risk</span>
                </div>
                <p className="text-slate-400 text-sm mt-3 max-w-3xl">{dispute.description || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-slate-500">
                  <span>Opened by: {dispute.openedBy?.name || 'Unknown'}</span>
                  <span>Against: {dispute.againstUser?.name || 'N/A'}</span>
                  <span>Gig: {dispute.job?.title || 'N/A'}</span>
                  <span>Payment: {dispute.payment?.razorpayOrderId || 'N/A'}</span>
                </div>
                {dispute.adminNotes && <p className="text-slate-300 text-sm mt-4">Admin notes: {dispute.adminNotes}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
                <select value={dispute.status} onChange={(e) => updateDispute(dispute, { status: e.target.value })} className="bg-slate-900/70 border border-white/5 rounded-xl px-3 py-2 text-xs text-white">
                  <option value="open">Open</option>
                  <option value="under_review">Under review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select value={dispute.priority} onChange={(e) => updateDispute(dispute, { priority: e.target.value })} className="bg-slate-900/70 border border-white/5 rounded-xl px-3 py-2 text-xs text-white">
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
                <select value={dispute.fraudRisk} onChange={(e) => updateDispute(dispute, { fraudRisk: e.target.value })} className="bg-slate-900/70 border border-white/5 rounded-xl px-3 py-2 text-xs text-white">
                  <option value="low">Low risk</option>
                  <option value="medium">Medium risk</option>
                  <option value="high">High risk</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {!disputes.length && <div className="glass-card p-12 rounded-3xl border border-white/5 text-center text-slate-500 font-bold">No disputes found.</div>}
      </div>
    </div>
  );
};

export default AdminDisputes;
