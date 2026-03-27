"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleBackgroundProps {
  type?: "neural" | "particles" | "sphere";
}

export default function ParticleBackground({ type = "neural" }: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = type === "neural" ? 150 : type === "sphere" ? 2000 : 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      let x, y, z;
      
      if (type === "sphere") {
        // Spherical distribution
        const radius = Math.random() * 20 + 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      } else {
        // Random distribution
        x = (Math.random() - 0.5) * 60;
        y = (Math.random() - 0.5) * 60;
        z = (Math.random() - 0.5) * 60;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Colors - purple to cyan gradient
      colors[i * 3] = 0.31 + Math.random() * 0.2; // R
      colors[i * 3 + 1] = 0.27 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: type === "sphere" ? 0.15 : 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Create connections for neural network
    let lines: THREE.LineSegments | null = null;
    if (type === "neural") {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4F46E5,
        transparent: true,
        opacity: 0.15,
      });
      const lineGeometry = new THREE.BufferGeometry();
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    }

    // Update connections
    const updateConnections = () => {
      if (!lines || !particlesRef.current) return;

      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const connectionPositions: number[] = [];
      const maxDistance = 8;

      for (let i = 0; i < positions.length / 3; i++) {
        for (let j = i + 1; j < positions.length / 3; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < maxDistance) {
            connectionPositions.push(
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2],
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2]
            );
          }
        }
      }

      const connectionGeometry = new THREE.BufferGeometry();
      connectionGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(connectionPositions), 3)
      );
      lines.geometry = connectionGeometry;
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.001;

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
        particlesRef.current.rotation.x += 0.0002;

        // Gentle wave motion
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += Math.sin(time + positions[i * 3]) * 0.02;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;

        if (type === "neural") {
          updateConnections();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
      if (lines) {
        lines.geometry.dispose();
        (lines.material as THREE.Material).dispose();
      }
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
