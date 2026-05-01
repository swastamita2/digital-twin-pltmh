"use client";

import React from 'react';
import { SensorsResponse, SummaryData } from '@/lib/api';
import { Cpu, Wifi, CircuitBoard } from 'lucide-react';

interface Props {
  sensors: SensorsResponse;
  summary: SummaryData;
}

function formatRupiah(val: number): string {
  return `Rp ${(val / 1000).toFixed(0)}rb`;
}

export default function EdgeSensorStatus({ sensors, summary }: Props) {
  const paramValues: Record<string, { value: number; unit: string }> = {
    flow_rate: { value: summary.current.flow_rate, unit: 'm³/s' },
    vibration: { value: summary.current.vibration, unit: 'mm/s' },
    gen_temp: { value: summary.current.gen_temp, unit: '°C' },
    'voltage,current': { value: summary.current.voltage, unit: 'V' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Edge Computing Node</h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Wifi className="w-3.5 h-3.5" />
          Online
        </div>
      </div>

      {/* Raspberry Pi */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-white mb-3">
        <div className="p-2 bg-slate-700 rounded-lg">
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold">{sensors.edge_device.name}</p>
          <p className="text-[10px] text-slate-400">{sensors.edge_device.specs}</p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">${sensors.edge_device.price_usd}</span>
      </div>

      {/* Sensor list */}
      <div className="space-y-2">
        {sensors.sensors.map((sensor) => {
          const pv = paramValues[sensor.parameter];
          return (
            <div
              key={sensor.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
            >
              <div className="p-1.5 bg-white rounded-md">
                <CircuitBoard className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-slate-700">{sensor.name}</p>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium border border-emerald-100">
                    {sensor.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{sensor.type}</p>
              </div>
              <div className="text-right">
                {pv && (
                  <p className="text-sm font-bold font-mono text-slate-800">{pv.value.toFixed(1)}<span className="text-[10px] text-slate-400 ml-0.5">{pv.unit}</span></p>
                )}
                <p className="text-[9px] text-slate-400 font-mono">${sensor.price_usd}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost summary */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Total investasi sensor</span>
        <span className="text-xs font-mono font-bold text-teal-700">
          ${sensors.grand_total_usd} ({formatRupiah(sensors.grand_total_idr)})
        </span>
      </div>
      <p className="text-[9px] text-slate-400 text-center mt-1">Low-cost sensor system (&lt;USD 200)</p>
    </div>
  );
}
