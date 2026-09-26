import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Globe2, 
  Radio, 
  Building2, 
  ShieldCheck, 
  Layers, 
  Activity, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { startJudgeDemo } = useApp();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B1628] via-[#07111F] to-[#07111F] border border-cyan-500/20 p-8 lg:p-14 shadow-2xl">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>GovTech / Digital Public Infrastructure Platform</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-none">
            CITIZENPULSE <span className="gradient-text-cyan">BRICS</span>
          </h1>

          <p className="text-2xl font-bold text-slate-200 tracking-wide">
            "From Citizen Voice to Infrastructure Intelligence"
          </p>

          <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
            An AI-powered Digital Public Infrastructure platform that transforms fragmented multilingual citizen feedback across voice calls, texts, and messaging platforms into evidence-based infrastructure intelligence and explainable policy decisions.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate('/citizen')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Try Citizen Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#101D31] hover:bg-slate-800 text-slate-200 border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Open Policy Dashboard</span>
            </button>

            <button
              onClick={startJudgeDemo}
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-300/30 shadow-xl shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run 3-Min Judge Demo</span>
            </button>
          </div>
        </div>

        {/* Futuristic Architecture Pipeline Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#07111F]/90 border border-cyan-500/20 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wider font-extrabold text-cyan-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> End-to-End Infrastructure Intelligence Pipeline
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {[
              { label: "1. Citizen Signals", desc: "Voice, SMS, WhatsApp" },
              { label: "2. Multilingual AI", desc: "Telugu, Hindi, BRICS Dialects" },
              { label: "3. Hotspot Mapping", desc: "Spatial & Census Overlay" },
              { label: "4. Policy Brief", desc: "Explainable Priority Score" },
              { label: "5. Impact Simulation", desc: "Before vs After Outcomes" }
            ].map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0B1628] border border-slate-800">
                <span className="text-[10px] font-extrabold text-cyan-400 block">{step.label}</span>
                <span className="text-xs text-slate-300 font-medium">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Statistics Counters */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { num: "500+", label: "Citizen Requests", desc: "Multilingual feedback" },
          { num: "30", label: "Regions Monitored", desc: "Cross-BRICS coverage" },
          { num: "8", label: "Infra Categories", desc: "Water, Roads, Power, etc." },
          { num: "5", label: "BRICS Markets", desc: "IN, BR, RU, CN, ZA" },
          { num: "100%", label: "Explainable Scoring", desc: "Transparent 5-factor engine" }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-cyan-500/20 text-center hover:border-cyan-500/40 transition-all">
            <h3 className="text-3xl font-black text-white tracking-tight gradient-text-cyan">{stat.num}</h3>
            <p className="text-xs font-bold text-slate-200 mt-1">{stat.label}</p>
            <p className="text-[10px] text-slate-400">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">System Mechanics</span>
          <h2 className="text-3xl font-extrabold text-white">How CitizenPulse BRICS Works</h2>
          <p className="text-xs text-slate-400">Turning fragmented citizen signals into high-impact infrastructure investments.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "Citizens Speak",
              desc: "Citizens express needs via voice calls, WhatsApp, or local web forms in their native languages.",
              icon: Radio
            },
            {
              step: "02",
              title: "AI Understands",
              desc: "NLP engine auto-detects language, translates text, and extracts infrastructure category & urgency.",
              icon: Sparkles
            },
            {
              step: "03",
              title: "Platform Finds Gaps",
              desc: "Combines citizen demand with census data, spatial maps, and existing capital budgets.",
              icon: Globe2
            },
            {
              step: "04",
              title: "Policymakers Act",
              desc: "Priority engine ranks regions with explainable score breakdowns and auto-generates policy briefs.",
              icon: FileText
            },
            {
              step: "05",
              title: "Impact Is Simulated",
              desc: "Simulates projected complaint reductions and population access before committing public funds.",
              icon: Activity
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 relative group hover:border-cyan-500/40 transition-all">
                <span className="text-2xl font-black text-cyan-500/30 font-mono">{item.step}</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing CTA Footer Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0B1628] to-purple-950/40 border border-cyan-500/30 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-white">"From Citizen Voice to Better Infrastructure Decisions."</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/citizen')}
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Start Citizen Demo
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Explore Intelligence Dashboard
          </button>
        </div>
        <p className="text-[10px] text-slate-500">CitizenPulse BRICS • Synthetic Demo Data • Human-in-the-Loop Governance</p>
      </section>
    </div>
  );
}
