import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Syringe, Plus, CheckCircle2, AlertTriangle, Clock,
  Calendar, ShieldCheck, UserCheck, Info
} from 'lucide-react';

export const VaccinationPage: React.FC = () => {
  const { role, showNotification } = useApp();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    animal_id: 'COW006',
    vaccine_name: 'Foot and Mouth Disease (FMD) Quadrivalent',
    date_administered: new Date().toISOString().split('T')[0],
    next_due_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    administered_by: 'Dr. Ananya Verma',
    user_role: 'Veterinarian',
    batch_number: 'FMD-2026-B92',
    remarks: 'Routine 6-month prophylactic booster'
  });

  const loadVaccinations = () => {
    setLoading(true);
    api.getVaccinations()
      .then(res => {
        setVaccinations(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadVaccinations();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addVaccination(formData);
      showNotification('Vaccination record added successfully');
      setIsModalOpen(false);
      loadVaccinations();
    } catch (err) {
      alert('Failed to save vaccination');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              VETERINARY IMMUNIZATION
            </span>
            <span className="text-xs text-slate-400">• FMD / HS / BQ / BRUCELLOSIS</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Herd Prophylactic Vaccination & Immunization Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official vaccination records manually entered by veterinarians or authorized farm personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="manual" label="MANUAL VET ENTRY" size="md" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Vaccination Record</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Notice (Section 25, 26) */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>RECORD VERIFICATION NOTICE:</strong> The system stores and displays official records entered by authorized veterinarians. The AI does not invent vaccination schedules or auto-generate medication authorizations.
        </span>
      </div>

      {/* Vaccination Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Status: UP TO DATE</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">75 Animals</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Valid immunity window</span>
        </div>
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Status: DUE SOON</span>
          <div className="text-2xl font-black text-amber-400 font-mono">3 Animals</div>
          <span className="text-[10px] text-amber-300 mt-1 block">Due within next 14 days</span>
        </div>
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Status: OVERDUE</span>
          <div className="text-2xl font-black text-red-400 font-mono">2 Animals</div>
          <span className="text-[10px] text-red-300 mt-1 block">Requires immediate booster</span>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Status: UNKNOWN</span>
          <div className="text-2xl font-black text-slate-400 font-mono">0 Animals</div>
          <span className="text-[10px] text-slate-400 mt-1 block">All animals registered</span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Vaccination History Log (Section 26)</h3>
          <span className="text-xs text-slate-400 font-mono">{vaccinations.length} Registered Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-mono uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Animal ID</th>
                <th className="py-2.5 px-3">Vaccine Name</th>
                <th className="py-2.5 px-3">Administered Date</th>
                <th className="py-2.5 px-3">Next Due Date</th>
                <th className="py-2.5 px-3">Administered By</th>
                <th className="py-2.5 px-3">Batch Number</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vaccinations.map((v: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-bold text-white">{v.animal_id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{v.vaccine_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{v.date_administered}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{v.next_due_date}</td>
                  <td className="py-2.5 px-3">{v.administered_by}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{v.batch_number || 'N/A'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] font-mono ${
                      v.status === 'Completed' || v.status === 'UP TO DATE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      v.status === 'Due Soon' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{v.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-400" />
                + Add Vaccination Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Animal ID:</label>
                  <input
                    type="text"
                    value={formData.animal_id}
                    onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vaccine Name:</label>
                  <input
                    type="text"
                    value={formData.vaccine_name}
                    onChange={(e) => setFormData({...formData, vaccine_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Date Administered:</label>
                  <input
                    type="date"
                    value={formData.date_administered}
                    onChange={(e) => setFormData({...formData, date_administered: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Next Due Date:</label>
                  <input
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Administered By:</label>
                  <input
                    type="text"
                    value={formData.administered_by}
                    onChange={(e) => setFormData({...formData, administered_by: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Batch Number:</label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Remarks:</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
