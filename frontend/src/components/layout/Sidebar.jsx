import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Flame, 
  Building2, 
  Sparkles, 
  FileText, 
  Sliders, 
  Globe2, 
  Database, 
  Workflow, 
  ShieldCheck, 
  Activity, 
  Award,
  Radio,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { isDemoMode } = useApp();

  const navItems = [
    { label: 'Overview', path: '/', icon: Radio },
    { label: 'Citizen Requests', path: '/citizen', icon: MessageSquarePlus },
    { label: 'National Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Demand Hotspots', path: '/hotspots', icon: Flame },
    { label: 'Infrastructure', path: '/infrastructure', icon: Building2 },
    { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Policy Briefs', path: '/policy-brief', icon: FileText },
    { label: 'Impact Simulator', path: '/impact', icon: Sliders },
    { label: 'BRICS View', path: '/brics', icon: Globe2 },
    { label: 'Data Explorer', path: '/data', icon: Database },
    { label: 'AI Ingestion', path: '/ingestion', icon: Workflow },
    { label: 'Responsible AI', path: '/responsible-ai', icon: ShieldCheck },
    { label: 'System Health', path: '/admin', icon: Activity },
    { label: 'Submission', path: '/submission', icon: Award }
  ];

  return (
    <aside className="w-64 bg-[#0B1628] border-r border-cyan-500/20 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-cyan-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">CitizenPulse</h1>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">BRICS</span>
            </div>
            <p className="text-[10px] text-slate-400">Citizen Voice → Infrastructure</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Status */}
      <div className="p-3 border-t border-cyan-500/20 bg-[#07111F]/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-slate-900/60 border border-cyan-500/10">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Status:
          </span>
          <span className="text-emerald-400 font-semibold">Operational</span>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-900/40">
          <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-semibold text-slate-200 truncate">Dr. A. Sharma</p>
            <p className="text-[9px] text-slate-400 truncate">Chief Infrastructure Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
