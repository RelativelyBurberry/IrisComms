"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Rocket, MessageSquare, Eye } from "lucide-react";

export function MissionCenter() {
  const { dailyMissions, badges, score } = useAppStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Daily Missions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Rocket className="w-6 h-6 text-indigo-500" />
          Daily Missions
        </h3>
        <div className="space-y-4">
          {dailyMissions.map((mission) => (
            <div 
              key={mission.id}
              className={`p-6 rounded-[2rem] border transition-all duration-300 ${
                mission.completed 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-bold uppercase tracking-widest ${mission.completed ? "text-emerald-400" : "text-white/40"}`}>
                  {mission.completed ? "Mission Complete" : "In Progress"}
                </span>
                {mission.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Circle className="w-6 h-6 text-white/20" />
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{mission.text}</h4>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                  className={`h-full ${mission.completed ? "bg-emerald-500" : "bg-indigo-500"}`}
                />
              </div>
              <div className="mt-2 text-right">
                <span className="text-xs font-bold text-white/40">{mission.progress} / {mission.goal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Galaxy Badges */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Award className="w-6 h-6 text-pink-500" />
          Galaxy Badges
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={badge.unlocked ? { scale: 1.05, y: -5 } : {}}
              className={`p-6 rounded-[2rem] border text-center transition-all duration-500 ${
                badge.unlocked 
                  ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                  : "bg-white/5 border-white/10 opacity-40 grayscale"
              }`}
            >
              <div className="text-5xl mb-4 drop-shadow-lg">{badge.icon}</div>
              <h4 className="text-lg font-bold text-white mb-1">{badge.name}</h4>
              <p className="text-[10px] text-white/40 leading-tight">{badge.description}</p>
              {badge.unlocked && (
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white">
                  Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Global Score Card */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Total Experience</span>
            <div className="text-6xl font-black text-white mt-2 flex items-baseline gap-2">
              {score}
              <span className="text-2xl text-white/40 font-bold uppercase">XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
