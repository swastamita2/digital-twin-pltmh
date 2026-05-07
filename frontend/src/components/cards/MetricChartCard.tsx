import React from 'react';
import { ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

interface MetricChartCardProps<T> {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'critical';
  data: T[];
  dataKey: Extract<keyof T, string> | string;
  color: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'violet';
  thresholdLimit?: number;
}

const colorMap = {
  teal: '#14b8a6',
  blue: '#2563eb',
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#f43f5e',
  violet: '#8b5cf6',
};

const statusDot = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500 animate-pulse',
  critical: 'bg-rose-500 animate-pulse',
};

export default function MetricChartCard<T>({ title, value, unit, icon: Icon, status = 'normal', data, dataKey, color, thresholdLimit }: MetricChartCardProps<T>) {
  const chartColor = colorMap[color];
  const stringDataKey = String(dataKey);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full ${status === 'normal' ? 'bg-emerald-50 text-emerald-600' : status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}
            </span>
            <span className="text-[10px] font-medium text-slate-400">{unit}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-2 h-2 rounded-full ${statusDot[status]}`}></span>
          <span className="text-[10px] font-medium text-slate-500 capitalize">{status}</span>
        </div>
        <div className="h-8 w-24 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color-${stringDataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={dataKey as any} stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#color-${stringDataKey})`} isAnimationActive={false} />
              {thresholdLimit !== undefined && (
                <ReferenceLine y={thresholdLimit} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
