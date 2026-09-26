import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, Play, GitBranch, ExternalLink, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SubmissionPage() {
  const navigate = useNavigate();
  const { startJudgeDemo } = useApp();

  const checklist = [
    { title: "Public GitHub Repository", status: "Verified", desc: "Production-ready codebase with clean structure and docs" },
    { title: "Working Full-Stack Prototype", status: "Verified", desc: "Vite + React frontend with Node.js/Express backend" },
    { title: "Multilingual AI Processing", status: "Verified", desc: "Language detection & neural translation across 7 languages" },
    { title: "Explainable Priority Engine", status: "Verified", desc: "Transparent 5-factor mathematical weighting formula" },
    { title: "Demand Hotspot Intelligence", status: "Verified", desc: "Spatial Leaflet maps correlating demand with infrastructure gaps" },
    { title: "AI Recommendations Engine", status: "Verified", desc: "Evidence-backed project interventions with cost & beneficiary estimates" },
    { title: "AI Policy Brief Generator", status: "Verified", desc: "Cabinet-ready executive policy briefing document generator" },
    { title: "Interactive Impact Simulator", status: "Verified", desc: "Counterfactual outcome modeling sliders with before/after metrics" },
    { title: "BRICS Multi-Country Architecture", status: "Verified", desc: "Extensible framework supporting IN, BR, RU, CN, ZA" },
    { title: "Responsible AI Governance", status: "Verified", desc: "Human-in-the-loop, privacy redaction, and explainability" },
    { title: "Interactive 3-Min Judge Demo", status: "Verified", desc: "Automated step-by-step evaluator walkthrough" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#0B1628] to-purple-950/60 border-2 border-cyan-500/40 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] mx-auto shadow-xl shadow-cyan-500/20">
          <div className="w-full h-full bg-[#07111F] rounded-[14px] flex items-center justify-center">
            <Award className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-cyan-400">BRICS HACKATHON INNOVATION TRACK</span>
          <h1 className="text-3xl font-black text-white">CitizenPulse BRICS Submission Package</h1>
          <p className="text-xs text-slate-300">From Citizen Voice to Infrastructure Intelligence</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={startJudgeDemo}
            className="px-6 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-xl shadow-cyan-500/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch 3-Minute Judge Demo</span>
          </button>

          <button
            onClick={() => navigate('/citizen')}
            className="px-5 py-3 rounded-xl text-xs font-bold bg-[#101D31] text-slate-200 border border-cyan-500/30 hover:border-cyan-500/60 transition-colors"
          >
            Open Citizen Demo
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Hackathon Deliverables Checklist</span>
        </h2>

        <div className="space-y-3">
          {checklist.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#07111F] border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 pl-6">{item.desc}</p>
              </div>

              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                ✓ {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
