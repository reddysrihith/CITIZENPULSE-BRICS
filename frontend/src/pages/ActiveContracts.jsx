import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck } from 'lucide-react';
import OngoingProjectsHub from '../components/ai-matching/OngoingProjectsHub';

const ActiveContracts = () => {
  const { user } = useSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      {/* Header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/5 shrink-0">
            <Zap className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-heading">
              Ongoing Projects
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-semibold">
              Manage live contracts, review milestone checkpoints, and coordinate secure delivery.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            Escrow Guard Protected
          </span>
        </div>
      </motion.div>

      {/* Spacious Ongoing Projects Hub Card */}
      <motion.div variants={itemVariants} className="w-full">
        <OngoingProjectsHub userRole={user?.role} />
      </motion.div>
    </motion.div>
  );
};

export default ActiveContracts;
