"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface AntiCheatGuardProps {
  registrationId: string;
  copyPasteDisabled?: boolean;
}

export function AntiCheatGuard({ registrationId, copyPasteDisabled = true }: AntiCheatGuardProps) {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationId) return;

    const reportSignal = async (eventType: string, details: string) => {
      try {
        const res = await fetch("/api/student/anti-cheat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType, details })
        });
        const data = await res.json();
        if (data.warning) {
          setWarningMessage(data.warning);
        }
      } catch {
        // network silent
      }
    };

    // 1. Visibility Change (Tab switched)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportSignal("TAB_SWITCH", "Participant switched away from active competition tab");
        setWarningMessage("Tab switch detected. This event has been logged for event coordinators.");
      }
    };

    // 2. Window Blur (Lost focus)
    const handleWindowBlur = () => {
      reportSignal("BLUR", "Browser window lost focus");
    };

    // 3. Prevent Copy / Paste if enabled
    const handlePaste = (e: ClipboardEvent) => {
      if (copyPasteDisabled) {
        e.preventDefault();
        reportSignal("PASTE_ATTEMPT", "Attempted clipboard paste in competition editor");
        setWarningMessage("Direct pasting is restricted by coordinator settings.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("paste", handlePaste);
    };
  }, [registrationId, copyPasteDisabled]);

  if (!warningMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-amber-950/90 border border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] backdrop-blur-md text-amber-200 font-mono text-xs flex items-start gap-3 animate-bounce">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-bold text-amber-300 block mb-1 uppercase tracking-wider">
          Compliance Notice
        </span>
        <p>{warningMessage}</p>
      </div>
      <button
        onClick={() => setWarningMessage(null)}
        className="p-1 hover:bg-amber-900/60 rounded text-amber-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
