"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLoadedGazeCloudAPI, loadGazeCloudAPI } from "@/lib/gazecloud";
import type { GazeCloudResult } from "@/types/gaze";

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
  isCalibrated: boolean;
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

const DEFAULT_GAZE_POINT = { x: 0.5, y: 0.5 };
const GAZE_HISTORY_LIMIT = 30;
const RECENT_GAZE_WINDOW = 10;
const GAZE_SMOOTHING_ALPHA = 0.35;

function createDefaultEyeState(): EyeState {
  return {
    isTracking: false,
    isCalibrated: false,
    gazePoint: DEFAULT_GAZE_POINT,
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
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1, height: 1 };
  }

  return {
    width: Math.max(window.innerWidth, 1),
    height: Math.max(window.innerHeight, 1),
  };
}

function normalizeGazePoint(docX: number, docY: number) {
  const { width, height } = getViewportSize();

  return {
    x: clamp01(docX / width),
    y: clamp01(docY / height),
  };
}

function smoothGazePoint(
  nextPoint: { x: number; y: number },
  previousPoint: { x: number; y: number } | null,
) {
  if (!previousPoint) {
    return nextPoint;
  }

  return {
    x: clamp01(
      GAZE_SMOOTHING_ALPHA * nextPoint.x +
        (1 - GAZE_SMOOTHING_ALPHA) * previousPoint.x,
    ),
    y: clamp01(
      GAZE_SMOOTHING_ALPHA * nextPoint.y +
        (1 - GAZE_SMOOTHING_ALPHA) * previousPoint.y,
    ),
  };
}

function getGazeDirection(
  gazePoint: { x: number; y: number },
): EyeState["gazeDirection"] {
  if (gazePoint.x < 0.35) return "left";
  if (gazePoint.x > 0.65) return "right";
  if (gazePoint.y < 0.35) return "up";
  if (gazePoint.y > 0.65) return "down";

  return "center";
}

function averageRecentGazePoints(points: GazePoint[]) {
  const recentPoints = points.slice(-RECENT_GAZE_WINDOW);
  if (recentPoints.length === 0) {
    return { ...DEFAULT_GAZE_POINT };
  }

  const averageX =
    recentPoints.reduce((sum, point) => sum + point.x, 0) / recentPoints.length;
  const averageY =
    recentPoints.reduce((sum, point) => sum + point.y, 0) / recentPoints.length;

  return {
    x: clamp01(averageX),
    y: clamp01(averageY),
  };
}

export function useEyeTracking(options: EyeTrackingOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gazeHistoryRef = useRef<GazePoint[]>([]);
  const smoothedGazeRef = useRef<{ x: number; y: number } | null>(null);
  const averagedGazeRef = useRef({ ...DEFAULT_GAZE_POINT });
  const optionsRef = useRef(options);
  const cameraStartRef = useRef(false);
  const trackingActiveRef = useRef(false);
  const mountedRef = useRef(true);
  const sessionRef = useRef(0);

  const [eyeState, setEyeState] = useState<EyeState>(createDefaultEyeState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const handleTrackingLost = useCallback(() => {
    setEyeState((prev) => ({
      ...prev,
      isTracking: false,
      confidence: 0,
    }));
  }, []);

  const handleGazeResult = useCallback(
    (gazeData: GazeCloudResult) => {
      if (!mountedRef.current) return;

      setCameraReady(true);
      setError(null);

      if (gazeData.state === -1) {
        handleTrackingLost();
        return;
      }

      const rawPoint = normalizeGazePoint(gazeData.docX, gazeData.docY);
      const smoothedPoint = smoothGazePoint(rawPoint, smoothedGazeRef.current);
      const gazeDirection = getGazeDirection(smoothedPoint);
      const isCalibrated = gazeData.state === 0;
      const headPose = { pitch: 0, yaw: 0, roll: 0 };

      smoothedGazeRef.current = smoothedPoint;
      gazeHistoryRef.current.push({
        ...smoothedPoint,
        timestamp: gazeData.time || Date.now(),
      });

      if (gazeHistoryRef.current.length > GAZE_HISTORY_LIMIT) {
        gazeHistoryRef.current.shift();
      }

      averagedGazeRef.current = averageRecentGazePoints(gazeHistoryRef.current);

      optionsRef.current.onGazeChange?.(gazeDirection);
      optionsRef.current.onHeadPoseChange?.(headPose);

      setEyeState((prev) => ({
        ...prev,
        isTracking: true,
        isCalibrated,
        gazePoint: smoothedPoint,
        gazeDirection,
        emotion: "neutral",
        headPose,
        confidence: isCalibrated ? 0.95 : 0.5,
        landmarks: [],
        isLeftBlinking: false,
        isRightBlinking: false,
        isLeftWinking: false,
        isRightWinking: false,
        isDoubleBlinking: false,
        leftEyebrowRaised: false,
        rightEyebrowRaised: false,
      }));
    },
    [handleTrackingLost],
  );

  const stopCamera = useCallback(() => {
    sessionRef.current += 1;
    trackingActiveRef.current = false;
    cameraStartRef.current = false;

    const api = getLoadedGazeCloudAPI();
    if (api) {
      api.OnResult = null;
      api.OnCalibrationComplete = null;
      api.OnCamDenied = null;
      api.OnError = null;

      try {
        api.StopEyeTracking();
      } catch (stopError) {
        console.warn("Failed to stop GazeCloudAPI cleanly:", stopError);
      }
    }

    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    gazeHistoryRef.current = [];
    smoothedGazeRef.current = null;
    averagedGazeRef.current = { ...DEFAULT_GAZE_POINT };
    setEyeState(createDefaultEyeState());
    setCameraReady(false);
    setIsInitialized(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraStartRef.current || trackingActiveRef.current) return;

    cameraStartRef.current = true;
    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;
    setError(null);

    try {
      const api = await loadGazeCloudAPI();
      if (!mountedRef.current || sessionRef.current !== sessionId) return;

      api.UseClickRecalibration = false;
      api.OnResult = (gazeData) => {
        if (sessionRef.current !== sessionId) return;
        handleGazeResult(gazeData);
      };
      api.OnCalibrationComplete = () => {
        if (!mountedRef.current || sessionRef.current !== sessionId) return;

        setCameraReady(true);
        setEyeState((prev) => ({
          ...prev,
          isCalibrated: true,
        }));
      };
      api.OnCamDenied = () => {
        if (!mountedRef.current || sessionRef.current !== sessionId) return;

        trackingActiveRef.current = false;
        setCameraReady(false);
        setError("Camera access denied. Please enable camera permissions.");
        handleTrackingLost();
      };
      api.OnError = (message) => {
        if (!mountedRef.current || sessionRef.current !== sessionId) return;

        trackingActiveRef.current = false;
        setCameraReady(false);
        setError(message || "Failed to initialize GazeCloudAPI.");
        handleTrackingLost();
      };

      api.StartEyeTracking();
      trackingActiveRef.current = true;
      setIsInitialized(true);
    } catch (startError) {
      trackingActiveRef.current = false;
      setIsInitialized(false);
      setCameraReady(false);
      setError(
        startError instanceof Error
          ? startError.message
          : "Failed to load GazeCloudAPI.",
      );
    } finally {
      cameraStartRef.current = false;
    }
  }, [handleGazeResult, handleTrackingLost]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  const getGazePosition = useCallback(() => {
    return averagedGazeRef.current;
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
      if (
        !options.targets ||
        options.targets.length === 0 ||
        typeof window === "undefined"
      ) {
        return;
      }

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
