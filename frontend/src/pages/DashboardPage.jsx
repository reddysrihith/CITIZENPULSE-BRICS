import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Users, 
  Flame, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Radio, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import LeafletMap from '../components/maps/LeafletMap';
import { getDashboardData, getHotspots } from '../services/api';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { selectedCountry } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    async function loadData() {
      const db = await getDashboardData();
      const hs = await getHotspots();
      setDashboardData(db);
      setHotspots(hs);
    }
    loadData();
  }, []);

  const kpis = dashboardData?.kpis || {
    totalRequests: 24681,
    highPriority: 4286,
    demandHotspots: 37,
    infrastructureGaps: 82,
    investmentGaps: 21,
    projectedImpact: '8.4M'
  };

  const filteredHotspots = selectedCountry === 'All' 
    ? hotspots 
    : hotspots.filter(h => h.country.toLowerCase() === selectedCountry.toLowerCase());

  const categoryData = dashboardData?.categoryBreakdown || [
    { name: 'Water & Sanitation', count: 7420 },
    { name: 'Roads & Transport', count: 5210 },
    { name: 'Healthcare', count: 3840 },
    { name: 'Education', count: 2950 },
    { name: 'Electricity', count: 2310 },
    { name: 'Digital Conn.', count: 1840 }
  ];

  const urgencyData = dashboardData?.urgencyDistribution || [
    { name: 'Critical', value: 18, color: '#EF4444' },
    { name: 'High', value: 42, color: '#F59E0B' },
    { name: 'Medium', value: 28, color: '#3B82F6' },
    { name: 'Low', value: 12, color: '#10B981' }
  ];

  const timelineData = dashboardData?.requestsTimeline || [
    { month: 'Apr', requests: 3100 },
    { month: 'May', requests: 3800 },
    { month: 'Jun', requests: 4200 },
    { month: 'Jul', requests: 4900 },
    { month: 'Aug', requests: 5600 },
    { month: 'Sep', requests: 6481 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>National Infrastructure Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-white">National Infrastructure Intelligence</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0B1628] px-3 py-1.5 rounded-lg border border-cyan-500/20">
          <span>Active Filter:</span>
          <span className="font-bold text-cyan-300">{selectedCountry} BRICS Markets</span>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Requests" value={kpis.totalRequests.toLocaleString()} change="+12.4%" icon={Users} color="cyan" />
        <StatCard title="High Priority" value={kpis.highPriority.toLocaleString()} change="+8.1%" icon={AlertTriangle} color="red" />
        <StatCard title="Demand Hotspots" value={kpis.demandHotspots} icon={Flame} color="amber" />
        <StatCard title="Infra Gaps" value={kpis.infrastructureGaps} icon={Building2} color="purple" />
        <StatCard title="Investment Gaps" value={kpis.investmentGaps} icon={TrendingUp} color="cyan" />
        <StatCard title="Projected Impact" value={kpis.projectedImpact} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Main Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Citizen Demand & Infrastructure Hotspots</span>
          </h2>
          <span className="text-xs text-slate-400">Showing {filteredHotspots.length} regional hotspots</span>
        </div>

        <LeafletMap 
          hotspots={filteredHotspots} 
          height="500px" 
          onSelectHotspot={(spot) => setSelectedHotspot(spot)} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white">Citizen Request Ingestion Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0B1628', border: '1px solid #22D3EE', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="requests" stroke="#22D3EE" fillOpacity={1} fill="url(#colorReq)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white">Citizen Requests by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip contentStyle={{ background: '#0B1628', border: '1px solid #8B5CF6', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Distribution Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white">Urgency Distribution</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0B1628', border: '1px solid #22D3EE', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {urgencyData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300">{item.name}: <strong>{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
