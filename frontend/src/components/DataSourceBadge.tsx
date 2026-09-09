import React from 'react';
import { Cpu, User, FlaskConical, Sparkles } from 'lucide-react';

export type DataSourceType = 'sensor' | 'manual' | 'lab' | 'ai' | string;

interface DataSourceBadgeProps {
  source?: DataSourceType;
  label?: string;
  size?: 'sm' | 'md';
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source = 'sensor', label, size = 'sm' }) => {
  const normSource = (source || '').toLowerCase();

  let badgeType: 'sensor' | 'manual' | 'lab' | 'ai' = 'sensor';
  if (normSource.includes('manual') || normSource.includes('farmer') || normSource.includes('vet') || normSource.includes('audit')) {
    badgeType = 'manual';
  } else if (normSource.includes('lab') || normSource.includes('culture') || normSource.includes('scc')) {
    badgeType = 'lab';
  } else if (normSource.includes('ai') || normSource.includes('predict') || normSource.includes('forecast')) {
    badgeType = 'ai';
  } else {
    badgeType = 'sensor';
  }

  const styles = {
    sensor: {
      bg: 'bg-cyan-950/70 border-cyan-500/30 text-cyan-300',
      icon: <Cpu className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      defaultText: 'AUTOMATIC SENSOR DATA'
    },
    manual: {
      bg: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300',
      icon: <User className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      defaultText: 'MANUAL DATA'
    },
    lab: {
      bg: 'bg-purple-950/70 border-purple-500/30 text-purple-300',
      icon: <FlaskConical className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      defaultText: 'LABORATORY DATA'
    },
    ai: {
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
      defaultText: 'AI-GENERATED DATA'
    }
  }[badgeType];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border rounded px-2 py-0.5 shadow-sm ${styles.bg} ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      }`}
      title={label || styles.defaultText}
    >
      {styles.icon}
      <span>{label || styles.defaultText}</span>
    </span>
  );
};
