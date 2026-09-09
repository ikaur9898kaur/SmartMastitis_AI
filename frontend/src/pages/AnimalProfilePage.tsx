import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  HeartPulse, ShieldAlert, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown, Clock, Activity, Milk, Thermometer,
  Calendar, Award, Stethoscope, Syringe, FileText, Utensils,
  ChevronDown, ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

export const AnimalProfilePage: React.FC = () => {
  const { selectedAnimalId, setSelectedAnimalId, t, role, showNotification } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeRange, setActiveRange] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'sensors' | 'history' | 'vaccines' | 'treatments' | 'lab'>('sensors');
  const [loading, setLoading] = useState<boolean>(true);

  const demoAnimals = [
    { id: 'COW004', label: 'COW004 (HF Cow — 74% HIGH RISK)' },
    { id: 'COW001', label: 'COW001 (Sahiwal Cow — 8% NO RISK)' },
    { id: 'COW002', label: 'COW002 (HF Cow — 27% LOW RISK)' },
    { id: 'COW003', label: 'COW003 (Murrah Buffalo — 51% MODERATE RISK)' },
    { id: 'COW005', label: 'COW005 (Crossbred Cow — 88% CRITICAL RISK)' },
    { id: 'BUF001', label: 'BUF001 (Murrah Buffalo — 11% NO RISK)' },
    { id: 'COW006', label: 'COW006 (Gir Cow — 9% NO RISK)' },
  ];

  const loadData = (animalId: string, range: number) => {
    setLoading(true);
    Promise.all([
      api.getAnimalProfile(animalId),
      api.getPrediction(animalId),
      api.getAnimalTelemetry(animalId, range)
    ])
      .then(([profRes, predRes, telemRes]) => {
        setProfile(profRes);
        setPrediction(predRes);
        setTelemetry(telemRes);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load animal profile', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData(selectedAnimalId, activeRange);
  }, [selectedAnimalId, activeRange]);

  if (loading || !profile || !prediction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-sm">Retrieving Digital Health Profile for {selectedAnimalId}...</p>
        </div>
      </div>
    );
  }

  const { animal, individual_baseline, deviations, vaccination_history, disease_history, active_treatments, latest_lab_result } = profile;

  return (
    <div className="space-y-6">
      
      {/* Top Animal Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {animal.animal_id.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{animal.animal_id}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {animal.tag_number}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                animal.species === 'Buffalo' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-300'
              }`}>
                {animal.species} • {animal.breed}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Age: {animal.age_years} yrs • Lactation: {animal.lactation_number} (DIM {animal.days_in_lactation}d) • {animal.shed} / {animal.pen}
            </p>
          </div>
        </div>

        {/* Quick Demo Animal Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Switch Animal:</span>
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            {demoAnimals.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 7-14 Day Predictive Risk Banner (Section 37, 38) */}
      <div className={`p-5 rounded-2xl border shadow-xl relative overflow-hidden ${
        prediction.risk_level === 'CRITICAL RISK' ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-500/60 text-red-100' :
        prediction.risk_level === 'HIGH RISK' ? 'bg-gradient-to-r from-orange-950/70 via-slate-900 to-slate-900 border-orange-500/60 text-orange-100' :
        prediction.risk_level === 'MODERATE RISK' ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/50 text-amber-100' :
        'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/50 text-emerald-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <DataSourceBadge source="ai" label="XGBoost PREDICTIVE MODEL" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                FORECAST HORIZON: {prediction.forecast_horizon}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                {prediction.risk_level === 'HIGH RISK' || prediction.risk_level === 'CRITICAL RISK' ? (
                  <ShieldAlert className="w-6 h-6 text-orange-400 shrink-0 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
                {prediction.alert_banner}
              </h2>
              <span className={`text-sm px-3 py-1 rounded-full font-black font-mono border ${
                prediction.risk_level === 'CRITICAL RISK' ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/50' :
                prediction.risk_level === 'HIGH RISK' ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-900/50' :
                prediction.risk_level === 'MODERATE RISK' ? 'bg-amber-500 text-slate-950 border-amber-400' :
                'bg-emerald-600 text-white border-emerald-500'
              }`}>
                {prediction.risk_percentage}% RISK PROBABILITY
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {prediction.confidence_note}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Previous Mastitis Episodes:</div>
            <div className="text-lg font-bold text-white">
              {animal.previous_mastitis ? `${animal.previous_mastitis_count} prior case(s)` : 'None'}
            </div>
            <div className="text-xs text-slate-400 mt-1">Vaccination Status:</div>
            <span className="text-xs font-bold text-emerald-400">{animal.vaccination_status}</span>
          </div>
        </div>

        {/* Regulatory Safeguard Notice */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{prediction.diagnostic_disclaimer}</span>
        </div>
      </div>

      {/* Explainable AI & Recommendations (Section 39, 40) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Why is this animal at risk? (SHAP-style Contributing Factors) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <h3 className="font-bold text-base text-white">
                WHY IS THIS ANIMAL AT RISK? (Explainable AI Factors)
              </h3>
            </div>
            <DataSourceBadge source="ai" label="FEATURE CONTRIBUTION" />
          </div>

          {prediction.contributing_factors.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-300 text-sm">No significant abnormal deviation detected.</p>
              <p className="mt-1">All physiological collar telemetry and milk conductivity measurements align with the individual baseline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prediction.contributing_factors.map((factor: any, fIdx: number) => (
                <div 
                  key={fIdx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                    <span className="text-white text-sm">{factor.feature}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      factor.impact_level === 'High' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {factor.impact_level} Impact
                    </span>
                  </div>

                  <p className="text-slate-300 font-medium mb-2">{factor.description}</p>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                    <div>
                      <span>Current: </span>
                      <strong className="text-white">{factor.current_value}</strong>
                    </div>
                    <div>
                      <span>Baseline: </span>
                      <strong className="text-slate-300">{factor.baseline_value}</strong>
                    </div>
                    <div>
                      <span>Change: </span>
                      <strong className={factor.change_pct > 0 ? 'text-amber-400' : 'text-cyan-400'}>
                        {factor.change_pct > 0 ? `+${factor.change_pct}%` : `${factor.change_pct}%`}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Preventive & Corrective Decision-Support Recommendations (Section 40) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white">
                Decision-Support Recommendations
              </h3>
              <DataSourceBadge source="manual" label="VET PROTOCOL" />
            </div>

            <div className="space-y-2.5">
              {prediction.recommendations.map((rec: string, rIdx: number) => (
                <div key={rIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {rIdx + 1}
                  </div>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/50 text-[10px] text-slate-400 border border-slate-700/60">
            <strong>VETERINARY PRECAUTION:</strong> Recommendations support decision-making. The system does not autonomously diagnose disease or prescribe prescription antimicrobial medication.
          </div>
        </div>

      </div>

      {/* Individual Animal Baseline vs Current Values (Section 32) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Individual Animal Baseline vs Current Telemetry</span>
              <span className="text-xs font-normal text-slate-400">(Calculated from {individual_baseline.calculated_days} days of normal history)</span>
            </h3>
            <p className="text-xs text-slate-400">
              AI evaluates relative deviations against the animal's own physiological baseline rather than rigid static thresholds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {deviations.map((dev: any, dIdx: number) => (
            <div key={dIdx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs shadow-md">
              <div className="text-slate-400 font-medium mb-1 truncate" title={dev.metric}>
                {dev.metric}
              </div>

              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-xl font-black text-white">{dev.current}</span>
                <span className="text-slate-400 text-[10px]">{dev.unit}</span>
              </div>

              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Baseline: <span className="text-slate-300">{dev.baseline}</span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                <span className={`font-mono font-bold text-xs flex items-center ${
                  dev.percentage_change > 0 ? 'text-amber-400' : (dev.percentage_change < 0 ? 'text-cyan-400' : 'text-slate-400')
                }`}>
                  {dev.percentage_change > 0 ? `+${dev.percentage_change}%` : `${dev.percentage_change}%`}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  dev.status === 'Critical' ? 'bg-red-950 text-red-300' :
                  dev.status.includes('Drop') || dev.status.includes('Decreased') || dev.status === 'Elevated' ? 'bg-amber-950 text-amber-300' :
                  'bg-emerald-950 text-emerald-300'
                }`}>
                  {dev.status}
                </span>
              </div>

              <div className="mt-2 text-[9px] text-slate-400 truncate">
                {dev.source}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Timeline with Baseline Overlays & Timescale Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-white">
              Multi-Parameter Time-Series Telemetry & Baseline Overlay
            </h3>
            <p className="text-xs text-slate-400">
              Correlated telemetry showing milk conductivity rise, yield drop, and activity decline over time.
            </p>
          </div>

          {/* Time Window Buttons (24h, 7d, 14d, 30d, 90d) */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            {[
              { days: 1, label: '24 Hours' },
              { days: 7, label: '7 Days' },
              { days: 14, label: '14 Days' },
              { days: 30, label: '30 Days' },
              { days: 90, label: '90 Days' },
            ].map(range => (
              <button
                key={range.days}
                onClick={() => setActiveRange(range.days)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeRange === range.days
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Chart Row: Conductivity & Yield vs Activity & Rumination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          
          {/* Chart 1: Milk Conductivity & Milk Yield */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Milk Conductivity vs Milk Yield (per session)</span>
              <DataSourceBadge source="sensor" label="MILK SENSING CHAMBER" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#38bdf8" domain={[4.5, 7.0]} fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[2.0, 6.0]} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="conductivity" stroke="#38bdf8" strokeWidth={2.5} name="Conductivity (mS/cm)" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="baseline_conductivity" stroke="#38bdf8" strokeDasharray="4 4" name="Conductivity Baseline" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="milk_yield" stroke="#10b981" strokeWidth={2.5} name="Milk Yield (kg)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="baseline_milk_yield" stroke="#10b981" strokeDasharray="4 4" name="Yield Baseline" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Smart Collar Activity & Estimated Rumination */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Smart Collar Activity & Rumination Duration</span>
              <DataSourceBadge source="sensor" label="COLLAR & BEHAVIOUR PROXY" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#f59e0b" domain={[30, 85]} fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" domain={[350, 560]} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="activity" stroke="#f59e0b" strokeWidth={2.5} name="Activity (/100)" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="baseline_activity" stroke="#f59e0b" strokeDasharray="4 4" name="Activity Baseline" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rumination" stroke="#14b8a6" strokeWidth={2.5} name="Rumination (min/day)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="baseline_rumination" stroke="#14b8a6" strokeDasharray="4 4" name="Rumination Baseline" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Animal Health Dossier Details Tabs (Vaccinations, Treatments, Disease History, Lab SCC) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex border-b border-slate-800 space-x-4 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('vaccines')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'vaccines' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Vaccination Records ({vaccination_history.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Disease History Timeline ({disease_history.length})
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'treatments' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Active Treatments & Medication ({active_treatments.length})
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'lab' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Laboratory & SCC Results
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'vaccines' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>MANUALLY ENTERED VACCINATIONS (Veterinarian / Authorized Farmer)</span>
              <DataSourceBadge source="manual" label="MANUAL VET ENTRY" />
            </div>
            {vaccination_history.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No vaccination records logged for this animal.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 font-mono uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Vaccine Name</th>
                      <th className="py-2.5 px-3">Date Administered</th>
                      <th className="py-2.5 px-3">Next Due Date</th>
                      <th className="py-2.5 px-3">Administered By</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {vaccination_history.map((v: any, vIdx: number) => (
                      <tr key={vIdx}>
                        <td className="py-2.5 px-3 font-bold text-white">{v.vaccine_name}</td>
                        <td className="py-2.5 px-3 font-mono">{v.date_administered}</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300">{v.next_due_date}</td>
                        <td className="py-2.5 px-3">{v.administered_by}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{v.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>CHRONOLOGICAL HEALTH & DISEASE HISTORY</span>
              <DataSourceBadge source="manual" label="CLINICAL RECORD" />
            </div>
            <div className="space-y-2">
              {disease_history.map((d: any, dIdx: number) => (
                <div key={dIdx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{d.disease_name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-slate-800 text-slate-300">{d.status}</span>
                    </div>
                    <p className="text-slate-400 mt-1">Diagnosis Date: {d.diagnosis_date} • Diagnosed by: {d.recorded_by}</p>
                    <p className="text-slate-300 mt-0.5">Evidence: {d.evidence}</p>
                    {d.treatment && <p className="text-emerald-400 mt-0.5">Treatment: {d.treatment}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {d.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>VETERINARY TREATMENT RECORDS & WITHDRAWAL PERIODS</span>
              <DataSourceBadge source="manual" label="VET PRESCRIPTION" />
            </div>
            {active_treatments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No active treatments. Animal is not currently on medication.</p>
            ) : (
              active_treatments.map((tRec: any, tIdx: number) => (
                <div key={tIdx} className="p-4 rounded-xl bg-slate-950 border border-red-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-red-300">{tRec.condition}</span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-800 font-mono">
                      WITHDRAWAL: {tRec.withdrawal_period_days} DAYS
                    </span>
                  </div>
                  <p className="text-white font-semibold">Medicine: {tRec.medicine_name} ({tRec.dosage})</p>
                  <p className="text-slate-300">Veterinarian: {tRec.veterinarian} • Start Date: {tRec.start_date}</p>
                  <p className="text-amber-300">Notice: {tRec.remarks}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>REFERENCE LABORATORY / SOMATIC CELL COUNT (SCC)</span>
              <DataSourceBadge source="lab" label="LABORATORY DATA" />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Latest Somatic Cell Count:</span>
                  <div className="text-2xl font-black text-purple-300 font-mono">
                    {latest_lab_result.scc.toLocaleString()} <span className="text-sm">cells/mL</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400">California Mastitis Test (CMT):</span>
                  <div className="text-lg font-bold text-white">{latest_lab_result.cmt_result}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <div>Culture Result: <strong>{latest_lab_result.culture_result}</strong></div>
                <div>Laboratory: <strong>{latest_lab_result.laboratory}</strong></div>
                <div>Sample Date: <strong>{latest_lab_result.sample_date || 'Recent'}</strong></div>
              </div>

              <p className="text-[11px] text-slate-400">
                SCC serves as ground-truth reference data. Basic milk sensor does not measure SCC directly without validated flow cytometry / optical hardware.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
