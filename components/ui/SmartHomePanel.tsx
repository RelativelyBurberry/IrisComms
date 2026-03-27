"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Lightbulb, Fan, Bell, ToggleLeft, ToggleRight } from "lucide-react";

export function SmartHomePanel() {
  const { iotDevices, toggleIotDevice } = useAppStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "light": return <Lightbulb className="w-6 h-6" />;
      case "fan": return <Fan className="w-6 h-6" />;
      case "bell": return <Bell className="w-6 h-6" />;
      default: return <Lightbulb className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {iotDevices.map((device) => (
        <motion.div
          key={device.id}
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-3xl border transition-all duration-300 ${
            device.status === "on" 
              ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20" 
              : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${device.status === "on" ? "text-indigo-400" : "text-white/40"}`}>
              {getIcon(device.type)}
            </div>
            <button 
              onClick={() => toggleIotDevice(device.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {device.status === "on" ? (
                <ToggleRight className="w-10 h-10 text-indigo-500" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{device.name}</h3>
          <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
            Status: <span className={device.status === "on" ? "text-indigo-400" : ""}>{device.status}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}
