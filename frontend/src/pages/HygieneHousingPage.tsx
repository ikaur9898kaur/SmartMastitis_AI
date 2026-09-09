import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  ShieldCheck, Home, CheckCircle2, AlertTriangle, Droplets,
  Wind, Award, Plus, Calendar
} from 'lucide-react';

export const HygieneHousingPage: React.FC = () => {
  const [hygieneRecords, setHygieneRecords] = useState<any[]>([]);
  const [housingRecords, setHousingRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hygiene' | 'housing'>('hygiene');

  useEffect(() => {
    api.getFarmHygiene().then(res => setHygieneRecords(res || []));
    api.getHousingRecords().then(res => setHousingRecords(res || []));
  }, []);

  const latestHygiene = hygieneRecords[0] || {
    overall_hygiene_score: 82.0,
    overall_hygiene_risk: 'MODERATE',
    bedding_dryness: 'Moderate',
    bedding_cleanliness: 'Moderate',
    drainage: 'Good',
    floor_cleanliness: 'Good',
    inspected_by: 'Dr. Ananya Verma (Vet)',
    date: '2026-09-09',
    remarks: 'Bedding in Shed 2 requires additional dry straw replenishment.'
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              BIOSECURITY & HOUSING AUDIT
            </span>
            <span className="text-xs text-slate-400">• FARM HYGIENE SCORE: {latestHygiene.overall_hygiene_score}/100</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Farm Hygiene Assessment & Housing Environment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive audit checklists for shed cleanliness, bedding dryness, cow comfort, and drainage conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="manual" label="FARM AUDIT REPORT" size="md" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('hygiene')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'hygiene' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Farm Hygiene Checklist & Biosecurity Score
        </button>
        <button
          onClick={() => setActiveTab('housing')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'housing' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Housing & Shed Management Specifications
        </button>
      </div>

      {/* Hygiene Section */}
      {activeTab === 'hygiene' && (
        <div className="space-y-5">
          {/* Top Score Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">
                CURRENT FARM HYGIENE SCORE
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-black text-white font-mono">{latestHygiene.overall_hygiene_score}</span>
                <span className="text-slate-400 text-sm font-mono">/ 100</span>
                <span className={`px-2.5 py-1 rounded font-bold font-mono text-xs ${
                  latestHygiene.overall_hygiene_risk === 'LOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  latestHygiene.overall_hygiene_risk === 'MODERATE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  {latestHygiene.overall_hygiene_risk} HYGIENE RISK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Audited By: <strong>{latestHygiene.inspected_by}</strong> • Remarks: {latestHygiene.remarks}
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Udder Cleanliness: <strong className="text-emerald-400">Good</strong></div>
              <div className="text-slate-400">Bedding Dryness: <strong className="text-amber-400">Moderate (Flagged)</strong></div>
              <div className="text-slate-400">Milking Area Cleanliness: <strong className="text-emerald-400">Excellent</strong></div>
            </div>
          </div>

          {/* 12-Item Checklist Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
            <h3 className="font-bold text-sm text-white mb-2">12-Point Farm Hygiene Audit Checklist (Section 17)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Shed Cleanliness', val: 'Good', color: 'text-emerald-400' },
                { label: 'Udder Cleanliness', val: 'Good', color: 'text-emerald-400' },
                { label: 'Teat Cleanliness', val: 'Good', color: 'text-emerald-400' },
                { label: 'Bedding Cleanliness', val: 'Moderate', color: 'text-amber-400' },
                { label: 'Bedding Dryness', val: 'Moderate', color: 'text-amber-400' },
                { label: 'Floor Cleanliness', val: 'Good', color: 'text-emerald-400' },
                { label: 'Manure Removal Frequency', val: 'Twice Daily', color: 'text-emerald-400' },
                { label: 'Drainage Condition', val: 'Good', color: 'text-emerald-400' },
                { label: 'Water Trough Cleanliness', val: 'Good', color: 'text-emerald-400' },
                { label: 'Milking Area Cleanliness', val: 'Excellent', color: 'text-emerald-300' },
                { label: 'Equipment Cleanliness', val: 'Excellent', color: 'text-emerald-300' },
                { label: 'Equipment Sanitation Frequency', val: 'After Every Milking', color: 'text-emerald-400' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className={`font-bold ${item.color} font-mono text-[11px]`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Housing Section */}
      {activeTab === 'housing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-4">
          <h3 className="font-bold text-base text-white">Housing & Shed Conditions (Section 18)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Housing Type:</span>
              <div className="font-bold text-white text-sm">Loose Housing with Free Stalls</div>
              <span className="text-[11px] text-slate-500">Allows natural walking and social behaviour</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Floor & Bedding:</span>
              <div className="font-bold text-white text-sm">Grooved Concrete with Dry Straw Bedding</div>
              <span className="text-[11px] text-slate-500">Straw replacement frequency: Twice weekly</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Ventilation & Airflow:</span>
              <div className="font-bold text-emerald-400 text-sm">Good (Ridge vents + HVLS ceiling fans)</div>
              <span className="text-[11px] text-slate-500">Reduces humidity build-up in summer</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Stocking Density & Overcrowding:</span>
              <div className="font-bold text-white text-sm">1.1 animal/m² (No Overcrowding)</div>
              <span className="text-[11px] text-emerald-400">100% feed bunk space availability</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Water Availability:</span>
              <div className="font-bold text-cyan-300 text-sm">Continuous Automatic Fresh Waterers</div>
              <span className="text-[11px] text-slate-500">Float valve level maintained 24/7</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Cow Comfort Index:</span>
              <div className="font-bold text-emerald-400 text-sm">High Comfort (85% Lying in Stalls)</div>
              <span className="text-[11px] text-slate-500">Promotes rumination and udder rest</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
