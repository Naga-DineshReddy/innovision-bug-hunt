"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ShieldCheck, CheckSquare, Square, ArrowRight, AlertTriangle, Terminal } from "lucide-react";

const RULES = [
  "Individual participation only.",
  "Each participant must use only the assigned system.",
  "Participants must solve the debugging problems within the specified time.",
  "No communication with other participants.",
  "No unauthorized electronic devices.",
  "Follow coordinator instructions.",
  "Copying or attempting to interfere with another participant may result in disqualification.",
  "Submit answers before the deadline.",
  "Tie-breaker questions may be used if necessary.",
  "Coordinator decisions regarding evaluation and event management are final."
];

function InstructionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roundParam = searchParams.get("round") || "1";
  const roundNumber = Number(roundParam);

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    if (!accepted) return;
    setLoading(true);

    if (roundNumber === 1) {
      router.push("/competition/round-1");
    } else if (roundNumber === 2) {
      router.push("/competition/round-2");
    } else {
      router.push("/competition/final");
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="p-6 sm:p-10 rounded-2xl bg-[#0a0f1e]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8 border-b border-cyan-500/20 pb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center mb-3">
            <Terminal className="w-6 h-6" />
          </div>
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold block mb-1">
            INNOVISION — BUG HUNT 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Competition Rules &amp; Integrity Guidelines
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-2">
            Please read each rule carefully. By starting Round {roundNumber}, you agree to strictly comply with all contest policies.
          </p>
        </div>

        {/* Warning callout */}
        <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Active tab monitoring and window telemetry are enabled throughout the competition. Multiple tab shifts or unverified focus loss will be flagged for review by LAB 4-A coordinators.
          </p>
        </div>

        {/* Rules Checklist / List */}
        <div className="space-y-3 mb-8">
          {RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <span className="pt-0.5">{rule}</span>
            </div>
          ))}
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => setAccepted(!accepted)}
            className="flex items-center gap-3 text-sm font-mono text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer select-none"
          >
            {accepted ? (
              <CheckSquare className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            ) : (
              <Square className="w-5 h-5 text-slate-600" />
            )}
            <span className="font-semibold">
              I have read, understood, and agree to follow all 10 competition rules.
            </span>
          </button>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!accepted || loading}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-black font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {loading
                ? "INITIALIZING SECURE SESSION..."
                : roundNumber === 1
                ? "I AGREE — START ROUND 1 (5 MINUTES)"
                : roundNumber === 2
                ? "I AGREE — START ROUND 2 (10 MINUTES)"
                : "I AGREE — START FINAL ROUND 3 (15 MINUTES)"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompetitionInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading competition instructions...
        </div>
      }
    >
      <InstructionsContent />
    </Suspense>
  );
}
