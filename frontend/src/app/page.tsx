"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import MetricChartCard from '@/components/cards/MetricChartCard';
import { useDigitalTwinData } from '@/hooks/useDataFetching';
import {
  Activity, Droplets, Zap, RefreshCw, Server, Waves, Shield, Thermometer,
  CloudRain, Calendar, Bell, User, Clock, Battery, Sun, Maximize, RotateCcw, Box
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

// Dynamic import for 3D component
const Turbine3D = dynamic(() => import('@/components/widgets/Turbine3D'), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-b from-slate-700 to-slate-900 w-full h-full rounded-2xl flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-slate-400">Loading 3D Model...</p>
    </div>
  ),
});

const MOCK_TIMESERIES = Array.from({ length: 24 }).map((_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  power_kw: 240 + Math.sin(i) * 10,
  flow_rate: 1.8 + Math.cos(i) * 0.1,
  efficiency: 88 + Math.sin(i) * 2,
  load: 80 + Math.cos(i) * 2,
  frequency: 50 + (Math.sin(i) * 0.1),
  gen_temp: 68 + Math.cos(i) * 2,
  water_temp: 18 + Math.sin(i),
  intake_level: 1.4 + Math.cos(i) * 0.1,
  tailrace_level: 0.9 + Math.sin(i) * 0.1,
}));

