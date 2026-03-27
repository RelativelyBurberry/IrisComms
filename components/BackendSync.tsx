"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function BackendSync() {
  const syncRemoteState = useAppStore((state) => state.syncRemoteState);

  useEffect(() => {
    let cancelled = false;

    const pullState = async () => {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return;

        const snapshot = (await response.json()) as Parameters<typeof syncRemoteState>[0];
        if (!cancelled) {
          syncRemoteState(snapshot);
        }
      } catch (error) {
        console.warn("Remote sync failed:", error);
      }
    };

    void pullState();
    const interval = window.setInterval(pullState, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [syncRemoteState]);

  return null;
}
