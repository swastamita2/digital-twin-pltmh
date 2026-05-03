"""
Rule-Based Anomaly Detection & Statistical Process Control (SPC)
untuk Digital Twin PLTMH.

Metode:
  1. Threshold-based detection (rule-based)
  2. Statistical Process Control — Shewhart Control Charts (UCL/LCL)
  3. Rate-of-change detection (perubahan mendadak)

Referensi:
  - ISO 10816 untuk batas getaran mesin
  - Standar operasional PLTMH tipe Cross-flow
"""

import math


# ═══════════════════════════════════════════════════════
# THRESHOLD DEFINITIONS (Rule-Based)
# ═══════════════════════════════════════════════════════

THRESHOLDS = {
    'flow_rate': {
        'unit': 'm³/s',
        'normal_min': 0.25,
        'normal_max': 0.90,
        'warning_min': 0.15,
        'warning_max': 1.00,
        'critical_min': 0.05,
        'critical_max': 1.20,
        'description': 'Debit Air Masuk Turbin',
    },
    'vibration': {
        'unit': 'mm/s',
        'normal_min': 0.0,
        'normal_max': 4.5,    # ISO 10816 Class III Zone A/B boundary
        'warning_min': 0.0,
        'warning_max': 7.1,   # ISO 10816 Zone B/C boundary
        'critical_min': 0.0,
        'critical_max': 11.0,  # ISO 10816 Zone C/D boundary
        'description': 'Getaran Turbin (ISO 10816)',
    },
    'gen_temp': {
        'unit': '°C',
        'normal_min': 35.0,
        'normal_max': 80.0,
        'warning_min': 30.0,
        'warning_max': 100.0,
        'critical_min': 25.0,
        'critical_max': 120.0,
        'description': 'Suhu Generator',
    },
    'voltage': {
        'unit': 'V',
        'normal_min': 198.0,   # 220V - 10%
        'normal_max': 242.0,   # 220V + 10%
        'warning_min': 187.0,  # 220V - 15%
        'warning_max': 253.0,  # 220V + 15%
        'critical_min': 176.0, # 220V - 20%
        'critical_max': 264.0, # 220V + 20%
        'description': 'Tegangan Output',
    },
    'current': {
        'unit': 'A',
        'normal_min': 50.0,
        'normal_max': 250.0,
        'warning_min': 30.0,
        'warning_max': 270.0,
        'critical_min': 10.0,
        'critical_max': 290.0,
        'description': 'Arus Output',
    },
    'power_kw': {
        'unit': 'kW',
        'normal_min': 10.0,
        'normal_max': 55.0,
        'warning_min': 5.0,
        'warning_max': 70.0,
        'critical_min': 0.0,
        'critical_max': 100.0,
        'description': 'Daya Output',
    },
}

# Mapping: komponen → parameter sensor → penyebab downtime
COMPONENT_SENSOR_MAP = {
    'bearing': {
        'parameter': 'vibration',
        'name': 'Bearing Turbin',
        'failure_pct': 35,
        'description': 'Kerusakan bearing terdeteksi dari peningkatan getaran turbin',
    },
    'pipa': {
        'parameter': 'flow_rate',
        'name': 'Pipa Pesat',
        'failure_pct': 28,
        'description': 'Kebocoran pipa terdeteksi dari penurunan debit abnormal',
        'inverted': True,  # Low flow_rate = problem
    },
    'generator': {
        'parameter': 'gen_temp',
        'name': 'Generator',
        'failure_pct': 22,
        'description': 'Overheating generator terdeteksi dari sensor suhu',
    },
    'intake': {
        'parameter': 'flow_rate',
        'name': 'Intake',
        'failure_pct': 15,
        'description': 'Penyumbatan intake terdeteksi dari penurunan debit mendadak',
        'inverted': True,
    },
}


# ═══════════════════════════════════════════════════════
# CORE FUNCTIONS
# ═══════════════════════════════════════════════════════

def classify_value(param_name, value):
    """Classify a parameter value as 'normal', 'warning', or 'critical'."""
    t = THRESHOLDS.get(param_name)
    if t is None:
        return 'unknown'
    
    if t['normal_min'] <= value <= t['normal_max']:
        return 'normal'
    elif t['warning_min'] <= value <= t['warning_max']:
        return 'warning'
    else:
        return 'critical'