export default function Dashboard() {
  const {
    timeseries, summary, components, alertsInfo,
    loading, error, refresh,
  } = useDigitalTwinData();

  // Map real data to include UI-required fields missing from the backend schema, falling back to mock data
  const chartData = timeseries && timeseries.length > 0 ? timeseries.map(pt => ({
    ...pt,
    time: pt.date ? new Date(pt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
    efficiency: pt.power_kw ? Math.min(100, (pt.power_kw / 50) * 100) : 88,
    load: pt.power_kw ? Math.min(100, (pt.power_kw / 50) * 100) : 80,
    frequency: 50 + (Math.random() * 0.2 - 0.1),
    water_temp: 18 + Math.random(),
    intake_level: 1.4 + Math.random() * 0.1,
    tailrace_level: 0.9 + Math.random() * 0.1,
  })) : MOCK_TIMESERIES;

  const energyProductionData = [
    { name: '00:00 - 06:00', value: 0.68, color: '#3b82f6' }, // Blue
    { name: '06:00 - 12:00', value: 0.92, color: '#10b981' }, // Emerald
    { name: '12:00 - 18:00', value: 1.15, color: '#0f766e' }, // Dark Teal
    { name: '18:00 - 24:00', value: 0.67, color: '#84cc16' }, // Lime
  ];

  const systemStatus = [
    { name: 'Turbine', status: 'Normal' },
    { name: 'Generator', status: 'Normal' },
    { name: 'Control System', status: 'Normal' },
    { name: 'Water Intake', status: 'Normal' },
    { name: 'Penstock', status: 'Normal' },
    { name: 'Tailrace', status: 'Normal' },
  ];

  const alertsList = [
    { message: 'System normal', time: '10:15 WIB', type: 'success' },
    { message: 'System normal', time: '10:15 WIB', type: 'success' },
    { message: 'Voltage fluctuation', time: '08:30 WIB', type: 'danger' },
    { message: 'Low water flow detected', time: '09:47 WIB', type: 'warning' },
    { message: 'Voltage fluctuation', time: '08:30 WIB', type: 'danger' },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
          <Server className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button onClick={refresh} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-12">
      {/* ═══ HEADER ═══ */}
      <header className="bg-[#04384D] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Droplets className="text-teal-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Micro Hydro Power Plant</h1>
            <div className="flex items-center gap-1.5 text-xs text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Live Monitoring
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
            <CloudRain className="w-5 h-5 text-blue-200" />
            <div className="text-xs">
              <div className="font-semibold text-sm">23°C</div>
              <div className="text-blue-200">Light Rain</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-200" />
            <div className="text-xs">
              <div className="font-semibold text-sm">20 Mei 2026</div>
              <div className="text-blue-200">10:30:45 WIB</div>
            </div>
          </div>

          <button className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-teal-500 rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
          </button>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-800 font-bold">
              Y
            </div>
            <div className="text-xs pr-2">
              <div className="font-semibold">Yusuf</div>
              <div className="text-slate-300 text-[10px]">Administrator ▾</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 mt-6 space-y-4">
        {/* ═══ ROW 1: KPI Cards ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricChartCard title="Power Output" value="245.6" unit="kW" icon={Zap} color="emerald" data={chartData} dataKey="power_kw" />
          <MetricChartCard title="Water Flow" value="1.82" unit="m³/s" icon={Waves} color="blue" data={chartData} dataKey="flow_rate" />
          <MetricChartCard title="Efficiency" value="89" unit="%" icon={Activity} color="emerald" data={chartData} dataKey="efficiency" />
          <MetricChartCard title="Load" value="81" unit="%" icon={Activity} color="teal" data={chartData} dataKey="load" />
          <MetricChartCard title="Frequency" value="50.00" unit="Hz" icon={Activity} color="emerald" data={chartData} dataKey="frequency" />
        </div>

        {/* ═══ ROW 2: 3D Visualization & System Status ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3D Visualization */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[450px]">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <h2 className="text-white font-semibold drop-shadow-md">3D Plant Visualization</h2>
              <span className="px-2 py-0.5 bg-teal-500/80 text-white text-[10px] rounded-full flex items-center gap-1 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Live
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button className="p-2 bg-[#04384D]/80 backdrop-blur-md rounded-lg text-white hover:bg-[#04384D]"><RotateCcw className="w-4 h-4" /></button>
              <button className="p-2 bg-[#04384D]/80 backdrop-blur-md rounded-lg text-white hover:bg-[#04384D]"><Box className="w-4 h-4" /></button>
              <button className="p-2 bg-[#04384D]/80 backdrop-blur-md rounded-lg text-white hover:bg-[#04384D]"><Maximize className="w-4 h-4" /></button>
            </div>
            {/* The actual 3D container */}
            <div className="w-full h-[450px] bg-gradient-to-b from-[#4A6670] to-[#2B3A42]">
               {summary && <Turbine3D summary={summary} components={components || undefined} />}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-4">System Status</h3>
            <div className="flex-1 space-y-1 text-sm">
              {systemStatus.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-teal-600">
                      {i === 0 && <Activity className="w-3.5 h-3.5" />}
                      {i === 1 && <Zap className="w-3.5 h-3.5" />}
                      {i === 2 && <Shield className="w-3.5 h-3.5" />}
                      {i === 3 && <Waves className="w-3.5 h-3.5" />}
                      {i === 4 && <div className="w-3.5 h-3.5 border-2 border-teal-600 rounded-full" />}
                      {i === 5 && <Waves className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {item.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3 h-3" /> <span className="text-[10px]">Operating Hours</span>
                </div>
                <div className="font-bold text-slate-800">2451 <span className="text-xs font-normal text-slate-500">h</span></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Activity className="w-3 h-3" /> <span className="text-[10px]">Plant Load</span>
                </div>
                <div className="font-bold text-slate-800">49.1 <span className="text-xs font-normal text-slate-500">%</span></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Zap className="w-3 h-3" /> <span className="text-[10px]">Capacity</span>
                </div>
                <div className="font-bold text-slate-800">50 <span className="text-xs font-normal text-slate-500">kW</span></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Sun className="w-3 h-3" /> <span className="text-[10px]">Energy Today</span>
                </div>
                <div className="font-bold text-slate-800">3.42 <span className="text-xs font-normal text-slate-500">MWh</span></div>
              </div>
            </div>

            <button className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors">
              View All Status &gt;
            </button>
          </div>
        </div>

        {/* ═══ ROW 3: Real-time Monitoring ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Real-time Monitoring</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: 'Power Output', value: '245.6', unit: 'kW', dataKey: 'power_kw', color: '#10b981', icon: Zap },
              { title: 'Load', value: '81', unit: '%', dataKey: 'load', color: '#14b8a6', icon: Activity },
              { title: 'Water Flow', value: '1.82', unit: 'm³/s', dataKey: 'flow_rate', color: '#3b82f6', icon: Waves },
              { title: 'Frequency', value: '50.0', unit: 'Hz', dataKey: 'frequency', color: '#10b981', icon: Activity },
              { title: 'Generator Temperature', value: '68.5', unit: '°C', dataKey: 'gen_temp', color: '#10b981', icon: Thermometer },
              { title: 'Water Temperature', value: '18.6', unit: '°C', dataKey: 'water_temp', color: '#10b981', icon: Thermometer },
            ].map((chart, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <chart.icon className="w-3 h-3 text-slate-400" />
                  <h4 className="text-[10px] text-slate-500">{chart.title}</h4>
                </div>
                <div className="font-bold text-sm text-slate-800 mb-2">
                  {chart.value} <span className="text-[10px] font-normal text-slate-500">{chart.unit}</span>
                </div>
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chart.color} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={chart.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ fontSize: '10px', padding: '4px', borderRadius: '4px' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Area type="monotone" dataKey={chart.dataKey} stroke={chart.color} fillOpacity={1} fill={`url(#grad-${i})`} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                  <span>10:20</span>
                  <span>10:25</span>
                  <span>10:30</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ ROW 4: Operational Insights & Power Output 24h ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Operational Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-4">Operational Insights</h3>
            <div className="flex justify-around items-center flex-1">
              {/* Turbine Speed Dial */}
              <div className="flex flex-col items-center">
                <p className="text-[11px] text-slate-500 mb-2">Turbine Speed</p>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#0f766e" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">750</span>
                    <span className="text-[10px] text-slate-400">rpm</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Normal
                </div>
              </div>

              {/* Tailrace Level Dial */}
              <div className="flex flex-col items-center">
                <p className="text-[11px] text-slate-500 mb-2">Tailrace Level</p>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="125.6" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">0.98</span>
                    <span className="text-[10px] text-slate-400">m</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Normal
                </div>
              </div>
            </div>
          </div>

          {/* Power Output 24 Hours */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">Power Output (24 Hours)</h3>
            <div className="h-[150px] w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
              {/* Using same recharts but bigger as placeholder */}
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPowerBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="power_kw" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPowerBig)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ═══ ROW 5: Energy Production & Water Levels ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Energy Production */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">Energy Production</h3>
              <div className="flex bg-slate-100 rounded-md p-0.5 text-[10px]">
                <button className="px-2 py-1 bg-teal-600 text-white rounded shadow-sm">Hari Ini</button>
                <button className="px-2 py-1 text-slate-500 hover:text-slate-700">7 Hari</button>
                <button className="px-2 py-1 text-slate-500 hover:text-slate-700">30 Hari</button>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyProductionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {energyProductionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">3.42</span>
                  <span className="text-xs text-slate-500">MWh</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-3 text-xs">
                  {energyProductionData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 w-24">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <div className="font-medium text-slate-800">{item.value.toFixed(2)} MWh</div>
                      <div className="text-teal-500 font-medium">
                        {((item.value / 3.42) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-blue-600">3.42 MWh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water Levels */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">Water Levels</h3>
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                {/* Intake Level */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] text-slate-500">Intake Level</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-1">1.45 <span className="text-[10px] font-normal text-slate-500">m</span></div>
                  <div className="h-12 w-full border border-slate-100 rounded p-1">
                     <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="intake_level" stroke="none" fillOpacity={1} fill="url(#colorIntake)" isAnimationActive={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tailrace Level */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] text-slate-500">Tailrace Level</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-1">0.98 <span className="text-[10px] font-normal text-slate-500">m</span></div>
                  <div className="h-12 w-full border border-slate-100 rounded p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTailrace" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="tailrace_level" stroke="none" fillOpacity={1} fill="url(#colorTailrace)" isAnimationActive={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tank Visualization */}
              <div className="w-32 flex justify-between">
                {/* Visual Tank */}
                <div className="w-16 h-40 bg-slate-100 rounded-b-2xl rounded-t-sm border-2 border-slate-200 relative overflow-hidden flex flex-col justify-end">
                   {/* Water Intake layer (blue) */}
                   <div className="w-full bg-[#7BC6E6]/80 absolute bottom-0 z-0" style={{ height: '70%' }}></div>
                   {/* Water Tailrace layer (green) */}
                   <div className="w-full bg-gradient-to-t from-[#48B572] to-[#60d38e] absolute bottom-0 z-10" style={{ height: '40%' }}></div>
                </div>
                {/* Scale */}
                <div className="flex flex-col justify-between py-2 text-[8px] text-slate-500 h-40">
                  <span>2.0 m</span>
                  <span>1.5 m</span>
                  <span>1.0 m</span>
                  <span>0.5 m</span>
                  <span>0 m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 6: Alerts & Plant Status ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Alerts & Notifications */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">Alerts & Notifications</h3>
              <button className="text-[10px] font-medium text-slate-500 hover:text-slate-700">View all</button>
            </div>
            <div className="space-y-2">
              {alertsList.map((alert, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      alert.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                      alert.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {alert.type === 'success' && <Shield className="w-4 h-4" />}
                      {alert.type === 'warning' && <Activity className="w-4 h-4" />}
                      {alert.type === 'danger' && <Activity className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{alert.message}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>{alert.time}</span>
                    <span className="text-slate-300 font-bold">&gt;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Status Photo Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-32 bg-slate-200 relative">
               <img 
                 src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                 alt="Plant location" 
                 className="object-cover w-full h-full"
               />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-800">Plant Status</h4>
                <div className="flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Online
                </div>
              </div>
              
              <div className="space-y-2 text-[10px]">
                <div>
                  <div className="text-slate-400">Plant Name</div>
                  <div className="font-medium text-slate-700">Sungai Institut Teknologi PLN</div>
                </div>
                <div>
                  <div className="text-slate-400">Location</div>
                  <div className="font-medium text-slate-700">Cengkareng, Jawa Barat</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
