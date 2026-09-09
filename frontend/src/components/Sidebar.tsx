import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Users, HeartPulse, Cpu, Milk, Utensils, 
  Wind, Sparkles, MapPin, HardDrive, FileText, BarChart3,
  Syringe, Stethoscope, ShieldCheck, Clock, LineChart, Network, ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, t } = useApp();

  const navGroups = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
        { id: 'herd', label: t.navHerd, icon: Users },
        { id: 'animalProfile', label: t.navAnimalProfile, icon: HeartPulse },
      ]
    },
    {
      title: 'AI & PREDICTIVE WARNING',
      items: [
        { id: 'prediction', label: t.navPrediction, icon: Sparkles },
        { id: 'progression', label: t.navProgression, icon: LineChart },
        { id: 'gis', label: t.navGis, icon: MapPin },
        { id: 'modelPerformance', label: t.navModelPerf, icon: BarChart3 },
      ]
    },
    {
      title: 'IOT SENSOR TELEMETRY',
      items: [
        { id: 'collar', label: t.navCollar, icon: Cpu },
        { id: 'milkSensor', label: t.navMilkSensor, icon: Milk },
        { id: 'environment', label: t.navEnvironment, icon: Wind },
        { id: 'devices', label: t.navDevices, icon: HardDrive },
      ]
    },
    {
      title: 'FARM & MILKING OPERATIONS',
      items: [
        { id: 'milking', label: t.navMilking, icon: Clock },
        { id: 'capa', label: t.navCapa, icon: ShieldAlert },
        { id: 'hygiene', label: t.navHygiene, icon: ShieldCheck },
        { id: 'feeding', label: t.navFeeding, icon: Utensils },
      ]
    },
    {
      title: 'VETERINARY & LAB RECORDS',
      items: [
        { id: 'vaccination', label: t.navVaccination, icon: Syringe },
        { id: 'disease', label: t.navDisease, icon: Stethoscope },
        { id: 'lab', label: t.navLab, icon: FileText },
        { id: 'reports', label: t.navReports, icon: FileText },
      ]
    },
    {
      title: 'SPECIFICATION & FLOW',
      items: [
        { id: 'architecture', label: t.navArchitecture, icon: Network },
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-30 transition-transform duration-200 overflow-y-auto flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate text-left">{item.label}</span>
                      {item.id === 'prediction' && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* System Footnote */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">Decision-Support System</p>
          <p className="leading-tight mt-0.5">
            Predicts mastitis risk 7–14 days ahead. Veterinary confirmation required.
          </p>
        </div>
      </aside>
    </>
  );
};
