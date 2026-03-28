export interface GazeCloudResult {
  state: -1 | 0 | 1;
  docX: number;
  docY: number;
  time: number;
}

export interface GazeCloudAPI {
  StartEyeTracking: () => void;
  StopEyeTracking: () => void;
  OnResult: ((gazeData: GazeCloudResult) => void) | null;
  OnCalibrationComplete: (() => void) | null;
  OnCamDenied: (() => void) | null;
  OnError: ((message: string) => void) | null;
  UseClickRecalibration?: boolean;
}

declare global {
  interface Window {
    GazeCloudAPI?: GazeCloudAPI;
  }
}

export {};
