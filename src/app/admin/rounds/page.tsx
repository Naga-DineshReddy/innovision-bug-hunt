"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RoundInfo } from "@/types";
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Flame,
  RefreshCw
} from "lucide-react";

export default function AdminRoundsPage() {
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetModalRound, setResetModalRound] = useState<RoundInfo | null>(null);
  const [resetConfirmationText, setResetConfirmationText] = useState("");

  const fetchRounds = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rounds");
      const data = await res.json();
      if (res.ok) {
        setRounds(data.rounds || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const handleRoundAction = async (roundNumber: number, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundNumber, action })
      });

      if (res.ok) {
        await fetchRounds();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error executing round action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetModalRound || resetConfirmationText !== "RESET") return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: resetModalRound.round_number,
          action: "RESET"
        })
      });

      if (res.ok) {
        await fetchRounds();
        setResetModalRound(null);
        setResetConfirmationText("");
      }
    } catch {
      alert("Failed to reset round");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-cyan-400" />
              Round Lifecycle &amp; Timer Controller
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Start, pause, complete, or safely reset competition rounds across all 80 terminal sessions.
            </p>
          </div>

          <button
            onClick={fetchRounds}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Rounds Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rounds.map((round) => {
            const isLive = round.status === "LIVE";
            const isPaused = round.status === "PAUSED";
            const isCompleted = round.status === "COMPLETED";
            const isLocked = round.status === "LOCKED";
            const isReady = round.status === "READY";

            return (
              <div
                key={round.round_number}
                className={`p-6 rounded-2xl border backdrop-blur-xl transition-all flex flex-col justify-between ${
                  isLive
                    ? "bg-[#0a0f1e]/95 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : isPaused
                    ? "bg-[#0a0f1e]/95 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                    : isCompleted
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-[#0a0f1e]/80 border-cyan-500/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {round.name}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded font-bold border uppercase ${
                        isLive
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/60 animate-pulse"
                          : isPaused
                          ? "bg-amber-950 text-amber-300 border-amber-500/60"
                          : isCompleted
                          ? "bg-blue-950 text-blue-300 border-blue-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {round.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{round.subtitle}</h3>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-cyan-300">
                        {round.duration_minutes} Minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Questions:</span>
                      <span>{round.total_questions} Questions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Marks:</span>
                      <span className="font-semibold text-emerald-400">
                        {round.total_marks} Marks
                      </span>
                    </div>
                    {round.round_number === 3 && (
                      <div className="flex justify-between text-purple-300">
                        <span>Audience:</span>
                        <span className="font-bold">All 80 Participants (No Elimination)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  {/* Start / Resume */}
                  {isLive ? (
                    <button
                      onClick={() => handleRoundAction(round.round_number, "PAUSE")}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span>PAUSE ROUND</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoundAction(round.round_number, isPaused ? "RESUME" : "START")}
                      disabled={actionLoading || isCompleted}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 fill-current" />
                      <span>{isPaused ? "RESUME ROUND" : "START ROUND"}</span>
                    </button>
                  )}

                  {/* End Round */}
                  <button
                    onClick={() => handleRoundAction(round.round_number, "END")}
                    disabled={actionLoading || isCompleted}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4 text-red-400" />
                    <span>END ROUND</span>
                  </button>

                  {/* Safe Reset Round */}
                  <button
                    onClick={() => {
                      setResetModalRound(round);
                      setResetConfirmationText("");
                    }}
                    className="w-full py-2 rounded-xl bg-slate-950 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-800 text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET ROUND (CONFIRMATION REQUIRED)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Reset Round */}
      {resetModalRound && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0a0f1e] border-2 border-red-500/80 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 border border-red-500/50 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Confirm Reset for {resetModalRound.subtitle}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed text-left bg-red-950/30 p-3 rounded-lg border border-red-500/30">
              WARNING: Resetting will clear all submitted code answers for this round and revert all participant scores back to 0. Type <strong className="text-red-400">RESET</strong> below to confirm.
            </p>

            <input
              type="text"
              placeholder='Type "RESET" to confirm'
              value={resetConfirmationText}
              onChange={(e) => setResetConfirmationText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#060913] border border-slate-700 text-center font-bold text-white uppercase focus:border-red-400 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setResetModalRound(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmationText !== "RESET" || actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-40"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