def detect_anomalies_single(row):
    """Detect anomalies in a single data row using rule-based thresholds.
    
    Returns a list of anomaly dicts.
    """
    anomalies = []
    for param in ['flow_rate', 'vibration', 'gen_temp', 'voltage', 'current', 'power_kw']:
        val = row.get(param)
        if val is None:
            continue
        status = classify_value(param, val)
        if status != 'normal':
            t = THRESHOLDS[param]
            anomalies.append({
                'parameter': param,
                'value': val,
                'status': status,
                'unit': t['unit'],
                'description': t['description'],
                'normal_range': f"{t['normal_min']}–{t['normal_max']} {t['unit']}",
            })
    return anomalies


def detect_anomalies_batch(data_rows):
    """Detect anomalies across a batch of rows. Returns summary + list."""
    all_anomalies = []
    for row in data_rows:
        row_anomalies = detect_anomalies_single(row)
        if row_anomalies:
            all_anomalies.append({
                'date': row['date'],
                'anomalies': row_anomalies,
            })
    return all_anomalies


def calculate_spc(data_rows, parameter):
    """Calculate Statistical Process Control (Shewhart) data for a parameter.
    
    Returns dict with: mean, std, UCL, LCL, and data points with OOC flags.
    """
    values = [row[parameter] for row in data_rows if row.get(parameter) is not None]
    
    if len(values) < 2:
        return None
    
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / (len(values) - 1)
    std = math.sqrt(variance)
    
    ucl = mean + 3 * std  # Upper Control Limit (3-sigma)
    lcl = mean - 3 * std  # Lower Control Limit (3-sigma)
    
    # Also calculate warning limits (2-sigma)
    uwl = mean + 2 * std
    lwl = mean - 2 * std
    
    spc_points = []
    for row in data_rows:
        val = row.get(parameter)
        if val is None:
            continue
        ooc = val > ucl or val < lcl  # Out of Control
        warning = (val > uwl or val < lwl) and not ooc
        spc_points.append({
            'date': row['date'],
            'value': val,
            'out_of_control': ooc,
            'warning': warning,
        })
    
    return {
        'parameter': parameter,
        'description': THRESHOLDS.get(parameter, {}).get('description', parameter),
        'unit': THRESHOLDS.get(parameter, {}).get('unit', ''),
        'mean': round(mean, 3),
        'std': round(std, 3),
        'ucl': round(ucl, 3),
        'lcl': round(lcl, 3),
        'uwl': round(uwl, 3),
        'lwl': round(lwl, 3),
        'total_points': len(spc_points),
        'ooc_count': sum(1 for p in spc_points if p['out_of_control']),
        'warning_count': sum(1 for p in spc_points if p['warning']),
        'data': spc_points,
    }


def get_component_health(latest_row, recent_rows=None):
    """Assess health of 4 critical components based on latest sensor data.
    
    Components:
      - Bearing (via vibration)
      - Pipa Pesat (via flow_rate, inverted)
      - Generator (via gen_temp)
      - Intake (via flow_rate, sudden drop)
    """
    components = {}
    
    for comp_id, comp_info in COMPONENT_SENSOR_MAP.items():
        param = comp_info['parameter']
        val = latest_row.get(param, 0)
        
        # For inverted parameters (low = bad), flip classification
        if comp_info.get('inverted'):
            # For intake: detect sudden drop by comparing to recent average
            if comp_id == 'intake' and recent_rows and len(recent_rows) >= 3:
                recent_avg = sum(r.get(param, 0) for r in recent_rows[-7:]) / min(7, len(recent_rows))
                drop_pct = ((recent_avg - val) / recent_avg * 100) if recent_avg > 0 else 0
                if drop_pct > 30:
                    status = 'critical'
                elif drop_pct > 15:
                    status = 'warning'
                else:
                    status = 'normal'
                health_pct = max(0, min(100, 100 - drop_pct * 2))
            else:
                # Pipa: low flow = problem
                status = classify_value(param, val)
                # Invert: if flow is low → warning/critical
                if val < THRESHOLDS[param]['normal_min']:
                    status = 'warning' if val >= THRESHOLDS[param]['warning_min'] else 'critical'
                else:
                    status = 'normal'
                health_pct = max(0, min(100, (val / THRESHOLDS[param]['normal_max']) * 100))
        else:
            status = classify_value(param, val)
            t = THRESHOLDS[param]
            # Health % — higher for values closer to normal center
            center = (t['normal_min'] + t['normal_max']) / 2
            max_deviation = t['critical_max'] - center
            deviation = abs(val - center)
            health_pct = max(0, min(100, (1 - deviation / max_deviation) * 100))
        
        components[comp_id] = {
            'id': comp_id,
            'name': comp_info['name'],
            'status': status,
            'health_pct': round(health_pct, 1),
            'sensor_param': param,
            'sensor_value': val,
            'sensor_unit': THRESHOLDS[param]['unit'],
            'failure_pct': comp_info['failure_pct'],
            'description': comp_info['description'],
        }
    
    return components


