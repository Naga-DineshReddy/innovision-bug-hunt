import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSession } from "@/lib/auth";
import { getRounds, getCompetitionSettings } from "@/lib/store";
import {
  Terminal,
  Lock,
  Play,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  ShieldAlert,
  Flame,
  Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getStudentSession();

  if (!session) {
    redirect("/login");
  }

  const rounds = await getRounds();
  const settings = await getCompetitionSettings();

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Participant Profile Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-cyan-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  INNOVISION — BUG HUNT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  {session.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
                {session.student_name}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Department: {session.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
              <span className="text-slate-400">ID: </span>
              <span className="font-bold">{session.registration_id}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              <span>{settings.event_date} • {settings.event_time}</span>
            </div>
          </div>
        </div>

        {/* Current Score Summary Strip according to PDF mark distribution */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1 text-[10px]">Round 1 (Easy)</span>
            <span className="text-base font-bold text-cyan-300">{session.round_1_score} / 20</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1 text-[10px]">Round 2 (Moderate)</span>
            <span className="text-base font-bold text-blue-300">{session.round_2_score} / 30</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase block mb-1 text-[10px]">Round 3 (Hard)</span>
            <span className="text-base font-bold text-purple-300">{session.round_3_score} / 50</span>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40">
            <span className="text-cyan-400 uppercase block mb-1 text-[10px] font-bold">Total Score</span>
            <span className="text-lg font-extrabold text-white">{session.total_score} / 100</span>
          </div>
        </div>
      </div>

      {/* Disqualification / Lock Notice if applicable */}
      {session.status === "DISQUALIFIED" && (
        <div className="mb-8 p-6 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 font-mono text-sm flex items-start gap-4 shadow-xl">
          <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <h3 className="font-bold text-red-300 text-base mb-1">PARTICIPATION SUSPENDED</h3>
            <p className="text-xs text-red-300/80">
              Your registration has been flagged or disqualified by event coordinators due to compliance signals. Please consult an in-person invigilator in LAB 4-A.
            </p>
          </div>
        </div>
      )}

      {/* Information Banner: All students proceed through all 3 rounds */}
      <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Structure</strong>: Easy (5 min) → Moderate (10 min) → Hard (15 min). All registered students proceed through all three rounds!
        </span>
      </div>

      {/* Rounds Progression Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold mb-4">
          COMPETITION ROUNDS
        </h2>

        {rounds.map((round) => {
          const isSubmitted =
            (round.round_number === 1 && !!session.round_1_submitted_at) ||
            (round.round_number === 2 && !!session.round_2_submitted_at) ||
            (round.round_number === 3 && !!session.round_3_submitted_at);

          const isRound1Done =
            !!session.round_1_submitted_at ||
            !!(session.round_1_deadline_at && new Date(session.round_1_deadline_at).getTime() <= Date.now());
          const isRound2Done =
            !!session.round_2_submitted_at ||
            !!(session.round_2_deadline_at && new Date(session.round_2_deadline_at).getTime() <= Date.now());

          let isAccessible = false;
          let lockReason = "";

          if (round.status === "LOCKED") {
            isAccessible = false;
            lockReason = "Locked by coordinator";
          } else if (isSubmitted) {
            isAccessible = false;
            lockReason = "Round Completed & Submitted";
          } else if (round.round_number === 1) {
            isAccessible = true;
          } else if (round.round_number === 2) {
            if (!isRound1Done) {
              isAccessible = false;
              lockReason = "Complete Round 1 first";
            } else {
              isAccessible = true;
            }
          } else if (round.round_number === 3) {
            if (!isRound2Done) {
              isAccessible = false;
              lockReason = "Complete Round 2 first";
            } else {
              isAccessible = true;
            }
          }

          const targetUrl = `/competition/instructions?round=${round.round_number}`;

          return (
            <div
              key={round.round_number}
              className={`p-6 rounded-2xl border backdrop-blur-md transition-all font-mono ${
                isAccessible
                  ? "bg-[#0a0f1e]/90 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                  : isSubmitted
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-950/80 border-slate-800/80 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      isAccessible
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                        : isSubmitted
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {isSubmitted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      `0${round.round_number}`
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-bold text-cyan-400">
                        {round.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                          isSubmitted
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-bold"
                            : isAccessible
                            ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50 animate-pulse font-bold"
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}
                      >
                        {isSubmitted ? "COMPLETED" : round.status}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {round.subtitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {round.duration_minutes} Minutes
                      </span>
                      <span>•</span>
                      <span>{round.total_questions} Questions</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        {round.total_marks} Marks
                      </span>
                      {isSubmitted && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 font-bold">
                            Score:{" "}
                            {round.round_number === 1
                              ? session.round_1_score
                              : round.round_number === 2
                              ? session.round_2_score
                              : session.round_3_score}{" "}
                            Marks
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:self-center">
                  {isAccessible ? (
                    <Link
                      href={targetUrl}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>ENTER ROUND {round.round_number}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : isSubmitted ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-4 py-2.5 rounded-xl border border-emerald-500/40 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>SUBMITTED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>{lockReason || "Locked"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Result Button */}
      {(session.status === "COMPLETED" || session.round_1_score > 0 || session.round_2_score > 0 || session.round_3_score > 0) && (
        <div className="mt-8 text-center">
          <Link
            href="/competition/result"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs tracking-wider transition-all"
          >
            <Award className="w-4 h-4" />
            <span>VIEW MY RESULTS &amp; SCORECARD</span>
          </Link>
        </div>
      )}
    </div>
  );
}
