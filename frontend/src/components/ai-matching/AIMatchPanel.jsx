import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Sparkles, Send, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import MatchScoreBreakdown from './MatchScoreBreakdown';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const AIMatchPanel = ({ jobId, jobSkills = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [invitingId, setInvitingId] = useState(null);

  const fetchMatches = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const url = forceRefresh 
        ? `/ai-matching/match-job` 
        : `/ai-matching/recommended-freelancers/${jobId}`;
        
      const res = forceRefresh
        ? await api.post('/ai-matching/match-job', { jobId })
        : await api.get(url);

      if (res.data.success) {
        setMatches(res.data.data.matches || []);
      } else {
        setError('Failed to fetch matched freelancers.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while running AI match.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await api.get(`/ai-matching/client-invitations/${jobId}`);
      if (res.data.success) {
        const ids = new Set(res.data.data.map(inv => inv.freelancer));
        setInvitedIds(ids);
      }
    } catch (err) {
      console.error('Failed to load sent invitations:', err);
    }
  };

  const handleInvite = async (freelancerId) => {
    setInvitingId(freelancerId);
    try {
      const res = await api.post('/ai-matching/invite', { jobId, freelancerId });
      if (res.data.success) {
        setInvitedIds(prev => {
          const updated = new Set(prev);
          updated.add(freelancerId);
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInvitingId(null);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchMatches();
      fetchInvitations();
    }
  }, [jobId]);

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-primary-400 text-xs font-black uppercase tracking-[3px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine
          </span>
          <h3 className="text-2xl font-black text-white font-heading mt-1">Smart Candidate Matching</h3>
          <p className="text-slate-400 text-xs font-semibold">Ranked candidates using sentence embeddings & profile scoring</p>
        </div>
        <button
          onClick={() => fetchMatches(true)}
          disabled={loading}
          className="btn-premium px-4 py-2.5 flex items-center text-xs font-bold tracking-widest uppercase gap-2 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate Matches
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex justify-between items-center text-sm font-bold">
          <span>{error}</span>
          <button onClick={() => fetchMatches(true)} className="underline hover:text-white transition-colors">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-28 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
          <p className="text-slate-500 font-bold text-sm">No matched freelancers found yet.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-4"
        >
          {matches.map((match) => {
            const compositePercent = Math.round(match.compositeScore * 100);
            
            return (
              <motion.div
                key={match.freelancerId}
                variants={cardVariants}
                className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative group"
              >
                {match.isTopMatch && (
                  <div className="absolute -top-3 -left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-xl shadow-lg flex items-center gap-1">
                    Top Match 🏆
                  </div>
                )}

                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black overflow-hidden shrink-0 border border-white/10">
                    {match.avatar ? (
                      <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
                    ) : (
                      match.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-extrabold text-base truncate">{match.name}</h4>
                      <span className="flex items-center text-amber-400 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        {match.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {match.location?.city ? `${match.location.city}, ${match.location.country}` : 'Remote'}
                    </p>

                    {/* Skill highlight */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {match.skills.map(skill => {
                        const isMatched = jobSkills.some(js => js.toLowerCase().trim() === skill.toLowerCase().trim());
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                              isMatched 
                                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 font-black shadow-lg shadow-primary-500/5' 
                                : 'bg-slate-900/50 text-slate-400 border border-white/5'
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 self-stretch justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  {/* Circular Score Indicator */}
                  <div 
                    className="relative cursor-pointer select-none"
                    onMouseEnter={() => setActiveTooltip(match.freelancerId)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="22" className="stroke-slate-800 fill-none" strokeWidth="4" />
                      <circle 
                        cx="28" 
                        cy="28" 
                        r="22" 
                        className="stroke-primary-500 fill-none transition-all duration-1000" 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 * (1 - match.compositeScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                      {compositePercent}%
                    </span>

                    {/* Tooltip breakdown */}
                    <AnimatePresence>
                      {activeTooltip === match.freelancerId && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-16 right-0 z-50 pointer-events-none"
                        >
                          <MatchScoreBreakdown 
                            skillSimilarity={match.skillSimilarity}
                            ratingScore={match.ratingScore}
                            locationBonus={match.locationBonus}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col lg:flex-row gap-2">
                    <button 
                      onClick={() => alert(`Redirecting to ${match.name}'s profile...`)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Profile
                    </button>
                    <button 
                      disabled={invitedIds.has(match.freelancerId) || invitingId === match.freelancerId}
                      onClick={() => handleInvite(match.freelancerId)}
                      className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-all ${
                        invitedIds.has(match.freelancerId)
                          ? 'bg-slate-800 border border-white/5 cursor-not-allowed opacity-50'
                          : 'bg-primary-500 hover:bg-primary-600'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {invitingId === match.freelancerId ? 'Inviting...' : invitedIds.has(match.freelancerId) ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default AIMatchPanel;
