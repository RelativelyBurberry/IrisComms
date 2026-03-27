"use client";

import { useAppStore } from "@/lib/store";
import { 
  Users, 
  Activity, 
  AlertCircle, 
  MessageSquare, 
  TrendingUp, 
  Send,
  UserCheck,
  Shield,
  BrainCircuit,
  Siren,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CaregiverDashboard() {
  const { 
    currentText, 
    analyticsData, 
    emergencyLogs, 
    caregiverMessages, 
    addCaregiverMessage,
    emotion,
  } = useAppStore();
  
  const [msgInput, setMsgInput] = useState("");

  const careInsights = useMemo(() => {
    const latestAccuracy = analyticsData.accuracy.at(-1) ?? 0;
    const latestSpeed = analyticsData.typingSpeed.at(-1) ?? 0;
    const alertCount = emergencyLogs.length;
    const urgency =
      alertCount > 0 || emotion.emotion === "pain" || emotion.emotion === "stressed"
        ? "High Attention"
        : latestAccuracy > 92 && latestSpeed > 20
          ? "Stable"
          : "Monitor";

    return [
      {
        label: "Care Priority",
        value: urgency,
        icon: Shield,
        tone:
          urgency === "High Attention"
            ? "text-red-300"
            : urgency === "Stable"
              ? "text-emerald-300"
              : "text-amber-200",
      },
      {
        label: "Cognitive Load",
        value: `${Math.max(100 - latestAccuracy + Math.round(latestSpeed / 2), 12)} score`,
        icon: BrainCircuit,
        tone: "text-cyan-300",
      },
      {
        label: "Response Escalations",
        value: `${alertCount} total`,
        icon: Siren,
        tone: "text-pink-300",
      },
    ];
  }, [analyticsData.accuracy, analyticsData.typingSpeed, emergencyLogs.length, emotion.emotion]);

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;
    addCaregiverMessage(msgInput, "Caregiver");
    setMsgInput("");
    toast.success("Message sent to user's screen");
  };

  // Simple sparkline component for charts
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (data.length === 0) {
      return <div className="h-16 w-full rounded-xl bg-white/5" />;
    }

    if (data.length === 1) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-16">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={`0,50 100,50`}
          />
        </svg>
      );
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(max - min, 1);
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox="0 0 100 100" className="w-full h-16">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8 p-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-white flex items-center gap-3">
            <Users className="w-10 h-10 text-indigo-500" />
            Caregiver Hub
          </h2>
          <p className="text-white/40">Real-time monitoring and analytics</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">User Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live View & Messaging */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {careInsights.map((insight) => (
              <div
                key={insight.label}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-3xl"
              >
                <div className="flex items-center gap-2 text-white/35">
                  <insight.icon className={`h-4 w-4 ${insight.tone}`} />
                  <span className="text-[11px] uppercase tracking-[0.2em]">{insight.label}</span>
                </div>
                <p className={`mt-3 text-lg font-semibold ${insight.tone}`}>{insight.value}</p>
              </div>
            ))}
          </div>

          {/* Live View */}
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 bg-white/5 backdrop-blur-3xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Live User Activity
              </h3>
              <span className="text-xs font-medium text-white/30 uppercase tracking-widest">Real-time Sync</span>
            </div>
            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 min-h-[150px]">
              {currentText ? (
                <p className="text-3xl text-white/90 font-light leading-relaxed italic">
                  "{currentText}"
                  <span className="inline-block w-1 h-8 bg-indigo-500 ml-1 animate-pulse" />
                </p>
              ) : (
                <p className="text-white/20 text-xl font-light italic">User is not typing currently...</p>
              )}
            </div>
          </div>

          {/* Caregiver Messaging */}
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 bg-white/5 backdrop-blur-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" />
              Send Assistance Message
            </h3>
            <div className="flex gap-4">
              <input 
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to appear on user's screen..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {["Do you need water?", "Are you okay?", "Help is coming", "Check your vitals"].map(phrase => (
                <button 
                  key={phrase}
                  onClick={() => setMsgInput(phrase)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  {phrase}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {caregiverMessages.slice().reverse().slice(0, 4).map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{message.from}</span>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/80">{message.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Logs */}
        <div className="space-y-8">
          {/* Analytics Snapshot */}
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 bg-white/5 backdrop-blur-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Session Analytics
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-white/40">Typing Speed (WPM)</span>
                  <span className="text-2xl font-bold text-emerald-400">{analyticsData.typingSpeed[analyticsData.typingSpeed.length-1]}</span>
                </div>
                <Sparkline data={analyticsData.typingSpeed} color="#10b981" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-white/40">Accuracy (%)</span>
                  <span className="text-2xl font-bold text-indigo-400">{analyticsData.accuracy[analyticsData.accuracy.length-1]}%</span>
                </div>
                <Sparkline data={analyticsData.accuracy} color="#6366f1" />
              </div>
            </div>
          </div>

          {/* Emergency Logs */}
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 bg-white/5 backdrop-blur-3xl max-h-[400px] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Emergency Logs
            </h3>
            <div className="space-y-4">
              {emergencyLogs.length > 0 ? (
                emergencyLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-red-400 font-bold text-sm">{log.type}</span>
                      <span className="text-[10px] text-white/30">{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white/60 text-xs">Status: {log.status}</p>
                    {log.message && (
                      <p className="mt-1 text-xs text-white/50">Message: {log.message}</p>
                    )}
                    {log.delivery && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/60">
                        <p>
                          Delivery:{" "}
                          <span className={log.delivery.delivered ? "text-emerald-300" : "text-amber-200"}>
                            {log.delivery.delivered ? "Sent" : "Logged only"}
                          </span>
                        </p>
                        <p>Recipients: {log.delivery.recipients.length || 0}</p>
                        {log.delivery.reason && <p>Reason: {log.delivery.reason}</p>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-white/20 text-sm">No emergency alerts recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
