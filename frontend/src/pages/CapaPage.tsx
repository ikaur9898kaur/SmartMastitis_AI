import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Clock,
  Plus, Search, Filter, ArrowRight, UserCheck, Calendar,
  FileCheck, Sparkles, RefreshCw, X, Tag
} from 'lucide-react';

export const CapaPage: React.FC = () => {
  const { showNotification } = useApp();
  const [actions, setActions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // New Action Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    animal_id: '',
    category: 'Milking Hygiene',
    trigger_source: 'AI Early Warning Alert',
    severity: 'HIGH',
    root_cause: '',
    corrective_action: '',
    preventive_action: '',
    assigned_to: 'Dr. Rajesh Sharma (Lead Veterinarian)',
    target_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  });

  // Verification Prompt Modal
  const [resolveModalId, setResolveModalId] = useState<string | null>(null);
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [verifiedBy, setVerifiedBy] = useState<string>('Dr. Rajesh Sharma');

  const loadCapaData = () => {
    setLoading(true);
    Promise.all([
      api.getCapaActions(),
      api.getCapaStats()
    ])
      .then(([actionList, statData]) => {
        setActions(actionList || []);
        setStats(statData || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCapaData();
  }, []);

  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.root_cause || !formData.corrective_action || !formData.preventive_action) {
      alert('Please fill out all required action fields.');
      return;
    }
    try {
      await api.createCapaAction({
        ...formData,
        animal_id: formData.animal_id ? formData.animal_id.trim() : null
      });
      showNotification('New Corrective & Preventive Action logged successfully.');
      setIsModalOpen(false);
      setFormData({
        title: '',
        animal_id: '',
        category: 'Milking Hygiene',
        trigger_source: 'AI Early Warning Alert',
        severity: 'HIGH',
        root_cause: '',
        corrective_action: '',
        preventive_action: '',
        assigned_to: 'Dr. Rajesh Sharma (Lead Veterinarian)',
        target_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
      });
      loadCapaData();
    } catch (err: any) {
      alert(`Failed to save CAPA: ${err.message}`);
    }
  };

  const handleStatusTransition = async (actionId: string, newStatus: string) => {
    try {
      await api.updateCapaStatus(actionId, {
        status: newStatus
      });
      showNotification(`CAPA ${actionId} status updated to ${newStatus}`);
      loadCapaData();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolveModalId) return;
    try {
      await api.updateCapaStatus(resolveModalId, {
        status: 'RESOLVED',
        verification_notes: verifyNotes || 'Post-intervention inspection verified effective with zero recurring symptoms.',
        verified_by: verifiedBy
      });
      showNotification(`CAPA ${resolveModalId} verified and marked RESOLVED`);
      setResolveModalId(null);
      setVerifyNotes('');
      loadCapaData();
    } catch (err: any) {
      alert(`Error resolving action: ${err.message}`);
    }
  };

  // Filtered list
  const filteredActions = actions.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.action_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.animal_id && a.animal_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.root_cause.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              BIOSECURITY & QUALITY CONTROL
            </span>
            <span className="text-xs text-slate-400">• ISO / HACCP DAIRY CAPA FRAMEWORK</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Corrective & Preventive Action (CAPA) System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trace root causes, enforce immediate containment (Corrective), and establish systemic protocol controls (Preventive) for early mastitis risks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New CAPA Action</span>
          </button>
          <DataSourceBadge source="manual" label="VET AUDIT & AI TRIGGERS" size="md" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Total CAPAs:</span>
          <div className="text-2xl font-black text-white font-mono">{stats?.total_actions || 0}</div>
          <span className="text-slate-500 text-[11px] mt-1 block">Logged Non-Conformances</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Open / Uncontained:</span>
          <div className="text-2xl font-black text-red-400 font-mono">{stats?.open_actions || 0}</div>
          <span className="text-red-500 text-[11px] mt-1 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Immediate Action Due
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">In Progress:</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats?.in_progress || 0}</div>
          <span className="text-amber-500 text-[11px] mt-1 block">Under Implementation</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Under Vet Review:</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{stats?.under_review || 0}</div>
          <span className="text-cyan-500 text-[11px] mt-1 block">Verification Pending</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Resolved & Closed:</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats?.resolved || 0}</div>
          <span className="text-emerald-500 text-[11px] mt-1 block">
            Resolution: {stats?.resolution_rate || '0%'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CAPA title, ID, cow/shed, root cause..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 font-mono"
          >
            <option value="ALL">Status: All</option>
            <option value="OPEN">Status: Open</option>
            <option value="IN_PROGRESS">Status: In Progress</option>
            <option value="UNDER_REVIEW">Status: Under Review</option>
            <option value="RESOLVED">Status: Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 font-mono"
          >
            <option value="ALL">Severity: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 font-mono"
          >
            <option value="ALL">Category: All</option>
            <option value="Milking Hygiene">Milking Hygiene</option>
            <option value="Environmental / Bedding">Environmental / Bedding</option>
            <option value="Machine & Parlor">Machine & Parlor</option>
            <option value="Clinical Containment">Clinical Containment</option>
            <option value="Worker Biosecurity">Worker Biosecurity</option>
            <option value="Feed / Nutrition">Feed / Nutrition</option>
          </select>

          <button
            onClick={loadCapaData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
            title="Reload CAPA list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* CAPA Action Cards */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No Corrective & Preventive Actions match the selected criteria.
          </div>
        ) : (
          filteredActions.map(action => {
            const isResolved = action.status === 'RESOLVED';
            const isCritical = action.severity === 'CRITICAL';
            const isHigh = action.severity === 'HIGH';

            return (
              <div
                key={action.action_id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                  isResolved
                    ? 'border-emerald-800/40 bg-slate-900/80'
                    : isCritical
                    ? 'border-red-800/80 bg-red-950/10'
                    : isHigh
                    ? 'border-amber-800/80 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Card Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-white text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {action.action_id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        action.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : action.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : action.severity === 'MODERATE'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {action.severity} SEVERITY
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        action.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : action.status === 'UNDER_REVIEW'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : action.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      ● {action.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                      {action.category}
                    </span>
                    {action.animal_id && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono font-bold">
                        Tag: {action.animal_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: <strong className="text-white">{action.target_date}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Title & Trigger Source */}
                <div>
                  <h3 className="text-base font-black text-white">{action.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-medium">Trigger Source:</span>
                    <span className="text-cyan-400 font-semibold font-mono">{action.trigger_source}</span>
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1 font-mono flex items-center gap-1">
                    <Search className="w-3 h-3 text-amber-400" />
                    Root Cause Investigation:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{action.root_cause}</p>
                </div>

                {/* 2-Column Actions: Corrective (Immediate) vs Preventive (Long-term) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Corrective Action */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Immediate Corrective Action (Containment)
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300">
                        RAPID FIX
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{action.corrective_action}</p>
                  </div>

                  {/* Preventive Action */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Long-Term Preventive Action (Systemic)
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300">
                        PROCESS REVISION
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{action.preventive_action}</p>
                  </div>
                </div>

                {/* Verification Notes if Resolved */}
                {isResolved && action.verification_notes && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono text-[11px] block">
                        Veterinary Effectiveness Sign-off (Verified by {action.verified_by || 'Veterinarian'}):
                      </span>
                      <p className="mt-0.5 text-emerald-100">{action.verification_notes}</p>
                    </div>
                  </div>
                )}

                {/* Bottom Footer & Status Workflow Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assigned Lead: <strong className="text-slate-200">{action.assigned_to}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {action.status === 'OPEN' && (
                      <button
                        onClick={() => handleStatusTransition(action.action_id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Start Implementation</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {action.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusTransition(action.action_id, 'UNDER_REVIEW')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Submit for Vet Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => {
                          setResolveModalId(action.action_id);
                          setVerifyNotes(`Physical assessment and laboratory check confirm risk containment for ${action.title}.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-950"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Vet Sign-Off & Close</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Closed & Audited
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log New CAPA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Log New Corrective & Preventive Action (CAPA)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define acute containment and systemic prevention protocols.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCapa} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Non-Conformance / Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foremilk Clotting Detected in Shed 2 Pen 3"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Related Tag / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. COW004 or SHED-2"
                    value={formData.animal_id}
                    onChange={e => setFormData({ ...formData, animal_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="Milking Hygiene">Milking Hygiene</option>
                    <option value="Environmental / Bedding">Environmental / Bedding</option>
                    <option value="Machine & Parlor">Machine & Parlor</option>
                    <option value="Clinical Containment">Clinical Containment</option>
                    <option value="Worker Biosecurity">Worker Biosecurity</option>
                    <option value="Feed / Nutrition">Feed / Nutrition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Severity *</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trigger Source *</label>
                  <select
                    value={formData.trigger_source}
                    onChange={e => setFormData({ ...formData, trigger_source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="AI Early Warning Alert">AI Early Warning Alert</option>
                    <option value="Inline Conductivity Spike">Inline Conductivity Spike</option>
                    <option value="Bulk Tank SCC Spike">Bulk Tank SCC Spike</option>
                    <option value="Milker Hygiene Non-Conformance">Milker Hygiene Non-Conformance</option>
                    <option value="GIS Cluster Hotspot Alert">GIS Cluster Hotspot Alert</option>
                    <option value="Veterinary Routine Inspection">Veterinary Routine Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Resolution Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.target_date}
                    onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Root Cause Analysis *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Identify what caused the failure (e.g. liner split, high humidity, milker haste)..."
                  value={formData.root_cause}
                  onChange={e => setFormData({ ...formData, root_cause: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    Immediate Corrective Action (Containment) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Immediate action to stop current risk (e.g. isolate animal, replace claw liner)..."
                    value={formData.corrective_action}
                    onChange={e => setFormData({ ...formData, corrective_action: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-900/60 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    Long-Term Preventive Action (Systemic) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Systemic control to ensure it does not happen again (e.g. retraining, SOP revision)..."
                    value={formData.preventive_action}
                    onChange={e => setFormData({ ...formData, preventive_action: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-900/60 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assigned Lead Personnel *</label>
                <input
                  type="text"
                  required
                  value={formData.assigned_to}
                  onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950"
                >
                  Save & Log Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution & Verification Modal */}
      {resolveModalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Veterinary Sign-Off & Verification</h3>
              </div>
              <button
                onClick={() => setResolveModalId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Sign off on completion of action <strong className="text-white font-mono">{resolveModalId}</strong> and record verification evidence.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Verifying Veterinarian / Inspector</label>
                <input
                  type="text"
                  value={verifiedBy}
                  onChange={e => setVerifiedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Effectiveness Verification Notes</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  placeholder="Record CMT score, somatic cell count check, or inspection notes proving the action was effective..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResolveModalId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950"
              >
                Sign-off & Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
