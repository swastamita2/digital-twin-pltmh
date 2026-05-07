"""
Rule-Based Thresholds + Statistical Process Control (SPC)
untuk Digital Twin PLTMH.

Metode:
  1. Threshold-based detection (rule-based) untuk konteks batas acuan
  2. Statistical Process Control — Shewhart Control Charts (UCL/LCL)
  3. Residual-based SPC (e_t = x_t - x_hat_t) untuk sensor mekanik/termal

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
        'normal_max': 2.8,    # KTI Tabel 2.1 (Normal)
        'warning_min': 0.0,
        'warning_max': 4.5,   # KTI Tabel 2.1 (Warning)
        'critical_min': 0.0,
        'critical_max': 11.0, # KTI Tabel 2.1 (Critical > 4.5, ISO C/D)
        'description': 'Getaran Turbin (ISO 10816)',
    },
    'gen_temp': {
        'unit': '°C',
        'normal_min': 35.0,
        'normal_max': 60.0,   # KTI Tabel 2.1 (Normal < 60)
        'warning_min': 30.0,
        'warning_max': 80.0,  # KTI Tabel 2.1 (Warning 60-80)
        'critical_min': 25.0,
        'critical_max': 120.0,# KTI Tabel 2.1 (Critical > 80)
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
    'rpm': {
        'unit': 'rpm',
        'normal_min': 712.5,   # 750 rpm - 5%
        'normal_max': 787.5,   # 750 rpm + 5%
        'warning_min': 680.0,
        'warning_max': 820.0,
        'critical_min': 600.0,
        'critical_max': 900.0,
        'description': 'Kecepatan Turbin',
    },
    'frequency': {
        'unit': 'Hz',
        'normal_min': 49.5,    # 50 Hz - 1% (sesuai KTI Tabel 2.1)
        'normal_max': 50.5,    # 50 Hz + 1%
        'warning_min': 49.0,   # 50 Hz - 2%
        'warning_max': 51.0,   # 50 Hz + 2%
        'critical_min': 48.0,  # 50 Hz - 4%
        'critical_max': 52.0,  # 50 Hz + 4%
        'description': 'Frekuensi Output Generator',
    },
}

# Default parameter set for SPC processing
SPC_PARAMS = ['flow_rate', 'vibration', 'gen_temp', 'voltage', 'current', 'power_kw', 'rpm', 'frequency']

# Parameters that use residual-based SPC (per KTI)
RESIDUAL_PARAMS = {'vibration', 'gen_temp'}

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
    if t['warning_min'] <= value <= t['warning_max']:
        return 'warning'
    return 'critical'


def detect_anomalies_single(row):
    """Detect anomalies in a single data row using rule-based thresholds."""
    anomalies = []
    for param in SPC_PARAMS:
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
                'normal_range': f"{t['normal_min']}-{t['normal_max']} {t['unit']}",
            })
    return anomalies


def _rolling_mean(values, window):
    """Compute rolling mean predictions for residual calculation."""
    preds = []
    for i, v in enumerate(values):
        if i == 0:
            preds.append(v)
            continue
        start = max(0, i - window)
        hist = values[start:i]
        preds.append(sum(hist) / len(hist))
    return preds


def calculate_spc(data_rows, parameter, use_residual=False, window=10):
    """Calculate Statistical Process Control (Shewhart) data for a parameter.

    If use_residual=True, applies residual-based SPC:
      e_t = x_t - x_hat_t, x_hat_t = rolling mean(window)
    """
    values = [row[parameter] for row in data_rows if row.get(parameter) is not None]

    if len(values) < 2:
        return None

    if use_residual:
        preds = _rolling_mean(values, window)
        series = [v - p for v, p in zip(values, preds)]
        mode = 'residual'
    else:
        preds = [None] * len(values)
        series = values
        mode = 'raw'

    mean = sum(series) / len(series)
    variance = sum((v - mean) ** 2 for v in series) / (len(series) - 1)
    std = math.sqrt(variance)

    ucl = mean + 3 * std  # Upper Control Limit (3-sigma)
    lcl = mean - 3 * std  # Lower Control Limit (3-sigma)

    # Warning limits (2-sigma)
    uwl = mean + 2 * std
    lwl = mean - 2 * std

    spc_points = []
    idx = 0
    for row in data_rows:
        val = row.get(parameter)
        if val is None:
            continue
        point_value = series[idx]
        ooc = point_value > ucl or point_value < lcl
        warning = (point_value > uwl or point_value < lwl) and not ooc
        spc_points.append({
            'date': row['date'],
            'value': round(point_value, 4),
            'raw_value': val,
            'predicted': preds[idx] if use_residual else None,
            'out_of_control': ooc,
            'warning': warning,
        })
        idx += 1

    return {
        'parameter': parameter,
        'description': THRESHOLDS.get(parameter, {}).get('description', parameter),
        'unit': THRESHOLDS.get(parameter, {}).get('unit', ''),
        'mode': mode,
        'window': window,
        'mean': round(mean, 4),
        'std': round(std, 4),
        'ucl': round(ucl, 4),
        'lcl': round(lcl, 4),
        'uwl': round(uwl, 4),
        'lwl': round(lwl, 4),
        'total_points': len(spc_points),
        'ooc_count': sum(1 for p in spc_points if p['out_of_control']),
        'warning_count': sum(1 for p in spc_points if p['warning']),
        'data': spc_points,
    }


def build_spc_index(data_rows, parameters=None, residual_params=None, window=10):
    """Build SPC index with point lookup by date for fast anomaly checks."""
    params = parameters or SPC_PARAMS
    residual_params = residual_params or RESIDUAL_PARAMS
    index = {}

    for param in params:
        spc = calculate_spc(
            data_rows,
            param,
            use_residual=param in residual_params,
            window=window,
        )
        if not spc:
            continue
        points_by_date = {p['date']: p for p in spc['data']}
        index[param] = {
            'spc': spc,
            'points_by_date': points_by_date,
        }
    return index


def detect_anomalies_batch(data_rows, spc_index=None):
    """Detect anomalies across a batch of rows using SPC limits."""
    if not data_rows:
        return []

    if spc_index is None:
        spc_index = build_spc_index(data_rows)

    all_anomalies = []
    for row in data_rows:
        row_anomalies = []
        for param, entry in spc_index.items():
            point = entry['points_by_date'].get(row['date'])
            if not point:
                continue
            
            # Cek apakah melanggar batas fisik
            val = row.get(param)
            t = THRESHOLDS.get(param, {})
            violates_physical = False
            if t and val is not None:
                violates_physical = (
                    val < t.get('warning_min', float('-inf')) or
                    val > t.get('warning_max', float('inf'))
                )

            # Anomali hanya dicatat jika: (1) Out of control (3σ), ATAU (2) Melanggar batas fisik
            if point['out_of_control'] or violates_physical:
                status = 'critical' if point['out_of_control'] or (t and (val < t.get('critical_min', float('-inf')) or val > t.get('critical_max', float('inf')))) else 'warning'
                row_anomalies.append({
                    'parameter': param,
                    'value': val,
                    'status': status,
                    'unit': t.get('unit', ''),
                    'description': t.get('description', param),
                    'normal_range': f"{t.get('normal_min', '-')}-{t.get('normal_max', '-')} {t.get('unit', '')}",
                    'spc_value': point['value'],
                    'spc_ucl': entry['spc']['ucl'],
                    'spc_lcl': entry['spc']['lcl'],
                    'spc_mode': entry['spc']['mode'],
                })
        if row_anomalies:
            all_anomalies.append({
                'date': row['date'],
                'anomalies': row_anomalies,
            })
    return all_anomalies


def detect_anomalies_latest_spc(data_rows, spc_index=None):
    """Detect anomalies for the latest row using SPC limits."""
    if not data_rows:
        return []

    if spc_index is None:
        spc_index = build_spc_index(data_rows)

    latest = data_rows[-1]
    anomalies = []
    for param, entry in spc_index.items():
        point = entry['points_by_date'].get(latest['date'])
        if not point:
            continue

        # Cek apakah melanggar batas fisik
        val = latest.get(param)
        t = THRESHOLDS.get(param, {})
        violates_physical = False
        if t and val is not None:
            violates_physical = (
                val < t.get('warning_min', float('-inf')) or
                val > t.get('warning_max', float('inf'))
            )

        if point['out_of_control'] or violates_physical:
            status = 'critical' if point['out_of_control'] or (t and (val < t.get('critical_min', float('-inf')) or val > t.get('critical_max', float('inf')))) else 'warning'
            anomalies.append({
                'parameter': param,
                'value': val,
                'status': status,
                'unit': t.get('unit', ''),
                'description': t.get('description', param),
                'normal_range': f"{t.get('normal_min', '-')}-{t.get('normal_max', '-')} {t.get('unit', '')}",
                'spc_value': point['value'],
                'spc_ucl': entry['spc']['ucl'],
                'spc_lcl': entry['spc']['lcl'],
                'spc_mode': entry['spc']['mode'],
            })
    return anomalies


def get_component_health(latest_row, recent_rows=None):
    """Assess health of 4 critical components based on latest sensor data."""
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


def get_overall_status(latest_row, recent_rows=None, spc_index=None):
    """Get overall operational status based on SPC or threshold detection."""
    if recent_rows:
        anomalies = detect_anomalies_latest_spc(recent_rows, spc_index=spc_index)
    else:
        anomalies = detect_anomalies_single(latest_row)

    has_critical = any(a['status'] == 'critical' for a in anomalies)
    has_warning = any(a['status'] == 'warning' for a in anomalies)

    if has_critical:
        return 'Kritis'
    if has_warning:
        return 'Waspada'
    return 'Normal'


def calculate_techno_economics():
    """Calculate techno-economic analysis: ROI, NPV, IRR, Payback Period."""
    # Investment costs (Rp) - Berdasarkan estimasi implementasi framework
    # Referensi: Magadán et al. (2022) — sensor low-cost
    # Total estimasi: Rp 2,5–5,0 juta per unit edge node (sesuai KTI Bab 4.5)
    investment = {
        'edge_computing_unit': 1_050_000,  # Raspberry Pi 4 / ESP32 + casing
        'hydraulic_sim_node': 95_000,      # Sensor YF-S201 (flow) + PCB
        'mechanical_sim_node': 175_000,    # Sensor ADXL345 (vibrasi) + ADC
        'thermal_sim_node': 55_000,        # Sensor DS18B20 (suhu) + kabel
        'electrical_sim_node': 95_000,     # Sensor INA219 (tegangan/arus)
        'system_infrastructure': 450_000,  # Kabel, konektor, panel box, grounding
        'system_integration': 650_000,     # Jasa integrasi, kalibrasi, uji coba
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
