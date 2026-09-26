import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const TrendingSkillsBanner = ({ onSkillClick }) => {
  const [skills, setSkills] = useState([]);

  const fetchTrendingSkills = async () => {
    try {
      const res = await api.get('/ai-matching/trending-skills');
      if (res.data.success) {
        setSkills(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch trending skills:', err);
    }
  };

  useEffect(() => {
    fetchTrendingSkills();

    // Poll every 5 minutes
    const interval = setInterval(fetchTrendingSkills, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (skills.length === 0) return null;

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary-400" />
        <span className="text-white font-extrabold text-xs uppercase tracking-wider">AI Skill Trends (Last 30 Days)</span>
        <span className="bg-primary-500/10 text-primary-300 text-[9px] font-black px-2 py-0.5 rounded-lg border border-primary-500/20 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Updated Daily
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {skills.map((item) => {
          const isGrowth = item.growthPercent > 0;
          return (
            <button
              key={item.skillName}
              onClick={() => onSkillClick && onSkillClick(item.skillName)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-primary-500/30 text-xs font-semibold text-slate-300 transition-all shrink-0 hover:scale-105 active:scale-95 shadow-md"
            >
              <span className="font-extrabold text-white capitalize">{item.skillName}</span>
              <span className="text-xs">{item.tag.split(' ')[0]}</span>
              <span className={`text-[10px] font-black ${isGrowth ? 'text-emerald-400' : item.growthPercent < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {isGrowth ? '+' : ''}{item.growthPercent}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingSkillsBanner;
