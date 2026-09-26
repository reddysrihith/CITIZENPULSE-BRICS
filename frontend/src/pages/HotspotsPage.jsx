import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, Users, Building2, ChevronRight, Sparkles, Filter } from 'lucide-react';
import LeafletMap from '../components/maps/LeafletMap';
import ScoreGauge from '../components/common/ScoreGauge';
import { getHotspots } from '../services/api';
import { useApp } from '../context/AppContext';

export default function HotspotsPage() {
  const { selectedCountry } = useApp();
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getHotspots();
      setHotspots(data);
      if (data.length > 0) setSelectedHotspot(data[0]);
    }
    loadData();
  }, []);

  const filteredHotspots = selectedCountry === 'All'
    ? hotspots
    : hotspots.filter(h => h.country.toLowerCase() === selectedCountry.toLowerCase());

  const active = selectedHotspot || filteredHotspots[0] || {
    id: "IN-TEL",
    name: "Telangana",
    country: "India",
    primaryNeed: "Water & Sanitation",
    citizenRequests: 1284,
    affectedPopulation: 184000,
    infrastructureGap: 32,
    investmentGap: "Medium",
    urgency: "High",
    priorityScore: 91,
    demandScore: 28,
    gapScore: 23,
    popScore: 18,
    urgencyScore: 13,
    invScore: 9,
    explanation: "High citizen demand for clean drinking water in rural mandals combined with 32% infrastructure deficit and acute summer water stress."
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Flame className="w-3.5 h-3.5" />
          <span>Spatial Priority Analytics</span>
        </div>
        <h1 className="text-3xl font-black text-white">Demand Hotspots Intelligence</h1>
        <p className="text-xs text-slate-400">Automated spatial detection correlating citizen request density with infrastructure deficit indicators.</p>
      </div>

      {/* Main Split Layout: Map + Side Intelligence Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Map Container (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <LeafletMap 
            hotspots={filteredHotspots} 
            height="560px"
            onSelectHotspot={(spot) => setSelectedHotspot(spot)} 
          />

          {/* Hotspot List Selector Strip */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300">Select Hotspot Cluster:</span>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {filteredHotspots.map((hs, idx) => (
                <button
                  key={hs.id}
                  onClick={() => setSelectedHotspot(hs)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all text-left space-y-1 ${
                    active.id === hs.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'bg-[#0B1628] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white text-xs">{hs.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {hs.priorityScore}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{hs.primaryNeed}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hotspot Intelligence Side Panel (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-glow p-6 rounded-2xl border border-purple-500/30 space-y-6">
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">HOTSPOT CLUSTER DETECTED</span>
                <h2 className="text-2xl font-black text-white mt-0.5">{active.name}</h2>
                <p className="text-xs text-slate-400">{active.country} • {active.primaryNeed}</p>
              </div>
              <ScoreGauge score={active.priorityScore} size={90} strokeWidth={8} title="" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Citizen Requests</span>
                <p className="text-base font-black text-cyan-300">{active.citizenRequests.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Affected Population</span>
                <p className="text-base font-black text-purple-300">{active.affectedPopulation ? active.affectedPopulation.toLocaleString() : '184,000'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Infrastructure Gap</span>
                <p className="text-base font-black text-amber-400">{active.infrastructureGap}% Deficit</p>
              </div>
              <div className="p-3 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Assessed Urgency</span>
                <p className="text-base font-black text-red-400">{active.urgency}</p>
              </div>
            </div>

            {/* Explainable Weighting Breakdown */}
            <div className="space-y-3 p-4 rounded-xl bg-[#07111F] border border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Explainable Priority Formula</h3>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Citizen Signal Density (30%)</span>
                    <span className="text-cyan-400 font-bold">{active.demandScore || 27}/30</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${((active.demandScore || 27) / 30) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Infrastructure Deficit (25%)</span>
                    <span className="text-purple-400 font-bold">{active.gapScore || 23}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${((active.gapScore || 23) / 25) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Population Impact (20%)</span>
                    <span className="text-blue-400 font-bold">{active.popScore || 17}/20</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${((active.popScore || 17) / 20) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation Statement */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-400">AI Priority Rationale</span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{active.explanation}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
