export const API_BASE_URL = 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════

export interface DataPoint {
  date: string;
  flow_rate: number;
  vibration: number;
  gen_temp: number;
  voltage: number;
  current: number;
  power_kw: number;
  anomaly_label?: string;
}

export interface SummaryData {
  current: {
    flow_rate: number;
    vibration: number;
    gen_temp: number;
    voltage: number;
    current: number;
    power_kw: number;
  };
  avg_7d: {
    flow_rate: number;
    vibration: number;
    gen_temp: number;
    power_kw: number;
  };
  status: string;
  turbine_active: boolean;
  date: string;
  last_updated: string;
  total_data_points: number;
}

export interface SPCPoint {
  date: string;
  value: number;
  out_of_control: boolean;
  warning: boolean;
}

export interface SPCData {
  parameter: string;
  description: string;
  unit: string;
  mean: number;
  std: number;
  ucl: number;
  lcl: number;
  uwl: number;
  lwl: number;
  total_points: number;
  ooc_count: number;
  warning_count: number;
  data: SPCPoint[];
}

export interface AnomalyDetail {
  parameter: string;
  value: number;
  status: string;
  unit: string;
  description: string;
  normal_range: string;
}

export interface AnomalyEvent {
  date: string;
  anomalies: AnomalyDetail[];
}

export interface AnomaliesResponse {
  total_days_analyzed: number;
  anomaly_days: number;
  anomaly_rate_pct: number;
  by_parameter: Record<string, number>;
  events: AnomalyEvent[];
}

export interface ComponentStatus {
  id: string;
  name: string;
  status: string;
  health_pct: number;
  sensor_param: string;
  sensor_value: number;
  sensor_unit: string;
  failure_pct: number;
  description: string;
}

export interface ComponentsResponse {
  bearing: ComponentStatus;
  pipa: ComponentStatus;
  generator: ComponentStatus;
  intake: ComponentStatus;
}

export interface Alert {
  type: 'success' | 'warning' | 'danger';
  parameter: string;
  message: string;
}

export interface AlertsResponse {
  status: string;
  alerts: Alert[];
}

export interface EdgeMetricsResponse {
  device: {
    name: string;
    type: string;
    specs: string;
  };
  performance: {
    cpu_load_pct: number;
    memory_used_mb: number;
    latency_ms: number;
    uptime_hours: number;
  };
  network: {
    status: string;
    raw_data_size_kb_per_hour: number;
    transmitted_size_kb_per_hour: number;
    bandwidth_saved_pct: number;
  };
  data_nodes: {
    id: string;
    name: string;
    parameter: string;
    status: string;
    type: string;
  }[];
}

export interface TechnoEconomics {
  investment_breakdown: Record<string, number>;
  total_investment: number;
  total_investment_usd: number;
  reactive_annual: number;
  predictive_annual: number;
  annual_savings: number;
  net_annual_savings: number;
  roi_pct: number;
  payback_months: number;
  npv_5yr: number;
  irr_pct: number;
  downtime_reactive_days: number;
  downtime_predictive_days: number;
  downtime_reduction_pct: number;
  discount_rate_pct: number;
  analysis_period_years: number;
}

// ═══════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const fetchTimeseries = (days = 60): Promise<DataPoint[]> =>
  fetchJSON(`${API_BASE_URL}/data/timeseries?days=${days}`);

export const fetchSummary = (): Promise<SummaryData> =>
  fetchJSON(`${API_BASE_URL}/data/summary`);

export const fetchSPC = (parameter: string, days = 60): Promise<SPCData> =>
  fetchJSON(`${API_BASE_URL}/spc/${parameter}?days=${days}`);

export const fetchAnomalies = (days = 30): Promise<AnomaliesResponse> =>
  fetchJSON(`${API_BASE_URL}/anomalies?days=${days}`);

export const fetchComponents = (): Promise<ComponentsResponse> =>
  fetchJSON(`${API_BASE_URL}/components`);

export const fetchAlerts = (): Promise<AlertsResponse> =>
  fetchJSON(`${API_BASE_URL}/alerts`);

export const fetchTechnoEconomics = (): Promise<TechnoEconomics> =>
  fetchJSON(`${API_BASE_URL}/techno-economics`);

export const fetchEdgeStatus = (): Promise<EdgeMetricsResponse> =>
  fetchJSON(`${API_BASE_URL}/edge-status`);
