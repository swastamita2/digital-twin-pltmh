"""
Flask REST API — Digital Twin PLTMH Dashboard Backend
Menggunakan Rule-Based Anomaly Detection & Statistical Process Control (SPC)

Endpoints:
  /api/data/timeseries      — Data time-series parameter operasional
  /api/data/summary         — Ringkasan status terkini
  /api/spc/<parameter>      — Data SPC (control chart) per parameter
  /api/anomalies            — Daftar anomali terdeteksi
  /api/components           — Status kesehatan 4 komponen kritis
  /api/alerts               — Peringatan operasional
  /api/techno-economics     — Analisis tekno-ekonomi (ROI, NPV, IRR)
  /api/thresholds           — Definisi threshold per parameter
  /api/sensors              — Info sensor edge computing
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import os
from datetime import datetime

from model.anomaly_detection import (
    detect_anomalies_single,
    detect_anomalies_batch,
    calculate_spc,
    get_component_health,
    get_overall_status,
    calculate_techno_economics,
    THRESHOLDS,
)

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_pltmh.csv')

# Cache variables
_cached_data = None
_cached_mtime = 0

# ═══════════════════════════════════════════════════════
# DATA LOADING
# ═══════════════════════════════════════════════════════

def load_data():
    """Load dataset from CSV. Generate if not exists."""
    if not os.path.exists(DATA_PATH):
        from data.dataset_generator import generate_pltmh_dataset
        generate_pltmh_dataset()

    data = []
    with open(DATA_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append({
                'date': row['date'],
                'flow_rate': float(row['flow_rate']),
                'vibration': float(row['vibration']),
                'gen_temp': float(row['gen_temp']),
                'voltage': float(row['voltage']),
                'current': float(row['current']),
                'power_kw': float(row['power_kw']),
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
    if _cached_data is None or current_mtime > _cached_mtime:
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
        'transmitted_size_kb_per_hour': 0.4,
        'bandwidth_saved_pct': 99.4,
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

@app.route('/api/data/timeseries', methods=['GET'])
def get_timeseries():
    """Get time-series data. Optional ?days=N to limit."""
    data = get_data()
    days = request.args.get('days', 30, type=int)
    recent = data[-days:]
    return jsonify(recent)


@app.route('/api/data/summary', methods=['GET'])
def get_summary():
    """Get current status summary."""
    data = get_data()
    latest = data[-1]
    recent_7 = data[-7:]

    # Calculate averages for last 7 days
    avg_flow = sum(r['flow_rate'] for r in recent_7) / len(recent_7)
    avg_vibration = sum(r['vibration'] for r in recent_7) / len(recent_7)
    avg_temp = sum(r['gen_temp'] for r in recent_7) / len(recent_7)
    avg_power = sum(r['power_kw'] for r in recent_7) / len(recent_7)

    status = get_overall_status(latest)
    turbine_active = latest['flow_rate'] > 0.15 and latest['power_kw'] > 5

    return jsonify({
        'current': {
            'flow_rate': latest['flow_rate'],
            'vibration': latest['vibration'],
            'gen_temp': latest['gen_temp'],
            'voltage': latest['voltage'],
            'current': latest['current'],
            'power_kw': latest['power_kw'],
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
    })


@app.route('/api/spc/<parameter>', methods=['GET'])
def get_spc_data(parameter):
    """Get Statistical Process Control data for a parameter."""
    valid_params = ['flow_rate', 'vibration', 'gen_temp', 'voltage', 'current', 'power_kw']
    if parameter not in valid_params:
        return jsonify({'error': f'Invalid parameter. Choose from: {valid_params}'}), 400

    data = get_data()
    days = request.args.get('days', 60, type=int)
    recent = data[-days:]
    spc_result = calculate_spc(recent, parameter)

    if spc_result is None:
        return jsonify({'error': 'Insufficient data'}), 400

    return jsonify(spc_result)


@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """Get detected anomalies from recent data."""
    data = get_data()
    days = request.args.get('days', 30, type=int)
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

    return jsonify({
        'total_days_analyzed': total_days,
        'anomaly_days': total_anomaly_days,
        'anomaly_rate_pct': anomaly_rate,
        'by_parameter': param_counts,
        'events': anomaly_events[-20:],  # Last 20 events
    })


@app.route('/api/components', methods=['GET'])
def get_components():
    """Get health status of 4 critical components."""
    data = get_data()
    latest = data[-1]
    recent = data[-14:]

    health = get_component_health(latest, recent)
    return jsonify(health)


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get operational alerts based on rule-based detection."""
    data = get_data()
    latest = data[-1]
    status = get_overall_status(latest)

    anomalies = detect_anomalies_single(latest)
    alerts = []

    for a in anomalies:
        alert_type = 'danger' if a['status'] == 'critical' else 'warning'
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

    return jsonify({'status': status, 'alerts': alerts})


@app.route('/api/techno-economics', methods=['GET'])
def get_techno_economics():
    """Get techno-economic analysis: ROI, NPV, IRR."""
    result = calculate_techno_economics()
    return jsonify(result)


@app.route('/api/thresholds', methods=['GET'])
def get_thresholds():
    """Get all threshold definitions."""
    return jsonify(THRESHOLDS)


@app.route('/api/edge-status', methods=['GET'])
def get_edge_status():
    """Get edge computing simulation metrics."""
    return jsonify(EDGE_METRICS)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
