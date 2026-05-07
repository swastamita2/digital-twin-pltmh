"use client";

import React from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { SPCData } from '@/lib/api';

interface Props {
  spcData: SPCData;
  height?: number;
}

// Format tanggal dari backend: "2026-05-01T09:59:59.900" → "09:59"
function formatXTick(val: string): string {
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// Format tooltip: tampilkan tanggal + waktu lengkap
function formatTooltipDate(val: string): string {
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  if (payload.out_of_control) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#EF4444" stroke="#fff" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={10} fill="none" stroke="#EF4444" strokeWidth={1} opacity={0.4} />
      </g>
    );
  }
  if (payload.warning) {
    return <circle cx={cx} cy={cy} r={4} fill="#F59E0B" stroke="#fff" strokeWidth={1.5} />;
  }
  return <circle cx={cx} cy={cy} r={3} fill="#0D9488" stroke="none" />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-slate-100">
      <p className="font-semibold text-slate-800 text-xs mb-1">{formatTooltipDate(point.date)}</p>
      <p className="text-sm text-slate-600">
        Nilai: <span className="font-bold font-mono">{Number(point.value).toFixed(4)}</span>
      </p>
      {point.raw_value != null && (
        <p className="text-xs text-slate-400">Raw: {Number(point.raw_value).toFixed(4)}</p>
      )}
      {point.out_of_control && (
        <p className="text-xs text-rose-600 font-semibold mt-1">⚠ Out of Control (di luar 3σ)</p>
      )}
      {point.warning && !point.out_of_control && (
        <p className="text-xs text-amber-600 font-semibold mt-1">⚡ Warning Zone (di luar 2σ)</p>
      )}
    </div>
  );
};

export default function ControlChart({ spcData, height = 320 }: Props) {
  const unit = spcData.unit ? ` (${spcData.unit})` : '';

  return (
    <div style={{ height }} className="w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={spcData.data} margin={{ top: 15, right: 60, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id={`grad-${spcData.parameter}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            tickFormatter={formatXTick}
            tickMargin={8}
            minTickGap={60}
            label={{ value: 'Waktu (HH:MM)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#94A3B8' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* UCL / LCL — batas kontrol 3-sigma */}
          <ReferenceLine
            y={spcData.ucl}
            stroke="#EF4444"
            strokeDasharray="6 3"
            label={{ value: 'UCL', position: 'right', fill: '#EF4444', fontSize: 10 }}
          />
          <ReferenceLine
            y={spcData.lcl}
            stroke="#EF4444"
            strokeDasharray="6 3"
            label={{ value: 'LCL', position: 'right', fill: '#EF4444', fontSize: 10 }}
          />
          {/* Warning limits — batas 2-sigma */}
          <ReferenceLine
            y={spcData.uwl}
            stroke="#F59E0B"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{ value: 'UWL', position: 'right', fill: '#F59E0B', fontSize: 9 }}
          />
          <ReferenceLine
            y={spcData.lwl}
            stroke="#F59E0B"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{ value: 'LWL', position: 'right', fill: '#F59E0B', fontSize: 9 }}
          />
          {/* Center line — x̄ (mean) */}
          <ReferenceLine
            y={spcData.mean}
            stroke="#3B82F6"
            strokeDasharray="8 4"
            label={{ value: 'X̄', position: 'right', fill: '#3B82F6', fontSize: 10 }}
          />

          {/* Data area + line */}
          <Area type="monotone" dataKey="value" stroke="none" fill={`url(#grad-${spcData.parameter})`} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0D9488"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
