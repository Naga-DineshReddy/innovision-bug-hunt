"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Submission } from "@/types";
import {
  FileCheck2,
  Code2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      if (res.ok && data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 4000); // 4-second live streaming
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  // Filtered list
  const filtered = submissions.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.participant_id.toLowerCase().includes(q) ||
      (s.student_name && s.student_name.toLowerCase().includes(q)) ||
      (s.question_title && s.question_title.toLowerCase().includes(q));

    const matchesRound =
      roundFilter === "ALL" || s.round_id === Number(roundFilter);

    return matchesSearch && matchesRound;
  });

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">
                REALTIME AUDIT
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE STREAMING (4s)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-cyan-400" />
              Live Submissions &amp; Code Evaluation Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live telemetry of participant submissions, test pass rates, execution latency, and awarded marks.
            </p>
          </div>

          <button
            onClick={fetchSubmissions}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Now</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or Student Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Rounds</option>
              <option value="1">Round 1 (Bug MCQ)</option>
              <option value="2">Round 2 (Code Fixing)</option>
              <option value="3">Round 3 (Optimization)</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        {filtered.length > 0 ? (
          <div className="rounded-2xl border border-cyan-500/20 bg-[#0a0f1e]/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070b16] text-[11px] uppercase text-slate-400">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Participant ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Question</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4 text-center">Outcome</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Latency</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(s.submitted_at).toLocaleTimeString()}
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {s.participant_id}
                      </td>

                      <td className="py-3 px-4 text-white font-semibold">
                        {s.student_name || "Participant"}
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {s.question_title || s.question_id}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        Round {s.round_id}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            s.status === "correct"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : s.status === "partial"
                              ? "bg-amber-950 text-amber-300 border-amber-500/40"
                              : s.status === "draft"
                              ? "bg-slate-900 text-slate-400 border-slate-700"
                              : "bg-red-950 text-red-300 border-red-500/40"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-white">
                        {s.score} pts
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500 text-[11px]">
                        {s.execution_time_ms || 22}ms
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(s)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0a0f1e]/60 border border-slate-800 text-slate-500 text-xs font-mono">
            <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No code submissions recorded yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              As students test and submit code during the competition, results will stream here live.
            </p>
          </div>
        )}

        {/* Code Inspection Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-[#0a0f1e] border border-cyan-500/40 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Submitted Code: {selectedSubmission.student_name}
                  </h3>
                  <span className="text-xs text-cyan-300">
                    {selectedSubmission.participant_id} • Round {selectedSubmission.round_id} • Score: {selectedSubmission.score} pts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2 font-semibold">
                  Submitted Python / Solution Code:
                </span>
                <pre className="p-4 rounded-xl bg-black border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {selectedSubmission.submitted_code || "# No code captured"}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
