"use client";

import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SummaryData, ComponentsResponse } from '@/lib/api';

// ═══════════════════════════════════════════════════════
// PRELOAD MODEL — triggers loading before component mounts
// ═══════════════════════════════════════════════════════
useGLTF.preload('/turbin-cf.glb');

// ═══════════════════════════════════════════════════════
// HELPERS — warna status untuk material bearing
// ═══════════════════════════════════════════════════════
function statusToColor(status: string): THREE.Color {
  if (status === 'critical') return new THREE.Color(0xef4444); // merah
  if (status === 'warning')  return new THREE.Color(0xf59e0b); // amber
  return new THREE.Color(0x10b981);                             // hijau (normal)
}

function applyBearingMaterial(
  mesh: THREE.Object3D | null,
  status: string,
) {
  if (!mesh) return;
  mesh.traverse((child) => {
    const m = child as THREE.Mesh;
    if (!m.isMesh || !m.material) return;

    // Clone material per-mesh agar tidak mutasi shared material
    const src = Array.isArray(m.material) ? m.material[0] : m.material;
    const mat = (src as THREE.MeshStandardMaterial).clone() as THREE.MeshStandardMaterial;
    const col = statusToColor(status);
    mat.color.copy(col);
    mat.emissive.copy(col);
    mat.emissiveIntensity = status !== 'normal' ? 0.45 : 0.05;
    mat.needsUpdate = true;
    m.material = mat;
  });
}

