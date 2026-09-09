import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle,
  Info, Sparkles, Activity, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

export const RiskProgressionPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getProgressionDemo()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { high_risk_animal, healthy_animal } = data;

  // Merge for comparison chart
  const comparisonData = high_risk_animal.progression.map((item: any, idx: number) => ({
    day: item.day,
    days_before: item.days_before,
    high_risk_pct: item.risk_pct,
    healthy_risk_pct: healthy_animal.progression[idx]?.risk_pct || 8,
    conductivity: item.conductivity,
    milk_yield: item.milk_yield,
    activity: item.activity,
    rumination: item.rumination,
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              INTERACTIVE FORECAST DEMO
            </span>
            <span className="text-xs text-slate-400">• SECTION 64 SPECIFICATION</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            7–14 Day Predictive Risk Escalation vs Healthy Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validates that the AI captures subtle gradual multi-sensor deviations 7–14 days before acute clinical signs, while avoiding false alarms on healthy cattle.
          </p>
        </div>

        <DataSourceBadge source="ai" label="XGBoost FORECAST DEMO" size="md" />
      </div>

      {/* Comparison Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white">
              Risk Probability Progression (Day -14 to Day -1 Prior to Onset)
            </h3>
            <p className="text-xs text-slate-400">
              Notice COW004 gradual escalation (18% &rarr; 76%) vs COW001 steady natural variation (7% &ndash; 11%).
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" domain={[0, 100]} unit="%" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="high_risk_pct" stroke="#f97316" strokeWidth={3.5} name="COW004 (High-Risk Progression)" dot={{ r: 5, fill: '#f97316' }} />
              <Line type="monotone" dataKey="healthy_risk_pct" stroke="#10b981" strokeWidth={2.5} name="COW001 (Healthy Baseline Control)" dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Side-by-Side Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* High Risk Animal (COW004) */}
        <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-base text-white">
                  High-Risk Progression: {high_risk_animal.animal_id}
                </h3>
              </div>
              <span className="text-xs text-slate-400">{high_risk_animal.species} • {high_risk_animal.breed}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-orange-500/20 text-orange-300 border border-orange-500/40">
              Escalating to 76%
            </span>
          </div>

          <div className="space-y-2">
            {high_risk_animal.progression.map((p: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white text-sm">{p.day}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cond: {p.conductivity} mS • Yield: {p.milk_yield} kg • Act: {p.activity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-orange-400">{p.risk_pct}%</div>
                  <div className="text-[10px] text-slate-400">{p.status}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-300 p-3 rounded-xl bg-orange-950/30 border border-orange-800/40">
            {high_risk_animal.conclusion}
          </p>
        </div>

        {/* Healthy Animal Control (COW001) */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Healthy Baseline Control: {healthy_animal.animal_id}
                </h3>
              </div>
              <span className="text-xs text-slate-400">{healthy_animal.species} • {healthy_animal.breed}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Steady at 8%
            </span>
          </div>

          <div className="space-y-2">
            {healthy_animal.progression.map((p: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white text-sm">{p.day}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cond: {p.conductivity} mS • Yield: {p.milk_yield} kg • Act: {p.activity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">{p.risk_pct}%</div>
                  <div className="text-[10px] text-emerald-300">{p.status}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-300 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            {healthy_animal.conclusion}
          </p>
        </div>

      </div>

    </div>
  );
};
