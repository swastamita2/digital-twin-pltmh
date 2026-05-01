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

# Cache
_cached_data = None


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
    """Get cached data."""
    global _cached_data
    if _cached_data is None:
        _cached_data = load_data()
    return _cached_data


# ═══════════════════════════════════════════════════════
# SENSOR INFO
# ═══════════════════════════════════════════════════════

SENSORS = [
    {
        'id': 'flow_sensor',
        'name': 'YF-S201',
        'type': 'Flow Rate Sensor',
        'parameter': 'flow_rate',
        'unit': 'm³/s',
        'price_idr': 80_000,
        'price_usd': 5,
        'status': 'online',
    },
    {
        'id': 'vibration_sensor',
        'name': 'ADXL345',
        'type': 'Accelerometer / Vibration',
        'parameter': 'vibration',
        'unit': 'mm/s',
        'price_idr': 130_000,
        'price_usd': 8,
        'status': 'online',
    },
    {
        'id': 'temp_sensor',
        'name': 'DS18B20',
        'type': 'Temperature Sensor',
        'parameter': 'gen_temp',
        'unit': '°C',
        'price_idr': 32_000,
        'price_usd': 2,
        'status': 'online',
    },
    {
        'id': 'power_sensor',
        'name': 'INA219',
        'type': 'Voltage/Current Sensor',
        'parameter': 'voltage,current',
        'unit': 'V / A',
        'price_idr': 80_000,
        'price_usd': 5,
        'status': 'online',
    },
]


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


@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """Get edge sensor information."""
    total_cost_idr = sum(s['price_idr'] for s in SENSORS)
    total_cost_usd = sum(s['price_usd'] for s in SENSORS)
    
    # Add Raspberry Pi
    edge_device = {
        'name': 'Raspberry Pi 4 Model B',
        'type': 'Edge Computing Device',
        'price_idr': 900_000,
        'price_usd': 55,
        'specs': 'ARM Cortex-A72, 4GB RAM, WiFi, GPIO 40-pin',
    }
    
    misc = {
        'name': 'Kabel, Housing, Power Supply',
        'price_idr': 400_000,
        'price_usd': 25,
    }
    
    grand_total_idr = total_cost_idr + edge_device['price_idr'] + misc['price_idr']
    grand_total_usd = total_cost_usd + edge_device['price_usd'] + misc['price_usd']

    return jsonify({
        'edge_device': edge_device,
        'sensors': SENSORS,
        'misc': misc,
        'total_sensor_cost_idr': total_cost_idr,
        'grand_total_idr': grand_total_idr,
        'grand_total_usd': grand_total_usd,
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
