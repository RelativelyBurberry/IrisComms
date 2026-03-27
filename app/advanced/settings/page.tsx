"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Volume2,
  Globe,
  Shield,
  User,
  Save,
  RotateCcw,
  TestTube,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface SettingsFormData {
  eyeSensitivity: number;
  dwellTime: number;
  voiceSpeed: number;
  voiceType: string;
  language: string;
  theme: string;
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  caregiverAccess: boolean;
}

export default function SettingsPage() {
  const {
    eyeSensitivity,
    setEyeSensitivity,
    dwellTime,
    setDwellTime,
    voiceSpeed,
    setVoiceSpeed,
    voiceType,
    setVoiceType,
    language,
    setLanguage,
    theme,
    setTheme,
    emergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    caregiverContact,
    setCaregiverContact,
  } = useAppStore();

  const [formData, setFormData] = useState<SettingsFormData>({
    eyeSensitivity,
    dwellTime,
    voiceSpeed,
    voiceType,
    language,
    theme,
    notifications: true,
    soundEffects: true,
    hapticFeedback: true,
    caregiverAccess: true,
  });

  const [newContact, setNewContact] = useState("");
  const [newCaregiver, setNewCaregiver] = useState(caregiverContact);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSliderChange = (
    field: keyof SettingsFormData,
    value: number[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value[0] }));
    setHasChanges(true);
  };

  const handleSelectChange = (field: keyof SettingsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleToggle = (field: keyof SettingsFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setEyeSensitivity(formData.eyeSensitivity);
    setDwellTime(formData.dwellTime);
    setVoiceSpeed(formData.voiceSpeed);
    setVoiceType(formData.voiceType);
    setLanguage(formData.language);
    setTheme(formData.theme as "dark" | "light");
    setCaregiverContact(newCaregiver);
    setHasChanges(false);
    toast.success("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData({
      eyeSensitivity: 50,
      dwellTime: 800,
      voiceSpeed: 1,
      voiceType: "default",
      language: "en",
      theme: "dark",
      notifications: true,
      soundEffects: true,
      hapticFeedback: true,
      caregiverAccess: true,
    });
    setHasChanges(true);
  };

  const handleTestVoice = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Hello! This is a test of the voice settings.",
    );
    utterance.rate = formData.voiceSpeed;
    speechSynthesis.speak(utterance);
    toast.info("Playing voice test...");
  };

  const handleAddContact = () => {
    if (newContact.trim()) {
      addEmergencyContact(newContact.trim());
      setNewContact("");
      toast.success("Emergency contact added!");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-white/60">Customize your IrisComm experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* Eye Tracking Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Eye Tracking
                </h2>
                <p className="text-sm text-white/50">
                  Configure gaze detection sensitivity
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white/80 text-sm font-medium">
                    Eye Sensitivity
                  </label>
                  <span className="text-indigo-400 font-mono text-sm">
                    {formData.eyeSensitivity}%
                  </span>
                </div>
                <Slider
                  value={[formData.eyeSensitivity]}
                  onValueChange={(v) => handleSliderChange("eyeSensitivity", v)}
                  min={10}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <p className="text-xs text-white/40 mt-2">
                  Higher sensitivity detects smaller eye movements
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white/80 text-sm font-medium">
                    Dwell Time
                  </label>
                  <span className="text-indigo-400 font-mono text-sm">
                    {formData.dwellTime}ms
                  </span>
                </div>
                <Slider
                  value={[formData.dwellTime]}
                  onValueChange={(v) => handleSliderChange("dwellTime", v)}
                  min={300}
                  max={2000}
                  step={100}
                  className="py-2"
                />
                <p className="text-xs text-white/40 mt-2">
                  Time required to look at a key before selection
                </p>
              </div>
            </div>
          </motion.section>

          {/* Voice Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Voice Output
                </h2>
                <p className="text-sm text-white/50">
                  Configure speech synthesis settings
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white/80 text-sm font-medium">
                    Speech Speed
                  </label>
                  <span className="text-cyan-400 font-mono text-sm">
                    {formData.voiceSpeed}x
                  </span>
                </div>
                <Slider
                  value={[formData.voiceSpeed * 100]}
                  onValueChange={(v) =>
                    handleSliderChange("voiceSpeed", [v[0] / 100])
                  }
                  min={50}
                  max={200}
                  step={10}
                  className="py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-3">
                    Voice Type
                  </label>
                  <Select
                    value={formData.voiceType}
                    onValueChange={(v) => handleSelectChange("voiceType", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="robot">Robot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/80 text-sm font-medium block mb-3">
                    Language
                  </label>
                  <Select
                    value={formData.language}
                    onValueChange={(v) => handleSelectChange("language", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-600/30 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                Test Voice
              </button>
            </div>
          </motion.section>

          {/* Appearance Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Appearance</h2>
                <p className="text-sm text-white/50">
                  Customize visual experience
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm font-medium block mb-3">
                  Theme
                </label>
                <Select
                  value={formData.theme}
                  onValueChange={(v) => handleSelectChange("theme", v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="cosmic">Cosmic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/80 text-sm font-medium block mb-3">
                  Font Size
                </label>
                <Select defaultValue="medium">
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xlarge">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Sound Effects
                  </p>
                  <p className="text-xs text-white/40">
                    Play sounds on key selection
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("soundEffects")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.soundEffects ? "bg-indigo-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      formData.soundEffects
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Haptic Feedback
                  </p>
                  <p className="text-xs text-white/40">
                    Vibrate on device selection
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("hapticFeedback")}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.hapticFeedback ? "bg-indigo-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      formData.hapticFeedback
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.section>

          {/* Emergency Contacts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Emergency Contacts
                </h2>
                <p className="text-sm text-white/50">
                  People to notify during emergencies
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No emergency contacts added yet</p>
                </div>
              ) : (
                emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-white">{contact}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(contact)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Add emergency contact (name or number)"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>

            <div className="mt-6">
              <label className="text-white/80 text-sm font-medium block mb-3">
                Primary Caregiver Contact
              </label>
              <input
                type="text"
                value={newCaregiver}
                onChange={(e) => {
                  setNewCaregiver(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Phone number or email"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </motion.section>

          {/* Caregiver Access */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Caregiver Access
                </h2>
                <p className="text-sm text-white/50">
                  Allow caregivers to view your progress
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("caregiverAccess")}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.caregiverAccess ? "bg-indigo-600" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    formData.caregiverAccess
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {formData.caregiverAccess && (
              <div className="mt-6 p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Sharing Enabled</span>
                </div>
                <p className="text-sm text-white/60">
                  Your caregiver can view your messages, activity, and alerts
                  through their dashboard.
                </p>
              </div>
            )}
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Defaults
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
