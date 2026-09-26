import { useEffect, useState } from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      }
    };

    loadAnalytics();
  }, []);

  const monthly = analytics?.monthlyPayments || [];
  const maxAmount = Math.max(...monthly.map((item) => item.amount), 1);

  return (
    <div className="space-y-7 pb-20">
      <div>
        <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin</p>
        <h1 className="text-4xl font-black text-white font-heading">Admin Analytics</h1>
        <p className="text-slate-400 mt-1 font-semibold">Revenue, categories, users, payments, and marketplace health.</p>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="glass-card p-7 rounded-3xl border border-white/5">
        <h2 className="text-xl text-white font-black font-heading flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-300" /> Monthly Payment Volume</h2>
        <div className="h-72 mt-8 flex items-end gap-4 border-b border-white/5 pb-5">
          {monthly.length ? monthly.map((item) => {
            const height = Math.max(8, Math.round((item.amount / maxAmount) * 100));
            return (
              <div key={`${item._id.year}-${item._id.month}`} className="flex-1 flex flex-col items-center justify-end h-full gap-3">
                <div className="w-full max-w-16 rounded-t-2xl bg-gradient-to-t from-primary-500 to-violet-400" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-slate-500 font-black">{item._id.month}/{String(item._id.year).slice(-2)}</span>
              </div>
            );
          }) : (
            <div className="w-full text-center text-slate-500 font-bold">No payment trend data yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-7 rounded-3xl border border-white/5">
          <h2 className="text-lg text-white font-black font-heading flex items-center gap-2 mb-5"><PieChart className="w-5 h-5 text-blue-300" /> Categories</h2>
          <div className="space-y-3">
            {(analytics?.categoryStats || []).map((item) => (
              <div key={item._id || 'uncat'} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-300 text-sm font-bold">{item._id || 'Uncategorized'}</span>
                <span className="text-primary-300 text-sm font-black">{item.gigs}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-white/5">
          <h2 className="text-lg text-white font-black font-heading flex items-center gap-2 mb-5"><BarChart3 className="w-5 h-5 text-emerald-300" /> User Roles</h2>
          <div className="space-y-3">
            {(analytics?.roleStats || []).map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-300 text-sm font-bold capitalize">{item._id}</span>
                <span className="text-emerald-300 text-sm font-black">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-white/5">
          <h2 className="text-lg text-white font-black font-heading flex items-center gap-2 mb-5"><BarChart3 className="w-5 h-5 text-violet-300" /> Payment Status</h2>
          <div className="space-y-3">
            {(analytics?.paymentStatusStats || []).map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-300 text-sm font-bold capitalize">{item._id}</span>
                <span className="text-violet-300 text-sm font-black">₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
