"""
FastAPI REST API — Digital Twin PLTMH Dashboard Backend
Menggunakan SPC residual (3-sigma) untuk deteksi anomali.

Endpoints:
  /api/data/timeseries      — Data time-series parameter operasional
  /api/data/summary         — Ringkasan status terkini
  /api/spc/<parameter>      — Data SPC (control chart) per parameter
  /api/anomalies            — Daftar anomali terdeteksi
  /api/components           — Status kesehatan 4 komponen kritis
  /api/alerts               — Peringatan operasional
  /api/techno-economics     — Analisis tekno-ekonomi (ROI, NPV, IRR)
  /api/thresholds           — Definisi threshold per parameter
  /api/edge-status          — Info edge computing
"""

from datetime import datetime
import csv
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from model.anomaly_detection import (
    detect_anomalies_batch,
    detect_anomalies_latest_spc,
    calculate_spc,
    get_component_health,
    get_overall_status,
    calculate_techno_economics,
    THRESHOLDS,
    RESIDUAL_PARAMS,
)

app = FastAPI(title="Digital Twin PLTMH API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_pltmh.csv')

# Cache variables
_cached_data = None
_cached_mtime = 0


# ═══════════════════════════════════════════════════════
# DATA LOADING
# ═══════════════════════════════════════════════════════

def _parse_float(value, fallback):
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def _estimate_head_pressure(flow_rate):
    # Simple proxy for inlet pressure (bar) from flow rate
    base = 1.45
    return max(0.5, min(2.2, base + (flow_rate - 0.55) * 0.6))


def _estimate_rpm(flow_rate):
    if flow_rate <= 0:
        return 0.0
    return max(400.0, min(900.0, 650.0 + flow_rate * 180.0))


def _estimate_frequency(rpm):
    """Estimasi frekuensi generator (Hz) dari RPM.
    Untuk generator sinkron 8 kutub (p=8): f = n*p/120
    Pada desain 750 RPM → f = 750*8/120 = 50 Hz (sesuai PLN)
    """
    if rpm <= 0:
        return 0.0
    return round(rpm * 8 / 120, 2)  # 8-pole synchronous generator


def load_data():
    """Load dataset from CSV. Generate if not exists."""
    if not os.path.exists(DATA_PATH):
        from data.dataset_generator import generate_pltmh_dataset
        generate_pltmh_dataset()

    data = []
    with open(DATA_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            flow_rate = _parse_float(row.get('flow_rate'), 0.0)
            gen_temp = _parse_float(row.get('gen_temp'), 0.0)
            voltage = _parse_float(row.get('voltage'), 0.0)
            current = _parse_float(row.get('current'), 0.0)
            power_kw = _parse_float(row.get('power_kw'), 0.0)

            head_pressure = _parse_float(
                row.get('head_pressure'),
                _estimate_head_pressure(flow_rate),
            )
            rpm = _parse_float(row.get('rpm'), _estimate_rpm(flow_rate))

            data.append({
                'date': row['date'],
                'flow_rate': flow_rate,
                'vibration': _parse_float(row.get('vibration'), 0.0),
                'gen_temp': gen_temp,
                'voltage': voltage,
                'current': current,
                'power_kw': power_kw,
                'head_pressure': head_pressure,
                'rpm': rpm,
                'frequency': _parse_float(
                    row.get('frequency'),
                    _estimate_frequency(rpm)
                ),
                'anomaly_label': row.get('anomaly_label', 'normal'),
            })
    return data


def get_data():
    """Get data with smart cache invalidation (checks file modification time)."""
    global _cached_data, _cached_mtime

    if not os.path.exists(DATA_PATH):
        _cached_data = load_data()
        _cached_mtime = os.path.getmtime(DATA_PATH)
        return _cached_data

    current_mtime = os.path.getmtime(DATA_PATH)
    if _cached_data is None or current_mtime != _cached_mtime:
        _cached_data = load_data()
        _cached_mtime = current_mtime

    return _cached_data


# ═══════════════════════════════════════════════════════
# SENSOR INFO
# ═══════════════════════════════════════════════════════

EDGE_METRICS = {
    'device': {
        'name': 'Edge Computing Node (Simulated)',
        'type': 'Local Processing Unit',
        'specs': 'Quad-Core CPU, 4GB RAM, Local Buffer Storage',
    },
    'performance': {
        'cpu_load_pct': 12.4,
        'memory_used_mb': 450,
        'latency_ms': 2.3,
        'uptime_hours': 2451,
    },
    'network': {
        'status': 'intermittent',
        'raw_data_size_kb_per_hour': 72.0,
        'transmitted_size_kb_per_hour': 5.4,
        'bandwidth_saved_pct': 92.5,
    },
    'data_nodes': [
        {'id': 'flow_sim', 'name': 'Flow Model', 'parameter': 'flow_rate', 'status': 'active', 'type': 'Hydraulic Node'},
        {'id': 'vib_sim', 'name': 'Vibration Model', 'parameter': 'vibration', 'status': 'active', 'type': 'Mechanical Node'},
        {'id': 'temp_sim', 'name': 'Temp Model', 'parameter': 'gen_temp', 'status': 'active', 'type': 'Thermal Node'},
        {'id': 'elec_sim', 'name': 'Electrical Model', 'parameter': 'voltage,current', 'status': 'active', 'type': 'Electrical Node'},
    ]
}


# ═══════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════

@app.get('/api/data/timeseries')
def get_timeseries(
    days: int = Query(600, ge=1),
    points: Optional[int] = Query(None, ge=1),
):
    """Get time-series data. Use days or points as count of rows."""
    data = get_data()
    limit = points or days
    recent = data[-limit:]
    return recent


@app.get('/api/data/summary')
def get_summary():
    """Get current status summary."""
    data = get_data()
    latest = data[-1]
    recent_7 = data[-300:] if len(data) >= 300 else data

    # Calculate averages for last window (7 points)
    avg_flow = sum(r['flow_rate'] for r in recent_7) / len(recent_7)
    avg_vibration = sum(r['vibration'] for r in recent_7) / len(recent_7)
    avg_temp = sum(r['gen_temp'] for r in recent_7) / len(recent_7)
    avg_power = sum(r['power_kw'] for r in recent_7) / len(recent_7)

    status = get_overall_status(latest, recent_rows=recent_7)
    turbine_active = latest['flow_rate'] > 0.15 and latest['power_kw'] > 5

    return {
        'current': {
            'flow_rate': latest['flow_rate'],
            'vibration': latest['vibration'],
            'gen_temp': latest['gen_temp'],
            'voltage': latest['voltage'],
            'current': latest['current'],
            'power_kw': latest['power_kw'],
            'head_pressure': latest.get('head_pressure'),
            'rpm': latest.get('rpm'),
            'frequency': latest.get('frequency'),
        },
        'avg_7d': {
            'flow_rate': round(avg_flow, 3),
            'vibration': round(avg_vibration, 2),
            'gen_temp': round(avg_temp, 1),
            'power_kw': round(avg_power, 1),
        },
        'status': status,
        'turbine_active': turbine_active,
        'date': latest['date'],
        'last_updated': datetime.now().isoformat(),
        'total_data_points': len(data),
    }


@app.get('/api/spc/{parameter}')
def get_spc_data(
    parameter: str,
    days: int = Query(600, ge=10),
    residual: Optional[bool] = None,
):
    """Get Statistical Process Control data for a parameter."""
    valid_params = ['flow_rate', 'vibration', 'gen_temp', 'voltage', 'current', 'power_kw', 'rpm']
    if parameter not in valid_params:
        raise HTTPException(status_code=400, detail=f"Invalid parameter. Choose from: {valid_params}")

    data = get_data()
    recent = data[-days:]
    use_residual = residual if residual is not None else parameter in RESIDUAL_PARAMS
    spc_result = calculate_spc(recent, parameter, use_residual=use_residual)

    if spc_result is None:
        raise HTTPException(status_code=400, detail='Insufficient data')

    return spc_result


@app.get('/api/anomalies')
def get_anomalies(days: int = Query(600, ge=1)):
    """Get detected anomalies from recent data."""
    data = get_data()
    recent = data[-days:]

    anomaly_events = detect_anomalies_batch(recent)

    # Summary stats
    total_anomaly_days = len(anomaly_events)
    total_days = len(recent)
    anomaly_rate = round((total_anomaly_days / total_days) * 100, 1) if total_days > 0 else 0

    # Count by parameter
    param_counts = {}
    for event in anomaly_events:
        for a in event['anomalies']:
            p = a['parameter']
            param_counts[p] = param_counts.get(p, 0) + 1

    return {
        'total_days_analyzed': total_days,
        'anomaly_days': total_anomaly_days,
        'anomaly_rate_pct': anomaly_rate,
        'by_parameter': param_counts,
        'events': anomaly_events[-20:],
    }


@app.get('/api/components')
def get_components():
    """Get health status of 4 critical components."""
    data = get_data()
    latest = data[-1]
    recent = data[-60:]

    health = get_component_health(latest, recent)
    return health


@app.get('/api/alerts')
def get_alerts():
    """Get operational alerts based on SPC detection."""
    data = get_data()
    latest = data[-1]
    recent = data[-300:] if len(data) >= 300 else data
    status = get_overall_status(latest, recent_rows=recent)

    anomalies = detect_anomalies_latest_spc(recent)
    alerts = []

    for a in anomalies:
        # Hanya kirim ke panel alert jika:
        # (1) Status CRITICAL (melanggar batas 3σ SPC), ATAU
        # (2) Nilai melanggar batas fisik operasional (rule-based threshold)
        # Warning 2σ statistik saja tidak perlu muncul di panel notifikasi
        is_critical_spc = a['status'] == 'critical'
        
        # Cek apakah melanggar threshold fisik
        t = THRESHOLDS.get(a['parameter'], {})
        val = a['value'] or 0
        violates_physical = False
        if t:
            violates_physical = (
                val < t.get('warning_min', float('-inf')) or
                val > t.get('warning_max', float('inf'))
            )
        
        if is_critical_spc or violates_physical:
            alert_type = 'danger' if is_critical_spc else 'warning'
            alerts.append({
                'type': alert_type,
                'parameter': a['parameter'],
                'message': f"{a['description']}: {a['value']} {a['unit']} "
                           f"(batas normal: {a['normal_range']})",
            })

    if not alerts:
        alerts.append({
            'type': 'success',
            'parameter': 'all',
            'message': 'Seluruh parameter operasional dalam rentang normal. Sistem beroperasi optimal.',
        })

    return {'status': status, 'alerts': alerts}


@app.get('/api/techno-economics')
def get_techno_economics():
    """Get techno-economic analysis: ROI, NPV, IRR."""
    result = calculate_techno_economics()
    return result


@app.get('/api/thresholds')
def get_thresholds():
    """Get all threshold definitions."""
    return THRESHOLDS


@app.get('/api/edge-status')
def get_edge_status():
    """Get edge computing simulation metrics."""
    return EDGE_METRICS


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='0.0.0.0', port=5000, reload=True)
