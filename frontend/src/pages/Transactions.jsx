import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, IndianRupee, Clock, CheckCircle, Search, Calendar } from 'lucide-react';
import api from '../services/api';
import TiltCard from '../components/animations/TiltCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Transactions = () => {
  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/payments/my-transactions');
        setTransactions(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.job?.title?.toLowerCase().includes(q) ||
      (user?.role === 'client' ? t.freelancer?.name : t.client?.name)?.toLowerCase().includes(q) ||
      t.razorpayOrderId?.toLowerCase().includes(q)
    );
  });

  const totalSpent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-8 pb-20">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[3px] text-emerald-400">Financial Hub</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-heading">
            Paid Gigs & Transactions
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Track all your completed payments and earnings.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TiltCard>
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <IndianRupee className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total {user?.role === 'client' ? 'Spent' : 'Earned'}</p>
                <h3 className="text-2xl font-black text-white font-heading">₹{totalSpent.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>
        </TiltCard>
        
        <TiltCard>
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paid Gigs</p>
                <h3 className="text-2xl font-black text-white font-heading">{transactions.length}</h3>
              </div>
            </div>
          </motion.div>
        </TiltCard>
      </div>

      <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white font-heading">Transaction History</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-center font-bold text-sm">
              {error}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-5">
                <CreditCard className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">No Paid Gigs Found</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-sm">When you complete payments for gigs, they will appear securely here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((t) => (
                <div key={t._id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                        {t.status}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-lg truncate mb-1">
                      {t.job?.title || 'Unknown Job'}
                    </h4>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      {user?.role === 'client' ? (
                        <>Paid to: <span className="text-white font-semibold">{t.freelancer?.name}</span></>
                      ) : (
                        <>Received from: <span className="text-white font-semibold">{t.client?.name}</span></>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                    <span className="text-2xl font-black text-white font-heading">
                      ₹{t.amount?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-900 px-2 py-1 rounded-lg border border-white/5">
                      {t.razorpayOrderId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Transactions;
