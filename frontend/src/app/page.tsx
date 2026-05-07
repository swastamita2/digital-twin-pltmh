"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import MetricChartCard from '@/components/cards/MetricChartCard';
import EdgeSensorStatus from '@/components/widgets/EdgeSensorStatus';
import AlertBanner from '@/components/cards/AlertBanner';
import ComponentHealth from '@/components/widgets/ComponentHealth';
import TechnoEconomicPanel from '@/components/widgets/TechnoEconomicPanel';
import AnomalyLog from '@/components/widgets/AnomalyLog';
import TurbineStatus from '@/components/widgets/TurbineStatus';
import ControlChart from '@/components/charts/ControlChart';
import { useDigitalTwinData } from '@/hooks/useDataFetching';
import {
  Activity, Droplets, Zap, RefreshCw, Server, Waves, Shield, Thermometer,
  CloudRain, Calendar, Bell, Clock, Sun
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ReferenceLine } from 'recharts';

// Dynamic import for 3D component
const Turbine3D = dynamic(() => import('@/components/widgets/Turbine3D'), {
  ssr: false,
  loading: () => (
    <div className="bg-linear-to-b from-slate-700 to-slate-900 w-full h-full rounded-2xl flex items-center justify-center min-h-100">
      <p className="text-sm text-slate-400">Loading 3D Model...</p>
    </div>
  ),
});



