import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Calendar, Award, Star, Activity, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import TiltCard from '../components/animations/TiltCard';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [timeframe, setTimeframe] = useState('7d');
  const [dashboardData, setDashboardData] = useState({ stats: [], trendChart: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setDashboardData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = dashboardData.stats.length > 0 ? dashboardData.stats : [
    { label: 'Loading...', value: '-', change: '-', isPositive: true },
    { label: 'Loading...', value: '-', change: '-', isPositive: true },
    { label: 'Loading...', value: '-', change: '-', isPositive: true },
    { label: 'Loading...', value: '-', change: '-', isPositive: true },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[3px] text-primary-400">Performance Center</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-heading">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1 font-medium">Real-time charts, detailed metrics, and custom operational reports.</p>
        </div>
        <div className="bg-slate-900/60 border border-white/5 p-1 rounded-2xl flex gap-1">
          {['7d', '30d', '1y'].map((time) => (
            <motion.button
              key={time}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(time)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                timeframe === time ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {time === '7d' ? '7 Days' : time === '30d' ? '30 Days' : '1 Year'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <TiltCard key={i}>
            <motion.div
              variants={itemVariants}
              className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/3 to-violet-500/3 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-3xl font-black text-white mt-4 font-heading">{stat.value}</h2>
              <div className="flex items-center gap-2 mt-4">
                <div className={`p-1 rounded-lg ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stat.change}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">vs last week</span>
              </div>
            </motion.div>
          </TiltCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart SVG */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary-400" />
            Earnings Trends (₹)
          </h3>
          <div className="h-72 w-full flex items-end justify-between px-4 pb-4 border-b border-white/5 relative">
            {/* SVG Grid Line */}
            <div className="absolute inset-x-0 bottom-1/4 h-px border-t border-dashed border-white/5" />
            <div className="absolute inset-x-0 bottom-2/4 h-px border-t border-dashed border-white/5" />
            <div className="absolute inset-x-0 bottom-3/4 h-px border-t border-dashed border-white/5" />

            {/* Sparkline Column */}
            {dashboardData.trendChart && dashboardData.trendChart.length > 0 ? dashboardData.trendChart.map((col, idx) => {
              // Calculate relative height percentage based on max val
              const maxVal = Math.max(...dashboardData.trendChart.map(c => c.val), 1000);
              const heightPct = Math.max(10, Math.round((col.val / maxVal) * 100));
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative">
                  <div className="absolute bottom-full mb-2 bg-[#0f172a] border border-white/10 px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 pointer-events-none">
                    <span className="text-[10px] font-black text-white">₹{col.val}</span>
                  </div>
                  <div style={{ height: `${heightPct}%` }} className={`w-10 bg-gradient-to-t from-primary-500 to-violet-500 rounded-2xl group-hover:brightness-125 transition-all duration-300 shadow-lg shadow-primary-500/10 relative overflow-hidden`}>
                    <div className="absolute inset-x-0 top-0 h-4 bg-white/20 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3">{col.day}</span>
                </div>
              );
            }) : (
              <div className="flex w-full items-center justify-center text-slate-500 text-sm font-bold h-full">No chart data available</div>
            )}
          </div>
        </motion.div>

        {/* Breakdown Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Top Milestones
          </h3>
          <div className="space-y-6">
            {[
              { title: 'Super Seller Badge', desc: 'Maintain 95%+ completion rate', icon: Star, color: 'text-yellow-400' },
              { title: 'Elite Freelancer Status', desc: 'Exceed ₹1,00,000 lifetime spend', icon: Award, color: 'text-violet-400' },
              { title: 'Response King', desc: 'Average reply time under 15 minutes', icon: Activity, color: 'text-emerald-400' },
            ].map((milestone, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all duration-300 group">
                <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
                  <milestone.icon className={`w-5 h-5 ${milestone.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{milestone.title}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
