import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';


// ─── Particle stream between two 3D points ───
const ParticleStream = ({ start, end, color, count = 40, speed = 1, active = true }) => {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
    }
    return { positions, offsets };
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const t = clock.getElapsedTime() * speed * 0.3;

    for (let i = 0; i < count; i++) {
      const progress = (particles.offsets[i] + t) % 1;
      pos.array[i * 3]     = start[0] + (end[0] - start[0]) * progress;
      pos.array[i * 3 + 1] = start[1] + (end[1] - start[1]) * progress + Math.sin(progress * Math.PI) * 0.15;
      pos.array[i * 3 + 2] = start[2] + (end[2] - start[2]) * progress;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={active ? 0.9 : 0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ─── Glowing node sphere ───
const EnergyNode = ({ position, color, label, scale = 1, pulse = false, labelOffset = [0, -0.45, 0], floatOffset = 0 }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5 + floatOffset) * 0.1;
    }
    if (!meshRef.current) return;
    if (pulse) {
      const s = scale * (1 + Math.sin(t * 3) * 0.08);
      meshRef.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(scale * 1.8 + Math.sin(t * 2) * 0.15);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* Core */}
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3D-Anchored HTML Label */}
      <Html position={labelOffset} center zIndexRange={[100, 0]}>
        <div className="flex items-center justify-center pointer-events-none w-[100px]">
          <div className="bg-[#0a1628]/80 backdrop-blur-md border border-white/5 py-1 px-3 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: color, color: color }}></span>
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// ─── Connection line between nodes ───
const ConnectionLine = ({ start, end, color, active }) => {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.25 : 0.08}
        linewidth={1}
      />
    </line>
  );
};

// ─── Main 3D scene ───
const EnergyScene = ({ data }) => {
  const isAnomaly = data?.anomaly?.detected;
  const ecoMode = data?.eco_mode;

  // Node positions (x, y, z) - Added Z-depth for 3D effect!
  const nodes = {
    solar:   [-2.0, 1.4, -0.8],
    battery: [-1.4, -0.6, 0.5],
    grid:    [2.0, 1.4, -0.8],
    home:    [1.4, -0.6, 0.5],
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 3]} intensity={0.8} color="#ffa84f" />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#3fff8b" />

      {/* Nodes */}
      <EnergyNode position={nodes.solar} color="#ffa84f" label="Solar" scale={1.1} pulse labelOffset={[0, 0.45, 0]} floatOffset={0} />
      <EnergyNode position={nodes.battery} color="#3fff8b" label="Battery" scale={0.9} pulse={ecoMode} labelOffset={[0, -0.45, 0]} floatOffset={1} />
      <EnergyNode position={nodes.grid} color="#44a5ff" label="Grid" scale={1.0} pulse={isAnomaly} labelOffset={[0, 0.45, 0]} floatOffset={2} />
      <EnergyNode position={nodes.home} color="#ff716c" label="Home" scale={0.95} labelOffset={[0, -0.45, 0]} floatOffset={3} />

      {/* Connection lines */}
      <ConnectionLine start={nodes.solar} end={nodes.battery} color="#ffa84f" active />
      <ConnectionLine start={nodes.solar} end={nodes.home} color="#ffa84f" active />
      <ConnectionLine start={nodes.battery} end={nodes.home} color="#3fff8b" active />
      <ConnectionLine start={nodes.grid} end={nodes.home} color="#44a5ff" active />
      <ConnectionLine start={nodes.solar} end={nodes.grid} color="#ffa84f" active />

      {/* Particle streams */}
      <ParticleStream start={nodes.solar} end={nodes.battery} color="#ffa84f" speed={1.2} count={30} />
      <ParticleStream start={nodes.solar} end={nodes.home} color="#ffa84f" speed={1.0} count={35} />
      <ParticleStream start={nodes.battery} end={nodes.home} color="#3fff8b" speed={0.8} count={25} />
      <ParticleStream start={nodes.grid} end={nodes.home} color="#44a5ff" speed={0.6} count={20} active={!ecoMode} />
      <ParticleStream start={nodes.solar} end={nodes.grid} color="#ffa84f" speed={0.9} count={20} />
    </>
  );
};

// ─── Exported component ───
export const EnergyFlow3D = ({ data }) => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <EnergyScene data={data} />
      </Canvas>
    </div>
  );
};
