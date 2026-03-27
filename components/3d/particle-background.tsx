"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      speeds[i] = 0.01 + Math.random() * 0.02;
    }

    return { positions, speeds };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positionArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positionArray.length / 3; i++) {
      positionArray[i * 3 + 1] += speeds[i];

      if (positionArray[i * 3 + 1] > 15) {
        positionArray[i * 3 + 1] = -15;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#4F46E5"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingSpheres() {
  const group1Ref = useRef<THREE.Group>(null);
  const group2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (group1Ref.current) {
      group1Ref.current.position.x = Math.sin(time * 0.3) * 5;
      group1Ref.current.position.y = Math.cos(time * 0.2) * 3;
    }

    if (group2Ref.current) {
      group2Ref.current.position.x = Math.cos(time * 0.25) * 4;
      group2Ref.current.position.y = Math.sin(time * 0.35) * 4;
    }
  });

  return (
    <>
      <group ref={group1Ref} position={[-5, 2, -5]}>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.15} />
        </mesh>
      </group>

      <group ref={group2Ref} position={[5, -2, -8]}>
        <mesh>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.08} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.12} />
        </mesh>
      </group>
    </>
  );
}

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Particles />
        <GlowingSpheres />
      </Canvas>
    </div>
  );
}
