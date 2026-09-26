import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Briefcase, CheckCircle, IndianRupee, Shield, Users } from 'lucide-react';
import api from '../../services/api';

const formatMoney = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const StatCard = ({ icon: Icon, label, value, subtext }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40"
  >
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[2px]">{label}</p>
        <h3 className="text-3xl font-black text-white mt-3 font-heading">{value}</h3>
        {subtext && <p className="text-slate-400 text-xs mt-2 font-semibold">{subtext}</p>}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard.');
      }
    };

    loadStats();
  }, []);

  const topCategories = stats?.topCategories || [];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-primary-400 text-xs font-black uppercase tracking-[3px]">Admin Control Center</p>
          <h1 className="text-4xl font-black text-white font-heading tracking-tight">Platform Overview</h1>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-4 rounded-2xl font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Users" value={stats?.users?.total ?? '...'} subtext={`${stats?.users?.clients || 0} clients, ${stats?.users?.freelancers || 0} freelancers`} />
        <StatCard icon={Briefcase} label="Gigs" value={stats?.gigs?.total ?? '...'} subtext={`${stats?.gigs?.pending || 0} pending approval`} />
        <StatCard icon={IndianRupee} label="Payment Volume" value={formatMoney(stats?.payments?.amount)} subtext={`${stats?.payments?.total || 0} payment records`} />
        <StatCard icon={BarChart3} label="Platform Revenue" value={formatMoney(stats?.payments?.platformRevenue)} subtext="Estimated at 10% commission" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-7 rounded-3xl border border-white/5 lg:col-span-2">
          <h2 className="text-xl font-black text-white font-heading mb-5">Operational Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Approved Gigs</p>
              <p className="text-2xl text-emerald-300 font-black mt-2">{stats?.gigs?.approved || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Verified Freelancers</p>
              <p className="text-2xl text-blue-300 font-black mt-2">{stats?.users?.verifiedFreelancers || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Job Success Rate</p>
              <p className="text-2xl text-violet-300 font-black mt-2">{stats?.proposals?.successRate || 0}%</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Open Disputes</p>
              <p className="text-2xl text-rose-300 font-black mt-2">{stats?.disputes?.open || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">High Risk</p>
              <p className="text-2xl text-amber-300 font-black mt-2">{stats?.disputes?.highRisk || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-7 rounded-3xl border border-white/5">
          <h2 className="text-xl font-black text-white font-heading mb-5">Top Categories</h2>
          <div className="space-y-3">
            {topCategories.length ? topCategories.map((item) => (
              <div key={item._id || 'Uncategorized'} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-300 text-sm font-bold">{item._id || 'Uncategorized'}</span>
                <span className="text-primary-300 text-sm font-black">{item.count}</span>
              </div>
            )) : (
              <p className="text-slate-500 text-sm font-semibold">No category data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-7 rounded-3xl border border-white/5">
        <h2 className="text-xl font-black text-white font-heading mb-5">Recent Admin Activity</h2>
        <div className="space-y-3">
          {(stats?.recentLogs || []).length ? stats.recentLogs.map((log) => (
            <div key={log._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <p className="text-white text-sm font-bold">{log.message}</p>
                <p className="text-slate-500 text-xs font-semibold">{log.admin?.name || 'Admin'} • {log.targetType}</p>
              </div>
              <span className="text-slate-500 text-xs font-bold">{new Date(log.createdAt).toLocaleString('en-IN')}</span>
            </div>
          )) : (
            <p className="text-slate-500 text-sm font-semibold">No admin actions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
