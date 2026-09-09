import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  FileText, Printer, Download, CheckCircle2,
  ShieldAlert, User, Building, Calendar, Layers
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedAnimalId, showNotification } = useApp();
  const [reportType, setReportType] = useState<'animal' | 'herd'>('animal');
  const [animalReport, setAnimalReport] = useState<any>(null);
  const [herdReport, setHerdReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    if (reportType === 'animal') {
      api.getAnimalReport(selectedAnimalId)
        .then(res => {
          setAnimalReport(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      api.getHerdReport()
        .then(res => {
          setHerdReport(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [reportType, selectedAnimalId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls (No print) */}
      <div className="no-print bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AUDIT & CLINICAL DOSSIERS
            </span>
            <span className="text-xs text-slate-400">• SECTION 62 COMPLIANCE</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Official Bovine Health & Herd Intelligence Dossiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized printable audit reports for dairy farm managers, attending veterinarians, and cooperative milk federations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setReportType('animal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'animal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Animal Dossier ({selectedAnimalId})
            </button>
            <button
              onClick={() => setReportType('herd')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'herd' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Herd Health Summary
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl text-xs space-y-6 print:border-none print:p-0">
        
        {loading ? (
          <div className="py-16 text-center text-slate-500">Generating structured dossier report...</div>
        ) : reportType === 'animal' && animalReport ? (
          <div className="space-y-6">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <span className="text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
                  SmartMastitis AI • Veterinary Decision-Support System
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {animalReport.report_title}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Farm: <strong>{animalReport.farm_details.name}</strong> ({animalReport.farm_details.id}) • {animalReport.farm_details.location}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>Generated: {animalReport.generated_at}</div>
                <div className="text-emerald-400 font-bold mt-1">Status: Certified Record</div>
              </div>
            </div>

            {/* Animal Profile Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <div>Tag Number: <strong className="text-white block font-mono">{animalReport.animal.tag_number}</strong></div>
              <div>Species / Breed: <strong className="text-white block">{animalReport.animal.species} • {animalReport.animal.breed}</strong></div>
              <div>Age / Lactation: <strong className="text-white block">{animalReport.animal.age_years} yrs • Lact {animalReport.animal.lactation_number} (DIM {animalReport.animal.days_in_lactation}d)</strong></div>
              <div>Location: <strong className="text-white block">{animalReport.animal.location}</strong></div>
            </div>

            {/* AI Predictive Risk Assessment */}
            <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/40 text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">7–14 Day Mastitis Risk Assessment</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-orange-500 text-slate-950">
                  {animalReport.mastitis_risk_assessment.risk_probability_pct} — {animalReport.mastitis_risk_assessment.current_risk_level}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Forecast Window: <strong>{animalReport.mastitis_risk_assessment.forecast_window}</strong> • Clinical Status: <strong>{animalReport.mastitis_risk_assessment.clinical_status}</strong>
              </p>
              <p className="text-[11px] text-amber-300 font-mono">
                {animalReport.mastitis_risk_assessment.regulatory_note}
              </p>
            </div>

            {/* Individual Baselines vs Telemetry */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white">Physiological Baselines (14-Day Reference)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Activity Baseline:</span>
                  <div className="text-base font-bold text-white font-mono">{animalReport.baseline_summary.activity_baseline}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Conductivity Baseline:</span>
                  <div className="text-base font-bold text-white font-mono">{animalReport.baseline_summary.conductivity_baseline}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Rumination Baseline:</span>
                  <div className="text-base font-bold text-white font-mono">{animalReport.baseline_summary.rumination_baseline}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Session Yield Baseline:</span>
                  <div className="text-base font-bold text-white font-mono">{animalReport.baseline_summary.yield_baseline}</div>
                </div>
              </div>
            </div>

            {/* Health & Treatment History */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white">Vaccinations & Disease History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 font-mono uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="py-2 px-3">Vaccine</th>
                      <th className="py-2 px-3">Date Administered</th>
                      <th className="py-2 px-3">Next Due</th>
                      <th className="py-2 px-3">Veterinarian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {animalReport.vaccination_history.map((v: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-white">{v.vaccine}</td>
                        <td className="py-2 px-3 font-mono">{v.date}</td>
                        <td className="py-2 px-3 font-mono">{v.next_due}</td>
                        <td className="py-2 px-3">{v.vet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
              <div>Attending Veterinarian: _______________________</div>
              <div>Farm Director: _______________________</div>
            </div>

          </div>
        ) : herdReport ? (
          <div className="space-y-6">
            
            {/* Herd Header */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <span className="text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
                  SmartMastitis AI • Herd Epidemiological Audit
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {herdReport.report_title}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Facility: <strong>{herdReport.farm}</strong>
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>Generated: {herdReport.generated_at}</div>
                <div className="text-emerald-400 font-bold mt-1">Certified Batch</div>
              </div>
            </div>

            {/* Herd Strength Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <div>Total Inventory: <strong className="text-white block font-mono text-lg">{herdReport.herd_summary.total_animals}</strong></div>
              <div>Cattle / Buffaloes: <strong className="text-white block">{herdReport.herd_summary.cattle_count} Cattle • {herdReport.herd_summary.buffalo_count} Buffaloes</strong></div>
              <div>Lactating / Dry: <strong className="text-white block">{herdReport.herd_summary.lactating_animals} Lactating • {herdReport.herd_summary.dry_animals} Dry</strong></div>
              <div>Under Active Treatment: <strong className="text-red-400 block font-mono">{herdReport.herd_summary.under_treatment} head</strong></div>
            </div>

            {/* Epidemiological Indices */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
              <h4 className="font-bold text-sm text-white mb-2">Key Herd Epidemiological Indicators</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>Herd Elevated Risk Prevalence: <strong className="text-orange-400 font-mono">{herdReport.epidemiological_indices.herd_elevated_risk_prevalence}</strong></div>
                <div>Bulk Tank SCC Estimate: <strong className="text-purple-300 font-mono">{herdReport.epidemiological_indices.average_bulk_tank_scc_estimate}</strong></div>
                <div>Daily Average Milk Production: <strong className="text-white font-mono">{herdReport.epidemiological_indices.average_daily_milk_yield}</strong></div>
                <div>Milking Hygiene Compliance Index: <strong className="text-emerald-400 font-mono">{herdReport.epidemiological_indices.milking_hygiene_compliance_index}</strong></div>
              </div>
            </div>

            {/* Key Actionable Recommendations */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
              <h4 className="font-bold text-sm text-white mb-2">Priority Farm Management Actions</h4>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                {herdReport.key_recommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="text-slate-300">{rec}</li>
                ))}
              </ul>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
