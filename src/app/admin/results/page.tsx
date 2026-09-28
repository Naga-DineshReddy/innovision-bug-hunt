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

  const getParticipantTotal = (p: Participant) => {
    const r1 = Number(p.round_1_score) || 0;
    const r2 = Number(p.round_2_score) || 0;
    const r3 = Number(p.round_3_score) || 0;
    const tb = Number(p.tie_breaker_score) || 0;
    const computed = r1 + r2 + r3 + tb;
    return p.total_score != null && !isNaN(Number(p.total_score)) && Number(p.total_score) > 0
      ? Number(p.total_score)
      : computed;
  };

  // Sort participants by Total Score descending (and R1+R2 score as tie-break)
  const ranked = [...participants].sort((a, b) => {
    const scoreA = getParticipantTotal(a);
    const scoreB = getParticipantTotal(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const r12A = (Number(a.round_1_score) || 0) + (Number(a.round_2_score) || 0);
    const r12B = (Number(b.round_1_score) || 0) + (Number(b.round_2_score) || 0);
    return r12B - r12A;
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Ranked Results &amp; Finalist Selection Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select and grant access for top 10–15 performers into Round 3: FINAL HUNT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectTop15}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>SELECT TOP 15</span>
            </button>

            <button
              onClick={handleConfirmFinalists}
              disabled={confirming || selectedFinalistIds.size === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>{confirming ? "LOCKING FINALISTS..." : `CONFIRM FINALISTS (${selectedFinalistIds.size})`}</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-purple-600 hover:text-purple-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Detailed Results Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-600 font-bold">
                  <th className="py-3 px-3 text-center">Select</th>
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4 text-center">Round 1 (20m)</th>
                  <th className="py-3 px-4 text-center">Round 2 (30m)</th>
                  <th className="py-3 px-4 text-center">Round 3 (50m)</th>
                  <th className="py-3 px-4 text-center">Tie Break</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-900">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ranked.map((p, index) => {
                  const rank = index + 1;
                  const isSelected = selectedFinalistIds.has(p.registration_id);

                  return (
                    <tr
                      key={p.registration_id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-purple-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFinalist(p.registration_id)}
                          className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600 fill-purple-100" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            rank === 1
                              ? "bg-amber-400 text-slate-950 font-extrabold shadow-xs"
                              : rank === 2
                              ? "bg-slate-200 text-slate-800 font-bold"
                              : rank === 3
                              ? "bg-amber-100 text-amber-900 font-bold"
                              : "text-slate-500 font-medium"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-700">
                        {p.registration_id}
                      </td>

                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{p.student_name}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                              Finalist
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center text-cyan-700 font-semibold">{p.round_1_score}</td>
                      <td className="py-3 px-4 text-center text-blue-700 font-semibold">{p.round_2_score}</td>
                      <td className="py-3 px-4 text-center text-purple-700 font-semibold">{p.round_3_score}</td>
                      <td className="py-3 px-4 text-center text-amber-700 font-semibold">+{p.tie_breaker_score}</td>

                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 text-base">
                        {getParticipantTotal(p)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            p.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : p.status === "IN_PROGRESS"
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
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
