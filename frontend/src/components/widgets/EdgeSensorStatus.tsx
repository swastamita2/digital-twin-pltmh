"use client";

import React from 'react';
import { EdgeMetricsResponse } from '@/lib/api';
import { Cpu, Wifi, HardDrive, Zap, Network } from 'lucide-react';

interface Props {
  metrics: EdgeMetricsResponse;
}

export default function EdgeSensorStatus({ metrics }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Edge Computing Node</h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Wifi className="w-3.5 h-3.5" />
          {metrics.network.status}
        </div>
      </div>

      {/* Edge Device Info */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-white mb-4">
        <div className="p-2 bg-slate-700 rounded-lg">
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold">{metrics.device.name}</p>
          <p className="text-[10px] text-slate-400">{metrics.device.specs}</p>
        </div>
      </div>

      {/* Edge Performance Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase">CPU Load</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-800">{metrics.performance.cpu_load_pct}%</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase">Latency</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-800">{metrics.performance.latency_ms}<span className="text-xs text-slate-400 ml-1">ms</span></p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <HardDrive className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase">Memory</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-800">{metrics.performance.memory_used_mb}<span className="text-xs text-slate-400 ml-1">MB</span></p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500">
            <Network className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase">Saved Data</span>
          </div>
          <p className="text-lg font-bold font-mono text-teal-600">{metrics.network.bandwidth_saved_pct}%</p>
        </div>
      </div>

      {/* Simulated Data Nodes */}
      <div>
        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulated Data Nodes</h4>
        <div className="space-y-1.5">
          {metrics.data_nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-700">{node.name}</span>
                <span className="text-[9px] text-slate-400">{node.type}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium border border-emerald-100">
                {node.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