// ═══════════════════════════════════════════════════════
// CROSS-FLOW TURBINE MODEL — dengan animasi dinamis
// ═══════════════════════════════════════════════════════
function CrossFlowTurbineModel({
  flowRate,
  isActive,
  vibrationStatus,
  generatorStatus,
}: {
  flowRate: number;
  isActive: boolean;
  vibrationStatus: string;
  generatorStatus: string;
}) {
  const { scene } = useGLTF('/turbin-cf.glb');

  // Refs untuk objek yang perlu dirotasi
  const turbineRef = useRef<THREE.Object3D | null>(null);
  const genRef     = useRef<THREE.Object3D | null>(null);
  // Fallback: jika nama tidak ditemukan, groupRef untuk muter semua model
  const groupRef   = useRef<THREE.Group>(null!);

  // Refs untuk bearing shields (material dinamis)
  const shieldTurbineRef   = useRef<THREE.Object3D | null>(null);
  const shieldPulleyRef    = useRef<THREE.Object3D | null>(null);
  const shieldGeneratorRef = useRef<THREE.Object3D | null>(null);

  // Clone scene & temukan objek berdasarkan nama
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    turbineRef.current         = null;
    genRef.current             = null;
    shieldTurbineRef.current   = null;
    shieldPulleyRef.current    = null;
    shieldGeneratorRef.current = null;

    // ─── SCAN: Gunakan EXACT match karena nama sudah diketahui dari console dump ───
    clone.traverse((child) => {
      const n = child.name;

      // Objek dinamis (rotasi) — exact match prioritas tertinggi
      if (n === 'Turbine')  { turbineRef.current = child; return; }
      if (n === 'Gen')      { genRef.current     = child; return; }

      // Shield bearings — nama sudah dikonfirmasi eksak oleh user
      if (n === 'Shield_Bearing_Turbine')   { shieldTurbineRef.current   = child; return; }
      if (n === 'Shield_Bearing_Pulley')    { shieldPulleyRef.current    = child; return; }
      if (n === 'Shield_Bearing_Generator') { shieldGeneratorRef.current = child; return; }
    });

    // Log hasil untuk konfirmasi
    console.log('[Turbine3D] Turbine:', turbineRef.current?.name ?? '❌ NOT FOUND');
    console.log('[Turbine3D] Gen:',     genRef.current?.name     ?? '❌ NOT FOUND');
    console.log('[Turbine3D] Shield_Bearing_Turbine:',   shieldTurbineRef.current?.name   ?? '❌');
    console.log('[Turbine3D] Shield_Bearing_Pulley:',    shieldPulleyRef.current?.name    ?? '❌');
    console.log('[Turbine3D] Shield_Bearing_Generator:', shieldGeneratorRef.current?.name ?? '❌');

    return clone;
  }, [scene]);

  // Update warna bearing saat status berubah
  useEffect(() => {
    applyBearingMaterial(shieldTurbineRef.current,   vibrationStatus);
    applyBearingMaterial(shieldPulleyRef.current,    vibrationStatus);
    applyBearingMaterial(shieldGeneratorRef.current, generatorStatus);
  }, [vibrationStatus, generatorStatus, clonedScene]);

  // Speed SELALU aktif selama flowRate > 0 — tidak bergantung isActive
  // Hardcode minimum 2.0 rad/s agar rotasi pasti terlihat
  const speedRef = useRef(2.0);
  useEffect(() => {
    const baseSpeed = flowRate > 0.05
      ? Math.max(2.0, (flowRate / 0.55) * 3.0)
      : 0;
    speedRef.current = baseSpeed;
    console.log('[Turbine3D] speed set to:', baseSpeed.toFixed(2), ' flowRate:', flowRate);
  }, [flowRate]);

  useFrame((_, delta) => {
    const spd = speedRef.current;
    if (spd <= 0) return;

    // Turbine runner — coba sumbu Y (cross-flow runner dilihat dari samping)
    if (turbineRef.current) {
      turbineRef.current.rotation.y += spd * delta;
    }

    // Generator rotor — 2× kecepatan turbine
    if (genRef.current) {
      genRef.current.rotation.y += spd * 2 * delta;
    }
  });

  return (
    <group ref={groupRef} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI / 4, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// GROUND PLANE
// ═══════════════════════════════════════════════════════
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#CBD5E1" roughness={0.9} metalness={0.0} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN 3D SCENE
// ═══════════════════════════════════════════════════════
function TurbineScene({
  summary,
  components,
}: {
  summary: SummaryData;
  components?: ComponentsResponse;
}) {
  const isActive      = summary.turbine_active;
  const flowRate      = summary.current.flow_rate;
  const bearingStatus = components?.bearing?.status   || 'normal';
  const genStatus     = components?.generator?.status || 'normal';

  // Kecepatan orbit kamera (lambat saat idle agar tampak elegan)
  const autoRotateSpeed = isActive ? 0.6 : 0.2;

  return (
    <>
      {/* Pencahayaan: multi-layer tanpa shadow pipeline */}
      <ambientLight intensity={1.0} color="#e0f2fe" />
      <directionalLight position={[8, 12, 8]}  intensity={2.0} color="#ffffff" />
      <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#bae6fd" />
      <pointLight       position={[0, 4, 2]}   intensity={0.8} color="#0d9488" distance={12} />
      <hemisphereLight  args={['#dbeafe', '#94a3b8', 0.5]} />

      <Ground />

      {/* === MODEL TURBIN CROSS-FLOW — DINAMIS === */}
      <group position={[0, -0.5, 0]}>
        <CrossFlowTurbineModel
          flowRate={flowRate}
          isActive={isActive}
          vibrationStatus={bearingStatus}
          generatorStatus={genStatus}
        />
      </group>

      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.25}
        minDistance={2}
        maxDistance={18}
        autoRotate={false}
        target={[0, 0, 0]}
        zoomSpeed={1.2}
        rotateSpeed={1.2}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SENSOR CHIP — komponen 2D untuk overlay panel
// ═══════════════════════════════════════════════════════
function SensorChip({ label, sensorName, value, unit, status = 'normal' }: {
  label: string;
  sensorName: string;
  value: string;
  unit: string;
  status?: string;
}) {
  const dotColor =
    status === 'critical' ? 'bg-red-500 shadow-red-400' :
    status === 'warning'  ? 'bg-amber-400 shadow-amber-300' :
                            'bg-emerald-500 shadow-emerald-400';
  const valColor =
    status === 'critical' ? 'text-red-400' :
    status === 'warning'  ? 'text-amber-400' :
                            'text-teal-400';
  return (
    <div className="flex items-center gap-2 bg-slate-900/75 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_5px] ${dotColor}`} />
      <div className="flex flex-col leading-none">
        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">{sensorName} · {label}</span>
        <span className={`text-[11px] font-bold font-mono mt-0.5 ${valColor}`}>
          {value} <span className="text-slate-500 font-normal text-[9px]">{unit}</span>
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT EXPORT — wrapper dengan Canvas
// ═══════════════════════════════════════════════════════
export default function Turbine3D({
  summary,
  components,
}: {
  summary: SummaryData;
  components?: ComponentsResponse;
}) {
  const isActive     = summary.turbine_active;
  const power        = summary.current.power_kw;
  const efficiency   = Math.min(100, Math.round((power / 50) * 100));
  const bearingStatus = components?.bearing?.status   || 'normal';
  const genStatus     = components?.generator?.status || 'normal';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Digital Twin — PLTMH Turbin Cross-Flow
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Model 3D interaktif · Sensor real-time terintegrasi
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isActive
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
          )}
          {isActive ? 'Beroperasi' : 'Idle'}
        </span>
      </div>

      {/* 3D Canvas — frameloop=always karena ada animasi rotasi berkelanjutan */}
      <div className="h-[500px] bg-gradient-to-b from-slate-100 to-slate-300 relative">
        <Canvas
          camera={{ position: [5, 3, 6], fov: 45 }}
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            powerPreference: 'high-performance',
          }}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <TurbineScene summary={summary} components={components} />
          </Suspense>
        </Canvas>

        {/* ── SENSOR OVERLAY (pojok kanan atas) ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          <SensorChip
            label="Vibrasi Turbin"
            sensorName="ADXL345"
            value={summary.current.vibration.toFixed(1)}
            unit="mm/s"
            status={bearingStatus}
          />
          <SensorChip
            label="Suhu Bearing"
            sensorName="DS18B20"
            value={summary.current.gen_temp.toFixed(0)}
            unit="°C"
            status={genStatus}
          />
          <SensorChip
            label="Debit Air"
            sensorName="YF-S201"
            value={summary.current.flow_rate.toFixed(2)}
            unit="m³/s"
            status="normal"
          />
          <SensorChip
            label="Tegangan & Arus"
            sensorName="INA219"
            value={`${summary.current.voltage.toFixed(0)}V / ${summary.current.current?.toFixed(0) ?? '0'}A`}
            unit=""
            status="normal"
          />
          <SensorChip
            label="RPM Turbin"
            sensorName="ENCODER"
            value={(summary.current.rpm ?? 0).toFixed(0)}
            unit="rpm"
            status={(summary.current.rpm ?? 750) < 712 || (summary.current.rpm ?? 750) > 787 ? 'warning' : 'normal'}
          />
          <SensorChip
            label="Frekuensi"
            sensorName="GOVERNOR"
            value={(summary.current.frequency ?? 50).toFixed(2)}
            unit="Hz"
            status={(summary.current.frequency ?? 50) < 49.5 || (summary.current.frequency ?? 50) > 50.5 ? 'warning' : 'normal'}
          />
        </div>

        {/* ── KPI bawah ── */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200/60">
            <span className="text-[10px] text-slate-400">Total Daya Output</span>
            <p className="text-base font-bold text-slate-800 font-mono">
              {power.toFixed(1)} <span className="text-xs text-slate-400">kW</span>
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200/60 text-right">
            <span className="text-[10px] text-slate-400">Efisiensi Sistem</span>
            <p
              className={`text-base font-bold font-mono ${
                efficiency >= 70
                  ? 'text-emerald-600'
                  : efficiency >= 40
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {efficiency}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
