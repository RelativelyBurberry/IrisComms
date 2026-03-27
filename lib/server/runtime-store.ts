export type CaregiverMessage = {
  id: string;
  text: string;
  from: string;
  timestamp: string;
};

export type EmergencyLog = {
  id: string;
  timestamp: string;
  type: string;
  status: string;
  message?: string;
  delivery?: {
    delivered: boolean;
    recipients: string[];
    skipped: boolean;
    reason?: string;
    sidList: string[];
  };
};

export type IoTDevice = {
  id: string;
  name: string;
  status: "on" | "off";
  type: string;
};

export type AppSettings = {
  eyeSensitivity: number;
  dwellTime: number;
  voiceSpeed: number;
  voiceType: string;
  language: string;
  theme: string;
  caregiverContact: string;
  emergencyContacts: string[];
  patientName: string;
  diagnosis: string;
  priorityNeeds: string[];
  careNotes: string;
};

export type AnalyticsData = {
  typingSpeed: number[];
  accuracy: number[];
  mostUsedPhrases: Array<{ phrase: string; count: number }>;
  totalSessionTime: number;
};

export type SessionSnapshot = {
  caregiverMessages: CaregiverMessage[];
  emergencyLogs: EmergencyLog[];
  iotDevices: IoTDevice[];
  lastKnownText: string;
  settings: AppSettings;
  analyticsData: AnalyticsData;
  updatedAt: string;
};

type RuntimeState = SessionSnapshot;

type RuntimeStateUpdate = Partial<Omit<RuntimeState, "settings" | "analyticsData">> & {
  settings?: Partial<AppSettings>;
  analyticsData?: Partial<AnalyticsData>;
};

const globalRuntime = globalThis as typeof globalThis & {
  __iriscommRuntimeState?: RuntimeState;
};

const defaultSettings: AppSettings = {
  eyeSensitivity: 50,
  dwellTime: 800,
  voiceSpeed: 1,
  voiceType: "default",
  language: "en",
  theme: "dark",
  caregiverContact: "",
  emergencyContacts: [],
  patientName: "",
  diagnosis: "",
  priorityNeeds: [],
  careNotes: "",
};

const defaultAnalytics: AnalyticsData = {
  typingSpeed: [12, 15, 18, 16, 22, 25, 28],
  accuracy: [85, 88, 92, 90, 95, 96, 98],
  mostUsedPhrases: [
    { phrase: "I need water", count: 12 },
    { phrase: "I am hungry", count: 8 },
    { phrase: "Thank you", count: 15 },
  ],
  totalSessionTime: 3600,
};

const defaultState: RuntimeState = {
  caregiverMessages: [],
  emergencyLogs: [],
  iotDevices: [
    { id: "light-1", name: "Smart Lights", status: "off", type: "light" },
    { id: "fan-1", name: "Ceiling Fan", status: "off", type: "fan" },
    { id: "bell-1", name: "Emergency Bell", status: "off", type: "bell" },
  ],
  lastKnownText: "",
  settings: defaultSettings,
  analyticsData: defaultAnalytics,
  updatedAt: new Date().toISOString(),
};

function mergeSettings(current: AppSettings, update?: Partial<AppSettings>): AppSettings {
  return {
    ...current,
    ...update,
    emergencyContacts:
      update?.emergencyContacts !== undefined
        ? [...new Set(update.emergencyContacts.map((contact) => contact.trim()).filter(Boolean))]
        : current.emergencyContacts,
    priorityNeeds:
      update?.priorityNeeds !== undefined
        ? [...new Set(update.priorityNeeds.map((need) => need.trim()).filter(Boolean))]
        : current.priorityNeeds,
  };
}

function mergeAnalytics(current: AnalyticsData, update?: Partial<AnalyticsData>): AnalyticsData {
  return {
    ...current,
    ...update,
  };
}

function getState(): RuntimeState {
  if (!globalRuntime.__iriscommRuntimeState) {
    globalRuntime.__iriscommRuntimeState = {
      ...defaultState,
      settings: { ...defaultSettings },
      analyticsData: {
        ...defaultAnalytics,
        mostUsedPhrases: [...defaultAnalytics.mostUsedPhrases],
      },
      iotDevices: defaultState.iotDevices.map((device) => ({ ...device })),
      caregiverMessages: [],
      emergencyLogs: [],
    };
  }

  return globalRuntime.__iriscommRuntimeState;
}

export async function getRuntimeSnapshot(): Promise<SessionSnapshot> {
  return getState();
}

export async function updateRuntimeSnapshot(
  update: RuntimeStateUpdate,
): Promise<SessionSnapshot> {
  const current = getState();
  const next: RuntimeState = {
    ...current,
    ...update,
    settings: mergeSettings(current.settings, update.settings),
    analyticsData: mergeAnalytics(current.analyticsData, update.analyticsData),
    updatedAt: new Date().toISOString(),
  };

  globalRuntime.__iriscommRuntimeState = next;
  return next;
}

export async function addCaregiverMessage(
  text: string,
  from: string,
): Promise<SessionSnapshot> {
  const current = getState();
  globalRuntime.__iriscommRuntimeState = {
    ...current,
    caregiverMessages: [
      {
        id: crypto.randomUUID(),
        text,
        from,
        timestamp: new Date().toISOString(),
      },
      ...current.caregiverMessages,
    ].slice(0, 25),
    updatedAt: new Date().toISOString(),
  };

  return getState();
}

export async function addEmergencyLog(
  type: string,
  status: string,
  message?: string,
  delivery?: EmergencyLog["delivery"],
): Promise<SessionSnapshot> {
  const current = getState();
  globalRuntime.__iriscommRuntimeState = {
    ...current,
    emergencyLogs: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type,
        status,
        message,
        delivery,
      },
      ...current.emergencyLogs,
    ].slice(0, 25),
    updatedAt: new Date().toISOString(),
  };

  return getState();
}

export async function toggleRuntimeDevice(id: string): Promise<SessionSnapshot> {
  const current = getState();
  return updateRuntimeSnapshot({
    iotDevices: current.iotDevices.map((device) =>
      device.id === id
        ? { ...device, status: device.status === "on" ? "off" : "on" }
        : device,
    ),
  });
}
