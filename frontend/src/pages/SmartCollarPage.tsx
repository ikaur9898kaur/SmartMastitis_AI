import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Cpu, Battery, Wifi, Activity, Moon, Sun, AlertTriangle,
  ArrowDownRight, CheckCircle2, TrendingUp, Info, Thermometer, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';

export const SmartCollarPage: React.FC = () => {
  const { selectedAnimalId, setSelectedAnimalId, t } = useApp();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAnimalTelemetry(selectedAnimalId, 14)
      .then(res => {
        setTelemetry(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedAnimalId]);

  const isCow004 = selectedAnimalId === 'COW004';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SMART COLLAR MONITORING
            </span>
            <span className="text-xs text-slate-400">• DEVICE: COLLAR001</span>
            <span className="text-xs text-slate-400">• ANIMAL: {selectedAnimalId}</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Bovine Smart Collar Telemetry & Activity Deviation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous surface temperature, triaxial motion, resting duration, and behaviour proxy analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="sensor" label="SMART COLLAR TELEMETRY" size="md" />
        </div>
      </div>

      {/* Hardware Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Surface Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Surface Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isCow004 ? '38.4°C' : '38.2°C'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Baseline: 38.2°C ({isCow004 ? '+0.5%' : '0.0%'})
          </div>
          <div className="mt-2 text-[10px] font-semibold text-emerald-400">Normal Range</div>
        </div>

        {/* Activity Level */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Activity Level</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isCow004 ? '42' : '70'} <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Baseline: 68/100
          </div>
          <div className={`mt-2 text-[10px] font-bold ${isCow004 ? 'text-red-400' : 'text-emerald-400'}`}>
            {isCow004 ? '-38% DROP DETECTED' : 'Optimal Mobility'}
          </div>
        </div>

        {/* Movement Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Movement Frequency</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isCow004 ? '18' : '28'} <span className="text-xs text-slate-400">steps/min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Triaxial accelerometer
          </div>
          <div className="mt-2 text-[10px] font-semibold text-slate-300">Continuous sampling</div>
        </div>

        {/* Resting Duration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Resting Duration</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isCow004 ? '5.4' : '3.4'} <span className="text-xs text-slate-400">hrs/day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            8 Lying / 10 Standing
          </div>
          <div className="mt-2 text-[10px] font-semibold text-slate-300">Stall resting pattern</div>
        </div>

        {/* Rumination Proxy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Rumination Proxy</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isCow004 ? '420' : '515'} <span className="text-xs text-slate-400">min/day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Baseline: 510 min/day
          </div>
          <div className={`mt-2 text-[10px] font-bold ${isCow004 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isCow004 ? '-17.6% (Estimated)' : 'Normal Chewing'}
          </div>
        </div>

        {/* Device Battery & Signal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Collar Power</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            82%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" /> Signal: Good (Wi-Fi)
          </div>
          <div className="mt-2 text-[10px] font-semibold text-slate-400">ESP32 Telemetry Unit</div>
        </div>

      </div>

      {/* Mandatory Prototype Labeling Notice (Section 10) */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>HARDWARE PROXY NOTICE:</strong> Rumination is designated as <em>"Estimated Rumination / Behaviour Proxy"</em> based on motion pattern clustering. Direct rumination measurement requires dedicated validated acoustic/bolus sensors.
        </span>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Activity Deviation vs Baseline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-white">
                Collar Activity vs Individual Baseline (14-Day Timeline)
              </h3>
              <p className="text-xs text-slate-400">
                Notice the marked decline starting at Day -7 in {selectedAnimalId}.
              </p>
            </div>
            <DataSourceBadge source="sensor" label="ACCELEROMETER" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[30, 85]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="activity" stroke="#f59e0b" strokeWidth={2.5} name="Current Activity" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="baseline_activity" stroke="#64748b" strokeDasharray="4 4" name="Baseline (68.0)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rumination Proxy vs Baseline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-white">
                Estimated Rumination Proxy vs Individual Baseline
              </h3>
              <p className="text-xs text-slate-400">
                Subclinical mastitis inflammation causes reduced feeding and cud-chewing duration.
              </p>
            </div>
            <DataSourceBadge source="sensor" label="BEHAVIOUR ESTIMATION" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[380, 560]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="rumination" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="Rumination (min/day)" />
                <Line type="monotone" dataKey="baseline_rumination" stroke="#64748b" strokeDasharray="4 4" name="Baseline (510 min)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
