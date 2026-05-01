import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'critical';
  color: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'violet';
  subtitle?: string;
}

const colorMap: Record<string, string> = {
  teal: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  blue: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  violet: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
};

const statusDot: Record<string, string> = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500 animate-pulse',
  critical: 'bg-rose-500 animate-pulse',
};

export default function MetricCard({ title, value, unit, icon: Icon, status, color, subtitle }: MetricCardProps) {
  return (
    <div className={`p-5 rounded-2xl border bg-white/50 backdrop-blur-md shadow-sm transition-all hover:shadow-md ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-slate-500">{title}</h3>
        <div className="flex items-center gap-2">
          {status && <span className={`w-2 h-2 rounded-full ${statusDot[status]}`}></span>}
          <div className="p-1.5 rounded-lg bg-white/60">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs font-medium text-slate-400">{unit}</span>
      </div>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}
