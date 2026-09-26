import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getJobs, reset } from '../redux/slices/jobSlice';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase, Search, Filter, IndianRupee, Clock,
  ExternalLink, X, ChevronDown, Sparkles, Plus,
  Send, FileText, CheckCircle, XCircle, UserCircle, CreditCard, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../components/animations/TiltCard';
import api from '../services/api';
import AIMatchPanel from '../components/ai-matching/AIMatchPanel';
import TrendingSkillsBanner from '../components/ai-matching/TrendingSkillsBanner';

const CATEGORIES = ['All', 'Web Development', 'Mobile Apps', 'Design', 'Writing', 'Marketing'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.97 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
  exit: { y: -20, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// Apply Now Modal
const ApplyModal = ({ job, onClose }) => {
  const [form, setForm] = useState({ coverLetter: '', bidAmount: job?.budget || '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.coverLetter.trim()) { setError('Please write a cover letter.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      await api.post(`/jobs/${job._id}/apply`, {
        coverLetter: form.coverLetter,
        bidAmount: Number(form.bidAmount),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-card w-full max-w-lg rounded-[2.5rem] p-10 border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6 space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20"
            >
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-2xl font-extrabold text-white font-heading">Application Sent!</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your proposal for <span className="text-white font-bold">"{job.title}"</span> has been submitted. The client will review it soon.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn-premium px-8 py-3 text-sm font-bold tracking-widest uppercase"
            >
              Done
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[3px] text-primary-400">Submit Proposal</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white font-heading leading-tight">{job.title}</h3>
              <p className="text-slate-500 text-sm mt-1">Budget: <span className="text-emerald-400 font-bold">₹{job.budget?.toLocaleString()}</span></p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Your Bid Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    value={form.bidAmount}
                    onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                    placeholder="Enter your bid"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Cover Letter
                </label>
                <textarea
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  rows={5}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none placeholder:text-slate-600 text-sm leading-relaxed"
                  placeholder="Introduce yourself and explain why you're the best fit for this project..."
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-premium w-full flex items-center justify-center py-4 text-sm font-bold tracking-widest uppercase"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Proposal</>
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const ManageProposalsModal = ({ job, onClose, onChanged }) => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' or 'aimatches'

  useEffect(() => {
    const loadProposals = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get(`/jobs/${job._id}/proposals`);
        setProposals(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load proposals.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [job._id]);

  const updateStatus = async (proposalId, status) => {
    setUpdatingId(proposalId);
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/jobs/${job._id}/proposals/${proposalId}`, { status });
      setProposals((items) => items.map((item) => item._id === proposalId ? res.data.data : item));
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} proposal.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const startPayment = async (proposal) => {
    setPayingId(proposal._id);
    setError('');
    setSuccess('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Unable to load Razorpay Checkout. Please check your internet connection.');
        return;
      }

      const res = await api.post('/payments/create-order', { proposalId: proposal._id });
      const { keyId, order, freelancer } = res.data;

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'SkillSphere',
        description: `Milestone payment for ${job.title}`,
        order_id: order.id,
        prefill: {
          name: freelancer?.name || '',
          email: freelancer?.email || '',
        },
        theme: {
          color: '#8b5cf6',
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', response);
            setSuccess(verifyRes.data.message || 'Payment completed successfully.');
            setProposals((items) => items.map((item) => item._id === proposal._id ? { ...item, status: 'paid' } : item));
            onChanged?.();
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed on server.');
          }
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      });

      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start Razorpay payment.');
    } finally {
      setPayingId(null);
    }
  };

  const statusClass = {
    pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    paid: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-card w-full max-w-4xl max-h-[86vh] overflow-hidden rounded-[2.5rem] border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="p-8 border-b border-white/5 bg-white/5">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[3px] text-primary-400">Proposal Management</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white font-heading pr-12">{job.title}</h3>
          <p className="text-slate-500 text-sm mt-1">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received</p>
          
          <div className="flex border-b border-white/5 mt-5">
            <button
              onClick={() => setActiveTab('proposals')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'proposals' 
                  ? 'border-primary-500 text-white font-black' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Received Proposals ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('aimatches')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'aimatches' 
                  ? 'border-primary-500 text-white font-black' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              AI Candidate Matches
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(86vh-150px)] custom-scrollbar">
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm font-bold">
              {success}
            </div>
          )}

          {activeTab === 'proposals' ? (
            isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-white/20 border-t-primary-400 rounded-full animate-spin mb-4" />
                <p className="font-bold">Loading proposals...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-5">
                  <FileText className="w-9 h-9 text-slate-600" />
                </div>
                <h4 className="text-xl font-extrabold text-white font-heading">No proposals yet</h4>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">Freelancers will appear here after they apply to this gig.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const freelancer = proposal.freelancer || {};
                  const isUpdating = updatingId === proposal._id;
                  return (
                    <div key={proposal._id} className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {freelancer.profileImage ? (
                                  <img src={freelancer.profileImage} alt={freelancer.name} className="w-full h-full object-cover" />
                                ) : (
                                  <UserCircle className="w-7 h-7 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-white font-extrabold truncate flex items-center gap-1.5">
                                  {freelancer.name || 'Freelancer'}
                                  {freelancer.isVerifiedBadge && (
                                    <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/10 shrink-0" />
                                  )}
                                </h4>
                                <p className="text-slate-500 text-xs truncate">{freelancer.email}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusClass[proposal.status] || statusClass.pending}`}>
                              {proposal.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                              <IndianRupee className="w-4 h-4" /> {proposal.amount?.toLocaleString()}
                            </span>
                            {proposal.estimatedTime && (
                              <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                                <Clock className="w-4 h-4" /> {proposal.estimatedTime}
                              </span>
                            )}
                            {freelancer.hourlyRate && (
                              <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                                Rate ₹{freelancer.hourlyRate}/hr
                              </span>
                            )}
                          </div>

                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{proposal.proposal || 'No proposal message provided.'}</p>

                          {freelancer.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {freelancer.skills.slice(0, 6).map((skill, idx) => (
                                <span key={`${skill.name}-${idx}`} className="px-2.5 py-1 bg-slate-800/80 text-slate-400 text-[10px] font-bold rounded-lg border border-white/5 uppercase tracking-wider">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-3 lg:w-36 shrink-0">
                          {proposal.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => updateStatus(proposal._id, 'accepted')}
                                className="flex-1 lg:flex-none px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-1" /> Accept
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => updateStatus(proposal._id, 'rejected')}
                                className="flex-1 lg:flex-none px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <XCircle className="w-4 h-4 inline mr-1" /> Reject
                              </button>
                            </>
                          )}
                          {proposal.status === 'accepted' && (
                            <button
                              type="button"
                              disabled={payingId === proposal._id}
                              onClick={() => startPayment(proposal)}
                              className="flex-1 lg:flex-none px-4 py-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <CreditCard className="w-4 h-4 inline mr-1" /> {payingId === proposal._id ? 'Opening' : 'Pay'}
                            </button>
                          )}
                          {proposal.status === 'paid' && (
                            <button
                              type="button"
                              disabled
                              className="flex-1 lg:flex-none px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest opacity-80 cursor-not-allowed transition-all"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1" /> Paid
                            </button>
                          )}
                          {proposal.status === 'rejected' && (
                            <button
                              type="button"
                              disabled
                              className="flex-1 lg:flex-none px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-widest opacity-50 cursor-not-allowed transition-all"
                            >
                              <XCircle className="w-4 h-4 inline mr-1" /> Rejected
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <AIMatchPanel jobId={job._id} jobSkills={job.requiredSkills || job.skills || []} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Jobs = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs, isLoading, isError, message } = useSelector((state) => state.jobs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [applyingJob, setApplyingJob] = useState(null);
  const [managingJob, setManagingJob] = useState(null);

  useEffect(() => {
    dispatch(getJobs());
    return () => dispatch(reset());
  }, [dispatch]);

  const filteredJobs = (() => {
    let result = [...(jobs || [])];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q) ||
          (job.skills || []).some((s) => s.toLowerCase().includes(q)) ||
          job.category?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') result = result.filter((j) => j.category === selectedCategory);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'budget_high') result.sort((a, b) => b.budget - a.budget);
    else if (sortBy === 'budget_low') result.sort((a, b) => a.budget - b.budget);
    return result;
  })();

  const canManageJob = (job) => {
  if (!job) return false;
  // Support when client is a populated object, a direct string, or an ObjectId
  const clientId = job.client?._id || (typeof job.client === 'object' ? job.client : job.client);
  const clientIdStr = clientId ? clientId.toString() : '';
  const userIdStr = user?._id ? user._id.toString() : (user?.id ? user.id.toString() : '');
  const userRole = user?.role || '';

  const isOwner = userRole === 'client' && clientIdStr && userIdStr && (clientIdStr.toLowerCase() === userIdStr.toLowerCase());

  console.log('[DEBUG] canManageJob ownership details:', {
    jobTitle: job.title,
    jobClientIdRaw: job.client,
    resolvedClientIdStr: clientIdStr,
    currentUserRole: userRole,
    currentUserIdStr: userIdStr,
    isOwner
  });

  return isOwner;
};

  const location = useLocation();

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const params = new URLSearchParams(location.search);
      const manageId = params.get('manage');
      const applyId = params.get('apply');

      const searchParam = params.get('search');

      if (searchParam) {
        setSearchQuery(searchParam);
      }

      if (manageId) {
        const jobToManage = jobs.find(j => j._id === manageId);
        if (jobToManage && canManageJob(jobToManage)) {
          setManagingJob(jobToManage);
        }
      } else if (applyId && user?.role === 'freelancer') {
        const jobToApply = jobs.find(j => j._id === applyId);
        if (jobToApply) {
          setApplyingJob(jobToApply);
        }
      }
    }
  }, [jobs, location.search, user]);

  return (
    <>
      <AnimatePresence>
        {applyingJob && <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} />}
        {managingJob && (
          <ManageProposalsModal
            job={managingJob}
            onClose={() => setManagingJob(null)}
            onChanged={() => dispatch(getJobs())}
          />
        )}
      </AnimatePresence>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 pb-20">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[3px] text-primary-400">Live Marketplace</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight font-heading">Gigs Marketplace</h1>
            <p className="text-slate-400 mt-1 font-medium">
              {isLoading ? 'Loading...' : `${filteredJobs.length} project${filteredJobs.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          {user?.role === 'client' && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/jobs/new" className="btn-premium flex items-center px-6 py-3 text-sm font-bold tracking-widest uppercase">
                <Plus className="w-4 h-4 mr-2" /> Post a Gig
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Trending Skills Banner */}
        <motion.div variants={itemVariants}>
          <TrendingSkillsBanner onSkillClick={(skill) => setSearchQuery(skill)} />
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 border-white/5">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 w-5 h-5 transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, skill or category..."
                className="w-full bg-slate-800/60 border border-white/5 rounded-xl py-3 pl-12 pr-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-800/60 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="budget_high">Highest Budget</option>
                <option value="budget_low">Lowest Budget</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${showFilters ? 'bg-primary-500 border-primary-400 text-white' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </motion.button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-1">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {isError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl font-medium">
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                className="glass-card h-44 rounded-3xl border-white/5" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, index) => (
                <TiltCard key={job._id}>
                  <motion.div layout variants={itemVariants} initial="hidden" animate="visible" exit="exit" custom={index}
                    className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary-500/5 to-violet-500/5 rounded-3xl" />
                    <div className="relative flex justify-between items-start gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-extrabold text-white group-hover:text-primary-300 transition-colors font-heading tracking-tight">
                            {job.title}
                          </h3>
                          <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-primary-500/20">
                            {job.category}
                          </span>
                          {job.isPaid && (
                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 inline" /> Paid
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed max-w-2xl font-medium mb-5">{job.description}</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                            <IndianRupee className="w-4 h-4" /> ₹{job.budget?.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                            <Clock className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-xl text-sm font-bold">
                            <Sparkles className="w-4 h-4" /> {job.proposals?.length || 0} Proposals
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(job.skills || []).map((skill, idx) => (
                            <motion.span key={idx} whileHover={{ scale: 1.1, y: -2 }}
                              className="px-2.5 py-1 bg-slate-800/80 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg border border-white/5 uppercase tracking-wider cursor-default transition-colors">
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0">
                        {user?.role === 'freelancer' && (
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setApplyingJob(job)}
                            className="btn-premium px-6 py-2.5 text-sm"
                          >
                            Apply Now
                          </motion.button>
                        )}
                        {canManageJob(job) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setManagingJob(job)}
                            className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-all">
                            Manage
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}
            className="glass-card p-20 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/3 to-violet-500/3 pointer-events-none" />
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
              <Briefcase className="w-12 h-12 text-slate-600" />
            </motion.div>
            <h3 className="text-2xl font-extrabold text-white mb-3 font-heading">
              {searchQuery || selectedCategory !== 'All' ? 'No Matches Found' : 'No Gigs Available'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">
              {searchQuery || selectedCategory !== 'All' ? "Try adjusting your search or filters." : 'Check back later for new projects!'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default Jobs;
