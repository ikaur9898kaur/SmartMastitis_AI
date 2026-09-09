import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Language } from '../types';
import { 
  ShieldAlert, Activity, Globe, UserCheck, Bell, 
  Menu, X, Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { role, setRole, language, setLanguage, t, setActiveTab, showNotification } = useApp();
  const [alertsCount, setAlertsCount] = useState<number>(3);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.getAlerts()
      .then(res => {
        setAlerts(res || []);
        const unres = (res || []).filter((a: any) => !a.is_resolved).length;
        setAlertsCount(unres);
      })
      .catch(() => {});
  }, []);

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'farmer', label: t.roleFarmer, desc: 'View herd, enter feeding, milking & hygiene logs' },
    { id: 'veterinarian', label: t.roleVet, desc: 'Review high-risk, enter diagnosis, vaccinations & treatments' },
    { id: 'admin', label: t.roleAdmin, desc: 'Full farm, devices, users, reports & ML governance' },
    { id: 'field_personnel', label: t.roleCoop, desc: 'Field monitoring, cooperative insights & reports' }
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    showNotification(`Switched role to: ${newRole.toUpperCase()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  SmartMastitis <span className="text-emerald-400">AI</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  7–14d FORECAST
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                FARM001 • Punjab, India • 80 Animals
              </p>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher, Language & Alerts */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Trigger: Risk Progression */}
          <button
            onClick={() => setActiveTab('progression')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all shadow-sm"
            title="Interactive Demonstration: COW004 gradual risk forecast vs COW001 healthy baseline"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Risk Progression Demo</span>
          </button>

          {/* Role Switcher Toolbar */}
          <div className="relative flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="hidden sm:flex items-center gap-1 text-slate-400 font-medium px-2 py-0.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.switchRole}:</span>
            </span>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-slate-900 text-slate-200 font-semibold rounded px-2 py-1 outline-none border border-slate-700 cursor-pointer hover:border-emerald-500 focus:border-emerald-500 transition-colors"
            >
              {rolesList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1 hidden sm:inline" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'en' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'hi' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('pa')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'pa' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Modal */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Active Early Warnings ({alerts.length})</span>
                  </div>
                  <button 
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  {alerts.map((a: any) => (
                    <div 
                      key={a.alert_id} 
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:bg-slate-800 transition-colors ${
                        a.severity === 'CRITICAL' ? 'bg-red-950/40 border-red-500/40 text-red-200' :
                        a.severity === 'HIGH' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' :
                        'bg-slate-800/80 border-slate-700 text-slate-200'
                      }`}
                      onClick={() => {
                        if (a.animal_id) {
                          setActiveTab('animalProfile');
                        }
                        setIsAlertsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{a.animal_id ? `Animal ${a.animal_id}` : a.alert_type}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/60 uppercase font-mono">{a.severity}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed mb-1">{a.message}</p>
                      <p className="text-[10px] text-slate-400">{a.created_at}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
