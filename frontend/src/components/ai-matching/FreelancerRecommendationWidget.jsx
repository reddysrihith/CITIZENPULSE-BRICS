import { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
import api from '../../services/api';

const FreelancerRecommendationWidget = ({ clientUser }) => {
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentJobsAndMatches = async () => {
      setLoading(true);
      try {
        // Fetch all jobs
        const res = await api.get('/jobs');
        if (res.data.success) {
          // Filter client's jobs
          const clientJobs = res.data.data
            .filter(j => j.client === clientUser?._id || j.client?._id === clientUser?._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          setJobs(clientJobs);

          // Fetch matches for each job
          const matchesMap = {};
          for (const job of clientJobs) {
            try {
              const matchRes = await api.get(`/ai-matching/recommended-freelancers/${job._id}`);
              if (matchRes.data.success) {
                matchesMap[job._id] = (matchRes.data.data.matches || []).slice(0, 3);
              }
            } catch (err) {
              console.error(`Failed to load matches for job ${job._id}:`, err);
            }
          }
          setRecommendations(matchesMap);
        }
      } catch (err) {
        console.error('Error in FreelancerRecommendationWidget:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clientUser) {
      fetchRecentJobsAndMatches();
    }
  }, [clientUser]);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-800 rounded w-2/3" />
        <div className="space-y-3 pt-4">
          <div className="h-20 bg-slate-900 rounded-xl" />
          <div className="h-20 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
      <div>
        <span className="text-primary-400 text-xs font-black uppercase tracking-[3px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Recommendations
        </span>
        <h3 className="text-xl font-black text-white font-heading mt-1">Matched Candidates for Recent Gigs</h3>
        <p className="text-slate-400 text-xs font-semibold">Best fitting freelancers based on job requirements and skills</p>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => {
          const matches = recommendations[job._id] || [];

          return (
            <div key={job._id} className="space-y-3 border-b border-white/5 last:border-b-0 pb-4 last:pb-0">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-extrabold text-sm capitalize truncate max-w-[70%]">{job.title}</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                  {job.category}
                </span>
              </div>

              {matches.length === 0 ? (
                <p className="text-slate-500 text-xs font-semibold pl-2">No suitable matches found for this gig yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {matches.map((match) => (
                    <div
                      key={match.freelancerId}
                      className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-primary-500/20 transition-all hover:bg-slate-900/70"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black overflow-hidden shrink-0 border border-white/10">
                          {match.avatar ? (
                            <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
                          ) : (
                            match.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-extrabold text-xs truncate">{match.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {match.averageRating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-primary-400 text-xs font-black bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                          {Math.round(match.compositeScore * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FreelancerRecommendationWidget;
