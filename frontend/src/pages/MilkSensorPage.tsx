import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Milk, Cpu, Activity, Thermometer, FlaskConical, CheckCircle2,
  AlertTriangle, RefreshCw, ArrowRight, ShieldAlert, Info
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

export const MilkSensorPage: React.FC = () => {
  const { selectedAnimalId } = useApp();
  const [stationInfo, setStationInfo] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getMilkSensingStation(),
      api.getAnimalTelemetry(selectedAnimalId, 14)
    ])
      .then(([stRes, telemRes]) => {
        setStationInfo(stRes);
        setTelemetry(telemRes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedAnimalId]);

  const isCow004 = selectedAnimalId === 'COW004';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SMART MILK SENSING CHAMBER
            </span>
            <span className="text-xs text-slate-400">• DEVICE: MILK001</span>
            <span className="text-xs text-slate-400">• STATION: Milking Parlor 1</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Inline Milk Biometrics & Risk Indicator Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conductivity, pH, temperature, and session milk yield captured during vacuum milking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="sensor" label="INLINE MILK SENSORS" size="md" />
        </div>
      </div>

      {/* Critical Indicator Cards (Section 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Conductivity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Milk Conductivity</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {isCow004 ? '6.1' : '5.2'} <span className="text-xs text-slate-400">mS/cm</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-mono">
            <span>Baseline: 5.2 mS/cm</span>
            <strong className={isCow004 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {isCow004 ? '+17.3% (ELEVATED)' : '0.0% (NORMAL)'}
            </strong>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Ion concentration shift (Na+/Cl- influx from blood barrier breakdown).</p>
        </div>

        {/* Milk pH */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Milk pH</span>
            <FlaskConical className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">
            {isCow004 ? '6.78' : '6.62'} <span className="text-xs text-slate-400">pH</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-mono">
            <span>Baseline: 6.62 pH</span>
            <strong className={isCow004 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {isCow004 ? '+2.4% (ALKALINE SHIFT)' : 'NORMAL'}
            </strong>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Normal fresh milk pH: 6.55–6.68. Subclinical shift toward blood pH (7.4).</p>
        </div>

        {/* Milk Yield */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Session Milk Yield</span>
            <Milk className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {isCow004 ? '3.4' : '4.2'} <span className="text-xs text-slate-400">kg/session</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-mono">
            <span>Baseline: 4.2 kg</span>
            <strong className={isCow004 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isCow004 ? '-19.0% (DROP)' : 'STEADY'}
            </strong>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Direct load-cell weigh beam output during morning milking session.</p>
        </div>

        {/* Milk Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Milk Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">
            {isCow004 ? '36.7' : '36.5'} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-mono">
            <span>Baseline: 36.5°C</span>
            <span className="text-emerald-400 font-bold">NORMAL</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Measured inline inside food-grade bypass measuring chamber.</p>
        </div>

      </div>

      {/* Mandatory Diagnostic Disclaimer Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>IMPORTANT RISK INDICATOR NOTICE:</strong> Milk conductivity, pH, temperature and yield are physiological <em>risk indicators</em>. They do not constitute an autonomous diagnosis of clinical mastitis without veterinary examination or laboratory culture.
        </span>
      </div>

      {/* Hardware Architecture & Data Flow Diagram (Section 13) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Sensing Chamber Hardware Architecture & Telemetry Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              End-to-end hardware pipeline from cow udder through ESP32 microcontroller to cloud AI engine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 font-bold">ONLINE & CALIBRATED</span>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 my-4">
          {[
            { step: '1', name: 'Milk Extraction', sub: 'Cow Udder / Claw' },
            { step: '2', name: 'Sensing Chamber', sub: 'Food-Grade Inline Bypass' },
            { step: '3', name: 'Sensor Cluster', sub: 'Cond / pH / Temp / Weight' },
            { step: '4', name: 'ESP32 Micro', sub: 'ADC Sampling & Filtering' },
            { step: '5', name: 'Wi-Fi / REST', sub: 'TLS Ingestion API' },
            { step: '6', name: 'Cloud Database', sub: 'Baseline Matching' },
            { step: '7', name: 'AI Prediction', sub: 'XGBoost 7–14d Risk' }
          ].map((node, nIdx) => (
            <div key={nIdx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center relative flex flex-col justify-between">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs mx-auto mb-1 flex items-center justify-center">
                {node.step}
              </div>
              <div className="text-xs font-bold text-white leading-tight">{node.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{node.sub}</div>
            </div>
          ))}
        </div>

        {/* Hardware Status Diagnostics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Conductivity Sensor Probe:</span>
            <div className="text-white font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>4-Electrode AC Toroidal Cell</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Calibrated with 12.88 mS/cm standard</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">pH Electrode Probe:</span>
            <div className="text-white font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Glass BNC Analog Sensor</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Buffers: pH 4.0 & 7.0 verified</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Load Cell (Milk Yield):</span>
            <div className="text-white font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>HX711 20kg Weigh Beam</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Zero tare verified post-cleaning</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Sanitation & CIP Cleaning:</span>
            <div className="text-white font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clean-In-Place Cycle Done</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Alkaline detergent rinse completed</span>
          </div>
        </div>
      </div>

      {/* 14-Day Conductivity & Yield Correlation Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-white">
              Milk Conductivity and Session Yield vs Baseline (14-Day Timeline)
            </h3>
            <p className="text-xs text-slate-400">
              Notice the inverse correlation: conductivity elevates as session milk yield decreases.
            </p>
          </div>
          <DataSourceBadge source="sensor" label="DUAL INLINE SENSORS" />
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetry?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="left" stroke="#38bdf8" domain={[4.5, 7.0]} fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[2.5, 5.5]} fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left" type="monotone" dataKey="conductivity" stroke="#38bdf8" strokeWidth={2.5} name="Conductivity (mS/cm)" dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="baseline_conductivity" stroke="#38bdf8" strokeDasharray="4 4" name="Cond Baseline" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="milk_yield" stroke="#10b981" strokeWidth={2.5} name="Milk Yield (kg/session)" dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="baseline_milk_yield" stroke="#10b981" strokeDasharray="4 4" name="Yield Baseline" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
