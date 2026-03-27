"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function AnimatedEye() {
  const irisRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (irisRef.current) {
      irisRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }

    if (pupilRef.current) {
      pupilRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(time) * 0.2);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* Outer glow */}
        <mesh ref={glowRef} scale={1.8}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.15} />
        </mesh>

        {/* Sclera (white part) */}
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#f0f0f5"
            distort={0.1}
            speed={2}
            roughness={0.3}
          />
        </Sphere>

        {/* Iris */}
        <mesh ref={irisRef} position={[0, 0, 0.5]}>
          <circleGeometry args={[0.45, 64]} />
          <meshStandardMaterial
            color="#4F46E5"
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Iris detail ring */}
        <mesh ref={ringRef} position={[0, 0, 0.51]}>
          <ringGeometry args={[0.25, 0.44, 64]} />
          <meshStandardMaterial
            color="#06B6D4"
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Pupil */}
        <mesh ref={pupilRef} position={[0, 0, 0.52]}>
          <circleGeometry args={[0.18, 64]} />
          <meshStandardMaterial
            color="#0a0a15"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Highlight */}
        <mesh position={[0.15, 0.15, 0.55]}>
          <circleGeometry args={[0.08, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>

        {/* Secondary highlight */}
        <mesh position={[-0.1, -0.1, 0.54]}>
          <circleGeometry args={[0.04, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    const colors = new Float32Array(500 * 3);

    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Alternate between indigo and cyan
      const isIndigo = Math.random() > 0.5;
      colors[i * 3] = isIndigo ? 0.31 : 0.02;
      colors[i * 3 + 1] = isIndigo ? 0.27 : 0.71;
      colors[i * 3 + 2] = isIndigo ? 0.9 : 0.83;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.2;
      ring1Ref.current.rotation.y = time * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.15;
      ring2Ref.current.rotation.z = time * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = time * 0.2;
      ring3Ref.current.rotation.z = -time * 0.1;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} scale={2.5}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color="#4F46E5" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2Ref} scale={3}>
        <torusGeometry args={[1, 0.015, 16, 100]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.2} />
      </mesh>
      <mesh ref={ring3Ref} scale={3.5}>
        <torusGeometry args={[1, 0.01, 16, 100]} />
        <meshBasicMaterial color="#22C55E" transparent opacity={0.15} />
      </mesh>
    </>
  );
}

export function EyeScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4F46E5" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#06B6D4"
        />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#ffffff"
        />

        <AnimatedEye />
        <FloatingRings />
        <ParticleField />
        <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      </Canvas>
    </div>
  );
}
