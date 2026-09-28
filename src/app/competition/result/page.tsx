import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/auth";
import { getCompetitionSettings } from "@/lib/store";
import { ConfettiTrigger } from "@/components/ConfettiTrigger";
import {
  Award,
  ArrowLeft,
  Lock,
  Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentResultPage() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const settings = await getCompetitionSettings();

  const r1 = Number(session.round_1_score) || 0;
  const r2 = Number(session.round_2_score) || 0;
  const r3 = Number(session.round_3_score) || 0;
  const tb = Number(session.tie_breaker_score) || 0;
  const computedTotal = r1 + r2 + r3 + tb;
  const totalScore =
    session.total_score != null && !isNaN(Number(session.total_score)) && Number(session.total_score) > 0
      ? Number(session.total_score)
      : computedTotal;

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Confetti celebration effect */}
      <ConfettiTrigger />

      <div className="w-full p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xl font-mono text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Award className="w-8 h-8 text-cyan-600" />
        </div>

        <span className="text-xs uppercase tracking-widest text-cyan-700 font-bold block mb-1">
          INNOVISION — BUG HUNT 2026
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Competition Scorecard
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          BUG HUNT Official Competition Completed
        </p>

        {/* Participant Identification Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto mb-8 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Student Name:</span>
            <span className="text-slate-900 font-bold">{session.student_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Registration ID:</span>
            <span className="text-cyan-700 font-bold">{session.registration_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Department:</span>
            <span className="text-slate-700">{session.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="text-emerald-700 font-bold uppercase">{session.status}</span>
          </div>
        </div>

        {/* Round Scores Breakdown Table per PDF mark distribution */}
        <div className="max-w-md mx-auto space-y-3 mb-8">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-700 font-medium">Round 1 (Easy: 8 Qs):</span>
            <span className="font-bold text-cyan-700">{r1} / 20</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-700 font-medium">Round 2 (Moderate: 5 Qs):</span>
            <span className="font-bold text-blue-700">{r2} / 30</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-700 font-medium">Round 3 (Hard: 3 Qs):</span>
            <span className="font-bold text-purple-700">{r3} / 50</span>
          </div>

          {tb > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-700 font-medium">Tie Breaker Score:</span>
              <span className="font-bold text-amber-700">+{tb}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md text-sm font-bold">
            <span className="uppercase tracking-wider">Total Score:</span>
            <span className="text-xl font-extrabold">{totalScore} / 100</span>
          </div>
        </div>

        {/* Answer key disclosure policy message */}
        <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center mb-8">
          {settings.show_answers_after_competition ? (
            <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Official answer keys and explanations have been published by coordinators.
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Detailed solution keys and final standings will be released during final evaluation.
            </span>
          )}
        </div>

        {/* Action Link */}
        <Link
          href="/competition"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO DASHBOARD</span>
        </Link>
      </div>
    </div>
  );
}
