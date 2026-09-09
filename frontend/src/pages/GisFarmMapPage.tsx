import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  MapPin, AlertTriangle, ShieldAlert, CheckCircle2,
  Building, Milk, HeartPulse, Info
} from 'lucide-react';

export const GisFarmMapPage: React.FC = () => {
  const { setSelectedAnimalId, setActiveTab } = useApp();
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  useEffect(() => {
    api.getFarmMap()
      .then(res => {
        setMapData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !mapData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { sheds, facilities, animal_markers, hotspot_analysis } = mapData;

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker);
  };

  const handleNavigateProfile = (animalId: string) => {
    setSelectedAnimalId(animalId);
    setActiveTab('animalProfile');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GIS SPATIAL RISK MAP
            </span>
            <span className="text-xs text-slate-400">• GPS: 30.9010° N, 75.8573° E (Punjab)</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Farm Spatial Topography & Mastitis Disease Hotspot Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual geolocation of cattle sheds, milking parlor, isolation pen, and animal pins with risk stratification.
          </p>
        </div>

        <DataSourceBadge source="sensor" label="GPS / SHED SENSORS" size="md" />
      </div>

      {/* Hotspot Alert Banner */}
      {hotspot_analysis.hotspot_detected && (
        <div className="p-4 rounded-xl bg-orange-950/40 border border-orange-500/50 text-orange-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <strong className="text-sm font-bold text-white block">
                {hotspot_analysis.message}
              </strong>
              <span className="text-xs text-orange-300/90">{hotspot_analysis.recommendation}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-orange-500 text-slate-950 font-mono font-black text-xs shrink-0">
            {hotspot_analysis.high_risk_count} HIGH-RISK ANIMALS
          </span>
        </div>
      )}

      {/* Farm GIS Layout & Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Map Layout (SVG Grid Representation) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative min-h-[480px] flex flex-col justify-between overflow-hidden">
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs z-10 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 w-fit">
            <span className="text-slate-400 font-bold">Risk Levels:</span>
            <span className="flex items-center gap-1 font-mono text-[11px]"><span className="w-3 h-3 rounded-full bg-emerald-500" /> No Risk</span>
            <span className="flex items-center gap-1 font-mono text-[11px]"><span className="w-3 h-3 rounded-full bg-blue-500" /> Low</span>
            <span className="flex items-center gap-1 font-mono text-[11px]"><span className="w-3 h-3 rounded-full bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1 font-mono text-[11px]"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</span>
            <span className="flex items-center gap-1 font-mono text-[11px]"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</span>
          </div>

          {/* Interactive Spatial Grid */}
          <div className="relative w-full h-80 my-4 border border-dashed border-slate-800 rounded-xl bg-slate-900/40 p-4">
            
            {/* Shed 1 (Top Left) */}
            <div className="absolute top-4 left-4 w-44 h-32 rounded-xl border border-slate-700 bg-slate-800/40 p-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-cyan-400" /> Shed 1 (Cattle)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Zone A • Clean straw</span>
            </div>

            {/* Shed 2 (Top Right — HOTSPOT) */}
            <div className="absolute top-4 right-4 w-48 h-32 rounded-xl border-2 border-orange-500/70 bg-orange-950/20 p-2 text-xs shadow-lg shadow-orange-950/40">
              <span className="font-bold text-orange-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Shed 2 (Hotspot Cluster)
              </span>
              <span className="text-[10px] text-orange-400/80 block mt-0.5">High humidity + damp bedding</span>
            </div>

            {/* Central Milking Parlor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-2 text-xs text-center flex flex-col items-center justify-center">
              <Milk className="w-4 h-4 text-cyan-400 mb-0.5" />
              <span className="font-bold text-cyan-300">Central Milking Parlor</span>
              <span className="text-[10px] text-slate-400">Inline Sensing Units 1 & 2</span>
            </div>

            {/* Shed 3 (Bottom Left) */}
            <div className="absolute bottom-4 left-4 w-44 h-28 rounded-xl border border-slate-700 bg-slate-800/40 p-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> Shed 3 (Buffaloes)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Murrah & Nili-Ravi</span>
            </div>

            {/* Isolation Pen (Bottom Right) */}
            <div className="absolute bottom-4 right-4 w-44 h-28 rounded-xl border border-red-500/50 bg-red-950/20 p-2 text-xs">
              <span className="font-bold text-red-300 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-red-400" /> Isolation Pen
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Active treatment pen</span>
            </div>

            {/* Animal Pins Placed on Map */}
            {/* COW001 in Shed 1 */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW001', breed: 'Sahiwal', species: 'Cow', risk_level: 'NO RISK', risk_probability: 0.08, shed: 'Shed 1', pen: 'Pen 1' })}
              className="absolute top-16 left-10 p-1.5 rounded-full bg-emerald-500 text-white shadow-md hover:scale-125 transition-transform"
              title="COW001 (No Risk)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </button>

            {/* COW002 in Shed 1 */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW002', breed: 'HF', species: 'Cow', risk_level: 'LOW RISK', risk_probability: 0.27, shed: 'Shed 1', pen: 'Pen 4' })}
              className="absolute top-20 left-28 p-1.5 rounded-full bg-blue-500 text-white shadow-md hover:scale-125 transition-transform"
              title="COW002 (Low Risk)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </button>

            {/* COW004 in Shed 2 (High Risk Hotspot) */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW004', breed: 'Holstein Friesian', species: 'Cow', risk_level: 'HIGH RISK', risk_probability: 0.74, shed: 'Shed 2', pen: 'Pen 4' })}
              className="absolute top-14 right-24 p-2 rounded-full bg-orange-500 text-white shadow-xl shadow-orange-950/60 animate-bounce"
              title="COW004 (High Risk — 74%)"
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </button>

            {/* COW009 in Shed 2 (Moderate Risk) */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW009', breed: 'HF', species: 'Cow', risk_level: 'MODERATE RISK', risk_probability: 0.46, shed: 'Shed 2', pen: 'Pen 3' })}
              className="absolute top-20 right-10 p-1.5 rounded-full bg-amber-500 text-white shadow-md hover:scale-125 transition-transform"
              title="COW009 (Moderate Risk — 46%)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </button>

            {/* COW013 in Shed 2 (High Risk) */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW013', breed: 'HF', species: 'Cow', risk_level: 'HIGH RISK', risk_probability: 0.72, shed: 'Shed 2', pen: 'Pen 5' })}
              className="absolute top-24 right-32 p-1.5 rounded-full bg-orange-500 text-white shadow-md hover:scale-125 transition-transform"
              title="COW013 (High Risk — 72%)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </button>

            {/* COW005 in Isolation Pen (Critical) */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'COW005', breed: 'Crossbred', species: 'Cow', risk_level: 'CRITICAL RISK', risk_probability: 0.88, shed: 'Isolation Pen', pen: 'Pen 6' })}
              className="absolute bottom-12 right-16 p-2 rounded-full bg-red-500 text-white shadow-xl shadow-red-950/60 animate-pulse"
              title="COW005 (Critical Risk — 88%)"
            >
              <div className="w-3 h-3 rounded-full bg-white" />
            </button>

            {/* BUF001 in Shed 3 */}
            <button
              onClick={() => handleMarkerClick({ animal_id: 'BUF001', breed: 'Murrah', species: 'Buffalo', risk_level: 'NO RISK', risk_probability: 0.11, shed: 'Shed 3', pen: 'Pen 1' })}
              className="absolute bottom-12 left-16 p-1.5 rounded-full bg-emerald-500 text-white shadow-md hover:scale-125 transition-transform"
              title="BUF001 (No Risk)"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </button>

          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Click any animal pin to inspect location coordinates and risk profile.
          </div>
        </div>

        {/* Selected Marker Details Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white mb-3">
              Spatial Geolocation & Hotspot Inspector
            </h3>

            {selectedMarker ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">{selectedMarker.animal_id}</span>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                    selectedMarker.risk_level === 'HIGH RISK' ? 'bg-orange-500 text-white' :
                    selectedMarker.risk_level === 'CRITICAL RISK' ? 'bg-red-500 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {selectedMarker.risk_level}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div>Species / Breed: <strong>{selectedMarker.species} • {selectedMarker.breed}</strong></div>
                  <div>Assigned Shed: <strong>{selectedMarker.shed}</strong></div>
                  <div>Pen: <strong>{selectedMarker.pen}</strong></div>
                  <div>Risk Probability: <strong>{int(selectedMarker.risk_probability * 100)}%</strong></div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleNavigateProfile(selectedMarker.animal_id)}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center"
                  >
                    Open Animal Health Dossier &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Select any animal pin or shed zone on the farm map to inspect details.
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong>HARDWARE NOTE:</strong> Shed-level and pen zoning are mapped from IoT gateway beacon triangulation and pen tags when individual GPS collars are not fitted.
          </div>
        </div>

      </div>

    </div>
  );
};

function int(val: number) {
  return Math.round(val);
}
