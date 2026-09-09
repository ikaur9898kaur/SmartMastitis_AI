import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Search, Filter, Download, ChevronRight, Eye,
  ArrowUpDown, CheckCircle2, AlertTriangle, ShieldAlert, HeartPulse
} from 'lucide-react';

export const HerdManagementPage: React.FC = () => {
  const { t, setActiveTab, setSelectedAnimalId, showNotification } = useApp();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState<string>('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('');
  const [breedFilter, setBreedFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [shedFilter, setShedFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('risk_probability');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadAnimals = () => {
    setLoading(true);
    const params: any = {
      sort_by: sortBy,
      order: sortOrder,
      limit: 100
    };
    if (search) params.search = search;
    if (speciesFilter) params.species = speciesFilter;
    if (breedFilter) params.breed = breedFilter;
    if (riskFilter) params.risk_level = riskFilter;
    if (statusFilter) params.status = statusFilter;
    if (shedFilter) params.shed = shedFilter;

    api.getAnimals(params)
      .then(res => {
        setAnimals(res.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching animals', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAnimals();
  }, [speciesFilter, breedFilter, riskFilter, statusFilter, shedFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAnimals();
  };

  const handleAnimalSelect = (animalId: string) => {
    setSelectedAnimalId(animalId);
    setActiveTab('animalProfile');
  };

  const handleExportCsv = () => {
    window.open('/api/dataset/export/csv', '_blank');
    showNotification('Exporting Herd Dataset to CSV...');
  };

  const getRiskBadge = (risk: string, pct: number) => {
    switch (risk) {
      case 'NO RISK':
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{pct}% NO RISK</span>;
      case 'LOW RISK':
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">{pct}% LOW</span>;
      case 'MODERATE RISK':
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">{pct}% MOD</span>;
      case 'HIGH RISK':
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40">{pct}% HIGH</span>;
      case 'CRITICAL RISK':
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">{pct}% CRITICAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-bold text-xs bg-slate-700 text-slate-300">{risk}</span>;
    }
  };

  const cattleBreeds = ['Sahiwal', 'Gir', 'Holstein Friesian', 'Jersey', 'Red Sindhi', 'Crossbred HF-Sahiwal'];
  const buffaloBreeds = ['Murrah', 'Nili-Ravi', 'Mehsana', 'Jaffarabadi', 'Surti'];

  return (
    <div className="space-y-6">
      
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span>Herd Health Overview & Registry</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              80 Animals (Cattle & Buffaloes)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Individual animal profiling, lactation status, and continuous 7–14 day mastitis predictive risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Animal ID (e.g. COW004), Tag, or Breed..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0"
          >
            Search Registry
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-xs">
          
          {/* Species */}
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-emerald-500 outline-none"
          >
            <option value="">All Species (Cow & Buffalo)</option>
            <option value="Cow">Cattle (Cow)</option>
            <option value="Buffalo">Buffalo</option>
          </select>

          {/* Risk Level */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-emerald-500 outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="NO RISK">No Risk (0–20%)</option>
            <option value="LOW RISK">Low Risk (20–40%)</option>
            <option value="MODERATE RISK">Moderate Risk (40–60%)</option>
            <option value="HIGH RISK">High Risk (60–80%)</option>
            <option value="CRITICAL RISK">Critical Risk (80–100%)</option>
          </select>

          {/* Breed */}
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-emerald-500 outline-none"
          >
            <option value="">All Breeds</option>
            <optgroup label="Cattle Breeds">
              {cattleBreeds.map(b => <option key={b} value={b}>{b}</option>)}
            </optgroup>
            <optgroup label="Buffalo Breeds">
              {buffaloBreeds.map(b => <option key={b} value={b}>{b}</option>)}
            </optgroup>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-emerald-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="lactating">Lactating</option>
            <option value="dry">Dry</option>
            <option value="pregnant">Pregnant</option>
            <option value="recently calved">Recently Calved</option>
            <option value="under treatment">Under Treatment</option>
          </select>

          {/* Shed */}
          <select
            value={shedFilter}
            onChange={(e) => setShedFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-emerald-500 outline-none"
          >
            <option value="">All Sheds</option>
            <option value="Shed 1">Shed 1 (Cattle)</option>
            <option value="Shed 2">Shed 2 (Cattle - Cluster)</option>
            <option value="Shed 3">Shed 3 (Buffaloes)</option>
            <option value="Shed 4">Shed 4 (Dry & Calves)</option>
          </select>

        </div>
      </div>

      {/* Main Herd Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Animal ID</th>
                <th className="py-3 px-3.5">Tag / RFID</th>
                <th className="py-3 px-3.5">Species</th>
                <th className="py-3 px-3.5">Breed</th>
                <th className="py-3 px-3.5">Age</th>
                <th className="py-3 px-3.5">Lact / DIM</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Yield (kg)</th>
                <th className="py-3 px-3.5">Vaccination</th>
                <th className="py-3 px-3.5">Mastitis Risk</th>
                <th className="py-3 px-3.5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    Loading registry animals...
                  </td>
                </tr>
              ) : animals.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No animals matched the filter criteria.
                  </td>
                </tr>
              ) : (
                animals.map((a: any) => (
                  <tr 
                    key={a.animal_id}
                    onClick={() => handleAnimalSelect(a.animal_id)}
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {a.animal_id}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-400">
                      {a.tag_number}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        a.species === 'Buffalo' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {a.species}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-medium">{a.breed}</td>
                    <td className="py-3 px-3.5">{a.age_years} yrs</td>
                    <td className="py-3 px-3.5">
                      L{a.lactation_number} • {a.days_in_lactation}d
                    </td>
                    <td className="py-3 px-3.5">
                      {a.current_treatment ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800">
                          Treatment
                        </span>
                      ) : (
                        <span className="text-slate-300">{a.pregnancy_status}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-cyan-300">
                      {a.current_milk_yield > 0 ? `${a.current_milk_yield} kg` : 'Dry'}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        a.vaccination_status === 'UP TO DATE' ? 'text-emerald-400 bg-emerald-950/40' :
                        a.vaccination_status === 'DUE SOON' ? 'text-amber-400 bg-amber-950/40' : 'text-red-400 bg-red-950/40'
                      }`}>
                        {a.vaccination_status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      {getRiskBadge(a.current_mastitis_risk, a.risk_percentage)}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button className="p-1 rounded bg-slate-800 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
