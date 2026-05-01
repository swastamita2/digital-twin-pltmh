"use client";

import React from 'react';
import { ComponentsResponse } from '@/lib/api';
import { Cog, Droplets, Thermometer, Filter } from 'lucide-react';

interface Props {
  components: ComponentsResponse;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bearing: Cog,
  pipa: Droplets,
  generator: Thermometer,
  intake: Filter,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; bar: string; badge: string }> = {
  normal: {
    bg: 'bg-emerald-50 border-emerald-100',
    text: 'text-emerald-700',
    bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-700',
    bar: 'bg-gradient-to-r from-amber-400 to-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  critical: {
    bg: 'bg-rose-50 border-rose-100',
    text: 'text-rose-700',
    bar: 'bg-gradient-to-r from-rose-400 to-rose-500',
    badge: 'bg-rose-100 text-rose-700',
  },
};

const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal',
  warning: 'Waspada',
  critical: 'Kritis',
};

export default function ComponentHealth({ components }: Props) {
  const compList = ['bearing', 'pipa', 'generator', 'intake'] as const;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Kesehatan Komponen Kritis
      </h3>
      <div className="space-y-3">
        {compList.map((key) => {
          const comp = components[key];
          if (!comp) return null;
          const style = STATUS_STYLES[comp.status] || STATUS_STYLES.normal;
          const Icon = ICONS[key] || Cog;

          return (
            <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${style.bg} transition-all`}>
              <div className={`p-2 rounded-lg bg-white/80 ${style.text}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-700">{comp.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {STATUS_LABELS[comp.status]}
                  </span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${style.bar}`}
                    style={{ width: `${comp.health_pct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-[10px] text-slate-400">
                    {comp.sensor_value} {comp.sensor_unit}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">{comp.health_pct}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-3 text-center">
        Penyebab downtime: Bearing 35% · Pipa 28% · Generator 22% · Intake 15%
      </p>
    </div>
  );
}
