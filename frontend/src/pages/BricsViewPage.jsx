import React, { useState } from 'react';
import { Globe2, Layers, CheckCircle2, Languages, Cpu, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BricsViewPage() {
  const { setSelectedCountry } = useApp();
  const [activeCountry, setActiveCountry] = useState('India');

  const bricsCountries = [
    {
      name: "India",
      flag: "🇮🇳",
      requests: "12,480",
      topCategory: "Water & Sanitation",
      infraCoverage: "71%",
      primaryLanguages: ["Telugu", "Hindi", "Bengali", "Tamil", "Marathi"],
      channels: ["IVR Voice Call", "WhatsApp Bot", "Gram Panchayat Portal"],
      activeHotspots: 14
    },
    {
      name: "Brazil",
      flag: "🇧🇷",
      requests: "4,150",
      topCategory: "Healthcare & Roads",
      infraCoverage: "69%",
      primaryLanguages: ["Portuguese", "Indigenous Dialects"],
      channels: ["WhatsApp", "Fala.BR Portal"],
      activeHotspots: 8
    },
    {
      name: "Russia",
      flag: "🇷🇺",
      requests: "2,840",
      topCategory: "Electricity & Thermal Heating",
      infraCoverage: "78%",
      primaryLanguages: ["Russian", "Tatar", "Bashkir"],
      channels: ["VKontakte", "Gosuslugi API"],
      activeHotspots: 5
    },
    {
      name: "China",
      flag: "🇨🇳",
      requests: "3,920",
      topCategory: "Digital Connectivity 5G",
      infraCoverage: "88%",
      primaryLanguages: ["Mandarin", "Cantonese"],
      channels: ["WeChat Mini Program", "Government Web Forms"],
      activeHotspots: 6
    },
    {
      name: "South Africa",
      flag: "🇿🇦",
      requests: "1,291",
      topCategory: "Water & Housing",
      infraCoverage: "64%",
      primaryLanguages: ["English", "isiZulu", "isiXhosa", "Afrikaans"],
      channels: ["SMS Shortcode", "Township Kiosks"],
      activeHotspots: 4
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Multilateral GovTech Architecture</span>
        </div>
        <h1 className="text-3xl font-black text-white">BRICS Cross-Country Intelligence</h1>
        <p className="text-xs text-slate-400">Deploying unified DPI standards across Brazil, Russia, India, China, and South Africa.</p>
      </div>

      {/* Country Switcher Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        {bricsCountries.map((c) => (
          <button
            key={c.name}
            onClick={() => {
              setActiveCountry(c.name);
              setSelectedCountry(c.name);
            }}
            className={`glass-panel p-5 rounded-2xl border text-left space-y-3 transition-all ${
              activeCountry === c.name 
                ? 'border-cyan-500 bg-cyan-950/40 shadow-xl shadow-cyan-500/20' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{c.flag}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {c.activeHotspots} Hotspots
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">{c.name}</h3>
              <p className="text-xs text-slate-400">{c.requests} Signals</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Country Deep Dive */}
      {(() => {
        const country = bricsCountries.find(c => c.name === activeCountry) || bricsCountries[0];
        return (
          <div className="glass-panel-glow p-8 rounded-2xl border border-purple-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h2 className="text-2xl font-black text-white">{country.name} Infrastructure Profile</h2>
                  <p className="text-xs text-slate-400">Top Priority Need: <strong className="text-cyan-300">{country.topCategory}</strong></p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">DPI Coverage Index</span>
                <span className="text-2xl font-black text-emerald-400">{country.infraCoverage}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-[#07111F] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Languages className="w-4 h-4" />
                  <span>Regional Languages & Dialects</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {country.primaryLanguages.map((l, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#07111F] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Radio className="w-4 h-4" />
                  <span>Local Ingestion Channels</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {country.channels.map((ch, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300 text-[11px]">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#07111F] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>National Adapter Integration</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Connects seamlessly to local census databases, spatial GIS layers, and treasury budget allocation APIs.
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
