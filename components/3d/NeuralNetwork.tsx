"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

// ============================================
// Custom Shader for Neural Network Lines
// ============================================

const neuralVertexShader = `
  varying vec3 vPosition;
  varying float vDistance;
  uniform float uTime;
  
  void main() {
    vPosition = position;
    vec3 newPos = position;
    newPos.z += sin(uTime * 0.5 + position.x * 0.1) * 0.5;
    vDistance = length(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const neuralFragmentShader = `
  varying vec3 vPosition;
  varying float vDistance;
  uniform float uTime;
  uniform vec3 uColor;
  
  void main() {
    float alpha = 0.5 - (vDistance / 50.0);
    alpha *= sin(uTime * 2.0 + vPosition.x) * 0.2 + 0.5;
    vec3 finalColor = uColor * (1.0 + sin(uTime) * 0.2);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ============================================
// Animated Neural Network Node
// ============================================

interface NeuralNodeProps {
  position: [number, number, number];
  connectedTo?: NeuralNodeProps[];
}

export function NeuralNode({ position }: NeuralNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(time * 3) * 0.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Core Node */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color="#4F46E5"
          emissive="#4F46E5"
          emissiveIntensity={2}
          metalness={0.9}
          roughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Glow Layer */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting Particles */}
      {[...Array(3)].map((_, i) => (
        <OrbitingParticle key={i} index={i} />
      ))}
    </group>
  );
}

// ============================================
// Orbiting Particle Around Node
// ============================================

function OrbitingParticle({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      const angle = time * 2 + index * ((Math.PI * 2) / 3);
      meshRef.current.position.x = Math.cos(angle) * 0.8;
      meshRef.current.position.y = Math.sin(angle) * 0.8;
      meshRef.current.position.z = Math.sin(time * 3 + index) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#06B6D4" />
    </mesh>
  );
}

// ============================================
// Connection Lines Between Nodes
// ============================================

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
}

export function ConnectionLine({ start, end }: ConnectionLineProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);

  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: neuralVertexShader,
      fragmentShader: neuralFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#4F46E5") },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      (lineRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
        state.clock.elapsedTime;
    }
  });

  return (
    <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />
  );
}

// ============================================
// Full Neural Network Scene
// ============================================

export function NeuralNetworkScene() {
  const nodes = useMemo(() => {
    const positions: [number, number, number][] = [];
    // Create a 3D grid of nodes
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.random() > 0.5) {
            positions.push([x * 3, y * 3, z * 3]);
          }
        }
      }
    }
    return positions;
  }, []);

  return (
    <group>
      {nodes.map((pos, i) => (
        <NeuralNode key={i} position={pos} />
      ))}

      {/* Connection lines between nearby nodes */}
      {nodes.flatMap((node1, i) =>
        nodes.slice(i + 1).map((node2, j) => {
          const distance = Math.sqrt(
            Math.pow(node1[0] - node2[0], 2) +
              Math.pow(node1[1] - node2[1], 2) +
              Math.pow(node1[2] - node2[2], 2),
          );

          if (distance < 5) {
            return (
              <ConnectionLine key={`${i}-${j}`} start={node1} end={node2} />
            );
          }
          return null;
        }),
      )}
    </group>
  );
}

// ============================================
// Volumetric Light Rays
// ============================================

export function VolumetricLight() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 10, 0, Math.sin(angle) * 10]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <coneGeometry args={[2, 20, 32, 1, true]} />
            <meshBasicMaterial
              color="#4F46E5"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================
// Energy Field
// ============================================

export function EnergyField() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.z = time * 0.2;
      meshRef.current.scale.setScalar(1 + Math.sin(time) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[15, 0.5, 16, 100]} />
      <meshStandardMaterial
        color="#8B5CF6"
        emissive="#8B5CF6"
        emissiveIntensity={2}
        metalness={0.8}
        roughness={0.2}
        toneMapped={false}
      />
    </mesh>
  );
}

// ============================================
// Post Processing Setup
// ============================================

export function AdvancedPostProcessing() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.4}
        mipmapBlur
        intensity={2}
        radius={0.8}
        levels={9}
      />
      <Noise opacity={0.03} />
      <Vignette eskil={false} offset={0.15} darkness={1.2} />
    </EffectComposer>
  );
}
