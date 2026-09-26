import React, { useState, useEffect } from 'react';
import { Database, Search, Download, Filter, AlertCircle, Layers } from 'lucide-react';
import { getCitizenRequests, getHotspots, getInfrastructureData } from '../services/api';

export default function DataExplorerPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (activeTab === 'requests') {
        const res = await getCitizenRequests({ search });
        setDataList(res.requests || []);
      } else if (activeTab === 'regions') {
        const res = await getHotspots();
        setDataList(res || []);
      } else if (activeTab === 'infrastructure') {
        const res = await getInfrastructureData();
        setDataList(res || []);
      }
    }
    loadData();
  }, [activeTab, search]);

  const exportCSV = () => {
    if (!dataList || dataList.length === 0) return;
    const keys = Object.keys(dataList[0]);
    const csvContent = [
      keys.join(','),
      ...dataList.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CitizenPulse_BRICS_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Database className="w-3.5 h-3.5" />
            <span>Open Data & Audit Trail</span>
          </div>
          <h1 className="text-3xl font-black text-white">Data Explorer</h1>
        </div>
        
        {/* Synthetic Data Label Badge */}
        <div className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Demo Dataset — Synthetic Data</span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'requests', label: 'Citizen Requests' },
            { id: 'regions', label: 'Regions & Hotspots' },
            { id: 'infrastructure', label: 'Infrastructure Domains' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dataset..."
              className="w-full bg-[#07111F] text-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700/80 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#07111F] text-slate-400 uppercase text-[10px] font-bold border-b border-cyan-500/20">
              <tr>
                {activeTab === 'requests' && (
                  <>
                    <th className="p-4">ID</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Raw Text</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Region</th>
                    <th className="p-4">Urgency</th>
                    <th className="p-4">Confidence</th>
                  </>
                )}
                {activeTab === 'regions' && (
                  <>
                    <th className="p-4">ID</th>
                    <th className="p-4">Region</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Primary Need</th>
                    <th className="p-4">Citizen Signals</th>
                    <th className="p-4">Infra Gap</th>
                    <th className="p-4">Priority Score</th>
                  </>
                )}
                {activeTab === 'infrastructure' && (
                  <>
                    <th className="p-4">Category</th>
                    <th className="p-4">Coverage %</th>
                    <th className="p-4">Gap %</th>
                    <th className="p-4">Demand Level</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Active Hotspots</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {dataList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  {activeTab === 'requests' && (
                    <>
                      <td className="p-4 font-mono text-cyan-400 font-bold">{item.id}</td>
                      <td className="p-4 text-purple-300 font-semibold">{item.language}</td>
                      <td className="p-4 max-w-xs truncate text-slate-200">{item.rawText}</td>
                      <td className="p-4 font-bold text-slate-100">{item.category}</td>
                      <td className="p-4 text-slate-300">{item.region}</td>
                      <td className="p-4"><span className="text-amber-400 font-bold">{item.urgency}</span></td>
                      <td className="p-4 text-cyan-300 font-bold">{Math.round((item.confidence || 0.94) * 100)}%</td>
                    </>
                  )}
                  {activeTab === 'regions' && (
                    <>
                      <td className="p-4 font-mono text-cyan-400 font-bold">{item.id}</td>
                      <td className="p-4 font-bold text-white">{item.name}</td>
                      <td className="p-4">{item.country}</td>
                      <td className="p-4 text-purple-300 font-semibold">{item.primaryNeed}</td>
                      <td className="p-4 font-bold text-slate-200">{item.citizenRequests?.toLocaleString()}</td>
                      <td className="p-4 text-red-400 font-bold">{item.infrastructureGap}% Deficit</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{item.priorityScore}/100</span></td>
                    </>
                  )}
                  {activeTab === 'infrastructure' && (
                    <>
                      <td className="p-4 font-bold text-white">{item.category}</td>
                      <td className="p-4 text-cyan-300 font-bold">{item.coveragePercent}%</td>
                      <td className="p-4 text-red-400 font-bold">{item.gapPercent}%</td>
                      <td className="p-4 text-amber-400 font-semibold">{item.citizenDemandLevel}</td>
                      <td className="p-4 font-extrabold text-white">{item.investmentAllocated}</td>
                      <td className="p-4 font-bold text-purple-300">{item.activeHotspots}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
