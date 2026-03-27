"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial, Float } from "@react-three/drei";

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const [positions, colors] = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 30;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0005;
    ref.current.rotation.x += 0.0002;

    // Interactive response to mouse
    ref.current.rotation.x += (mouse.y * 0.1 - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (mouse.x * 0.1 - ref.current.rotation.y) * 0.05;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function Nebula() {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-5, 2, -10]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.05} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
        <mesh position={[8, -5, -15]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial color="#EC4899" transparent opacity={0.03} />
        </mesh>
      </Float>
    </group>
  );
}

export function GalaxyBackground() {
  return (
    <div className="fixed inset-0 -z-20 bg-[#05070A]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Stars />
        <Nebula />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}
