"use client";

import { useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, Environment, ContactShadows } from "@react-three/drei";
import { useAppStore } from "@/lib/store";
import { arService } from "@/lib/ar-service";
import * as THREE from "three";

interface DetectionCategory {
  categoryName: string;
}

interface DetectionResult {
  categories: DetectionCategory[];
}

function FloatingKeyboard() {
  const { appendToText } = useAppStore();
  const keys = ["A", "B", "C", "D", "E", "F", "G"];
  
  return (
    <group position={[0, 0, -2]}>
      {keys.map((key, i) => (
        <Float key={key} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            position={[(i - 3) * 0.5, 0, 0]} 
            onClick={() => appendToText(key)}
          >
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} />
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {key}
            </Text>
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function VirtualAvatar({ text, isSpeaking }: { text: string, isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Idle animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
      
      // Lip sync simulation
      if (isSpeaking) {
        const mouth = meshRef.current.getObjectByName("mouth");
        if (mouth) {
          mouth.scale.y = 0.5 + Math.sin(state.clock.getElapsedTime() * 20) * 0.5;
        }
      }
    }
  });

  return (
    <group ref={meshRef} position={[2, 0, -3]}>
      {/* Stylized Avatar Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>
      {/* Mouth for lip-sync */}
      <mesh name="mouth" position={[0, 1.1, 0.35]}>
        <boxGeometry args={[0.2, 0.05, 0.1]} />
        <meshStandardMaterial color="#be185d" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.15, 1.3, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.15, 1.3, 0.3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function ARLogic({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const { setDetectedObjects, setARSuggestions } = useAppStore();

  useFrame(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const detections = arService.detectObjects(videoRef.current);
      if (detections.length > 0) {
        const objects = detections.map(
          (d: DetectionResult) => d.categories[0]?.categoryName ?? "unknown",
        );
        setDetectedObjects(objects);
        
        const suggestions = objects
          .map((obj: string) => arService.getPhraseForObject(obj))
          .filter((phrase: string | null): phrase is string => phrase !== null);
        setARSuggestions(suggestions);
      }
    }
  });

  return null;
}

export function ARView() {
  const { 
    currentText, 
    isSpeaking, 
    setIsARMode
  } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    }

    setupCamera();
    arService.initialize();
    setIsARMode(true);

    return () => {
      setIsARMode(false);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [setIsARMode]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Camera Feed Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AR Overlay */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
            
            <FloatingKeyboard />
            <VirtualAvatar text={currentText} isSpeaking={isSpeaking} />
            <ARLogic videoRef={videoRef} />
            
            <Environment preset="city" />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Detection Labels */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
          AR Mode Active
        </div>
      </div>
    </div>
  );
}
