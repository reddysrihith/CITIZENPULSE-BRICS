import React, { useState, useEffect } from 'react';
import { Sliders, TrendingUp, Users, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { simulateImpactApi } from '../services/api';

export default function ImpactSimulatorPage() {
  const [budget, setBudget] = useState(145);
  const [coverage, setCoverage] = useState(85);
  const [period, setPeriod] = useState(12);
  const [intervention, setIntervention] = useState('Modular Water Treatment & Grid Extension');

  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    async function runSim() {
      const res = await simulateImpactApi({
        budget,
        populationCoverage: coverage,
        implementationPeriod: period,
        interventionType: intervention
      });

      setSimulation(res || {
        beforeAfter: {
          citizenComplaints: { before: 1284, after: 742 },
          populationAccessPct: { before: 68, after: 91 },
          infrastructureGapPct: { before: 32, after: 9 },
          projectedBeneficiaries: 184000,
          estimatedImprovementPct: 23
        },
        timelineProjection: [
          { month: 'M0', complaints: 1284, access: 68 },
          { month: 'M3', complaints: 1080, access: 73 },
          { month: 'M6', complaints: 920, access: 80 },
          { month: 'M9', complaints: 810, access: 86 },
          { month: 'M12', complaints: 742, access: 91 }
        ]
      });
    }
    runSim();
  }, [budget, coverage, period, intervention]);

  const metrics = simulation?.beforeAfter || {
    citizenComplaints: { before: 1284, after: 742 },
    populationAccessPct: { before: 68, after: 91 },
    infrastructureGapPct: { before: 32, after: 9 },
    projectedBeneficiaries: 184000,
    estimatedImprovementPct: 23
  };

  const chartData = simulation?.timelineProjection || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Policy Simulation & Counterfactual Modeling</span>
          </div>
          <h1 className="text-3xl font-black text-white">Simulate Infrastructure Impact</h1>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          <span>Simulated / Estimated Impact Model</span>
        </div>
      </div>

      {/* Control Sliders Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Intervention Parameters</h3>

        <div className="grid md:grid-cols-3 gap-6 text-xs">
          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Capital Budget Allocation</span>
              <span className="text-cyan-300">₹{budget} Cr</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹50 Cr</span>
              <span>₹500 Cr</span>
            </div>
          </div>

          {/* Population Coverage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Population Target Coverage</span>
              <span className="text-purple-300">{coverage}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={coverage}
              onChange={(e) => setCoverage(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Implementation Horizon Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Implementation Horizon</span>
              <span className="text-emerald-300">{period} Months</span>
            </div>
            <input
              type="range"
              min="6"
              max="36"
              step="3"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>6 Months</span>
              <span>36 Months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Impact Comparison Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Citizen Distress Complaints</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-400 line-through">{metrics.citizenComplaints.before}</span>
            <span className="text-2xl font-black text-emerald-400">{metrics.citizenComplaints.after}</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold">
            -{Math.round(((metrics.citizenComplaints.before - metrics.citizenComplaints.after) / metrics.citizenComplaints.before) * 100)}% Reduction
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Population Infrastructure Access</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-400">{metrics.populationAccessPct.before}%</span>
            <span className="text-2xl font-black text-cyan-300">{metrics.populationAccessPct.after}%</span>
          </div>
          <p className="text-[10px] text-cyan-400 font-bold">+{metrics.populationAccessPct.after - metrics.populationAccessPct.before}% Gain</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Infrastructure Deficit Gap</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-red-400">{metrics.infrastructureGapPct.before}%</span>
            <span className="text-2xl font-black text-emerald-400">{metrics.infrastructureGapPct.after}%</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold">Significant Gap Closure</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Projected Beneficiaries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-300">{metrics.projectedBeneficiaries.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-purple-400 font-bold">Direct Reach</p>
        </div>
      </div>

      {/* Projected Outcome Trajectory Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <h3 className="text-sm font-bold text-white">Projected Complaint Trajectory Over {period} Months</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0B1628', border: '1px solid #22D3EE', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="complaints" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
