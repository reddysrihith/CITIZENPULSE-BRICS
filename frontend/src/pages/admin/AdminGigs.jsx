import { useEffect, useState } from 'react';
import { CheckCircle, Search, Trash2, XCircle } from 'lucide-react';
import api from '../../services/api';

const statusClass = {
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const AdminGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');

  const loadGigs = async () => {
    setError('');
    try {
      const res = await api.get('/admin/gigs', { params: { status, search } });
      setGigs(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gigs.');
    }
  };

  useEffect(() => {
    loadGigs();
  }, [status]);

  const updateStatus = async (gig, nextStatus) => {
    setLoadingId(gig._id);
    setError('');
    try {
      await api.patch(`/admin/gigs/${gig._id}/status`, { status: nextStatus });
      await loadGigs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update gig.');
    } finally {
      setLoadingId('');
    }
  };

  const deleteGig = async (gig) => {
    if (!window.confirm(`Delete "${gig.title}" and its proposals?`)) return;
    setLoadingId(gig._id);
    setError('');
    try {
      await api.delete(`/admin/gigs/${gig._id}`);
      await loadGigs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete gig.');
    } finally {
      setLoadingId('');
    }
  };

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">Gig Review</h1>
        <p className="text-slate-400 mt-1 font-semibold">Approve or reject marketplace listings before they go live.</p>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadGigs()}
            placeholder="Search gigs"
            className="w-full bg-slate-900/70 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-900/70 border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={loadGigs} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest">Search</button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {gigs.map((gig) => (
          <div key={gig._id} className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl text-white font-black font-heading">{gig.title}</h2>
                  <span className={`px-3 py-1 rounded-xl border text-xs font-black capitalize ${statusClass[gig.status] || statusClass.approved}`}>{gig.status}</span>
                  <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-bold">{gig.category || 'General'}</span>
                </div>
                <p className="text-slate-400 text-sm mt-3 max-w-3xl">{gig.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-slate-500">
                  <span>Client: {gig.client?.name || 'Unknown'} ({gig.client?.email || 'no email'})</span>
                  <span>Budget: ₹{Number(gig.budget || 0).toLocaleString('en-IN')}</span>
                  <span>Proposals: {gig.proposalCount || 0}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={loadingId === gig._id || gig.status === 'approved'}
                  onClick={() => updateStatus(gig, 'approved')}
                  className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" /> Approve
                </button>
                <button
                  disabled={loadingId === gig._id || gig.status === 'rejected'}
                  onClick={() => updateStatus(gig, 'rejected')}
                  className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 inline mr-1" /> Reject
                </button>
                <button
                  disabled={loadingId === gig._id}
                  onClick={() => deleteGig(gig)}
                  className="px-4 py-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!gigs.length && <div className="glass-card p-12 rounded-3xl border border-white/5 text-center text-slate-500 font-bold">No gigs found.</div>}
      </div>
    </div>
  );
};

export default AdminGigs;
