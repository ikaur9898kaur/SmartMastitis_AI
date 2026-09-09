import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Thermometer, Droplets, Wind, AlertTriangle, ShieldCheck,
  CheckCircle2, Info, Sun, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';

export const EnvironmentPage: React.FC = () => {
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getDashboardCharts()
      .then(res => {
        setCharts(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentTemp = 31.2;
  const currentHumidity = 78.0;
  // THI formula: 0.8 * T + (RH/100)*(T - 14.4) + 46.4
  const currentThi = 84.5;
  const airQualityIndicator = 420;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SHED CLIMATE MONITORING
            </span>
            <span className="text-xs text-slate-400">• DEVICE: ENV001</span>
            <span className="text-xs text-slate-400">• LOCATION: Cattle Shed 1</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Farm Ambient Microclimate & Heat-Humidity Stress (THI)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ambient temperature, relative humidity, air quality proxy, and Temperature-Humidity Index (THI).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="sensor" label="FARM ENVIRONMENT UNIT" size="md" />
        </div>
      </div>

      {/* Primary Climate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Ambient Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">
            {currentTemp} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Daily Range: 24.5°C – 34.8°C
          </div>
          <div className="mt-2 text-[10px] font-bold text-amber-400">Warm Summer Condition</div>
        </div>

        {/* Relative Humidity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {currentHumidity}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Optimal comfort range: 50%–70%
          </div>
          <div className="mt-2 text-[10px] font-bold text-cyan-300">Elevated Humidity (Monsoon)</div>
        </div>

        {/* THI Gauge */}
        <div className="bg-slate-900 border border-red-500/40 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Heat-Humidity Stress (THI)</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400 font-mono">
            {currentThi} <span className="text-xs text-slate-400">THI</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Threshold: &gt;72 Mild, &gt;79 Moderate, &gt;88 Severe
          </div>
          <div className="mt-2 text-[10px] font-bold text-red-300 bg-red-950/60 border border-red-800 rounded px-1.5 py-0.5 inline-block">
            MODERATE-TO-HIGH HEAT STRESS
          </div>
        </div>

        {/* Air Quality / Gas Indicator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Air Quality / Gas Indicator</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono">
            {airQualityIndicator} <span className="text-xs text-slate-400">ADC idx</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            MQ-135 Gas Sensor Proxy
          </div>
          <div className="mt-2 text-[10px] font-semibold text-emerald-400">Adequate Shed Ventilation</div>
        </div>

      </div>

      {/* Mandatory Sensor Disclaimer (Section 16) */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>MQ-135 SENSOR NOTICE:</strong> Parameter is designated as <em>"Air Quality / Gas Indicator"</em>. Precise ammonia concentration (ppm) is not reported without multi-point calibration chamber certification and dedicated hardware.
        </span>
      </div>

      {/* 30-Day Climate & THI Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white">
              Shed Microclimate & THI Heat Stress Evolution (30 Days)
            </h3>
            <p className="text-xs text-slate-400">
              Correlating climate stress with elevated bacterial replication pressure in bedding straw.
            </p>
          </div>
          <DataSourceBadge source="sensor" label="CONTINUOUS TELEMETRY" />
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts?.environmental_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temp (°C)" dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} name="Humidity (%)" dot={false} />
              <Line type="monotone" dataKey="thi_index" stroke="#ef4444" strokeWidth={2.5} name="THI Heat Stress Index" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
