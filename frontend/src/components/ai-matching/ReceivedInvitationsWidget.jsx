import { useState, useEffect } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const ReceivedInvitationsWidget = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchInvitations = async () => {
    try {
      console.log('📡 Fetching received invitations...');
      const res = await api.get('/ai-matching/invitations');
      console.log('📡 Invitations response:', res.data);
      if (res.data.success) {
        // Filter out accepted/declined ones, only show pending invitations
        const pending = (res.data.data || []).filter(inv => {
          console.log(`inv: ${inv._id}, status: ${inv.status}, job:`, inv.job);
          return inv.status === 'pending';
        });
        setInvitations(pending);
      }
    } catch (err) {
      console.error('Failed to load freelancer invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleResponse = async (invitationId, responseStatus) => {
    setActionId(invitationId);
    try {
      const res = await api.put(`/ai-matching/invitations/${invitationId}`, { status: responseStatus });
      if (res.data.success) {
        // Fade out from state
        setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${responseStatus} invitation`);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-16 bg-slate-900/60 rounded-2xl" />
      </div>
    );
  }

  if (invitations.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
      <div>
        <span className="text-primary-400 text-xs font-black uppercase tracking-[3px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Received Invitations
        </span>
        <h3 className="text-xl font-black text-white font-heading mt-1">Exclusive Invites from Clients</h3>
        <p className="text-slate-400 text-xs font-semibold">Clients have hand-picked you for these gigs. Accept to automatically apply!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {invitations.map((inv) => {
            const job = inv.job || {};
            const client = inv.client || {};

            return (
              <motion.div
                key={inv._id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -30 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary-500/20 transition-all relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="text-white font-extrabold text-sm capitalize line-clamp-1">{job.title}</h4>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
                        {job.category}
                      </span>
                    </div>
                    <div className="text-emerald-400 font-extrabold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      ₹{job.budget?.toLocaleString()}
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2">{job.description}</p>

                  <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white overflow-hidden border border-white/10 shrink-0">
                      {client.profileImage ? (
                        <img src={client.profileImage} alt={client.name || 'Client'} className="w-full h-full object-cover" />
                      ) : (
                        (client.name || 'Client').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-300 font-bold text-[10px] truncate">{client.name || 'Client'}</p>
                      <p className="text-slate-500 text-[9px] truncate">{client.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleResponse(inv._id, 'accepted')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-400 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {actionId === inv._id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleResponse(inv._id, 'declined')}
                    className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-400 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    {actionId === inv._id ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReceivedInvitationsWidget;
