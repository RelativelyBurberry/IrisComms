"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface GazePoint {
  x: number;
  y: number;
  z?: number;
  timestamp: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface EyeState {
  isTracking: boolean;
  gazePoint: { x: number; y: number };
  gazeDirection: "left" | "center" | "right" | "up" | "down";
  blinkCount: number;
  isLeftBlinking: boolean;
  isRightBlinking: boolean;
  isLeftWinking: boolean;
  isRightWinking: boolean;
  isDoubleBlinking: boolean;
  leftEyebrowRaised: boolean;
  rightEyebrowRaised: boolean;
  emotion: "neutral" | "happy" | "sad" | "surprised" | "angry";
  headPose: { pitch: number; yaw: number; roll: number };
  confidence: number;
  landmarks: Landmark[];
}

export interface EyeTrackingOptions {
  onGazeChange?: (direction: EyeState["gazeDirection"]) => void;
  onBlink?: (type: "single" | "double" | "left" | "right") => void;
  onWink?: (eye: "left" | "right") => void;
  onEyebrowRaise?: (eye: "left" | "right") => void;
  onEmotionChange?: (emotion: EyeState["emotion"]) => void;
  onHeadPoseChange?: (pose: EyeState["headPose"]) => void;
  dwellTime?: number;
  sensitivity?: number;
}

const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_IRIS = [474, 475, 476, 477];
const RIGHT_IRIS = [469, 470, 471, 472];
const LEFT_EYEBROW = [336, 296, 334, 293, 300];
const RIGHT_EYEBROW = [107, 66, 105, 63, 70];
const MOUTH_LEFT = 61;
const MOUTH_RIGHT = 291;
const MOUTH_TOP = 13;
const MOUTH_BOTTOM = 14;
const NOSE_TIP = 4;
const FOREHEAD = 10;

