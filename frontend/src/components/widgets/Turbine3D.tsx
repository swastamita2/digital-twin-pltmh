"use client";

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SummaryData, ComponentsResponse } from '@/lib/api';

// ═══════════════════════════════════════════════════════
// CROSS-FLOW TURBINE & BOXY CASING
// ═══════════════════════════════════════════════════════
function TurbineAssembly({ rotationSpeed = 1 }: { rotationSpeed: number }) {
  const runnerRef = useRef<THREE.Group>(null!);

  useFrame((_state, delta) => {
    if (runnerRef.current) {
      runnerRef.current.rotation.z -= delta * rotationSpeed; // Negative to spin correctly with flow
    }
  });

  const bladeCount = 20;
  const radius = 0.6;
  const length = 1.4;

  const blades = useMemo(() => {
    const items = [];
    for (let i = 0; i < bladeCount; i++) {
      items.push({ angle: (i / bladeCount) * Math.PI * 2, key: i });
    }
    return items;
  }, [bladeCount]);

  return (
    <group position={[0, 0.4, 0]}>
      {/* Boxy Metal Casing (Reference: T-12 Cross Flow) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.8, length + 0.2]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      
      {/* Casing Flanges / Ribs */}
      {[-length/2 - 0.1, length/2 + 0.1].map((z, i) => (
        <mesh key={`rib-${i}`} position={[0, 0, z]}>
          <boxGeometry args={[1.9, 1.9, 0.05]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}

      {/* Internal Rotating Runner */}
      <group ref={runnerRef} rotation={[0, 0, 0]}>
        {/* Main Shaft extending to pulley */}
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, length + 1.2, 16]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Hub Discs */}
        {[-length/2, length/2].map((z, i) => (
          <mesh key={`disc-${i}`} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.04, 32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Blades */}
        {blades.map(({ angle, key }) => {
          const x = Math.cos(angle) * radius * 0.8;
          const y = Math.sin(angle) * radius * 0.8;
          return (
            <mesh key={key} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 4]}>
              <boxGeometry args={[radius * 0.4, 0.02, length]} />
              <meshStandardMaterial color="#0D9488" metalness={0.5} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* Bearing Housing (Front) with Vibration Sensor */}
      <group position={[0, 0, -1.0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* ADXL345 Sensor on Bearing */}
        <group position={[0, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.02, 0.06]} />
            <meshStandardMaterial color="#2563EB" roughness={0.8} />
          </mesh>
        </group>
      </group>
      
      {/* Bearing Housing (Back) */}
      <group position={[0, 0, 1.0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// GENERATOR & BELT DRIVE
// ═══════════════════════════════════════════════════════
function GeneratorAssembly({ tempStatus = 'normal', rotationSpeed = 1 }: { tempStatus?: string, rotationSpeed: number }) {
  const pulleyRef = useRef<THREE.Group>(null!);
  
  // Generator pulley spins faster (e.g. 1:3 ratio)
  useFrame((_state, delta) => {
    if (pulleyRef.current) {
      pulleyRef.current.rotation.z -= delta * rotationSpeed * 3;
    }
  });

  const color = tempStatus === 'critical' ? '#EF4444' : tempStatus === 'warning' ? '#F59E0B' : '#3B82F6';

  return (
    <group position={[-2.5, 0.6, 0]}>
      {/* Belt Drive System */}
      {/* Turbine Pulley (Large) - Absolute position relative to Turbine Shaft */}
      <group position={[2.5, -0.2, -1.4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
      </group>

      {/* Generator Pulley (Small) */}
      <group position={[0, 0, -1.4]} ref={pulleyRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        {/* Shaft */}
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.0, 16]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} />
        </mesh>
      </group>

      {/* Drive Belt connecting the two pulleys */}
      <mesh position={[1.25, -0.1, -1.4]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[2.5, 0.4, 0.05]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>
      <mesh position={[1.25, -0.5, -1.4]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[2.5, 0.4, 0.05]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>

      {/* Generator Body (Green/Blue standard industrial color) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 24]} />
        <meshStandardMaterial color="#059669" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Base Mount */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[0.8, 0.2, 1.0]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      {/* Cooling fins */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.02, 4, 32]} />
          <meshStandardMaterial color="#047857" metalness={0.3} roughness={0.4} />
        </mesh>
      ))}

      {/* Status indicator light */}
      <mesh position={[0, 0.55, 0.4]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>

      {/* SENSOR: DS18B20 (Temperature) Probe */}
      <group position={[0.3, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#D1D5DB" metalness={1} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.06]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// FOREBAY, PENSTOCK & FLOW SENSOR
// ═══════════════════════════════════════════════════════
function HydrologySystem() {
  const pipeColor = "#94A3B8";

  return (
    <group>
      {/* Forebay (Bak Penenang) at the top of the slope */}
      <group position={[0, 4.5, -4.5]}>
        {/* Concrete Pool */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[4, 1, 3]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
        </mesh>
        {/* Water inside Forebay */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[3.6, 0.1, 2.6]} />
          <meshStandardMaterial color="#0EA5E9" transparent opacity={0.7} roughness={0.1} />
        </mesh>
        {/* Trash Rack (Saringan Sampah) */}
        <mesh position={[0, 0.5, 1.3]} rotation={[Math.PI / 8, 0, 0]}>
          <boxGeometry args={[2, 1.5, 0.05]} />
          <meshStandardMaterial color="#475569" wireframe />
        </mesh>
      </group>

      {/* Penstock (Pipa Pesat) - Steep 45 degree angle into turbine casing */}
      <mesh position={[0, 2.5, -2.5]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 5.0, 16]} />
        <meshStandardMaterial color={pipeColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* SENSOR: YF-S201 (Flow Meter) Inline on Penstock */}
      <group position={[0, 2.8, -2.8]} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.4, 16]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.2]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {/* Tailrace Outlet from bottom of turbine */}
      <mesh position={[0, -0.4, 0.5]}>
        <boxGeometry args={[1.6, 0.8, 1.5]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// CONTROL PANEL & POWER LINE
// ═══════════════════════════════════════════════════════
function ElectricalSystem() {
  return (
    <group>
      {/* Control Panel near generator */}
      <group position={[-4.0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, -1.0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2.0, 8]} />
          <meshStandardMaterial color="#9CA3AF" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.8, 1.0, 0.2]} />
          <meshStandardMaterial color="#D1D5DB" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Raspberry Pi & INA219 */}
        <mesh position={[-0.15, 0.1, 0.11]}>
          <boxGeometry args={[0.2, 0.15, 0.02]} />
          <meshStandardMaterial color="#10B981" />
        </mesh>
        <mesh position={[0.15, 0.1, 0.11]}>
          <boxGeometry args={[0.15, 0.1, 0.02]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
      </group>

      {/* Village Power Line */}
      <group position={[-5.0, 4.0, -3.0]}>
        <mesh position={[0, -2.5, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 7.0, 8]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
          <meshStandardMaterial color="#78350F" roughness={0.9} />
        </mesh>
        {/* Wires heading to village */}
        {[-0.6, 0, 0.6].map((z, i) => (
          <mesh key={i} position={[2, 0.6, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 4.0, 8]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// TERRAIN & RIVER SCENERY
// ═══════════════════════════════════════════════════════
function EnvironmentScenery() {
  return (
    <group>
      {/* Powerhouse Foundation (Concrete floor for Turbine and Generator) */}
      <mesh position={[-1.25, -0.2, 0]}>
        <boxGeometry args={[5.5, 0.4, 4.0]} />
        <meshStandardMaterial color="#D1D5DB" roughness={0.8} />
      </mesh>
      
      {/* Steep Slope Earth */}
      <mesh position={[0, 1.5, -4.0]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[10, 0.5, 6.0]} />
        <meshStandardMaterial color="#3F2E1E" roughness={0.9} />
      </mesh>

      {/* Downstream River */}
      <mesh position={[0, -0.8, 4.0]}>
        <boxGeometry args={[10, 0.5, 6.0]} />
        <meshStandardMaterial color="#0284C7" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      <mesh position={[0, -1.2, 4.0]}>
        <boxGeometry args={[10, 0.5, 6.0]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// WATER PARTICLES
// ═══════════════════════════════════════════════════════
function WaterParticles({ flowRate = 0.5 }: { flowRate: number }) {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = Math.floor(flowRate * 300);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Start in forebay
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = 4.5;
      pos[i * 3 + 2] = -4.5 + (Math.random() - 0.5);
    }
    return pos;
  }, [count]);

  useFrame((_state, delta) => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // If in forebay, move towards penstock
      if (posArray[i * 3 + 1] > 3.5) {
        posArray[i * 3] *= 0.95; // Narrow into pipe
        posArray[i * 3 + 2] += delta * flowRate * 1.5;
        if (posArray[i * 3 + 2] > -3.5) posArray[i * 3 + 1] -= 0.1; 
      } 
      // Falling down penstock
      else if (posArray[i * 3 + 1] > 0.5) {
        posArray[i * 3 + 1] -= delta * flowRate * 4.0;
        posArray[i * 3 + 2] += delta * flowRate * 4.0;
      }
      // Splash out of tailrace
      else {
        posArray[i * 3 + 1] = -0.5;
        posArray[i * 3 + 2] += delta * flowRate * 3.0;
      }

      // Reset when downstream
      if (posArray[i * 3 + 2] > 5.0) {
        posArray[i * 3] = (Math.random() - 0.5) * 1.5;
        posArray[i * 3 + 1] = 4.5;
        posArray[i * 3 + 2] = -5.0 + Math.random();
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#E0F2FE" size={0.08} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ═══════════════════════════════════════════════════════
// STATUS LABELS
// ═══════════════════════════════════════════════════════
function StatusLabel({ position, label, value, unit, status = 'normal', sensorName }: {
  position: [number, number, number];
  label: string;
  value: string | number;
  unit: string;
  status?: string;
  sensorName?: string;
}) {
  const color = status === 'critical' ? '#EF4444' : status === 'warning' ? '#F59E0B' : '#10B981';
  return (
    <Html position={position} center distanceFactor={12}>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg border border-slate-200 pointer-events-none select-none flex flex-col items-center">
        {sensorName && <div className="bg-slate-800 text-white text-[8px] font-mono px-1.5 py-0.5 rounded uppercase mb-1">{sensorName}</div>}
        <p className="text-[9px] text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold font-mono" style={{ color }}>{value} <span className="text-[9px] text-slate-400">{unit}</span></p>
      </div>
    </Html>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN 3D SCENE
// ═══════════════════════════════════════════════════════
function TurbineScene({ summary, components }: { summary: SummaryData; components?: ComponentsResponse }) {
  const flowRate = summary.current.flow_rate;
  const isActive = summary.turbine_active;
  const rotationSpeed = isActive ? Math.max(0.3, flowRate * 4) : 0;

  const bearingStatus = components?.bearing?.status || 'normal';
  const genStatus = components?.generator?.status || 'normal';

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={2048} />
      <directionalLight position={[-10, 5, -5]} intensity={0.6} color="#BAE6FD" />
      <pointLight position={[-2, 2, 0]} intensity={0.5} color="#10B981" distance={8} />

      <group position={[0, -0.5, 0]}>
        <EnvironmentScenery />
        <HydrologySystem />
        <TurbineAssembly rotationSpeed={rotationSpeed} />
        <GeneratorAssembly tempStatus={genStatus} rotationSpeed={rotationSpeed} />
        <ElectricalSystem />
        <WaterParticles flowRate={isActive ? flowRate : 0} />

        {/* Labels Map exactly to Sensor Locations */}
        <StatusLabel
          position={[0, 1.0, -1.0]}
          label="Getaran Bearing"
          sensorName="ADXL345"
          value={summary.current.vibration.toFixed(1)}
          unit="mm/s"
          status={bearingStatus}
        />
        <StatusLabel
          position={[-2.5, 1.5, 0]}
          label="Suhu Generator"
          sensorName="DS18B20"
          value={summary.current.gen_temp.toFixed(0)}
          unit="°C"
          status={genStatus}
        />
        <StatusLabel
          position={[0, 3.8, -2.8]}
          label="Debit Air"
          sensorName="YF-S201"
          value={summary.current.flow_rate.toFixed(2)}
          unit="m³/s"
          status="normal"
        />
        <StatusLabel
          position={[-4.0, 2.5, 0]}
          label="Tegangan & Arus"
          sensorName="INA219"
          value={`${summary.current.voltage.toFixed(0)}V / ${summary.current.current.toFixed(0)}A`}
          unit=""
          status="normal"
        />
      </group>

      <OrbitControls
        enablePan={true}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.05}
        autoRotate={false}
        target={[-1, 1, 0]} // Focus point roughly at turbine/generator area
      />
    </>
  );
}

export default function Turbine3D({ summary, components }: { summary: SummaryData; components?: ComponentsResponse }) {
  const isActive = summary.turbine_active;
  const power = summary.current.power_kw;
  const efficiency = Math.min(100, Math.round((power / 50) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Digital Twin — PLTMH Cross-Flow (PUSAIR Ref)
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Belt-drive turbin dan generator dengan Forebay dan Penstock.</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          )}
          {isActive ? 'Beroperasi' : 'Idle'}
        </span>
      </div>

      <div className="h-[500px] bg-gradient-to-b from-sky-50 to-slate-200 relative">
        <Canvas shadows camera={{ position: [12, 8, 12], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <TurbineScene summary={summary} components={components} />
          </Suspense>
        </Canvas>
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200/60">
            <span className="text-[10px] text-slate-400">Total Daya Output</span>
            <p className="text-base font-bold text-slate-800 font-mono">{power.toFixed(1)} <span className="text-xs text-slate-400">kW</span></p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200/60 text-right">
            <span className="text-[10px] text-slate-400">Efisiensi Sistem</span>
            <p className={`text-base font-bold font-mono ${efficiency >= 70 ? 'text-emerald-600' : efficiency >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
              {efficiency}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

