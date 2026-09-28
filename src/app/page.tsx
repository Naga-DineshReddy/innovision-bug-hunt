import Link from "next/link";
import {
  Terminal,
  Code2,
  Clock,
  Award,
  Zap,
  Users,
  Calendar,
  MapPin,
  ChevronRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center font-mono">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Department Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs tracking-wider mb-6 shadow-sm">
          <Terminal className="w-3.5 h-3.5 text-cyan-600" />
          <span>DEPT. OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</span>
        </div>

        {/* Main Title */}
        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold mb-2">
          INNOVISION 2026 PRESENTS
        </h2>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-3">
          BUG <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">HUNT</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mb-2 tracking-wide italic">
          &ldquo;Find the Bug. Fix the Code. Beat the Clock.&rdquo;
        </p>
        <p className="text-xs text-cyan-700 font-bold mb-8">
          3 Rounds • 16 Questions • 100 Marks • Live Evaluation
        </p>

        {/* Event Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full mb-10 text-left">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1 font-bold">
              <Calendar className="w-3 h-3 text-cyan-600" /> Date
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">29-09-2026</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-cyan-600" /> Time
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">3:00 PM – 3:40 PM</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3 text-cyan-600" /> Venue
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">LAB 4-A</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1 font-bold">
              <Users className="w-3 h-3 text-cyan-600" /> Participation
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Individual (~130)</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <Code2 className="w-4 h-4 fill-current" />
            <span>ENTER BUG HUNT PORTAL</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/announcement"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Live Announcements</span>
          </Link>
        </div>

        {/* Test helper badge */}
        <div className="mt-8 text-xs text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          💡 Participant ID format: <code className="text-cyan-700 font-bold bg-cyan-50 px-1 py-0.5 rounded">BH-2026-001</code> to <code className="text-cyan-700 font-bold bg-cyan-50 px-1 py-0.5 rounded">BH-2026-080</code>
        </div>
      </section>

      {/* Rounds Architecture Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs text-cyan-700 uppercase tracking-widest font-bold mb-2">
            OFFICIAL COMPETITION PLAN
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Three Stages of Debugging</h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Structure: Easy (10m) → Moderate (10m) → Hard (10m) • All registered students proceed through all three rounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-cyan-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold text-xs">
                01
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold">
                10 Minutes
              </span>
            </div>
            <span className="text-xs text-cyan-700 uppercase tracking-widest font-bold block mb-1">
              ROUND 1 — EASY
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">BUG HUNT BASICS</h4>
            <p className="text-slate-600 text-xs mb-6 leading-relaxed">
              Wrong operators, inverted comparisons, loop ranges, list indexing, undefined variables, and basic input type conversion.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 text-cyan-700 font-semibold">
                <Clock className="w-3.5 h-3.5" /> 10 Minutes
              </span>
              <span className="font-medium">8 Questions</span>
              <span className="text-emerald-700 font-bold">20 Marks</span>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                02
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                10 Minutes
              </span>
            </div>
            <span className="text-xs text-blue-700 uppercase tracking-widest font-bold block mb-1">
              ROUND 2 — MODERATE
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">DEBUGGING CHALLENGE</h4>
            <p className="text-slate-600 text-xs mb-6 leading-relaxed">
              List traversal runtime errors, even-number filtering logic, max function comparisons, denominator averages, and conditional precedence.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Clock className="w-3.5 h-3.5" /> 10 Minutes
              </span>
              <span className="font-medium">5 Questions</span>
              <span className="text-emerald-700 font-bold">30 Marks</span>
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
                03
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold">
                10 Minutes
              </span>
            </div>
            <span className="text-xs text-purple-700 uppercase tracking-widest font-bold block mb-1">
              ROUND 3 — HARD
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-2">FINAL BUG HUNT</h4>
            <p className="text-slate-600 text-xs mb-6 leading-relaxed">
              Palindrome reverse traversal indices, factorial accumulator bugs, and hidden logical resets in prime verification algorithms.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                <Clock className="w-3.5 h-3.5" /> 10 Minutes
              </span>
              <span className="font-medium">3 Questions</span>
              <span className="text-emerald-700 font-bold">50 Marks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Website Behavior Highlights */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200">
        <h3 className="text-xs uppercase text-cyan-800 tracking-widest font-bold text-center mb-8">
          PLATFORM &amp; COMPETITION INTEGRITY RULES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Users className="w-5 h-5 text-cyan-600 mb-2" />
            <h5 className="font-bold text-slate-900 text-xs mb-1">Universal Entry</h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              All participants enter Round 1 simultaneously at the scheduled time without waiting queues.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Zap className="w-5 h-5 text-blue-600 mb-2" />
            <h5 className="font-bold text-slate-900 text-xs mb-1">Automatic Progression</h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              At each deadline, the current round auto-submits and the next round unlocks immediately.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Clock className="w-5 h-5 text-purple-600 mb-2" />
            <h5 className="font-bold text-slate-900 text-xs mb-1">Server-Side Timers</h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Timers are strictly controlled by server timestamps; browser refreshing cannot add time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Award className="w-5 h-5 text-emerald-600 mb-2" />
            <h5 className="font-bold text-slate-900 text-xs mb-1">Result Processing</h5>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Automated test suite evaluation with instant rankings, tie-breakers, and finalist selection.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 text-center text-xs text-slate-500 w-full">
        <p className="font-medium text-slate-600">INNOVISION • Department of Artificial Intelligence and Data Science</p>
        <p className="mt-1 text-slate-400">
          BUG HUNT 2026 • Official Competition Platform
        </p>
      </footer>
    </div>
  );
}
