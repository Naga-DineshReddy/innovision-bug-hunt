"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Participant } from "@/types";
import {
  Users,
  Search,
  Filter,
  Lock,
  Unlock,
  ShieldAlert,
  Edit,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Award
} from "lucide-react";

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roundFilter, setRoundFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Participant | null>(null);
  const [overrideScores, setOverrideScores] = useState({ r1: 0, r2: 0, r3: 0, tb: 0 });
  const [overrideReason, setOverrideReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/participants");
      const data = await res.json();
      if (res.ok) {
        setParticipants(data.participants || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000); // 5-second live refresh
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  // Handle Participant Action (Lock, Unlock, Disqualify, Restore)
  const handleAction = async (registrationId: string, action: string, reason = "") => {
    if (!confirm(`Are you sure you want to ${action} ${registrationId}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action, reason })
      });

      if (res.ok) {
        await fetchParticipants();
        if (selectedStudent?.registration_id === registrationId) {
          setSelectedStudent(null);
        }
      }
    } catch {
      alert("Action failed. Check connection.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Score Override Submit
  const handleScoreOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedStudent.registration_id,
          action: "OVERRIDE_SCORE",
          reason: overrideReason || "Coordinator adjustment",
          scoreOverrides: {
            round_1: overrideScores.r1,
            round_2: overrideScores.r2,
            round_3: overrideScores.r3,
            tie_breaker: overrideScores.tb
          }
        })
      });

      if (res.ok) {
        await fetchParticipants();
        setSelectedStudent(null);
      }
    } catch {
      alert("Failed to override score");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Participants
  const filtered = participants.filter((p) => {
    const matchesSearch =
      !search ||
      p.student_name.toLowerCase().includes(search.toLowerCase()) ||
      p.registration_id.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesRound = roundFilter === "ALL" || p.current_round === Number(roundFilter);

    return matchesSearch && matchesStatus && matchesRound;
  });

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Live Participant Monitor &amp; Controls
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active monitoring for 80 registered terminals in LAB 4-A with realtime status updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchParticipants}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Feed
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0a0f1e]/90 border border-cyan-500/20">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Name or Registration ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses ({participants.length})</option>
              <option value="LOGGED_IN">Logged In</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="COMPLETED">Completed</option>
              <option value="DISQUALIFIED">Disqualified</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>

          <div>
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1 (Basics)</option>
              <option value="2">Round 2 (Challenge)</option>
              <option value="3">Round 3 (Final Hunt)</option>
            </select>
          </div>
        </div>

        {/* Live Table */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0a0f1e]/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070b16] text-[11px] uppercase text-slate-400">
                  <th className="py-3 px-4">Reg ID</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Round</th>
                  <th className="py-3 px-4 text-center">R1</th>
                  <th className="py-3 px-4 text-center">R2</th>
                  <th className="py-3 px-4 text-center">R3</th>
                  <th className="py-3 px-4 text-center">Total</th>
                  <th className="py-3 px-4 text-center">Signals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((p) => {
                  return (
                    <tr
                      key={p.registration_id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {p.registration_id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.student_name}</div>
                        <div className="text-[10px] text-slate-500">{p.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            p.status === "IN_PROGRESS"
                              ? "bg-cyan-950 text-cyan-300 border-cyan-500/40 animate-pulse"
                              : p.status === "LOGGED_IN"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : p.status === "COMPLETED"
                              ? "bg-blue-950 text-blue-300 border-blue-500/40"
                              : p.status === "DISQUALIFIED"
                              ? "bg-red-950 text-red-300 border-red-500/50"
                              : p.status === "LOCKED"
                              ? "bg-amber-950 text-amber-300 border-amber-500/50"
                              : "bg-slate-900 text-slate-500 border-slate-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        Round {p.current_round}
                        {p.is_finalist && (
                          <span className="ml-1 text-[10px] text-purple-400 font-bold">
                            [Finalist]
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-cyan-400">{p.round_1_score}</td>
                      <td className="py-3 px-4 text-center text-blue-400">{p.round_2_score}</td>
                      <td className="py-3 px-4 text-center text-purple-400">{p.round_3_score}</td>

                      <td className="py-3 px-4 text-center font-bold text-white text-sm">
                        {p.total_score != null && !isNaN(Number(p.total_score)) && Number(p.total_score) > 0
                          ? Number(p.total_score)
                          : (Number(p.round_1_score) || 0) + (Number(p.round_2_score) || 0) + (Number(p.round_3_score) || 0) + (Number(p.tie_breaker_score) || 0)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.suspicious_count > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                            {p.suspicious_count} Flag{p.suspicious_count > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Clean</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Score override modal trigger */}
                          <button
                            onClick={() => {
                              setSelectedStudent(p);
                              setOverrideScores({
                                r1: p.round_1_score,
                                r2: p.round_2_score,
                                r3: p.round_3_score,
                                tb: p.tie_breaker_score
                              });
                            }}
                            title="Edit / Override Scores"
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock */}
                          {p.status === "LOCKED" ? (
                            <button
                              onClick={() => handleAction(p.registration_id, "UNLOCK")}
                              title="Unlock Session"
                              className="p-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(p.registration_id, "LOCK", "Coordinator Lock")}
                              title="Lock Session"
                              className="p-1 rounded bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-400"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Disqualify / Restore */}
                          {p.status === "DISQUALIFIED" ? (
                            <button
                              onClick={() => handleAction(p.registration_id, "RESTORE")}
                              title="Restore Participant"
                              className="p-1 rounded bg-slate-800 hover:bg-emerald-900 text-emerald-400"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(p.registration_id, "DISQUALIFY", "Compliance Violation")}
                              title="Disqualify Participant"
                              className="p-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#070b16] border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Showing {filtered.length} of {participants.length} total participants</span>
            <span>Refreshes automatically every 5 seconds</span>
          </div>
        </div>
      </div>

      {/* Score Override Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0a0f1e] border border-cyan-500/40 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Manual Score Override
            </h3>
            <p className="text-slate-400 mb-4 text-[11px]">
              Participant: <strong className="text-white">{selectedStudent.student_name}</strong> ({selectedStudent.registration_id})
            </p>

            <form onSubmit={handleScoreOverrideSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Round 1 Score (Max 20):</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={overrideScores.r1}
                  onChange={(e) => setOverrideScores({ ...overrideScores, r1: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-[#060913] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Round 2 Score (Max 40):</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={overrideScores.r2}
                  onChange={(e) => setOverrideScores({ ...overrideScores, r2: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-[#060913] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Round 3 Score (Max 40):</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={overrideScores.r3}
                  onChange={(e) => setOverrideScores({ ...overrideScores, r3: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-[#060913] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Tie-Breaker Points:</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={overrideScores.tb}
                  onChange={(e) => setOverrideScores({ ...overrideScores, tb: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-[#060913] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Audit Reason:</label>
                <input
                  type="text"
                  placeholder="e.g. In-person code review verification"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#060913] border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Save &amp; Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
