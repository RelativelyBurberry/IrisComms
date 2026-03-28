"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Camera, CheckCircle2, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { useAppStore } from "@/lib/store";

export function CalibrationScreen() {
  const {
    isCalibrated,
    dwellTime,
    setCalibrationProgress,
    setCurrentScreen,
  } = useAppStore();

  useEffect(() => {
    if (!isCalibrated) {
      setCalibrationProgress(0);
      return;
    }

    setCalibrationProgress(100);

    const timer = setTimeout(() => {
      setCurrentScreen("communication");
    }, 900);

    return () => clearTimeout(timer);
  }, [isCalibrated, setCalibrationProgress, setCurrentScreen]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/15">
            {isCalibrated ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            ) : (
              <Eye className="h-12 w-12 text-primary" />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {isCalibrated ? "Calibration Complete" : "Camera Calibration"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {isCalibrated
              ? "The eye-tracking API is ready. Redirecting you into communication mode."
              : "Calibration is handled directly by GazeCloudAPI. Follow the API prompt, keep your head steady, and let the vendor calibration finish."}
          </p>
        </div>

        <GlassCard variant="subtle" className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Camera className="h-5 w-5 text-primary" />
            Live Setup Notes
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Keep this screen open while the camera prompt and calibration UI run.</p>
            <p>Use the official API calibration flow only. The local fake dot sequence has been removed.</p>
            <p>
              Status:
              <span className={isCalibrated ? "ml-2 text-emerald-400" : "ml-2 text-amber-300"}>
                {isCalibrated ? "Ready to communicate" : "Waiting for API calibration"}
              </span>
            </p>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isCalibrated ? (
            <GazeButton
              variant="primary"
              size="xl"
              dwellTime={dwellTime}
              onClick={() => setCurrentScreen("communication")}
              onGazeSelect={() => setCurrentScreen("communication")}
              className="sm:min-w-[280px]"
            >
              <ArrowRight className="h-6 w-6" />
              Continue to Communication
            </GazeButton>
          ) : (
            <GazeButton
              variant="default"
              size="xl"
              dwellTime={dwellTime}
              onClick={() => setCurrentScreen("landing")}
              onGazeSelect={() => setCurrentScreen("landing")}
              className="sm:min-w-[280px]"
            >
              Return Home
            </GazeButton>
          )}
        </div>
      </motion.div>
    </div>
  );
}
