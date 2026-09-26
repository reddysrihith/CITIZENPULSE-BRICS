import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Flame, Droplets, Truck, HeartPulse, Zap, Wifi } from 'lucide-react';

export default function LeafletMap({ hotspots = [], height = "480px", onSelectHotspot }) {
  // Center near India/Global BRICS view
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 4;

  const getPriorityColor = (score) => {
    if (score >= 87) return '#EF4444'; // Danger Red
    if (score >= 80) return '#F59E0B'; // Warning Amber
    return '#22D3EE'; // Primary Cyan
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden border border-cyan-500/20 relative shadow-xl">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {hotspots.map((item) => {
          const radius = Math.min(28, Math.max(12, Math.round((item.citizenRequests / 3000) * 26 + 10)));
          const color = getPriorityColor(item.priorityScore);

          return (
            <CircleMarker
              key={item.id || item.name}
              center={[item.lat, item.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                weight: 2
              }}
              eventHandlers={{
                click: () => onSelectHotspot && onSelectHotspot(item)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span 
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: color }}
                    >
                      {item.priorityScore}/100
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <p><strong className="text-cyan-400">Country:</strong> {item.country}</p>
                    <p><strong className="text-cyan-400">Top Need:</strong> {item.primaryNeed}</p>
                    <p><strong className="text-cyan-400">Citizen Signals:</strong> {item.citizenRequests.toLocaleString()}</p>
                    <p><strong className="text-cyan-400">Infra Gap:</strong> {item.infrastructureGap}% Deficit</p>
                    <p><strong className="text-cyan-400">Affected Pop:</strong> {item.affectedPopulation ? item.affectedPopulation.toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Priority Engine</span>
                    <span className="text-[10px] text-cyan-300 font-bold hover:underline cursor-pointer">
                      Inspect Hotspot →
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-[#0B1628]/90 backdrop-blur-md p-3 rounded-lg border border-cyan-500/20 text-[11px] text-slate-300 space-y-1.5 shadow-lg">
        <p className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Priority Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Critical Hotspot (87+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>High Priority (80 - 86)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
          <span>Moderate Priority (&lt; 80)</span>
        </div>
        <p className="text-[9px] text-slate-500 pt-1 border-t border-slate-700/50">Marker size = Citizen Signal Volume</p>
      </div>
    </div>
  );
}
