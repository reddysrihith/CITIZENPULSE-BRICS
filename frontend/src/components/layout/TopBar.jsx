import React from 'react';
import { Search, Globe, Languages, Play, Bell, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TopBar() {
  const { 
    selectedCountry, 
    setSelectedCountry, 
    selectedLanguage, 
    setSelectedLanguage, 
    isDemoMode,
    startJudgeDemo 
  } = useApp();

  return (
    <header className="h-16 bg-[#0B1628]/90 backdrop-blur-md border-b border-cyan-500/20 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          placeholder="Search requests, regions, projects..."
          className="w-full bg-[#07111F]/80 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-slate-700/60 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Country Selector */}
        <div className="flex items-center gap-1.5 bg-[#07111F]/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0B1628] text-slate-200">All BRICS Markets</option>
            <option value="India" className="bg-[#0B1628] text-slate-200">India 🇮🇳</option>
            <option value="Brazil" className="bg-[#0B1628] text-slate-200">Brazil 🇧🇷</option>
            <option value="Russia" className="bg-[#0B1628] text-slate-200">Russia 🇷🇺</option>
            <option value="China" className="bg-[#0B1628] text-slate-200">China 🇨🇳</option>
            <option value="South Africa" className="bg-[#0B1628] text-slate-200">South Africa 🇿🇦</option>
          </select>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-[#07111F]/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Languages className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="English" className="bg-[#0B1628]">English</option>
            <option value="Telugu" className="bg-[#0B1628]">Telugu (తెలుగు)</option>
            <option value="Hindi" className="bg-[#0B1628]">Hindi (हिन्दी)</option>
            <option value="Bengali" className="bg-[#0B1628]">Bengali (বাংলা)</option>
            <option value="Portuguese" className="bg-[#0B1628]">Portuguese (Português)</option>
            <option value="Russian" className="bg-[#0B1628]">Russian (Русский)</option>
            <option value="Chinese" className="bg-[#0B1628]">Chinese (中文)</option>
          </select>
        </div>

        {/* AI Mode Indicator Pill */}
        <div className="px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 bg-purple-950/60 border border-purple-500/30 text-purple-300">
          <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
          <span>{isDemoMode ? 'DEMO MODE' : 'GEMINI AI ACTIVE'}</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-[#07111F]/80 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5"></span>
        </button>

        {/* 3-Minute Judge Demo Trigger Button */}
        <button
          onClick={startJudgeDemo}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200 border border-cyan-300/30"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Judge Demo</span>
        </button>
      </div>
    </header>
  );
}
