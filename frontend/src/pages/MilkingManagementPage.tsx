import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Clock, ShieldCheck, Calendar, UserCheck, CheckCircle2, Award
} from 'lucide-react';

export const MilkingManagementPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'workers'>('schedule');

  useEffect(() => {
    api.getMilkingSessions().then(res => setSessions(res || []));
    api.getWorkerHygiene().then(res => setWorkers(res || []));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PARLOR OPERATIONS & BIOSECURITY
            </span>
            <span className="text-xs text-slate-400">• TWICE-DAILY SCHEDULE (05:30 AM / 05:30 PM)</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Milking Operational Schedule & Worker Hygiene
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard 12-hour milking intervals, vacuum session logging, and milker biosecurity hygiene audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="manual" label="PARLOR SUPERVISOR AUDIT" size="md" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Operational Schedule & Intervals</span>
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'workers'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Worker Hygiene & Biosecurity ({workers.length} Personnel)</span>
        </button>
      </div>

      {/* 1. Operational Schedule & Intervals */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
              <span className="text-slate-400 block mb-1">Morning Shift Schedule:</span>
              <div className="text-2xl font-black text-white font-mono">05:30 AM</div>
              <span className="text-emerald-400 mt-1 block">Standard 12.0 Hour Interval</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
              <span className="text-slate-400 block mb-1">Evening Shift Schedule:</span>
              <div className="text-2xl font-black text-white font-mono">05:30 PM</div>
              <span className="text-emerald-400 mt-1 block">Standard 12.0 Hour Interval</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
              <span className="text-slate-400 block mb-1">Milking Interval Compliance:</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">98.4%</div>
              <span className="text-slate-400 mt-1 block">0 Missed Milking Events Today</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Recent Milking Sessions Log</h3>
                <p className="text-slate-400 text-xs mt-0.5">Automated vacuum recording and operator shifts</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Total Logged: {sessions.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-mono uppercase text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Session ID</th>
                    <th className="py-2.5 px-3">Animal ID</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Scheduled</th>
                    <th className="py-2.5 px-3">Actual Start</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Yield</th>
                    <th className="py-2.5 px-3">Method / Machine</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.map(s => (
                    <tr key={s.session_id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">#SES-{s.session_id}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{s.animal_id}</td>
                      <td className="py-2.5 px-3">{s.session_type}</td>
                      <td className="py-2.5 px-3 font-mono">{s.scheduled_time}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{s.actual_start}</td>
                      <td className="py-2.5 px-3">{s.duration} min</td>
                      <td className="py-2.5 px-3 font-bold text-white">{s.milk_yield} kg</td>
                      <td className="py-2.5 px-3">{s.milking_method} ({s.machine_id})</td>
                      <td className="py-2.5 px-3 font-mono">{s.operator_id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.remarks || 'Normal'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Worker / Milker Hygiene */}
      {activeTab === 'workers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Worker & Milker Biosecurity Compliance Log</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Work-related hygiene compliance only; no personal medical records collected.</p>
            </div>
            <DataSourceBadge source="manual" label="SUPERVISOR AUDIT" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-mono uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Worker ID</th>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Training Status</th>
                  <th className="py-2.5 px-3">Hand Wash</th>
                  <th className="py-2.5 px-3">Gloves</th>
                  <th className="py-2.5 px-3">Dedicated Towels</th>
                  <th className="py-2.5 px-3">Protective Gear</th>
                  <th className="py-2.5 px-3">Compliance Score</th>
                  <th className="py-2.5 px-3">Inspected By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {workers.map((w: any) => (
                  <tr key={w.worker_id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{w.worker_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{w.worker_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {w.training_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> YES
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">YES</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">YES</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">YES</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-bold font-mono text-emerald-300 bg-emerald-950 border border-emerald-800">
                        {w.compliance_score}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{w.inspected_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
