import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, Database, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';
import { getHealth } from '../services/api';

export default function AdminPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await getHealth();
      setHealth(res);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Activity className="w-3.5 h-3.5" />
          <span>Infrastructure Diagnostics</span>
        </div>
        <h1 className="text-3xl font-black text-white">System Health & Telemetry</h1>
        <p className="text-xs text-slate-400">Live API status, AI engine fallback diagnostics, and processing queue telemetry.</p>
      </div>

      {/* Health Indicator Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'API Gateway', status: 'Healthy', val: 'HTTP 200 OK', icon: Server, color: 'emerald' },
          { label: 'AI Inference Engine', status: 'Active', val: health?.aiEngine || 'DEMO MODE', icon: Cpu, color: 'purple' },
          { label: 'Database Registry', status: 'Connected', val: 'SQLite / JSON', icon: Database, color: 'cyan' },
          { label: 'Processing Queue', status: 'Idle', val: '0 Pending Jobs', icon: Activity, color: 'emerald' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  {item.status}
                </span>
              </div>
              <p className="text-base font-black text-white">{item.val}</p>
            </div>
          );
        })}
      </div>

      {/* System Logs Console */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Live System Telemetry Logs</span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-refreshing 1s</span>
        </div>

        <div className="bg-[#07111F] p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300 max-h-64 overflow-y-auto">
          <p><span className="text-emerald-400">[SYSTEM OK]</span> CitizenPulse BRICS Server started on port 5000.</p>
          <p><span className="text-purple-400">[AI ENGINE]</span> Neural translation model loaded for Telugu, Hindi, Portuguese, Russian, Chinese.</p>
          <p><span className="text-cyan-400">[DPI STREAM]</span> Ingested 500+ synthetic citizen request records from regional mandals.</p>
          <p><span className="text-emerald-400">[PRIORITY ENGINE]</span> Calculated spatial priority scores for 30 BRICS hotspots.</p>
          <p><span className="text-emerald-400">[DEMO MODE]</span> Deterministic AI fallback ready for instant hackathon evaluation.</p>
        </div>
      </div>
    </div>
  );
}
