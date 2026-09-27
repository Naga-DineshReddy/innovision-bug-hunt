"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Participant } from "@/types";
import {
  Award,
  Flame,
  CheckCircle2,
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function AdminResultsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinalistIds, setSelectedFinalistIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/participants");
      const data = await res.json();
      if (res.ok && data.participants) {
        setParticipants(data.participants);

        // Pre-populate already selected finalists
        const initialFinalists = new Set<string>();
        data.participants.forEach((p: Participant) => {
          if (p.is_finalist) initialFinalists.add(p.registration_id);
        });
        setSelectedFinalistIds(initialFinalists);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Sort participants by Total Score descending (and R1+R2 score as tie-break)
  const ranked = [...participants].sort((a, b) => {
    if (b.total_score !== a.total_score) {
      return b.total_score - a.total_score;
    }
    return (b.round_1_score + b.round_2_score) - (a.round_1_score + a.round_2_score);
  });

  // Toggle individual finalist checkbox
  const toggleFinalist = (regId: string) => {
    const updated = new Set(selectedFinalistIds);
    if (updated.has(regId)) {
      updated.delete(regId);
    } else {
      updated.add(regId);
    }
    setSelectedFinalistIds(updated);
  };

  // Select Top 15 button
  const handleSelectTop15 = () => {
    const top15 = ranked.slice(0, 15).map((p) => p.registration_id);
    setSelectedFinalistIds(new Set(top15));
    setNotification("Selected top 15 highest ranked participants. Click 'Confirm Finalists' to lock in access.");
  };

  // Confirm Finalists action
  const handleConfirmFinalists = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/admin/finalists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds: Array.from(selectedFinalistIds) })
      });

      if (res.ok) {
        setNotification(`Successfully confirmed ${selectedFinalistIds.size} finalists for Round 3 (Final Hunt)!`);
        await fetchParticipants();
      } else {
        alert("Failed to save finalists selection");
      }
    } catch {
      alert("Error confirming finalists");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Ranked Results &amp; Finalist Selection Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select and grant access for top 10–15 performers into Round 3: FINAL HUNT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectTop15}
              className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>SELECT TOP 15</span>
            </button>

            <button
              onClick={handleConfirmFinalists}
              disabled={confirming || selectedFinalistIds.size === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>{confirming ? "LOCKING FINALISTS..." : `CONFIRM FINALISTS (${selectedFinalistIds.size})`}</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-purple-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Detailed Results Table */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0a0f1e]/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070b16] text-[11px] uppercase text-slate-400">
                  <th className="py-3 px-3 text-center">Select</th>
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4 text-center">Round 1 (20m)</th>
                  <th className="py-3 px-4 text-center">Round 2 (30m)</th>
                  <th className="py-3 px-4 text-center">Round 3 (50m)</th>
                  <th className="py-3 px-4 text-center">Tie Break</th>
                  <th className="py-3 px-4 text-center font-bold text-white">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {ranked.map((p, index) => {
                  const rank = index + 1;
                  const isSelected = selectedFinalistIds.has(p.registration_id);

                  return (
                    <tr
                      key={p.registration_id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isSelected ? "bg-purple-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFinalist(p.registration_id)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            rank === 1
                              ? "bg-amber-400 text-black font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                              : rank === 2
                              ? "bg-slate-300 text-black font-bold"
                              : rank === 3
                              ? "bg-amber-700 text-white font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {p.registration_id}
                      </td>

                      <td className="py-3 px-4 text-white font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{p.student_name}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                              Finalist
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center text-cyan-400">{p.round_1_score}</td>
                      <td className="py-3 px-4 text-center text-blue-400">{p.round_2_score}</td>
                      <td className="py-3 px-4 text-center text-purple-400">{p.round_3_score}</td>
                      <td className="py-3 px-4 text-center text-amber-300">+{p.tie_breaker_score}</td>

                      <td className="py-3 px-4 text-center font-bold text-white text-base">
                        {p.total_score}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            p.status === "COMPLETED"
                              ? "bg-blue-950 text-blue-300 border-blue-500/40"
                              : p.status === "IN_PROGRESS"
                              ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                              : "bg-slate-900 text-slate-400 border-slate-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
