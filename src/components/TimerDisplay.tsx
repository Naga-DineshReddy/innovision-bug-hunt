"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerDisplayProps {
  deadlineAt: string; // ISO server timestamp
  onTimeUp: () => void;
  className?: string;
}

export function TimerDisplay({ deadlineAt, onTimeUp, className = "" }: TimerDisplayProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!deadlineAt) return;

    const deadlineTime = new Date(deadlineAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((deadlineTime - now) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTimeUp();
      }
    };

    // Immediate calculation
    updateTimer();

    // 1-second interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadlineAt, onTimeUp]);

  if (remainingSeconds === null) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs ${className}`}>
        <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span className="text-slate-400">Syncing timer...</span>
      </div>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isCritical = remainingSeconds <= 300; // Under 5 minutes
  const isDanger = remainingSeconds <= 60; // Under 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-sm font-semibold transition-all border ${
        isDanger
          ? "bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
          : isCritical
          ? "bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
          : "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
      } ${className}`}
    >
      {isDanger ? (
        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-cyan-400" />
      )}
      <span className="text-xs uppercase tracking-wider text-slate-400">Time:</span>
      <span className="tracking-widest text-base font-bold">{formatted}</span>
    </div>
  );
}