def get_overall_status(latest_row):
    """Get overall operational status based on all parameters."""
    anomalies = detect_anomalies_single(latest_row)
    
    has_critical = any(a['status'] == 'critical' for a in anomalies)
    has_warning = any(a['status'] == 'warning' for a in anomalies)
    
    if has_critical:
        return 'Kritis'
    elif has_warning:
        return 'Waspada'
    else:
        return 'Normal'


def calculate_techno_economics():
    """Calculate techno-economic analysis: ROI, NPV, IRR, Payback Period.
    
    Based on data from the paper:
    - Reactive maintenance: Rp 45-60 juta/tahun
    - Target predictive: Rp 15-20 juta/tahun
    - Sensor investment: < USD 200 ≈ Rp 3.2 juta
    """
    # Investment costs (Rp) - Berdasarkan estimasi implementasi framework
    investment = {
        'edge_computing_unit': 900_000,  # Estimasi unit processing lokal
        'hydraulic_sim_node': 80_000,   # Modul akuisisi data hidrolik
        'mechanical_sim_node': 130_000, # Modul akuisisi data mekanik
        'thermal_sim_node': 32_000,      # Modul akuisisi data termal
        'electrical_sim_node': 80_000,   # Modul akuisisi data elektrikal
        'system_infrastructure': 400_000, # Kabel dan casing pelindung
        'system_integration': 500_000,    # Jasa integrasi dan kalibrasi sistem
    }
    total_investment = sum(investment.values())
    
    # Annual costs
    reactive_maintenance_annual = 52_500_000   # Rp 52.5 juta (average 45-60)
    predictive_maintenance_annual = 17_500_000  # Rp 17.5 juta (average 15-20)
    annual_savings = reactive_maintenance_annual - predictive_maintenance_annual
    
    # Operating cost of sensors per year
    sensor_operating_annual = 500_000  # Listrik, penggantian minor
    net_annual_savings = annual_savings - sensor_operating_annual
    
    # Downtime improvement
    reactive_downtime_days = 180  # per tahun
    predictive_downtime_days = 36  # target: reduce 80%
    downtime_reduction_pct = round((1 - predictive_downtime_days / reactive_downtime_days) * 100, 1)
    
    # ROI
    roi = round((net_annual_savings / total_investment) * 100, 1)
    
    # Payback Period (months)
    payback_months = round(total_investment / (net_annual_savings / 12), 1)
    
    # NPV (5 years, discount rate 10%)
    discount_rate = 0.10
    npv = -total_investment
    for year in range(1, 6):
        npv += net_annual_savings / ((1 + discount_rate) ** year)
    npv = round(npv)
    
    # Simple IRR approximation
    # IRR is where NPV = 0. Given high ROI, IRR will be very high.
    # Using iterative approach
    irr = 0.0
    for rate_pct in range(1, 2000):  # 1% to 2000%
        rate = rate_pct / 100.0
        test_npv = -total_investment
        for year in range(1, 6):
            test_npv += net_annual_savings / ((1 + rate) ** year)
        if test_npv <= 0:
            irr = rate_pct - 1
            break
    
    return {
        'investment_breakdown': investment,
        'total_investment': total_investment,
        'total_investment_usd': round(total_investment / 16_000, 0),  # Approx USD
        'reactive_annual': reactive_maintenance_annual,
        'predictive_annual': predictive_maintenance_annual,
        'annual_savings': annual_savings,
        'net_annual_savings': net_annual_savings,
        'roi_pct': roi,
        'payback_months': payback_months,
        'npv_5yr': npv,
        'irr_pct': irr,
        'downtime_reactive_days': reactive_downtime_days,
        'downtime_predictive_days': predictive_downtime_days,
        'downtime_reduction_pct': downtime_reduction_pct,
        'discount_rate_pct': discount_rate * 100,
        'analysis_period_years': 5,
    }
