"use client";

import React from 'react';
import { TechnoEconomics } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, Clock, Calculator } from 'lucide-react';

interface Props {
  data: TechnoEconomics;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  }
  return `Rp ${(value / 1_000).toFixed(0)} rb`;
}

export default function TechnoEconomicPanel({ data }: Props) {
  const savingsPct = Math.round((data.annual_savings / data.reactive_annual) * 100);
  const reactiveWidth = 100;
  const predictiveWidth = Math.round((data.predictive_annual / data.reactive_annual) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
        <Calculator className="w-4 h-4" /> Analisis Tekno-Ekonomi
      </h3>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-100">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">ROI</p>
          <p className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{data.roi_pct}%</p>
          <p className="text-[10px] text-emerald-400">Return on Investment</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-100">
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">NPV (5 Thn)</p>
          <p className="text-xl font-bold text-blue-700 font-mono mt-0.5">{formatRupiah(data.npv_5yr)}</p>
          <p className="text-[10px] text-blue-400">Net Present Value</p>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-3 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">IRR</p>
          <p className="text-xl font-bold text-violet-700 font-mono mt-0.5">{data.irr_pct > 500 ? '>500' : data.irr_pct}%</p>
          <p className="text-[10px] text-violet-400">Internal Rate of Return</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-100">
          <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Payback</p>
          <p className="text-xl font-bold text-amber-700 font-mono mt-0.5">{data.payback_months}</p>
          <p className="text-[10px] text-amber-400">Bulan</p>
        </div>
      </div>

      {/* Cost comparison bar */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-600 mb-3">Perbandingan Biaya Pemeliharaan / Tahun</p>
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-500 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-rose-500" /> Reaktif (Breakdown)</span>
              <span className="font-mono font-semibold text-rose-600">{formatRupiah(data.reactive_annual)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700" style={{ width: `${reactiveWidth}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Prediktif (Digital Twin)</span>
              <span className="font-mono font-semibold text-emerald-600">{formatRupiah(data.predictive_annual)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700" style={{ width: `${predictiveWidth}%` }}></div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-emerald-600 font-semibold mt-2 text-right">
          Penghematan: {formatRupiah(data.annual_savings)}/tahun ({savingsPct}%)
        </p>
      </div>

      {/* Downtime comparison */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs font-semibold text-slate-600 mb-2">Reduksi Downtime</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-rose-600 font-mono">{data.downtime_reactive_days}</p>
            <p className="text-[10px] text-slate-400">Hari/Tahun<br />(Reaktif)</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{data.downtime_reduction_pct}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600 font-mono">{data.downtime_predictive_days}</p>
            <p className="text-[10px] text-slate-400">Hari/Tahun<br />(Prediktif)</p>
          </div>
        </div>
      </div>

      {/* Investment detail */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total Investasi Sensor</span>
          <span className="text-xs font-mono font-semibold text-slate-600">{formatRupiah(data.total_investment)} (USD {data.total_investment_usd})</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Discount rate: {data.discount_rate_pct}% · Periode: {data.analysis_period_years} tahun</p>
      </div>
    </div>
  );
}
