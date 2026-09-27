import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/auth";
import { getCompetitionSettings } from "@/lib/store";
import { ConfettiTrigger } from "@/components/ConfettiTrigger";
import {
  Award,
  CheckCircle2,
  Terminal,
  Clock,
  Sparkles,
  ArrowLeft,
  Lock
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentResultPage() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const settings = await getCompetitionSettings();

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Confetti celebration effect */}
      <ConfettiTrigger />

      <div className="w-full p-8 sm:p-10 rounded-2xl bg-[#0a0f1e]/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl font-mono text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950 to-blue-900 border border-cyan-500/50 text-cyan-300 mx-auto flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          <Award className="w-8 h-8 text-cyan-400" />
        </div>

        <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold block mb-1">
          INNOVISION — BUG HUNT 2026
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Competition Scorecard
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          BUG HUNT 40-Minute Competition Completed
        </p>

        {/* Participant Identification Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 max-w-md mx-auto mb-8 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Student Name:</span>
            <span className="text-white font-bold">{session.student_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Registration ID:</span>
            <span className="text-cyan-300 font-bold">{session.registration_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Department:</span>
            <span className="text-slate-300">{session.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold uppercase">{session.status}</span>
          </div>
        </div>

        {/* Round Scores Breakdown Table per PDF mark distribution */}
        <div className="max-w-md mx-auto space-y-3 mb-8">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-300">Round 1 (Easy: 8 Qs):</span>
            <span className="font-bold text-cyan-300">{session.round_1_score} / 20</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-300">Round 2 (Moderate: 5 Qs):</span>
            <span className="font-bold text-blue-300">{session.round_2_score} / 30</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-300">Round 3 (Hard: 3 Qs):</span>
            <span className="font-bold text-purple-300">{session.round_3_score} / 50</span>
          </div>

          {session.tie_breaker_score > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-300">Tie Breaker Score:</span>
              <span className="font-bold text-amber-300">+{session.tie_breaker_score}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/50 text-sm font-bold">
            <span className="text-white uppercase tracking-wider">Total Score:</span>
            <span className="text-cyan-300 text-base">{session.total_score} / 100</span>
          </div>
        </div>

        {/* Answer key disclosure policy message */}
        <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500 text-center mb-8">
          {settings.show_answers_after_competition ? (
            <span className="text-emerald-400">
              Official answer keys and explanations have been published by coordinators.
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Detailed solution keys and final standings will be released during final evaluation.
            </span>
          )}
        </div>

        {/* Action Link */}
        <Link
          href="/competition"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO DASHBOARD</span>
        </Link>
      </div>
    </div>
  );
}