export default function Dashboard() {
  const {
    chartData, summary, components, alertsInfo, edgeMetrics,
    spcVibration, spcGenTemp, spcFlow, anomalies, technoEcon,
    error, refresh,
  } = useDigitalTwinData();



  const energyProductionData = [
    { name: '00:00 - 06:00', value: 0.68, color: '#3b82f6' }, // Blue
    { name: '06:00 - 12:00', value: 0.92, color: '#10b981' }, // Emerald
    { name: '12:00 - 18:00', value: 1.15, color: '#0f766e' }, // Dark Teal
    { name: '18:00 - 24:00', value: 0.67, color: '#84cc16' }, // Lime
  ];

  const latestPoint = chartData.length ? chartData[chartData.length - 1] : null;
  const currentPower = summary?.current.power_kw ?? latestPoint?.power_kw ?? 0;
  const currentFlow = summary?.current.flow_rate ?? latestPoint?.flow_rate ?? 0;
  const currentVibration = summary?.current.vibration ?? latestPoint?.vibration ?? 0;
  const currentTemp = summary?.current.gen_temp ?? latestPoint?.gen_temp ?? 0;
  const currentVoltage = summary?.current.voltage ?? latestPoint?.voltage ?? 0;
  const currentFrequency = summary?.current?.frequency ?? latestPoint?.frequency ?? 50.0;
  const currentRpm = summary?.current.rpm ?? latestPoint?.rpm ?? 0;
  const currentLoad = latestPoint?.load ?? (currentPower / 50) * 100;
  const intakeLevel = latestPoint?.intake_level ?? 1.4;
  const tailraceLevel = latestPoint?.tailrace_level ?? 0.9;
  const operatingHours = edgeMetrics?.performance.uptime_hours ?? 0;

  const lastUpdated = summary?.last_updated ? new Date(summary.last_updated) : null;
  const displayDate = lastUpdated
    ? lastUpdated.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : '--';
  const displayTime = lastUpdated
    ? `${lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB`
    : '--:--:-- WIB';

  const normalizeStatus = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('kritis')) return 'critical';
    if (s.includes('waspada')) return 'warning';
    if (s.includes('critical')) return 'critical';
    if (s.includes('warning')) return 'warning';
    return 'normal';
  };

  const systemStatus = [
    { name: 'Turbine', status: components?.bearing?.status || 'normal' },
    { name: 'Generator', status: components?.generator?.status || 'normal' },
    { name: 'Control System', status: 'normal' },
    { name: 'Water Intake', status: components?.intake?.status || 'normal' },
    { name: 'Penstock', status: components?.pipa?.status || 'normal' },
    { name: 'Tailrace', status: 'normal' },
  ];

  const statusStyle = {
    normal: { label: 'Normal', dot: 'bg-emerald-500', text: 'text-emerald-600' },
    warning: { label: 'Waspada', dot: 'bg-amber-500', text: 'text-amber-600' },
    critical: { label: 'Kritis', dot: 'bg-rose-500', text: 'text-rose-600' },
  } as const;

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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5">
            <img src="/logo.svg" alt="Logo KTI" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Micro Hydro Power Plant</h1>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                Online
              </span>
              <span className="text-slate-500">|</span>
              <span>Last update {displayTime.replace(' WIB', '')} ({(lastUpdated ? Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000) : 0)}s ago)</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
            <Sun className="w-5 h-5 text-amber-200" />
            <div className="text-xs">
              <div className="font-semibold text-sm">28°C</div>
              <div className="text-amber-100">Cerah Berawan</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-200" />
            <div className="text-xs">
              <div className="font-semibold text-sm">{displayDate}</div>
              <div className="text-blue-200">{displayTime}</div>
            </div>
          </div>

          <button className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-teal-500 rounded-full text-[10px] flex items-center justify-center font-bold">
              {alertsInfo?.alerts?.filter(a => a.type !== 'success').length || 0}
            </span>
          </button>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-800 font-bold">
              A
            </div>
            <div className="text-xs pr-2">
              <div className="font-semibold">Tim Riset KTI</div>
              <div className="text-slate-300 text-[10px]">Administrator ▾</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-350 mx-auto px-4 mt-6 space-y-4">
        {/* ═══ ROW 1: KPI Cards ═══ */}
        {(() => {
          const getStatus = (val: number, type: 'power'|'flow'|'vibration'|'temp'|'voltage') => {
            switch (type) {
              case 'power': return val > 55 ? 'critical' : val > 50 ? 'warning' : 'normal';
              case 'flow': return val > 0.9 ? 'critical' : val > 0.8 || val < 0.25 ? 'warning' : 'normal';
              case 'vibration': return val >= 4.5 ? 'critical' : val >= 2.8 ? 'warning' : 'normal';
              case 'temp': return val >= 80 ? 'critical' : val >= 60 ? 'warning' : 'normal';
              case 'voltage': return (val > 242 || val < 198) ? 'critical' : 'normal';
              default: return 'normal';
            }
          };
          return (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricChartCard title="Power Output" value={currentPower} unit="kW" icon={Zap} color="teal" data={chartData} dataKey="power_kw" thresholdLimit={55} status={getStatus(currentPower, 'power')} />
              <MetricChartCard title="Water Flow" value={currentFlow} unit="m³/s" icon={Waves} color="teal" data={chartData} dataKey="flow_rate" thresholdLimit={0.9} status={getStatus(currentFlow, 'flow')} />
              <MetricChartCard title="Vibration" value={currentVibration} unit="mm/s" icon={Activity} color="teal" data={chartData} dataKey="vibration" thresholdLimit={4.5} status={getStatus(currentVibration, 'vibration')} />
              <MetricChartCard title="Gen Temperature" value={currentTemp} unit="°C" icon={Thermometer} color="teal" data={chartData} dataKey="gen_temp" thresholdLimit={80} status={getStatus(currentTemp, 'temp')} />
              <MetricChartCard title="Voltage" value={currentVoltage} unit="V" icon={Zap} color="teal" data={chartData} dataKey="voltage" thresholdLimit={242} status={getStatus(currentVoltage, 'voltage')} />
            </div>
          );
        })()}

        {/* ═══ ROW 2: 3D Visualization & System Status ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3D Visualization */}
          <div className="lg:col-span-2 relative min-h-112.5">
            {/* The actual 3D container */}
            <div className="w-full h-full">
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
                  {(() => {
                    const style = statusStyle[item.status as keyof typeof statusStyle] || statusStyle.normal;
                    return (
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                        <span className={`w-2 h-2 rounded-full ${style.dot}`}></span> {style.label}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3 h-3" /> <span className="text-[10px]">Operating Hours</span>
                </div>
                <div className="font-bold text-slate-800">{Math.round(operatingHours)} <span className="text-xs font-normal text-slate-500">h</span></div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Activity className="w-3 h-3" /> <span className="text-[10px]">Plant Load</span>
                </div>
                <div className="font-bold text-slate-800">{currentLoad.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span></div>
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
                <div className="font-bold text-slate-800">
                {/* Energy Today: rata-rata kW × durasi dataset (jam), max 24 jam */}
                {(() => {
                  if (chartData.length === 0) return '3.42';
                  const avgPower = chartData.reduce((acc: number, pt: any) => acc + (pt.power_kw ?? 0), 0) / chartData.length;
                  // Hitung durasi aktual dari data (maks 24 jam)
                  const firstTime = chartData[0]?.date ? new Date(chartData[0].date).getTime() : 0;
                  const lastTime  = chartData[chartData.length - 1]?.date ? new Date(chartData[chartData.length - 1].date).getTime() : 0;
                  const durationHours = firstTime && lastTime ? Math.min(24, (lastTime - firstTime) / 3_600_000) : 2;
                  return (avgPower * durationHours / 1000).toFixed(2);
                })()}
                <span className="text-xs font-normal text-slate-500"> MWh</span>
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {[
              { title: 'Power Output', value: currentPower.toFixed(1), unit: 'kW', dataKey: 'power_kw', color: '#0d9488', icon: Zap, threshold: 55 },
              { title: 'Water Flow', value: currentFlow.toFixed(2), unit: 'm³/s', dataKey: 'flow_rate', color: '#0d9488', icon: Waves, threshold: 0.9 },
              { title: 'Vibration', value: currentVibration.toFixed(2), unit: 'mm/s', dataKey: 'vibration', color: '#0d9488', icon: Activity, threshold: 4.5 },
              { title: 'Bearing Temperature', value: currentTemp.toFixed(1), unit: '°C', dataKey: 'gen_temp', color: '#0d9488', icon: Thermometer, threshold: 80.0 },
              { title: 'Voltage', value: currentVoltage.toFixed(0), unit: 'V', dataKey: 'voltage', color: '#0d9488', icon: Zap, threshold: 242.0 },
              { title: 'Frequency', value: currentFrequency.toFixed(2), unit: 'Hz', dataKey: 'frequency', color: '#0d9488', icon: Activity, threshold: 50.5 },
              { title: 'Turbine RPM', value: currentRpm.toFixed(0), unit: 'rpm', dataKey: 'rpm', color: '#0d9488', icon: Activity, threshold: 788 },
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
                      <ReferenceLine y={chart.threshold} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                  <span>{chartData[0]?.time ?? '--:--'}</span>
                  <span>{chartData[Math.floor(chartData.length / 2)]?.time ?? '--:--'}</span>
                  <span>{chartData[chartData.length - 1]?.time ?? '--:--'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ ROW 4: Operational Insights & Power Output 24h ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Turbine Status */}
          {summary ? (
            <TurbineStatus summary={summary} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-center text-xs text-slate-400">
              Loading turbine status...
            </div>
          )}

          {/* Power Output 24 Hours */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">Power Output (24 Hours)</h3>
            <div className="h-37.5 w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
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
              <div className="relative w-40 h-40 shrink-0">
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
                  <span className="text-2xl font-bold text-slate-800">
                  {/* Donut center: total MWh harian dari data aktual */}
                  {(() => {
                    if (chartData.length === 0) return '3.42';
                    const avgPower = chartData.reduce((acc: number, pt: any) => acc + (pt.power_kw ?? 0), 0) / chartData.length;
                    const firstTime = chartData[0]?.date ? new Date(chartData[0].date).getTime() : 0;
                    const lastTime  = chartData[chartData.length - 1]?.date ? new Date(chartData[chartData.length - 1].date).getTime() : 0;
                    const durationHours = firstTime && lastTime ? Math.min(24, (lastTime - firstTime) / 3_600_000) : 2;
                    return (avgPower * durationHours / 1000).toFixed(2);
                  })()}
                  </span>
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
                    <span className="text-[11px] text-slate-500">Inlet Pressure</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-1">{intakeLevel.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">bar</span></div>
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
                  <div className="text-lg font-bold text-slate-800 mb-1">{tailraceLevel.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">m</span></div>
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
                  {/* Water Intake layer — tinggi dinamis dari API (max 2.2 bar → 100%) */}
                  <div className="w-full bg-[#7BC6E6]/80 absolute bottom-0 z-0"
                    style={{ height: `${Math.min(100, (intakeLevel / 2.2) * 100).toFixed(0)}%` }}>
                  </div>
                  {/* Water Tailrace layer — tinggi dinamis dari API (max 1.5m → 100%) */}
                  <div className="w-full bg-linear-to-t from-[#48B572] to-[#60d38e] absolute bottom-0 z-10"
                    style={{ height: `${Math.min(100, (tailraceLevel / 1.5) * 100).toFixed(0)}%` }}>
                  </div>
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
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">Alerts & Notifications</h3>
              <button className="text-[10px] font-medium text-slate-500 hover:text-slate-700">View all</button>
            </div>
            <div className="space-y-2">
              {alertsInfo?.alerts?.length ? (
                alertsInfo.alerts.map((alert, i) => (
                  <AlertBanner key={i} type={alert.type} message={alert.message} />
                ))
              ) : (
                <p className="text-xs text-slate-400">Menunggu data peringatan...</p>
              )}
            </div>
          </div>

          {/* Edge Computing Status */}
          <div className="lg:col-span-1">
            {edgeMetrics && <EdgeSensorStatus metrics={edgeMetrics} />}
          </div>

          {/* Component Health */}
          <div className="lg:col-span-1">
            {components ? (
              <ComponentHealth components={components} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-xs text-slate-400">
                Loading component health...
              </div>
            )}
          </div>
        </div>

        {/* ═══ ROW 7: Anomaly Log & Techno-Economics ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {anomalies ? (
            <AnomalyLog anomalies={anomalies} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-xs text-slate-400">
              Loading anomaly log...
            </div>
          )}
          {technoEcon ? (
            <TechnoEconomicPanel data={technoEcon} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-xs text-slate-400">
              Loading techno-economic analysis...
            </div>
          )}
        </div>

        {/* ═══ ROW 8: SPC Control Charts ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">SPC Control Charts (3σ)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-slate-100 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 mb-2">Getaran Turbin (Residual)</div>
              {spcVibration ? (
                <ControlChart spcData={spcVibration} height={220} />
              ) : (
                <div className="text-xs text-slate-400">Menunggu data SPC getaran...</div>
              )}
            </div>
            <div className="border border-slate-100 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 mb-2">Suhu Generator (Residual)</div>
              {spcGenTemp ? (
                <ControlChart spcData={spcGenTemp} height={220} />
              ) : (
                <div className="text-xs text-slate-400">Menunggu data SPC suhu...</div>
              )}
            </div>
            <div className="border border-slate-100 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 mb-2">Debit Air (Raw)</div>
              {spcFlow ? (
                <ControlChart spcData={spcFlow} height={220} />
              ) : (
                <div className="text-xs text-slate-400">Menunggu data SPC debit...</div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
