import { useEffect, useState } from 'react';
import {
  fetchTimeseries, fetchSummary, fetchSPC, fetchAnomalies,
  fetchComponents, fetchAlerts, fetchTechnoEconomics, fetchEdgeStatus,
  DataPoint, SummaryData, SPCData, AnomaliesResponse,
  ComponentsResponse, AlertsResponse, TechnoEconomics, EdgeMetricsResponse
} from '../lib/api';

const MOCK_TIMESERIES = Array.from({ length: 60 }).map((_, i) => {
  const baseFlow = 0.55;
  const flow = baseFlow + Math.sin(i / 6) * 0.08;
  const power = 40 + Math.sin(i / 5) * 6;
  const efficiency = Math.min(100, (power / 50) * 100);
  const load = efficiency;
  const frequency = 50 + (load - 80) * 0.01;
  return {
    time: `10:${i.toString().padStart(2, '0')}`,
    power_kw: power,
    flow_rate: flow,
    vibration: 2.8 + Math.sin(i / 4) * 0.4,
    gen_temp: 58 + Math.cos(i / 6) * 1.5,
    voltage: 220 + Math.sin(i / 5) * 3,
    current: 180 + Math.cos(i / 7) * 4,
    rpm: 750 + (flow - baseFlow) * 120,
    head_pressure: 1.45 + (flow - baseFlow) * 0.6,
    efficiency,
    load,
    frequency,
    water_temp: 18 + (flow - baseFlow) * 4,
    intake_level: 1.4 + (flow - baseFlow) * 0.3,
    tailrace_level: 0.9 + (flow - baseFlow) * 0.2,
  };
});

export function useDigitalTwinData() {
  const [timeseries, setTimeseries] = useState<DataPoint[]>([]);
  const [chartData, setChartData] = useState<any[]>(MOCK_TIMESERIES);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [spcVibration, setSpcVibration] = useState<SPCData | null>(null);
  const [spcGenTemp, setSpcGenTemp] = useState<SPCData | null>(null);
  const [spcFlow, setSpcFlow] = useState<SPCData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesResponse | null>(null);
  const [components, setComponents] = useState<ComponentsResponse | null>(null);
  const [alertsInfo, setAlertsInfo] = useState<AlertsResponse | null>(null);
  const [technoEcon, setTechnoEcon] = useState<TechnoEconomics | null>(null);
  const [edgeMetrics, setEdgeMetrics] = useState<EdgeMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ts, summ, spcV, spcT, spcF, anom, comp, alts, te, sens] = await Promise.all([
        fetchTimeseries(600),
        fetchSummary(),
        fetchSPC('vibration', 600, true),
        fetchSPC('gen_temp', 600, true),
        fetchSPC('flow_rate', 600, false),
        fetchAnomalies(600),
        fetchComponents(),
        fetchAlerts(),
        fetchTechnoEconomics(),
        fetchEdgeStatus(),
      ]);
      setTimeseries(ts);
      
      // Clean Architecture: Transform raw API DataPoint to UI-ready ChartData here
      if (ts && ts.length > 0) {
        const baseFlow = 0.55;
        const mappedData = ts.map(pt => {
          const flow = pt.flow_rate ?? 0;
          const power = pt.power_kw ?? 0;
          const efficiency = power ? Math.min(100, (power / 50) * 100) : 0;
          const load = efficiency;
          const frequency = 50 + (load - 80) * 0.01;
          const intakeLevel = pt.head_pressure ?? (1.4 + (flow - baseFlow) * 0.3);
          const tailraceLevel = 0.9 + (flow - baseFlow) * 0.2;
          const waterTemp = 18 + (flow - baseFlow) * 4 + (pt.gen_temp ? (pt.gen_temp - 58) * 0.02 : 0);
          const rpm = pt.rpm ?? (750 + (flow - baseFlow) * 120);

          return {
            ...pt,
            time: pt.date ? new Date(pt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
            efficiency,
            load,
            // Frekuensi: ambil dari backend dulu, fallback ke rumus RPM 8-pole jika tidak ada
            frequency: pt.frequency != null
              ? Number(pt.frequency.toFixed(2))
              : Number(((rpm * 8) / 120).toFixed(2)),
            water_temp: Number(waterTemp.toFixed(2)),
            intake_level: Number(intakeLevel.toFixed(3)),
            tailrace_level: Number(tailraceLevel.toFixed(3)),
            rpm: Number(rpm.toFixed(1)),
          };
        });
        setChartData(mappedData);
      } else {
        setChartData(MOCK_TIMESERIES);
      }

      setSummary(summ);
      setSpcVibration(spcV);
      setSpcGenTemp(spcT);
      setSpcFlow(spcF);
      setAnomalies(anom);
      setComponents(comp);
      setAlertsInfo(alts);
      setTechnoEcon(te);
      setEdgeMetrics(sens);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching data from edge computing node');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Mengubah polling interval menjadi 5 detik (5000ms) untuk efek "Live Streaming"
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    timeseries, chartData, summary, spcVibration, spcGenTemp, spcFlow,
    anomalies, components, alertsInfo, technoEcon, edgeMetrics,
    loading, error, refresh: loadData,
  };
}
