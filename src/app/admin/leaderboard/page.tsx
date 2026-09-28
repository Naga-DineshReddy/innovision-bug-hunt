"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Participant } from "@/types";
import { Trophy, Download, Printer, ArrowUpDown, Award, CheckCircle2 } from "lucide-react";

export default function AdminLeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/participants");
      const data = await res.json();
      if (data.participants) {
        setParticipants(data.participants);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000); // 4-second live auto-refresh
    return () => clearInterval(interval);
  }, [load]);

  // Accurate multi-criteria ranking & tie-breaker:
  // 1. Total Score (desc)
  // 2. Round 3 Score (Hardest round)
  // 3. Round 2 Score (Moderate)
  // 4. Tie-Breaker Points
  // 5. Earlier submission timestamp (Speed tie-break)
  const sorted = [...participants].sort((a, b) => {
    if (a.total_score !== b.total_score) {
      return sortAsc ? a.total_score - b.total_score : b.total_score - a.total_score;
    }
    if (b.round_3_score !== a.round_3_score) {
      return b.round_3_score - a.round_3_score;
    }
    if (b.round_2_score !== a.round_2_score) {
      return b.round_2_score - a.round_2_score;
    }
    if (b.tie_breaker_score !== a.tie_breaker_score) {
      return b.tie_breaker_score - a.tie_breaker_score;
    }
    const timeA = new Date(a.round_3_submitted_at || a.last_active_at || 0).getTime();
    const timeB = new Date(b.round_3_submitted_at || b.last_active_at || 0).getTime();
    return timeA - timeB;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Registration ID",
      "Student Name",
      "Department",
      "Round 1 Score",
      "Round 2 Score",
      "Round 3 Score",
      "Tie Breaker Score",
      "Total Score",
      "Finalist Status",
      "Completion Status"
    ];

    const rows = sorted.map((p, idx) => [
      idx + 1,
      `"${p.registration_id}"`,
      `"${p.student_name}"`,
      `"${p.department}"`,
      p.round_1_score,
      p.round_2_score,
      p.round_3_score,
      p.tie_breaker_score,
      p.total_score,
      p.is_finalist ? "Yes" : "No",
      p.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `INNOVISION_BUG_HUNT_2026_LEADERBOARD.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                OFFICIAL STANDINGS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                ADMIN CONFIDENTIAL
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE UPDATING (4s)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Leaderboard &amp; Certified Standings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ranked tabulation of all 80 competitors with multi-round score breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortAsc ? "Sort: Lowest First" : "Sort: Highest First"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {sorted.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rank 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center flex flex-col justify-between order-2 sm:order-1 hover:shadow-md transition-all">
              <div>
                <span className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-sm mx-auto flex items-center justify-center mb-2">
                  2
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  1st Runner Up
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{sorted[1].student_name}</h3>
                <span className="text-xs text-cyan-700 font-semibold">{sorted[1].registration_id}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-sm font-bold text-slate-800">
                {sorted[1].total_score} Marks
              </div>
            </div>

            {/* Rank 1: Bug Hunt Champion */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50/80 via-white to-white border-2 border-amber-400 shadow-md text-center flex flex-col justify-between order-1 sm:order-2 hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 font-extrabold text-lg mx-auto flex items-center justify-center mb-2 shadow-sm">
                  👑 1
                </div>
                <span className="text-xs text-amber-700 font-extrabold uppercase tracking-widest block">
                  BUG HUNT CHAMPION
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">{sorted[0].student_name}</h3>
                <span className="text-xs text-cyan-700 font-bold">{sorted[0].registration_id}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200 text-lg font-extrabold text-amber-800">
                {sorted[0].total_score} / 100 Marks
              </div>
            </div>

            {/* Rank 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center flex flex-col justify-between order-3 hover:shadow-md transition-all">
              <div>
                <span className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-sm mx-auto flex items-center justify-center mb-2">
                  3
                </span>
                <span className="text-[10px] text-amber-700 uppercase tracking-wider block font-bold">
                  2nd Runner Up
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{sorted[2].student_name}</h3>
                <span className="text-xs text-cyan-700 font-semibold">{sorted[2].registration_id}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-sm font-bold text-slate-800">
                {sorted[2].total_score} Marks
              </div>
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-600 font-bold">
                  <th className="py-3 px-4 text-center">Rank</th>
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
                {sorted.map((p, idx) => (
                  <tr key={p.registration_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-700">
                      {p.registration_id}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {p.student_name}
                      {p.is_finalist && (
                        <span className="ml-2 text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          [Finalist]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-cyan-700 font-medium">{p.round_1_score}</td>
                    <td className="py-3 px-4 text-center text-blue-700 font-medium">{p.round_2_score}</td>
                    <td className="py-3 px-4 text-center text-purple-700 font-medium">{p.round_3_score}</td>
                    <td className="py-3 px-4 text-center text-amber-700 font-medium">+{p.tie_breaker_score}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900 text-sm">
                      {p.total_score}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
