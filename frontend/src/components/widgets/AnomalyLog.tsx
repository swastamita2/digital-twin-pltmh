"use client";

import React from 'react';
import { AnomaliesResponse } from '@/lib/api';
import { AlertTriangle, XCircle, Clock } from 'lucide-react';

interface Props {
  anomalies: AnomaliesResponse;
}

export default function AnomalyLog({ anomalies }: Props) {
  const events = [...anomalies.events].reverse(); // Show newest first

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Log Deteksi Anomali
        </h3>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
          {anomalies.anomaly_days}/{anomalies.total_days_analyzed} sampel
        </span>
      </div>

      {/* Summary */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-rose-50 rounded-lg p-2.5 text-center border border-rose-100">
          <p className="text-lg font-bold text-rose-700 font-mono">{anomalies.anomaly_rate_pct}%</p>
          <p className="text-[10px] text-rose-500">Tingkat Anomali</p>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg p-2.5 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-700 font-mono">{anomalies.anomaly_days}</p>
          <p className="text-[10px] text-slate-500">Sampel Anomali</p>
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-2 max-h-70 overflow-y-auto pr-1">
          {events.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Tidak ada anomali terdeteksi</p>
        ) : (
          events.slice(0, 15).map((event, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="mt-0.5">
                {event.anomalies.some(a => a.status === 'critical') ? (
                  <XCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-mono text-slate-500">{event.date}</span>
                </div>
                {event.anomalies.map((a, j) => (
                  <p key={j} className="text-[11px] text-slate-600 leading-snug">
                    <span className={`font-semibold ${a.status === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {a.description}
                    </span>
                    {': '}
                    <span className="font-mono">{a.value} {a.unit}</span>
                    <span className="text-slate-400"> (normal: {a.normal_range})</span>
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
