import { useEffect, useState } from 'react';
import {
  fetchTimeseries, fetchSummary, fetchSPC, fetchAnomalies,
  fetchComponents, fetchAlerts, fetchTechnoEconomics, fetchEdgeStatus,
  DataPoint, SummaryData, SPCData, AnomaliesResponse,
  ComponentsResponse, AlertsResponse, TechnoEconomics, EdgeMetricsResponse
} from '../lib/api';

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
        fetchTimeseries(60),
        fetchSummary(),
        fetchSPC('vibration', 60),
        fetchSPC('gen_temp', 60),
        fetchSPC('flow_rate', 60),
        fetchAnomalies(30),
        fetchComponents(),
        fetchAlerts(),
        fetchTechnoEconomics(),
        fetchEdgeStatus(),
      ]);
      setTimeseries(ts);
      
      // Clean Architecture: Transform raw API DataPoint to UI-ready ChartData here
      if (ts && ts.length > 0) {
        const mappedData = ts.map(pt => ({
          ...pt,
          time: pt.date ? new Date(pt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
          efficiency: pt.power_kw ? Math.min(100, (pt.power_kw / 50) * 100) : 88,
          load: pt.power_kw ? Math.min(100, (pt.power_kw / 50) * 100) : 80,
          frequency: 50 + (Math.random() * 0.2 - 0.1),
          water_temp: 18 + Math.random(),
          intake_level: 1.4 + Math.random() * 0.1,
          tailrace_level: 0.9 + Math.random() * 0.1,
        }));
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
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    timeseries, chartData, summary, spcVibration, spcGenTemp, spcFlow,
    anomalies, components, alertsInfo, technoEcon, edgeMetrics,
    loading, error, refresh: loadData,
  };
}
