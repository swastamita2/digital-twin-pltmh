"use client";

import React from 'react';
import { SummaryData } from '@/lib/api';

interface Props {
  summary: SummaryData;
}

export default function TurbineStatus({ summary }: Props) {
  const isActive = summary.turbine_active;
  const powerKw = summary.current.power_kw;
  const flowRate = summary.current.flow_rate;
  const vibration = summary.current.vibration;
  const efficiency = Math.min(100, Math.round((powerKw / 50) * 100)); // 50 kW rated
  const spinDuration = isActive ? Math.max(0.5, 4 - (flowRate * 3)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Status Turbin Cross-Flow
      </h3>

      <div className="flex items-center gap-6">
        {/* Turbine Animation */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <div className={`absolute inset-0 rounded-full border-4 ${isActive ? 'border-teal-400' : 'border-slate-200'} transition-colors duration-500`}></div>
          {isActive && <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-pulse"></div>}
          <div
            className="absolute inset-2 flex items-center justify-center"
            style={{ animation: isActive ? `spin ${spinDuration}s linear infinite` : 'none' }}
          >
            <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
              <circle cx="40" cy="40" r="8" fill={isActive ? '#0D9488' : '#94A3B8'} />
              <path d="M40 32 C35 15, 30 8, 40 8 C50 8, 45 15, 40 32Z" fill={isActive ? '#0D9488' : '#CBD5E1'} opacity="0.9" />
              <path d="M47 37 C60 28, 70 28, 67 36 C64 44, 55 42, 47 37Z" fill={isActive ? '#14B8A6' : '#CBD5E1'} opacity="0.8" />
              <path d="M47 43 C60 52, 70 52, 67 44 C64 36, 55 38, 47 43Z" fill={isActive ? '#0D9488' : '#CBD5E1'} opacity="0.9" />
              <path d="M40 48 C35 65, 30 72, 40 72 C50 72, 45 65, 40 48Z" fill={isActive ? '#14B8A6' : '#CBD5E1'} opacity="0.8" />
              <path d="M33 37 C20 28, 10 28, 13 36 C16 44, 25 42, 33 37Z" fill={isActive ? '#14B8A6' : '#CBD5E1'} opacity="0.8" />
              <path d="M33 43 C20 52, 10 52, 13 44 C16 36, 25 38, 33 43Z" fill={isActive ? '#0D9488' : '#CBD5E1'} opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
              {isActive ? 'Aktif' : 'Idle'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-500">Daya Output</span>
              <span className="font-mono font-semibold text-slate-700">{powerKw.toFixed(1)} kW</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700" style={{ width: `${Math.min(100, (powerKw / 50) * 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-500">Efisiensi</span>
              <span className="font-mono font-semibold text-slate-700">{efficiency}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${efficiency >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : efficiency >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`} style={{ width: `${efficiency}%` }}></div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span>Debit: <span className="font-mono text-slate-600">{flowRate.toFixed(2)} m³/s</span></span>
            <span>Getaran: <span className="font-mono text-slate-600">{vibration.toFixed(1)} mm/s</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
