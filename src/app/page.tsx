import Link from "next/link";
import {
  Terminal,
  Shield,
  Zap,
  Clock,
  Award,
  ChevronRight,
  Code2,
  Cpu,
  MapPin,
  Calendar,
  Users
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full font-mono">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Department Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs mb-8 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        {/* Association & Main Title */}
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] text-cyan-400 font-bold mb-2">
          INNOVISION 2026 PRESENTS
        </h2>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3">
          BUG <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">HUNT</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mb-2 tracking-wide italic">
          &ldquo;Find the Bug. Fix the Code. Beat the Clock.&rdquo;
        </p>
        <p className="text-xs text-cyan-400/90 mb-8">
          40-Minute Competition • 3 Rounds • 16 Questions • 100 Marks
        </p>

        {/* Event Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full mb-10 text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" /> Date
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">29-09-2026</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Time
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">3:00 PM – 3:40 PM</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> Venue
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">LAB 4-A</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> Participation
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">Individual (~80)</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02]"
          >
            <Code2 className="w-4 h-4 fill-current" />
            <span>ENTER BUG HUNT PORTAL</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/announcement"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Live Announcements</span>
          </Link>
        </div>

        {/* Test helper badge */}
        <div className="mt-8 text-xs text-slate-500 bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-800">
          💡 Existing Participant ID format: <code className="text-cyan-400 font-bold">BH-2026-001</code> to <code className="text-cyan-400 font-bold">BH-2026-080</code>
        </div>
      </section>

      {/* Rounds Architecture Section According to PDF */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs text-cyan-400 uppercase tracking-widest font-semibold mb-2">
            OFFICIAL 40-MINUTE COMPETITION PLAN
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Three Stages of Debugging</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Structure: Easy → Moderate → Hard • All registered students continue through all three rounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/30 backdrop-blur-md relative overflow-hidden group hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs">
                01
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                3:00 – 3:10 PM
              </span>
            </div>
            <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold block mb-1">
              ROUND 1 — EASY
            </span>
            <h4 className="text-lg font-bold text-white mb-2">BUG HUNT BASICS</h4>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Wrong operators, inverted comparisons, loop ranges, list indexing, undefined variables, and basic input type conversion.
            </p>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Clock className="w-3.5 h-3.5" /> 5 Minutes
              </span>
              <span>8 Questions</span>
              <span className="text-emerald-400 font-bold">20 Marks</span>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f1e]/90 border border-blue-500/30 backdrop-blur-md relative overflow-hidden group hover:border-blue-400 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                02
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-300">
                3:10 – 3:25 PM
              </span>
            </div>
            <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold block mb-1">
              ROUND 2 — MODERATE
            </span>
            <h4 className="text-lg font-bold text-white mb-2">DEBUGGING CHALLENGE</h4>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              List traversal runtime errors, even-number filtering logic, max function comparisons, denominator averages, and conditional precedence.
            </p>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-3.5 h-3.5" /> 10 Minutes
              </span>
              <span>5 Questions</span>
              <span className="text-emerald-400 font-bold">30 Marks</span>
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f1e]/90 border border-purple-500/30 backdrop-blur-md relative overflow-hidden group hover:border-purple-400 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold text-xs">
                03
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300">
                Round 3 (15m)
              </span>
            </div>
            <span className="text-xs text-purple-400 uppercase tracking-widest font-semibold block mb-1">
              ROUND 3 — HARD
            </span>
            <h4 className="text-lg font-bold text-white mb-2">FINAL BUG HUNT</h4>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Palindrome reverse traversal indices, factorial accumulator bugs, and hidden logical resets in prime verification algorithms.
            </p>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Clock className="w-3.5 h-3.5" /> 15 Minutes
              </span>
              <span>3 Questions</span>
              <span className="text-emerald-400 font-bold">50 Marks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Website Behavior Highlights from PDF */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/60">
        <h3 className="text-xs uppercase text-cyan-400 tracking-widest font-bold text-center mb-8">
          PLATFORM &amp; COMPETITION INTEGRITY RULES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <Users className="w-5 h-5 text-cyan-400 mb-2" />
            <h5 className="font-bold text-white text-xs mb-1">Universal Entry</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All 80 participants enter Round 1 simultaneously at 3:00 PM without waiting queues.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <Zap className="w-5 h-5 text-blue-400 mb-2" />
            <h5 className="font-bold text-white text-xs mb-1">Automatic Progression</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              At each deadline, the current round auto-submits and the next round unlocks immediately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <Clock className="w-5 h-5 text-purple-400 mb-2" />
            <h5 className="font-bold text-white text-xs mb-1">Server-Side Timers</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Timers are strictly controlled by server timestamps; browser refreshing cannot add time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <Award className="w-5 h-5 text-emerald-400 mb-2" />
            <h5 className="font-bold text-white text-xs mb-1">Result Processing</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              At 3:38 PM Round 3 locks and the final two minutes are used for verified result compilation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>INNOVISION • Department of Artificial Intelligence and Data Science</p>
        <p className="mt-1 text-slate-600">
          BUG HUNT 2026 • 40-Minute Official Competition Platform
        </p>
      </footer>
    </div>
  );
}