export function useEyeTracking(options: EyeTrackingOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);

  const [eyeState, setEyeState] = useState<EyeState>({
    isTracking: false,
    gazePoint: { x: 0.5, y: 0.5 },
    gazeDirection: "center",
    blinkCount: 0,
    isLeftBlinking: false,
    isRightBlinking: false,
    isLeftWinking: false,
    isRightWinking: false,
    isDoubleBlinking: false,
    leftEyebrowRaised: false,
    rightEyebrowRaised: false,
    emotion: "neutral",
    headPose: { pitch: 0, yaw: 0, roll: 0 },
    confidence: 0,
    landmarks: [],
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const lastBlinkTimeRef = useRef<number>(0);
  const blinkCountRef = useRef<number>(0);
  const gazeHistoryRef = useRef<GazePoint[]>([]);
  const lastWinkTimeRef = useRef<number>(0);
  const lastEyebrowTimeRef = useRef<number>(0);
  const cameraStartRef = useRef(false);

  const EAR_THRESHOLD = options.sensitivity
    ? 0.2 + (options.sensitivity / 100) * 0.1
    : 0.25;
  const WINK_DURATION = 150;
  const DOUBLE_BLINK_WINDOW = 300;
  const WINK_COOLDOWN = 600;
  const EYEBROW_COOLDOWN = 1200;

  const calculateEAR = useCallback(
    (eyePoints: number[], landmarks: Landmark[]): number => {
      if (eyePoints.length < 6 || landmarks.length === 0) return 1;

      const getPoint = (idx: number) => landmarks[idx] || { x: 0, y: 0, z: 0 };

      const vertical1 = Math.sqrt(
        Math.pow(getPoint(eyePoints[1]).x - getPoint(eyePoints[5]).x, 2) +
          Math.pow(getPoint(eyePoints[1]).y - getPoint(eyePoints[5]).y, 2),
      );
      const vertical2 = Math.sqrt(
        Math.pow(getPoint(eyePoints[2]).x - getPoint(eyePoints[4]).x, 2) +
          Math.pow(getPoint(eyePoints[2]).y - getPoint(eyePoints[4]).y, 2),
      );
      const horizontal = Math.sqrt(
        Math.pow(getPoint(eyePoints[0]).x - getPoint(eyePoints[3]).x, 2) +
          Math.pow(getPoint(eyePoints[0]).y - getPoint(eyePoints[3]).y, 2),
      );

      return (vertical1 + vertical2) / (2 * horizontal);
    },
    [],
  );

  const calculateGazeDirection = useCallback(
    (landmarks: Landmark[], videoWidth: number): EyeState["gazeDirection"] => {
      if (landmarks.length === 0) return "center";
      const nose = landmarks[NOSE_TIP] || { x: 0, y: 0, z: 0 };
      const leftIris = landmarks[LEFT_IRIS[0]] || { x: 0, y: 0, z: 0 };
      const rightIris = landmarks[RIGHT_IRIS[0]] || { x: 0, y: 0, z: 0 };
      const avgIrisX = (leftIris.x + rightIris.x) / 2;
      const relativeX = (avgIrisX - nose.x) / videoWidth;
      if (relativeX < -0.03) return "left";
      if (relativeX > 0.03) return "right";
      const forehead = landmarks[FOREHEAD] || { x: 0, y: 0, z: 0 };
      const noseY = nose.y;
      const relativeY = (forehead.y - noseY) / videoWidth;
      if (relativeY < -0.05) return "up";
      if (relativeY > 0.08) return "down";
      return "center";
    },
    [],
  );

  const detectEyebrowRaise = useCallback(
    (
      landmarks: Landmark[],
      videoHeight: number,
    ): { left: boolean; right: boolean } => {
      if (landmarks.length === 0) return { left: false, right: false };
      const getPoint = (idx: number) => landmarks[idx] || { x: 0, y: 0, z: 0 };
      const leftEyeTop = Math.min(...LEFT_EYE.slice(1, 5).map((i) => getPoint(i).y));
      const leftEyebrowBottom = Math.max(...LEFT_EYEBROW.map((i) => getPoint(i).y));
      const leftEyebrowRaise = (leftEyebrowBottom - leftEyeTop) / videoHeight > 0.03;
      const rightEyeTop = Math.min(...RIGHT_EYE.slice(1, 5).map((i) => getPoint(i).y));
      const rightEyebrowBottom = Math.max(...RIGHT_EYEBROW.map((i) => getPoint(i).y));
      const rightEyebrowRaise = (rightEyebrowBottom - rightEyeTop) / videoHeight > 0.03;
      return { left: leftEyebrowRaise, right: rightEyebrowRaise };
    },
    [],
  );

  const detectEmotion = useCallback(
    (landmarks: Landmark[]): EyeState["emotion"] => {
      if (landmarks.length === 0) return "neutral";

      const mouthLeft = landmarks[MOUTH_LEFT];
      const mouthRight = landmarks[MOUTH_RIGHT];
      const mouthTop = landmarks[MOUTH_TOP];
      const mouthBottom = landmarks[MOUTH_BOTTOM];

      if (!mouthLeft || !mouthRight || !mouthTop || !mouthBottom) return "neutral";

      // Mouth width vs height
      const mouthWidth = Math.sqrt(
        Math.pow(mouthRight.x - mouthLeft.x, 2) + Math.pow(mouthRight.y - mouthLeft.y, 2),
      );
      const mouthHeight = Math.sqrt(
        Math.pow(mouthBottom.x - mouthTop.x, 2) + Math.pow(mouthBottom.y - mouthTop.y, 2),
      );

      // Smile detection: mouth corners are higher than center or wider
      const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
      const mouthCurvature = (mouthLeft.y + mouthRight.y) / 2 - mouthCenterY;

      if (mouthCurvature < -0.01) return "happy"; // corners up
      if (mouthCurvature > 0.01) return "sad";    // corners down
      if (mouthHeight / mouthWidth > 0.5) return "surprised"; // wide open

      return "neutral";
    },
    [],
  );

  const calculateGazePoint = useCallback(
    (landmarks: Landmark[], videoWidth: number, videoHeight: number): { x: number; y: number } => {
      if (landmarks.length === 0) return { x: 0.5, y: 0.5 };

      // Get iris and eye corners for better estimation
      const leftIris = landmarks[LEFT_IRIS[0]];
      const rightIris = landmarks[RIGHT_IRIS[0]];
      
      const leftEyeInner = landmarks[LEFT_EYE[0]];
      const leftEyeOuter = landmarks[LEFT_EYE[3]];
      const rightEyeInner = landmarks[RIGHT_EYE[0]];
      const rightEyeOuter = landmarks[RIGHT_EYE[3]];

      if (!leftIris || !rightIris || !leftEyeInner || !leftEyeOuter || !rightEyeInner || !rightEyeOuter) {
        return { x: 0.5, y: 0.5 };
      }

      // Calculate horizontal ratio (0 to 1)
      const leftHorizontalRatio = (leftIris.x - leftEyeInner.x) / (leftEyeOuter.x - leftEyeInner.x);
      const rightHorizontalRatio = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);
      const horizontalRatio = (leftHorizontalRatio + rightHorizontalRatio) / 2;

      // Calculate vertical ratio (0 to 1)
      const leftEyeTop = landmarks[LEFT_EYE[1]].y;
      const leftEyeBottom = landmarks[LEFT_EYE[4]].y;
      const rightEyeTop = landmarks[RIGHT_EYE[1]].y;
      const rightEyeBottom = landmarks[RIGHT_EYE[4]].y;

      const leftVerticalRatio = (leftIris.y - leftEyeTop) / (leftEyeBottom - leftEyeTop);
      const rightVerticalRatio = (rightIris.y - rightEyeTop) / (rightEyeBottom - rightEyeTop);
      const verticalRatio = (leftVerticalRatio + rightVerticalRatio) / 2;

      // Map ratios to screen coordinates with some sensitivity adjustment
      // Iris movements are small, so we amplify them
      const sensitivityX = 2.5;
      const sensitivityY = 3.5;
      
      let x = 0.5 + (horizontalRatio - 0.5) * sensitivityX;
      let y = 0.5 + (verticalRatio - 0.5) * sensitivityY;

      // Smooth with last value if available
      if (gazeHistoryRef.current.length > 0) {
        const last = gazeHistoryRef.current[gazeHistoryRef.current.length - 1];
        x = last.x * 0.7 + x * 0.3;
        y = last.y * 0.7 + y * 0.3;
      }

      // Clamp to [0, 1]
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      return { x, y };
    },
    [],
  );

  const onResults = useCallback(
    (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const landmarks = results.multiFaceLandmarks?.[0] || [];
      const currentTime = Date.now();

      if (landmarks.length > 0) {
        const leftEAR = calculateEAR(LEFT_EYE, landmarks);
        const rightEAR = calculateEAR(RIGHT_EYE, landmarks);
        const gazeDirection = calculateGazeDirection(landmarks, videoWidth);
        const gazePoint = calculateGazePoint(landmarks, videoWidth, videoHeight);
        const eyebrowState = detectEyebrowRaise(landmarks, videoHeight);
        const emotion = detectEmotion(landmarks);

        const isLeftBlinking = leftEAR < EAR_THRESHOLD;
        const isRightBlinking = rightEAR < EAR_THRESHOLD;
        const isBlinking = isLeftBlinking && isRightBlinking;
        const isLeftWinking = isLeftBlinking && !isRightBlinking;
        const isRightWinking = isRightBlinking && !isLeftBlinking;

        // Double blink detection
        if (isBlinking) {
          const timeSinceLastBlink = currentTime - lastBlinkTimeRef.current;
          if (timeSinceLastBlink > 100 && timeSinceLastBlink < DOUBLE_BLINK_WINDOW) {
            options.onBlink?.("double");
            setEyeState((prev) => ({ ...prev, isDoubleBlinking: true }));
            setTimeout(() => setEyeState((prev) => ({ ...prev, isDoubleBlinking: false })), 300);
            lastBlinkTimeRef.current = 0; // Reset
          } else if (timeSinceLastBlink > DOUBLE_BLINK_WINDOW) {
            lastBlinkTimeRef.current = currentTime;
          }
        }

        // Wink detection
        if (isLeftWinking && currentTime - lastWinkTimeRef.current > WINK_COOLDOWN) {
          lastWinkTimeRef.current = currentTime;
          options.onWink?.("left");
          setEyeState((prev) => ({ ...prev, isLeftWinking: true }));
          setTimeout(() => setEyeState((prev) => ({ ...prev, isLeftWinking: false })), WINK_DURATION);
        } else if (isRightWinking && currentTime - lastWinkTimeRef.current > WINK_COOLDOWN) {
          lastWinkTimeRef.current = currentTime;
          options.onWink?.("right");
          setEyeState((prev) => ({ ...prev, isRightWinking: true }));
          setTimeout(() => setEyeState((prev) => ({ ...prev, isRightWinking: false })), WINK_DURATION);
        }

        const headPose = {
          pitch: landmarks[FOREHEAD]?.y || 0,
          yaw: landmarks[NOSE_TIP]?.x || 0,
          roll: 0,
        };

        options.onGazeChange?.(gazeDirection);
        options.onHeadPoseChange?.(headPose);

        if (
          (eyebrowState.left || eyebrowState.right) &&
          currentTime - lastEyebrowTimeRef.current > EYEBROW_COOLDOWN
        ) {
          lastEyebrowTimeRef.current = currentTime;
          options.onEyebrowRaise?.(eyebrowState.left ? "left" : "right");
        }

        if (emotion !== eyeState.emotion) {
          options.onEmotionChange?.(emotion);
        }

        setEyeState((prev) => ({
          ...prev,
          isTracking: true,
          gazePoint,
          gazeDirection,
          isLeftBlinking,
          isRightBlinking,
          leftEyebrowRaised: eyebrowState.left,
          rightEyebrowRaised: eyebrowState.right,
          emotion,
          headPose,
          confidence: 0.95,
          landmarks: landmarks,
        }));

        gazeHistoryRef.current.push({
          ...gazePoint,
          timestamp: currentTime,
        });
        if (gazeHistoryRef.current.length > 30) gazeHistoryRef.current.shift();
      } else {
        setEyeState((prev) => ({ ...prev, isTracking: false, confidence: 0 }));
      }
    },
    [
      calculateEAR,
      calculateGazeDirection,
      calculateGazePoint,
      detectEyebrowRaise,
      options,
      EAR_THRESHOLD,
      DOUBLE_BLINK_WINDOW,
      WINK_DURATION,
    ],
  );

  const initializeEyeTracking = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isInitialized) return;

    try {
      // Use dynamic imports but with proper error handling and type casting if needed
      const FaceMeshModule = await import("@mediapipe/face_mesh");
      const CameraModule = await import("@mediapipe/camera_utils");

      // Some environments might need .default depending on how they are bundled
      const FaceMesh = FaceMeshModule.FaceMesh || (FaceMeshModule as any).default;
      const Camera = CameraModule.Camera || (CameraModule as any).default;

      if (!FaceMesh || !Camera) {
        throw new Error("MediaPipe modules not found");
      }

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        camera.start().then(() => {
          setCameraReady(true);
        });

        cameraRef.current = camera;
      }

      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize eye tracking:", err);
      setError(
        "Failed to initialize eye tracking. Please ensure camera access is granted.",
      );
    }
  }, [isInitialized, onResults]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || cameraStartRef.current || cameraReady) return;

    try {
      cameraStartRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await initializeEyeTracking();
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access denied. Please enable camera permissions.");
    } finally {
      cameraStartRef.current = false;
    }
  }, [cameraReady, initializeEyeTracking]);

  const stopCamera = useCallback(() => {
    cameraStartRef.current = false;
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    setIsInitialized(false);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stopCamera]);

  const getGazePosition = useCallback(() => {
    const recent = gazeHistoryRef.current.slice(-10);
    if (recent.length === 0) return { x: 0.5, y: 0.5 };

    const avgX = recent.reduce((sum, p) => sum + p.x, 0) / recent.length;
    const avgY = recent.reduce((sum, p) => sum + p.y, 0) / recent.length;
    return { x: avgX, y: avgY };
  }, []);

  return {
    videoRef,
    canvasRef,
    containerRef,
    eyeState,
    isInitialized,
    cameraReady,
    error,
    startCamera,
    stopCamera,
    getGazePosition,
    gazeHistory: gazeHistoryRef.current,
  };
}

