import type { GazeCloudAPI } from "@/types/gaze";

const GAZE_CLOUD_SCRIPT_ID = "gazecloud-api-sdk";
const GAZE_CLOUD_SCRIPT_SRC = "https://api.gazerecorder.com/GazeCloudAPI.js";

let gazeCloudLoadPromise: Promise<GazeCloudAPI> | null = null;

function getGlobalGazeCloudAPI() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.GazeCloudAPI ?? null;
}

function getExistingScript() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.getElementById(GAZE_CLOUD_SCRIPT_ID) as HTMLScriptElement | null
  ) ?? document.querySelector<HTMLScriptElement>(`script[src="${GAZE_CLOUD_SCRIPT_SRC}"]`);
}

export function getLoadedGazeCloudAPI() {
  return getGlobalGazeCloudAPI();
}

export function loadGazeCloudAPI(): Promise<GazeCloudAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("GazeCloudAPI can only load in the browser."));
  }

  const loadedAPI = getGlobalGazeCloudAPI();
  if (loadedAPI) {
    return Promise.resolve(loadedAPI);
  }

  if (gazeCloudLoadPromise) {
    return gazeCloudLoadPromise;
  }

  gazeCloudLoadPromise = new Promise<GazeCloudAPI>((resolve, reject) => {
    const resolveAPI = () => {
      const api = getGlobalGazeCloudAPI();
      if (!api) {
        gazeCloudLoadPromise = null;
        reject(new Error("GazeCloudAPI loaded, but the global API was unavailable."));
        return;
      }

      resolve(api);
    };

    const handleError = () => {
      gazeCloudLoadPromise = null;
      reject(new Error("Failed to load GazeCloudAPI.js."));
    };

    const existingScript = getExistingScript();
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolveAPI();
        return;
      }

      existingScript.addEventListener("load", resolveAPI, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GAZE_CLOUD_SCRIPT_ID;
    script.src = GAZE_CLOUD_SCRIPT_SRC;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolveAPI();
      },
      { once: true },
    );
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return gazeCloudLoadPromise;
}
