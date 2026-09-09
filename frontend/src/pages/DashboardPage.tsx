import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp,
  Activity, Milk, Thermometer, Droplets, HeartPulse, Eye,
  Info, ChevronRight, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, BarChart, Bar, Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { t, setActiveTab, setSelectedAnimalId } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [highRiskAnimals, setHighRiskAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getDashboardCharts(),
      api.getAnimals({ risk_level: 'HIGH RISK', limit: 5 })
    ])
      .then(([statsRes, chartsRes, highRes]) => {
        setStats(statsRes);
        setCharts(chartsRes);
        setHighRiskAnimals(highRes.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data', err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats || !charts) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-sm">Loading Smart Dairy Farm Telemetry...</p>
        </div>
      </div>
    );
  }

  const { herd_strength, mastitis_risk, averages } = stats;

  const handleAnimalClick = (animalId: string) => {
    setSelectedAnimalId(animalId);
    setActiveTab('animalProfile');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Farm Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE PRODUCTION FARM
              </span>
              <span className="text-xs text-slate-400">• FARM ID: {stats.farm_id}</span>
              <span className="text-xs text-slate-400">• {stats.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {stats.farm_name} — Livestock Health Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Real-time multi-sensor telemetry fusion & AI early warning engine for dairy cattle and buffaloes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="ai" label="AI RISK ENGINE" size="md" />
            <DataSourceBadge source="sensor" label="ESP32 SENSORS" size="md" />
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="mt-4 px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>IMPORTANT:</strong> {t.decisionSupportDisclaimer}
          </span>
        </div>
      </div>

      {/* Large Risk Category Summary Cards (Section 4, 38) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Animals */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-md cursor-pointer hover:border-slate-500 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>TOTAL ANIMALS</span>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </div>
          <div className="text-3xl font-black text-white">{herd_strength.total_animals}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            65 Cattle • 15 Buffaloes
          </div>
        </div>

        {/* NO RISK */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 shadow-md cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold mb-1">
            <span>NO RISK</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-300">{mastitis_risk.no_risk}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            Normal baseline (0–20%)
          </div>
        </div>

        {/* LOW RISK */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-4 shadow-md cursor-pointer hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between text-blue-400 text-xs font-bold mb-1">
            <span>LOW RISK</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-300">{mastitis_risk.low_risk}</div>
          <div className="text-[11px] text-blue-400/80 mt-1">
            Mild variance (20–40%)
          </div>
        </div>

        {/* MODERATE RISK */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 shadow-md cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold mb-1">
            <span>MODERATE RISK</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{mastitis_risk.moderate_risk}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Elevated watch (40–60%)
          </div>
        </div>

        {/* HIGH RISK */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-orange-950/40 border border-orange-500/50 rounded-xl p-4 shadow-md cursor-pointer hover:border-orange-400 transition-all group"
        >
          <div className="flex items-center justify-between text-orange-400 text-xs font-bold mb-1">
            <span>HIGH RISK</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-orange-300">{mastitis_risk.high_risk}</div>
          <div className="text-[11px] text-orange-400/80 mt-1">
            7–14d Warning (60–80%)
          </div>
        </div>

        {/* CRITICAL RISK */}
        <div 
          onClick={() => setActiveTab('herd')}
          className="bg-red-950/40 border border-red-500/50 rounded-xl p-4 shadow-md cursor-pointer hover:border-red-400 transition-all group"
        >
          <div className="flex items-center justify-between text-red-400 text-xs font-bold mb-1">
            <span>CRITICAL RISK</span>
            <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-300">{mastitis_risk.critical_risk}</div>
          <div className="text-[11px] text-red-400/80 mt-1">
            Immediate Action (80–100%)
          </div>
        </div>

      </div>

      {/* Herd Sub-Strength & Operational Averages Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs">
        <div>
          <span className="text-slate-400 block">Lactating:</span>
          <span className="font-bold text-white text-sm">{herd_strength.lactating} animals</span>
        </div>
        <div>
          <span className="text-slate-400 block">Dry Period:</span>
          <span className="font-bold text-white text-sm">{herd_strength.dry} animals</span>
        </div>
        <div>
          <span className="text-slate-400 block">Pregnant:</span>
          <span className="font-bold text-white text-sm">{herd_strength.pregnant} animals</span>
        </div>
        <div>
          <span className="text-slate-400 block">Recently Calved:</span>
          <span className="font-bold text-emerald-400 text-sm">{herd_strength.recently_calved} animals</span>
        </div>
        <div>
          <span className="text-slate-400 block">Under Treatment:</span>
          <span className="font-bold text-red-400 text-sm">{averages.animals_under_treatment} animals</span>
        </div>
        <div>
          <span className="text-slate-400 block">Avg Milk Yield:</span>
          <span className="font-bold text-white text-sm">{averages.average_milk_yield} kg/day</span>
        </div>
        <div>
          <span className="text-slate-400 block">Avg Conductivity:</span>
          <span className="font-bold text-cyan-400 text-sm">{averages.average_conductivity} mS/cm</span>
        </div>
        <div>
          <span className="text-slate-400 block">Devices Offline:</span>
          <span className={`font-bold text-sm ${averages.devices_offline > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {averages.devices_offline} unit
          </span>
        </div>
      </div>

      {/* Flagged High-Risk Animal Showcase */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/40 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">
              Prioritized Animals for Clinical & Teat Inspection (Next 7–14 Days)
            </h3>
          </div>
          <span className="text-xs text-orange-300 font-mono">
            Requires Physical Examination by Veterinarian
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Animal ID</th>
                <th className="py-2 px-3">Tag / RFID</th>
                <th className="py-2 px-3">Species & Breed</th>
                <th className="py-2 px-3">Risk Probability</th>
                <th className="py-2 px-3">Key Warning Signals</th>
                <th className="py-2 px-3">Shed / Pen</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {highRiskAnimals.map((a: any) => (
                <tr key={a.animal_id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{a.animal_id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{a.tag_number}</td>
                  <td className="py-2.5 px-3">{a.species} • {a.breed}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                      {a.risk_percentage}% HIGH RISK
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {a.animal_id === 'COW004' 
                      ? 'Conductivity ↑17%, Yield ↓19%, Activity ↓38%, Poor Bedding'
                      : 'Conductivity elevation & rumination drop detected'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{a.shed} / {a.pen}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleAnimalClick(a.animal_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10 Interactive Charts (Section 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. Herd Risk Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              1. Herd Mastitis Risk Distribution
            </h3>
            <DataSourceBadge source="ai" label="AI RISK STRATIFICATION" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.risk_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {charts.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-1">
            Total: 80 animals • 45 No Risk (56%) • 18 Low (23%) • 10 Moderate (12%) • 5 High (6%) • 2 Critical (3%)
          </p>
        </div>

        {/* 2. Mastitis Risk Trend (30 Days) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              2. Mastitis Risk Category Trend (30-Day Timeline)
            </h3>
            <DataSourceBadge source="ai" label="7–14d FORECAST" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.risk_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="no_risk" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="No Risk" />
                <Area type="monotone" dataKey="low_risk" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Low Risk" />
                <Area type="monotone" dataKey="moderate_risk" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} name="Moderate Risk" />
                <Area type="monotone" dataKey="high_risk" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.5} name="High Risk" />
                <Area type="monotone" dataKey="critical_risk" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Critical Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Milk Yield Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Milk className="w-4 h-4 text-cyan-400" />
              3. Average Herd Milk Yield (kg/head/day)
            </h3>
            <DataSourceBadge source="sensor" label="MILK SENSING CHAMBER" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.milk_yield_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[13, 18]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="herd_average" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Actual Yield" />
                <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="4 4" dot={false} name="Baseline Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. SCC Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              4. Average Somatic Cell Count (SCC cells/mL)
            </h3>
            <DataSourceBadge source="lab" label="LABORATORY / SCC" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.scc_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="average_scc" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Herd SCC" />
                <Line type="monotone" dataKey="threshold_limit" stroke="#ef4444" strokeDasharray="4 4" dot={false} name="Subclinical Limit (250k)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Milk Conductivity Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              5. Electrical Conductivity Trend (mS/cm)
            </h3>
            <DataSourceBadge source="sensor" label="ELECTRODE SENSOR" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.conductivity_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[4.8, 5.8]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="average_conductivity" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Avg Conductivity" />
                <Line type="monotone" dataKey="normal_baseline" stroke="#10b981" strokeDasharray="3 3" dot={false} name="Healthy Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Collar Activity Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              6. Smart Collar Activity Index (/100)
            </h3>
            <DataSourceBadge source="sensor" label="SMART COLLAR" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.activity_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[55, 75]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="average_activity" stroke="#10b981" strokeWidth={2.5} dot={false} name="Collar Activity" />
                <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="4 4" dot={false} name="Baseline (68.0)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Rumination Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              7. Rumination Duration (min/day)
            </h3>
            <DataSourceBadge source="sensor" label="ESTIMATED BEHAVIOUR PROXY" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.rumination_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" domain={[450, 550]} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="average_rumination" stroke="#14b8a6" strokeWidth={2.5} dot={false} name="Rumination" />
                <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="4 4" dot={false} name="Standard (510 min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Shed Environmental & Heat Stress Index (THI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              8. Shed Climate & Heat-Humidity Stress (THI)
            </h3>
            <DataSourceBadge source="sensor" label="SHED SENSOR UNIT" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.environmental_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                <Line type="monotone" dataKey="thi_index" stroke="#ef4444" strokeWidth={2.5} dot={false} name="THI Heat Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. New High-Risk Animals Flagged */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              9. New High-Risk Animals Flagged (7–14d Lead Time)
            </h3>
            <DataSourceBadge source="ai" label="AI PREDICTIVE FLAG" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.new_high_risk_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" allowDecimals={false} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="new_flagged" fill="#f97316" radius={[4, 4, 0, 0]} name="New Flags" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10. Confirmed Cases & Recoveries */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              10. Clinical Veterinary Cases & Recoveries
            </h3>
            <DataSourceBadge source="manual" label="VET CONFIRMED RECORD" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.confirmed_cases_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" allowDecimals={false} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="active_confirmed_cases" stroke="#ef4444" strokeWidth={2.5} name="Under Treatment" />
                <Line type="monotone" dataKey="recovered_cases" stroke="#10b981" strokeWidth={2.5} name="Recovered Animals" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
