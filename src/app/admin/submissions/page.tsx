import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSubmissions } from "@/lib/store";
import { AdminNav } from "@/components/AdminNav";
import { FileCheck2, Code2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const submissions = await getSubmissions();

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            Live Submissions &amp; Code Evaluation Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime log of all participant submissions, test case pass counts, execution latency, and awarded marks.
          </p>
        </div>

        {submissions.length > 0 ? (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(s.submitted_at).toLocaleTimeString()}
                      </td>

                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {s.participant_id}
                      </td>

                      <td className="py-3 px-4 text-white font-semibold">
                        {s.student_name || "Participant"}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
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
                        {s.execution_time_ms || 24}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0a0f1e]/60 border border-slate-800 text-slate-500">
            <Code2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">No active code submissions yet</p>
            <p className="text-xs mt-1">Submissions appear here automatically as participants solve problems.</p>
          </div>
        )}
      </div>
    </div>
  );
}
