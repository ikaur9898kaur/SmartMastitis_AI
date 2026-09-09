import React from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Cpu, Milk, Wind, HardDrive, Database, Sparkles,
  ShieldAlert, UserCheck, ArrowDown, Layers, FileCheck, Stethoscope
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SYSTEM ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">• SECTION 65 SPECIFICATION</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            End-to-End IoT Telemetry, Feature Engineering & AI Decision Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual data-flow map illustrating multi-rate sensor ingestion, relational storage, XGBoost predictive modeling, and clinical decision support.
          </p>
        </div>

        <DataSourceBadge source="ai" label="FULL PLATFORM TOPOLOGY" size="md" />
      </div>

      {/* Visual Data Flow Map */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-xs space-y-6">
        
        {/* Layer 1: Hardware & Manual Sources */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            LAYER 1: DATA SOURCES & INGESTION CHANNELS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            
            {/* Source 1: Smart Collar */}
            <div className="bg-slate-900 border border-cyan-500/40 p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Cpu className="w-4 h-4" />
              </div>
              <strong className="block text-white text-sm">SMART COLLAR</strong>
              <div className="text-slate-400 text-[11px] space-y-0.5 font-mono">
                <div>Activity Level</div>
                <div>Surface Temp</div>
                <div>Behaviour Proxy</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-bold">
                ESP32 &bull; BLE/Wi-Fi
              </div>
            </div>

            {/* Source 2: Milk Sensing Unit */}
            <div className="bg-slate-900 border border-cyan-500/40 p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Milk className="w-4 h-4" />
              </div>
              <strong className="block text-white text-sm">MILK SENSING UNIT</strong>
              <div className="text-slate-400 text-[11px] space-y-0.5 font-mono">
                <div>Conductivity (mS)</div>
                <div>Milk pH Level</div>
                <div>Yield Load Cell</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-bold">
                ESP32 &bull; Wi-Fi / REST
              </div>
            </div>

            {/* Source 3: Environment Unit */}
            <div className="bg-slate-900 border border-cyan-500/40 p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Wind className="w-4 h-4" />
              </div>
              <strong className="block text-white text-sm">ENVIRONMENT UNIT</strong>
              <div className="text-slate-400 text-[11px] space-y-0.5 font-mono">
                <div>Ambient Temp</div>
                <div>Relative Humidity</div>
                <div>Air Quality (Gas)</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-bold">
                ESP32 &bull; Solar / Wi-Fi
              </div>
            </div>

            {/* Source 4: Farm & Milking Manual Inputs */}
            <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <UserCheck className="w-4 h-4" />
              </div>
              <strong className="block text-white text-sm">MANUAL FARM LOGS</strong>
              <div className="text-slate-400 text-[11px] space-y-0.5 font-mono">
                <div>Feeding Rations</div>
                <div>Hygiene Audits</div>
                <div>Milking Procedures</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-bold">
                Farmer &bull; Mobile Web
              </div>
            </div>

            {/* Source 5: Laboratory & Clinical Outcomes */}
            <div className="bg-slate-900 border border-purple-500/40 p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Stethoscope className="w-4 h-4" />
              </div>
              <strong className="block text-white text-sm">LAB & VET RECORDS</strong>
              <div className="text-slate-400 text-[11px] space-y-0.5 font-mono">
                <div>SCC Cells / mL</div>
                <div>Bacterial Culture</div>
                <div>Vaccines & Therapy</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-bold">
                Veterinarian Sign-off
              </div>
            </div>

          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 2: Cloud Database Storage */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              LAYER 2: CLOUD RELATIONAL DATABASE & TIME-SERIES AGGREGATOR
            </h3>
          </div>
          <p className="text-slate-400 text-xs">
            Multi-rate time-series aggregation (1-min collar, 2x daily milking, daily feeding, periodic lab SCC) aligned without timestamp collisions.
          </p>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 3: Feature Engineering & Baseline Engine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center space-y-1">
            <strong className="text-white text-sm block">INDIVIDUAL BASELINE ENGINE</strong>
            <p className="text-slate-400 text-xs">
              Computes 14-day rolling physiological baseline for each cow/buffalo. Evaluates relative % deviations rather than rigid generic cutoffs.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center space-y-1">
            <strong className="text-white text-sm block">FEATURE EXTRACTION PIPELINE</strong>
            <p className="text-slate-400 text-xs">
              Fuses sensor changes, animal parity, lactation stage, prior mastitis history, THI weather stress, and shed hygiene into 29 feature columns.
            </p>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 4: AI Risk Engine */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/50 p-5 rounded-2xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-base text-white">
              LAYER 4: PRIMARY AI / XGBoost FORECASTING ENGINE
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto">
            Predicts subclinical mastitis RISK with a <strong>7–14 DAY ADVANCE LEAD TIME</strong> prior to acute clinical appearance.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-emerald-800">ROC-AUC: 0.948</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-cyan-800">Accuracy: 91.4%</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-800">Zero Data Leakage</span>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Layer 5: Explainable AI & Decision Support Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/40 space-y-1">
            <strong className="text-orange-300 text-sm block">Explainable AI (XAI)</strong>
            <p className="text-slate-400 text-[11px]">
              Itemizes top contributing parameters (e.g. Conductivity &uarr;17%, Yield &darr;19%, Activity &darr;38%).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1">
            <strong className="text-amber-300 text-sm block">Early Warning Alerts</strong>
            <p className="text-slate-400 text-[11px]">
              Multi-channel push, in-app notifications, and attending veterinarian alert routing.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1">
            <strong className="text-emerald-300 text-sm block">Preventive Recommendations</strong>
            <p className="text-slate-400 text-[11px]">
              Prioritizes physical inspection, teat dip verification, and non-antibiotic farm management decisions.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
