import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Zap, ArrowUpRight, Shield, Link as LinkIcon, Award, Send, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OngoingProjectsHub = ({ userRole }) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  
  // Modal state
  const [formProgress, setFormProgress] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formLink, setFormLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchOngoing = async () => {
    try {
      const res = await api.get('/jobs/ongoing');
      if (res.data.success) {
        setContracts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load ongoing projects:', err);
      setError('Could not fetch active contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoing();
  }, []);

  const openManageModal = (contract) => {
    setSelectedContract(contract);
    setFormProgress(contract.progress || 0);
    setFormNotes(contract.submissionNotes || '');
    setFormLink(contract.submissionLink || '');
    setSubmitSuccess(false);
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/jobs/ongoing/${selectedContract._id}/progress`, {
        progress: formProgress,
        submissionNotes: formNotes,
        submissionLink: formLink
      });

      if (res.data.success) {
        // Update local list
        setContracts(prev => prev.map(c => c._id === selectedContract._id ? res.data.data : c));
        setSubmitSuccess(true);
        setTimeout(() => {
          setSelectedContract(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMilestoneText = (pct) => {
    if (pct === 0) return 'Contract Initiated';
    if (pct < 25) return 'Kickoff & Specifications';
    if (pct < 50) return 'Core Architecture & Layout';
    if (pct < 75) return 'Functionality & Integrations';
    if (pct < 100) return 'Polishing & Final Verification';
    return 'Project Fully Completed 🎉';
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-900/60 rounded-3xl" />
          <div className="h-32 bg-slate-900/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (contracts.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-primary-400 text-xs font-black uppercase tracking-[3px] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary-400" /> Active Contracts
          </span>
          <h2 className="text-2xl font-black text-white font-heading mt-1">Ongoing Projects Hub</h2>
          <p className="text-slate-400 text-xs font-semibold">Track and manage execution progress of ongoing agreements.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
            {contracts.length} {contracts.length === 1 ? 'Project Active' : 'Projects Active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {contracts.map((contract) => {
            const job = contract.job || {};
            const client = contract.client || {};
            const freelancer = contract.freelancer || {};
            const otherParty = userRole === 'client' ? freelancer : client;
            const progressVal = contract.progress || 0;

            return (
              <motion.div
                key={contract._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-primary-500/30 hover:bg-slate-950/40 transition-all group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Job Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-extrabold text-base capitalize truncate group-hover:text-primary-400 transition-colors">
                        {job.title}
                      </h3>
                      <span className="inline-block mt-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                        {job.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-emerald-400 font-extrabold text-sm flex items-center justify-end">
                        ₹{job.budget?.toLocaleString()}
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">Agreed Budget</span>
                    </div>
                  </div>

                  {/* Other Party Info */}
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-white overflow-hidden border border-white/10 shrink-0">
                      {otherParty.profileImage ? (
                        <img src={otherParty.profileImage} alt={otherParty.name} className="w-full h-full object-cover" />
                      ) : (
                        (otherParty.name || 'User').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">
                        {userRole === 'client' ? 'Assigned Freelancer' : 'Contracting Client'}
                      </span>
                      <p className="text-slate-200 font-bold text-xs truncate">{otherParty.name || 'User'}</p>
                      <p className="text-slate-500 text-[10px] truncate">{otherParty.email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: '6s' }} /> 
                        {getMilestoneText(progressVal)}
                      </span>
                      <span className="text-primary-400 font-black">{progressVal}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressVal}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure Escrow Active
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/messages', {
                        state: {
                          activeChatPartner: {
                            id: otherParty._id || otherParty.id,
                            name: otherParty.name || 'User',
                            avatar: (otherParty.name || 'U').charAt(0).toUpperCase(),
                            online: true,
                            role: userRole === 'client' ? 'Hired Freelancer' : 'Contracting Client',
                            bio: otherParty.email || 'Verified user'
                          }
                        }
                      })}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1 transition-all"
                      title="Open chat room"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt("Raise a dispute for this contract. Please state the reason:");
                        if (reason) {
                          api.post('/disputes', { contractId: contract._id, reason, description: 'Dispute raised from Ongoing Projects UI' })
                            .then(res => alert(res.data.message))
                            .catch(err => alert(err.response?.data?.message || 'Failed to raise dispute'));
                        }
                      }}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs flex items-center gap-1 transition-all"
                      title="Raise Dispute"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openManageModal(contract)}
                      className="px-3.5 py-2 rounded-xl bg-primary-500/10 hover:bg-primary-500 border border-primary-500/20 hover:border-primary-400 text-primary-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      {userRole === 'client' ? 'Manage' : 'Update Progress'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress & Management Full Page Overlay */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto min-h-screen p-8 md:p-12 relative flex flex-col justify-between"
              data-lenis-prevent
            >
              <div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  ← Back to Projects
                </button>
              </div>

              {submitSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-heading">Progress Updated!</h3>
                  <p className="text-slate-400 text-sm">Contract details and checkpoint logs synchronized securely.</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateProgress} className="space-y-6">
                  <div>
                    <span className="text-primary-400 text-[10px] font-black uppercase tracking-[3px] flex items-center gap-1.5 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary-400" /> Progress Management
                    </span>
                    <h3 className="text-2xl font-black text-white font-heading">
                      {selectedContract.job?.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Set milestones, submit work links, and review progress logs.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  {/* Interactive Slider */}
                  <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Contract Completion Progress</span>
                      <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        {formProgress}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formProgress}
                      disabled={userRole === 'client' && selectedContract.progress > formProgress} // Clients can only increase or edit if allowed, or let it be free
                      onChange={(e) => setFormProgress(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />

                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>0% Start</span>
                      <span>25% Lay</span>
                      <span>50% Mid</span>
                      <span>75% Test</span>
                      <span>100% Wow</span>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <Award className="w-4 h-4 text-primary-400" />
                      <span>Status: <strong className="text-white">{getMilestoneText(formProgress)}</strong></span>
                    </div>
                  </div>

                  {/* Submission Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> Deliverables URL / Repo Link
                      </label>
                      <input
                        type="url"
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        placeholder="https://github.com/... or https://figma.com/file/..."
                        disabled={userRole === 'client'}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                      />
                    </div>

                    {formLink && userRole === 'client' && (
                      <div className="pt-1">
                        <a
                          href={formLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl"
                        >
                          Open Deliverables Link <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Deliverables & Progress Notes
                      </label>
                      <textarea
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder={userRole === 'client' ? "Freelancer notes will appear here..." : "Describe what was accomplished or include review items..."}
                        rows={4}
                        disabled={userRole === 'client'}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary-500/50 transition-colors resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedContract(null)}
                      className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all border border-white/5"
                    >
                      Close
                    </button>
                    
                    {/* Only show update buttons if authorized to modify or freelancer */}
                    {!(userRole === 'client' && selectedContract.submissionNotes === formNotes && selectedContract.progress === formProgress) && (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-primary-500/35"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            {userRole === 'client' ? 'Approve & Save' : 'Save Progress'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OngoingProjectsHub;
