const MatchScoreBreakdown = ({ skillSimilarity = 0, ratingScore = 0, locationBonus = 0 }) => {
  const skillPercent = Math.round(skillSimilarity * 100);
  const ratingPercent = Math.round(ratingScore * 100);
  const locationPercent = Math.round(locationBonus * 100);

  return (
    <div className="space-y-4 p-4 bg-slate-950/95 border border-white/10 rounded-2xl text-xs w-64 shadow-2xl backdrop-blur-xl">
      <h5 className="font-extrabold text-white uppercase tracking-[1px] mb-2 text-[10px]">Match Score Breakdown</h5>
      
      {/* Skill Similarity */}
      <div className="space-y-1">
        <div className="flex justify-between text-slate-400 font-bold">
          <span>Skill Similarity (60%)</span>
          <span className="text-primary-400 font-black">{skillPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${skillPercent}%` }} />
        </div>
      </div>

      {/* Rating Score */}
      <div className="space-y-1">
        <div className="flex justify-between text-slate-400 font-bold">
          <span>Rating Score (25%)</span>
          <span className="text-emerald-400 font-black">{ratingPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${ratingPercent}%` }} />
        </div>
      </div>

      {/* Location Bonus */}
      <div className="space-y-1">
        <div className="flex justify-between text-slate-400 font-bold">
          <span>Location Bonus (15%)</span>
          <span className="text-blue-400 font-black">{locationPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${locationPercent}%` }} />
        </div>
      </div>
    </div>
  );
};

export default MatchScoreBreakdown;