export function useGazeSelection(
  gazePosition: { x: number; y: number },
  options: {
    dwellTime?: number;
    onSelect?: () => void;
    targets?: DOMRect[];
  } = {},
) {
  const [hoveringTarget, setHoveringTarget] = useState<number | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const hoverStartRef = useRef<number | null>(null);
  const animationRef = useRef<number>(0);

  const dwellTime = options.dwellTime ?? 1500;

  useEffect(() => {
    const checkHover = () => {
      if (!options.targets || options.targets.length === 0 || typeof window === "undefined") return;

      const screenX = gazePosition.x * window.innerWidth;
      const screenY = gazePosition.y * window.innerHeight;

      let hoveredIndex: number | null = null;

      for (let i = 0; i < options.targets.length; i++) {
        const rect = options.targets[i];
        if (
          screenX >= rect.left &&
          screenX <= rect.right &&
          screenY >= rect.top &&
          screenY <= rect.bottom
        ) {
          hoveredIndex = i;
          break;
        }
      }

      if (hoveredIndex !== hoveringTarget) {
        setHoveringTarget(hoveredIndex);
        hoverStartRef.current = hoveredIndex !== null ? Date.now() : null;
        setDwellProgress(0);
      } else if (hoveredIndex !== null && hoverStartRef.current) {
        const elapsed = Date.now() - hoverStartRef.current;
        const progress = Math.min(elapsed / dwellTime, 1);
        setDwellProgress(progress);

        if (progress >= 1) {
          options.onSelect?.();
          hoverStartRef.current = Date.now();
        }
      }

      animationRef.current = requestAnimationFrame(checkHover);
    };

    animationRef.current = requestAnimationFrame(checkHover);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gazePosition, hoveringTarget, dwellTime, options]);

  return {
    hoveringTarget,
    dwellProgress,
    isDwelling: dwellProgress > 0,
  };
}
