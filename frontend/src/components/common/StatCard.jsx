import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, color = "cyan" }) {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    red: "text-red-400 border-red-500/30 bg-red-500/10",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        {change && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
