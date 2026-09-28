"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

interface VerifiedStudent {
  registration_id: string;
  student_name: string;
  department: string;
  event: string;
  status: string;
  current_round: number;
}

export default function StudentLoginPage() {
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = useState<VerifiedStudent | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim()) {
      setError("Please enter your Registration ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registrationId.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Check your ID.");
        setLoading(false);
        return;
      }

      setVerifiedStudent(data.participant);
      // Cache local student details for quick Navbar updates
      localStorage.setItem("innovision_student_cache", JSON.stringify(data.participant));
    } catch {
      setError("Network or server connection error. Please notify coordinator.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCompetition = () => {
    router.push("/competition");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md">
        {/* Glow backdrop */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-75" />

          <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 mx-auto flex items-center justify-center mb-3 shadow-sm">
                <Terminal className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs tracking-widest text-cyan-700 font-bold uppercase block mb-1">
                INNOVISION
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                BUG HUNT
              </h1>
              <p className="text-xs font-mono text-slate-600 mt-2 italic">
                &ldquo;Find the Bug. Fix the Code. Beat the Clock.&rdquo;
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="flex-1 font-semibold">{error}</p>
              </div>
            )}

            {!verifiedStudent ? (
              /* Step 1: Input Registration ID */
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-2">
                    Registration ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. BH-2026-001"
                      value={registrationId}
                      onChange={(e) => {
                        setRegistrationId(e.target.value.toUpperCase());
                        if (error) setError(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 uppercase tracking-wider transition-all shadow-sm"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-2">
                    Enter the unique ID generated during your INNOVISION event registration.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !registrationId.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>VERIFYING REGISTRATION...</span>
                    </div>
                  ) : (
                    <>
                      <span>VERIFY &amp; PROCEED</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Sample IDs helper */}
                <div className="pt-4 border-t border-slate-200 text-center">
                  <span className="text-[11px] font-mono text-slate-500">
                    Test IDs: <code className="text-cyan-700 font-bold bg-cyan-50 px-1 py-0.5 rounded">BH-2026-001</code> to <code className="text-cyan-700 font-bold bg-cyan-50 px-1 py-0.5 rounded">BH-2026-080</code>
                  </span>
                </div>
              </form>
            ) : (
              /* Step 2: Verification Success Card */
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-cyan-900/60 pb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>REGISTRATION VERIFIED</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Student Name:</span>
                    <span className="text-white font-bold">{verifiedStudent.student_name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Registration ID:</span>
                    <span className="text-cyan-300 font-bold">{verifiedStudent.registration_id}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-300 text-right">{verifiedStudent.department}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Event:</span>
                    <span className="text-cyan-400 font-bold">BUG HUNT</span>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-sm font-mono font-semibold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Ready to Hunt Bugs?
                  </p>

                  <button
                    onClick={handleEnterCompetition}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-black font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>ENTER COMPETITION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setVerifiedStudent(null);
                      setRegistrationId("");
                    }}
                    className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Change Registration ID
                  </button>
                </div>
              </div>
            )}

            {/* Security notice */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Server-Validated Session • LAB 4-A Network Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
