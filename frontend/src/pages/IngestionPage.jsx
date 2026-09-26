import React from 'react';
import { Workflow, CheckCircle2, Radio, Sparkles, MessageSquare, PhoneCall, Globe2, FileSpreadsheet } from 'lucide-react';

export default function IngestionPage() {
  const sources = [
    { name: 'Voice Call (IVR)', icon: PhoneCall, status: 'Active', count: '8,420', latency: '420ms', confidence: '94.2%' },
    { name: 'WhatsApp & Telegram', icon: MessageSquare, status: 'Active', count: '11,290', latency: '180ms', confidence: '96.8%' },
    { name: 'Citizen Web Portal', icon: Globe2, status: 'Active', count: '3,840', latency: '120ms', confidence: '98.1%' },
    { name: 'Local Govt Forms', icon: FileSpreadsheet, status: 'Active', count: '1,131', latency: '350ms', confidence: '92.5%' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
          <Workflow className="w-3.5 h-3.5" />
          <span>Real-Time Stream Processing</span>
        </div>
        <h1 className="text-3xl font-black text-white">AI Data Ingestion Pipeline</h1>
        <p className="text-xs text-slate-400">Live monitoring of incoming citizen voice, text, and messaging telemetry streams.</p>
      </div>

      {/* Pipeline Flow Visualizer Banner */}
      <div className="glass-panel-glow p-6 rounded-2xl border border-purple-500/30 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>7-Stage Neural Ingestion Architecture</span>
        </h3>

        <div className="flex items-center justify-between overflow-x-auto py-4 scrollbar-thin">
          {[
            { step: '01', name: 'INGEST' },
            { step: '02', name: 'NORMALIZE' },
            { step: '03', name: 'TRANSLATE' },
            { step: '04', name: 'CLASSIFY' },
            { step: '05', name: 'GEOLOCATE' },
            { step: '06', name: 'ANALYZE' },
            { step: '07', name: 'PRIORITIZE' }
          ].map((st, idx) => (
            <React.Fragment key={idx}>
              <div className="px-4 py-3 rounded-xl bg-[#07111F] border border-cyan-500/30 shrink-0 text-center space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">{st.step}</span>
                <span className="text-xs font-extrabold text-white">{st.name}</span>
              </div>
              {idx < 6 && <span className="text-cyan-500 font-bold text-sm px-1">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Ingestion Source Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((src, idx) => {
          const Icon = src.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {src.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{src.name}</h3>
                <p className="text-2xl font-black text-cyan-300 mt-1">{src.count}</p>
                <span className="text-[10px] text-slate-400">Records Processed</span>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
                <span>Avg Latency: <strong className="text-slate-200">{src.latency}</strong></span>
                <span>Confidence: <strong className="text-purple-300">{src.confidence}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
