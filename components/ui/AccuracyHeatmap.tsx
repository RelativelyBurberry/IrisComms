"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function AccuracyHeatmap() {
  const { heatmapData } = useAppStore();

  const grid = useMemo(() => {
    // Create a 10x10 grid for the heatmap
    const cells = Array.from({ length: 100 }, () => 0);
    
    heatmapData.forEach(sample => {
      const gx = Math.floor(sample.x * 10);
      const gy = Math.floor(sample.y * 10);
      const idx = gy * 10 + gx;
      if (idx >= 0 && idx < 100) {
        cells[idx]++;
      }
    });

    const maxCount = Math.max(...cells, 1);
    return cells.map(count => count / maxCount);
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gaze Distribution</h3>
        <span className="text-xs font-medium text-white/30 uppercase tracking-widest">Last 1000 Samples</span>
      </div>
      
      <div className="aspect-video w-full bg-black/40 rounded-3xl border border-white/10 p-4 grid grid-cols-10 grid-rows-10 gap-1 overflow-hidden backdrop-blur-3xl">
        {grid.map((intensity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              backgroundColor: intensity > 0 
                ? `rgba(79, 70, 229, ${0.1 + intensity * 0.8})` 
                : "rgba(255, 255, 255, 0.02)"
            }}
            className="rounded-sm transition-colors duration-500"
            style={{
              boxShadow: intensity > 0.5 ? "0 0 15px rgba(79, 70, 229, 0.3)" : "none"
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-tighter text-white/40 font-bold px-2">
        <span>Low Activity</span>
        <div className="flex-1 mx-4 h-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-indigo-500/50 to-indigo-500" />
        <span>High Focus</span>
      </div>
    </div>
  );
}
