import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Stethoscope, HeartPulse, ShieldAlert, Plus, CheckCircle2,
  Calendar, Clock, AlertTriangle, Info, UserCheck, ShieldCheck
} from 'lucide-react';

export const DiseaseTreatmentPage: React.FC = () => {
  const { role, showNotification } = useApp();
  const [diseases, setDiseases] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    animal_id: 'COW004',
    condition: 'Subclinical Mastitis Assessment',
    diagnosis_date: new Date().toISOString().split('T')[0],
    treatment_details: 'Veterinary intramammary infusion + anti-inflammatory support',
    medicine_name: 'Cloxacillin Intramammary',
    dosage: 'Standard quarter dose',
    start_date: new Date().toISOString().split('T')[0],
    veterinarian: 'Dr. Ananya Verma, BVSc & AH',
    withdrawal_period_days: 5,
    treatment_outcome: 'Under Observation',
    remarks: 'Initiated based on elevated conductivity and CMT trace reaction'
  });

  const loadData = () => {
    api.getDiseaseHistory().then(res => setDiseases(res || []));
    api.getTreatments().then(res => setTreatments(res || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'veterinarian' && role !== 'admin') {
      alert('Action restricted: Only a licensed Veterinarian or Farm Admin can record prescription medical treatments.');
      return;
    }
    try {
      await api.addTreatment(formData);
      showNotification('Veterinary treatment record added with audit trail');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to save treatment');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              VETERINARY CLINICAL MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">• MEDICAL WITHDRAWAL PERIODS ENFORCED</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Disease History Timeline, Comorbidities & Veterinary Treatments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official medical records, previous mastitis count calculations, and milk withdrawal governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="manual" label="VETERINARIAN RECORD" size="md" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Veterinary Treatment</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Antibiotic Safeguard (Section 29) */}
      <div className="px-4 py-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3 shadow-md">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <strong className="block text-sm font-bold text-white mb-0.5">
            MANDATORY ANTIMICROBIAL STEWARDSHIP POLICY
          </strong>
          <span>
            The AI risk engine does <strong>NOT</strong> autonomously prescribe antibiotics or chemical pharmaceuticals. All medication decisions, dosages, and withdrawal withholding periods must be authorized by a licensed Veterinarian.
          </span>
        </div>
      </div>

      {/* Two Column Layout: Disease History Timeline & Active Treatment Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Disease History Timeline (Section 27) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Chronological Disease History
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Prior confirmed mastitis and metabolic conditions.</p>
            </div>
            <DataSourceBadge source="manual" label="CLINICAL DIAGNOSIS" />
          </div>

          <div className="space-y-3">
            {diseases.map((d: any) => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    {d.disease_name}
                    <span className="font-mono text-slate-400 font-normal">({d.animal_id})</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                    d.status === 'Confirmed' ? 'bg-red-950 text-red-300 border border-red-800' :
                    d.status === 'Recovered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="text-slate-400 font-mono text-[11px]">
                  Diagnosed on: {d.diagnosis_date} • By: {d.recorded_by}
                </div>

                <p className="text-slate-300">
                  <strong>Evidence:</strong> {d.evidence}
                </p>

                {d.treatment && (
                  <p className="text-emerald-400">
                    <strong>Treatment:</strong> {d.treatment}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Outcome: <strong className="text-white">{d.outcome}</strong></span>
                  <span className="text-slate-500 italic">{d.remarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Veterinary Treatments & Withdrawal Periods (Section 29) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-400" />
                Active Treatments & Milk Withholding
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Strict compliance tracking to prevent residue in bulk milk.</p>
            </div>
            <DataSourceBadge source="manual" label="VET PRESCRIPTION" />
          </div>

          <div className="space-y-3">
            {treatments.map((tRec: any) => (
              <div key={tRec.id} className="p-4 rounded-xl bg-slate-950/80 border border-red-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-red-300">
                    {tRec.condition} — {tRec.animal_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-red-950 text-red-300 border border-red-800">
                    {tRec.withdrawal_period_days} DAYS WITHDRAWAL
                  </span>
                </div>

                <div className="text-white font-semibold">
                  Medicine: {tRec.medicine_name} ({tRec.dosage})
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] font-mono">
                  <div>Start Date: {tRec.start_date}</div>
                  <div>Outcome: <span className="text-amber-400">{tRec.treatment_outcome}</span></div>
                </div>

                <div className="text-slate-300 text-[11px]">
                  Supervising Veterinarian: <strong>{tRec.veterinarian}</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-200 text-[11px]">
                  <strong>WARNING:</strong> {tRec.remarks}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal for Recording New Treatment */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-400" />
                Record Veterinary Treatment & Prescription
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTreatment} className="space-y-3">
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
                  <label className="text-slate-400 block mb-1">Condition / Diagnosis:</label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Medicine Name:</label>
                  <input
                    type="text"
                    value={formData.medicine_name}
                    onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Dosage Protocol:</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Withdrawal Period (Days):</label>
                  <input
                    type="number"
                    value={formData.withdrawal_period_days}
                    onChange={(e) => setFormData({...formData, withdrawal_period_days: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Authorized Veterinarian:</label>
                <input
                  type="text"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData({...formData, veterinarian: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Withholding Remarks & Milking Isolation Protocol:</label>
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
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Veterinary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
