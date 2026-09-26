import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Droplets, 
  Truck, 
  HeartPulse, 
  GraduationCap, 
  Zap, 
  Wifi, 
  Home, 
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { getInfrastructureData } from '../services/api';

export default function InfrastructurePage() {
  const [infraList, setInfraList] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getInfrastructureData();
      setInfraList(data);
    }
    load();
  }, []);

  const iconMap = {
    Droplets,
    Truck,
    HeartPulse,
    GraduationCap,
    Zap,
    Wifi,
    Home,
    ShieldAlert
  };

  const comparisonData = infraList.map(item => ({
    name: item.category,
    coverage: item.coveragePercent,
    gap: item.gapPercent
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
          <Building2 className="w-3.5 h-3.5" />
          <span>National Asset & Deficit Diagnostic</span>
        </div>
        <h1 className="text-3xl font-black text-white">Infrastructure Intelligence</h1>
        <p className="text-xs text-slate-400">Coverage vs deficit breakdown across 8 core public infrastructure domains.</p>
      </div>

      {/* 8 Category Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {infraList.map((item) => {
          const Icon = iconMap[item.icon] || Building2;
          return (
            <div key={item.id} className="glass-panel p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Avg Priority: {item.priorityScoreAvg}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{item.category}</h3>
                <p className="text-xs text-slate-400">Demand Level: <strong className="text-amber-400">{item.citizenDemandLevel}</strong></p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Asset Coverage</span>
                  <span className="text-cyan-300 font-bold">{item.coveragePercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${item.coveragePercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Deficit Gap: <strong className="text-red-400">{item.gapPercent}%</strong></span>
                  <span>Active Hotspots: {item.activeHotspots}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Public Budget:</span>
                <span className="font-extrabold text-white">{item.investmentAllocated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Charts */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Infrastructure Coverage vs Deficit Gap Comparison</span>
          </h3>
          <span className="text-xs text-slate-400">National Target: 95% Minimum Coverage</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ background: '#0B1628', border: '1px solid #22D3EE', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="coverage" name="Existing Asset Coverage (%)" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gap" name="Infrastructure Deficit Gap (%)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
