import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  FileText, Plus, FlaskConical, CheckCircle2, AlertTriangle,
  Calendar, ShieldCheck, Microscope
} from 'lucide-react';

export const LabRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getLabResults()
      .then(res => {
        setRecords(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              LABORATORY DIAGNOSTICS
            </span>
            <span className="text-xs text-slate-400">• SOMATIC CELL COUNT & CULTURES</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Reference Laboratory SCC & Microbiological Culture Results
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Certified laboratory ground truth utilized to calibrate AI forecasting models without data leakage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="lab" label="LAB DIAGNOSTIC REPORT" size="md" />
        </div>
      </div>

      {/* Lab Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Microscope className="w-4 h-4 text-purple-400" />
            Official Laboratory Somatic Cell Count Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">{records.length} Certified Lab Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-mono uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Sample Date</th>
                <th className="py-2.5 px-3">Animal ID</th>
                <th className="py-2.5 px-3">Test Type</th>
                <th className="py-2.5 px-3">Somatic Cell Count</th>
                <th className="py-2.5 px-3">CMT Reaction</th>
                <th className="py-2.5 px-3">Bacterial Culture</th>
                <th className="py-2.5 px-3">Laboratory</th>
                <th className="py-2.5 px-3">Veterinarian</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{r.sample_date}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{r.animal_id}</td>
                  <td className="py-2.5 px-3">{r.test_type}</td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={r.scc > 250000 ? 'text-amber-400' : 'text-emerald-400'}>
                      {r.scc.toLocaleString()} cells/mL
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{r.cmt_result}</td>
                  <td className="py-2.5 px-3 text-slate-200">{r.culture_result}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.laboratory}</td>
                  <td className="py-2.5 px-3 text-slate-300">{r.veterinarian}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
