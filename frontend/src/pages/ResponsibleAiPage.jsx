import React from 'react';
import { ShieldCheck, UserCheck, Eye, Lock, Scale, FileText, AlertTriangle } from 'lucide-react';

export default function ResponsibleAiPage() {
  const principles = [
    {
      title: "Human-in-the-Loop Governance",
      desc: "AI produces evidence, spatial diagnostics, and draft recommendations. Final policy and budget allocation decisions remain strictly with authorized human public officials.",
      icon: UserCheck,
      color: "cyan"
    },
    {
      title: "Privacy & PII Anonymization",
      desc: "All incoming voice and text signals pass through immediate automated redaction of personal identifiable information (PII) before storage or LLM processing.",
      icon: Lock,
      color: "purple"
    },
    {
      title: "Explainable Priority Scoring",
      desc: "Zero black-box AI decisions. Priority scores are calculated via open, transparent 5-factor mathematical weighting visible to auditors and citizens alike.",
      icon: Eye,
      color: "amber"
    },
    {
      title: "Algorithmic Parity & Bias Auditing",
      desc: "Continuous monitoring prevents regional representation bias, ensuring marginalized communities without smartphone access are captured via voice IVR and local forms.",
      icon: Scale,
      color: "emerald"
    },
    {
      title: "Data Minimization",
      desc: "The platform retains only spatial infrastructure demand signals and demographic aggregates, discarding raw personal telemetry after classification.",
      icon: FileText,
      color: "cyan"
    },
    {
      title: "Synthetic Demo Data Disclosure",
      desc: "All datasets displayed in this prototype hackathon environment are synthetically generated for demonstration purposes and do not represent actual classified government records.",
      icon: AlertTriangle,
      color: "red"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ethical AI & Governance Framework</span>
        </div>
        <h1 className="text-3xl font-black text-white">Responsible AI Commitment</h1>
        <p className="text-xs text-slate-400">Guiding principles for ethical Digital Public Infrastructure intelligence and citizen trust.</p>
      </div>

      {/* Official Human-in-the-Loop Statement Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#0B1628] to-cyan-950/60 border-2 border-purple-500/40 text-center space-y-3 shadow-2xl">
        <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-white">"AI provides evidence and recommendations. Final policy decisions remain with authorized human decision-makers."</h2>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto">
          CitizenPulse BRICS empowers policy analysts with spatial data and explainable priority scores without delegating public governance authority to automated algorithms.
        </p>
      </div>

      {/* 6 Principle Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {principles.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#07111F] p-4 rounded-xl border border-slate-800">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
