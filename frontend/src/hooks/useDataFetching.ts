import { useEffect, useState } from 'react';
import {
  fetchTimeseries, fetchSummary, fetchSPC, fetchAnomalies,
  fetchComponents, fetchAlerts, fetchTechnoEconomics, fetchSensors,
  DataPoint, SummaryData, SPCData, AnomaliesResponse,
  ComponentsResponse, AlertsResponse, TechnoEconomics, SensorsResponse
} from '../lib/api';

export function useDigitalTwinData() {
  const [timeseries, setTimeseries] = useState<DataPoint[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [spcVibration, setSpcVibration] = useState<SPCData | null>(null);
  const [spcGenTemp, setSpcGenTemp] = useState<SPCData | null>(null);
  const [spcFlow, setSpcFlow] = useState<SPCData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesResponse | null>(null);
  const [components, setComponents] = useState<ComponentsResponse | null>(null);
  const [alertsInfo, setAlertsInfo] = useState<AlertsResponse | null>(null);
  const [technoEcon, setTechnoEcon] = useState<TechnoEconomics | null>(null);
  const [sensors, setSensors] = useState<SensorsResponse | null>(null);
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
        fetchSensors(),
      ]);
      setTimeseries(ts);
      setSummary(summ);
      setSpcVibration(spcV);
      setSpcGenTemp(spcT);
      setSpcFlow(spcF);
      setAnomalies(anom);
      setComponents(comp);
      setAlertsInfo(alts);
      setTechnoEcon(te);
      setSensors(sens);
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
    timeseries, summary, spcVibration, spcGenTemp, spcFlow,
    anomalies, components, alertsInfo, technoEcon, sensors,
    loading, error, refresh: loadData,
  };
}
