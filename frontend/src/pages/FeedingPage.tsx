import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { Utensils, Plus, CheckCircle2, TrendingDown, Scale, Droplets, Calendar, AlertCircle } from 'lucide-react';

export const FeedingPage: React.FC = () => {
  const { selectedAnimalId, showNotification } = useApp();
  const [feedRecords, setFeedRecords] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState({
    animal_id: selectedAnimalId,
    date: new Date().toISOString().split('T')[0],
    green_fodder: 18.0,
    dry_fodder: 6.0,
    concentrate: 5.0,
    silage: 8.0,
    mineral_mixture: 100.0,
    feed_intake_status: 'Normal',
    water_intake_status: 'Normal',
    appetite: 'Normal',
    body_condition_score: 3.25,
    weight_kg: 480.0
  });

  const loadFeed = () => {
    setLoading(true);
    api.getFeedingRecords()
      .then(res => {
        setFeedRecords(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadFeed();
  }, [selectedAnimalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addFeedingRecord({
        ...formData,
        green_fodder: Number(formData.green_fodder),
        dry_fodder: Number(formData.dry_fodder),
        concentrate: Number(formData.concentrate),
        silage: Number(formData.silage),
        mineral_mixture: Number(formData.mineral_mixture),
        body_condition_score: Number(formData.body_condition_score),
        weight_kg: Number(formData.weight_kg),
      });
      showNotification('Feeding & nutrition record logged successfully');
      setIsModalOpen(false);
      loadFeed();
    } catch (err) {
      alert('Error saving record');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NUTRITION & BODY CONDITION
            </span>
            <span className="text-xs text-slate-400">• RATION BALANCING & BCS</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Bovine Feeding, Nutrition & Appetite Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Green fodder, dry roughage, concentrate mix, feed refusal, and body condition scoring (BCS).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source="manual" label="FARMER MANUAL ENTRY" size="md" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Feeding Record</span>
          </button>
        </div>
      </div>

      {/* Rations Summary Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Green Fodder</span>
          <div className="text-2xl font-black text-white font-mono">18.0 <span className="text-xs text-slate-400">kg/day</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Maize / Berseem</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Dry Fodder</span>
          <div className="text-2xl font-black text-white font-mono">6.0 <span className="text-xs text-slate-400">kg/day</span></div>
          <span className="text-[10px] text-slate-300 mt-1 block">Wheat Straw (Turi)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Concentrate</span>
          <div className="text-2xl font-black text-white font-mono">5.0 <span className="text-xs text-slate-400">kg/day</span></div>
          <span className="text-[10px] text-slate-300 mt-1 block">20% Crude Protein Pellet</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Silage</span>
          <div className="text-2xl font-black text-white font-mono">8.0 <span className="text-xs text-slate-400">kg/day</span></div>
          <span className="text-[10px] text-slate-300 mt-1 block">Fermented Corn Silage</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Mineral Mixture</span>
          <div className="text-2xl font-black text-white font-mono">100 <span className="text-xs text-slate-400">g/day</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Chelated Minerals + Vit E</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs shadow-md">
          <span className="text-slate-400 font-medium block mb-1">Body Condition (BCS)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">3.25 <span className="text-xs text-slate-400">/ 5</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">Optimal for lactation</span>
        </div>
      </div>

      {/* Historical Feeding Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            Historical Daily Nutrition & Ration Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">Recent 30 Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 font-mono uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Animal ID</th>
                <th className="py-2.5 px-3">Green Fodder</th>
                <th className="py-2.5 px-3">Dry Fodder</th>
                <th className="py-2.5 px-3">Concentrate</th>
                <th className="py-2.5 px-3">Mineral Mix</th>
                <th className="py-2.5 px-3">Feed Intake</th>
                <th className="py-2.5 px-3">Water</th>
                <th className="py-2.5 px-3">BCS</th>
                <th className="py-2.5 px-3">Entered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {feedRecords.map((rec: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{rec.date}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{rec.animal_id}</td>
                  <td className="py-2.5 px-3">{rec.green_fodder} kg</td>
                  <td className="py-2.5 px-3">{rec.dry_fodder} kg</td>
                  <td className="py-2.5 px-3">{rec.concentrate} kg</td>
                  <td className="py-2.5 px-3">{rec.mineral_mixture} g</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      rec.feed_intake_status === 'Reduced' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {rec.feed_intake_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">{rec.water_intake_status}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-white">{rec.body_condition_score}</td>
                  <td className="py-2.5 px-3 text-slate-400">{rec.entered_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding new feeding record */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Log Daily Feeding & Body Condition
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Animal ID:</label>
                  <input
                    type="text"
                    value={formData.animal_id}
                    onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Date:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Green Fodder (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.green_fodder}
                    onChange={(e) => setFormData({...formData, green_fodder: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Dry Fodder (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.dry_fodder}
                    onChange={(e) => setFormData({...formData, dry_fodder: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Concentrate (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.concentrate}
                    onChange={(e) => setFormData({...formData, concentrate: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Feed Intake Status:</label>
                  <select
                    value={formData.feed_intake_status}
                    onChange={(e) => setFormData({...formData, feed_intake_status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced (Potential Sign)</option>
                    <option value="Increased">Increased</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Body Condition Score (1–5):</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="5"
                    value={formData.body_condition_score}
                    onChange={(e) => setFormData({...formData, body_condition_score: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
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
