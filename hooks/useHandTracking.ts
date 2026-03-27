"use client";

import { useRef, useCallback, useState } from "react";

export interface HandGesture {
  type: "swipe-left" | "swipe-right" | "none";
  confidence: number;
}

export function useHandTracking(onGesture?: (gesture: string) => void) {
  const [isHandTracking, setIsHandTracking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastXRef = useRef<number | null>(null);
  const isStartingRef = useRef(false);

  const detectGesture = useCallback((landmarks: Array<Array<{ x: number }>>) => {
    if (!landmarks || landmarks.length === 0 || !landmarks[0]?.[8]) return;

    const currentX = landmarks[0][8].x; // Tip of index finger
    if (lastXRef.current !== null) {
      const deltaX = currentX - lastXRef.current;
      if (deltaX > 0.1) {
        onGesture?.("swipe-right");
      } else if (deltaX < -0.1) {
        onGesture?.("swipe-left");
      }
    }
    lastXRef.current = currentX;
  }, [onGesture]);

  const startHandTracking = useCallback(async () => {
    if (isHandTracking || isStartingRef.current || !videoRef.current) return;
    isStartingRef.current = true;

    try {
      const handsModule = await import("@mediapipe/hands");
      const cameraModule = await import("@mediapipe/camera_utils");

      const globalScope = globalThis as typeof globalThis & {
        Hands?: new (config?: { locateFile?: (file: string) => string }) => {
          setOptions: (options: {
            maxNumHands: number;
            modelComplexity: number;
            minDetectionConfidence: number;
            minTrackingConfidence: number;
          }) => void;
          onResults: (
            callback: (results: {
              multiHandLandmarks?: Array<Array<{ x: number }>>;
            }) => void,
          ) => void;
          send: (input: { image: HTMLVideoElement }) => Promise<void>;
        };
        Camera?: new (
          video: HTMLVideoElement,
          config: {
            onFrame: () => Promise<void>;
            width: number;
            height: number;
          },
        ) => {
          start: () => void;
        };
      };

      const HandsCtor =
        handsModule.Hands ||
        (handsModule.default as { Hands?: typeof globalScope.Hands } | undefined)?.Hands ||
        globalScope.Hands;
      const CameraCtor =
        (cameraModule as { Camera?: typeof globalScope.Camera }).Camera ||
        (cameraModule.default as { Camera?: typeof globalScope.Camera } | undefined)?.Camera ||
        globalScope.Camera;

      if (!HandsCtor || !CameraCtor) {
        throw new Error("MediaPipe Hands exports could not be resolved");
      }

      const hands = new HandsCtor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        if (results.multiHandLandmarks) {
          detectGesture(results.multiHandLandmarks);
        }
      });

      const videoElement = videoRef.current;
      const camera = new CameraCtor(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setIsHandTracking(true);
    } catch (error) {
      console.error("Hand tracking initialization failed:", error);
    } finally {
      isStartingRef.current = false;
    }
  }, [detectGesture, isHandTracking]);

  return { videoRef, isHandTracking, startHandTracking };
}
