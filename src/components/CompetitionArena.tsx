"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Question, Participant, TestResultItem } from "@/types";
import { CodeEditorComponent } from "@/components/CodeEditorComponent";
import { TimerDisplay } from "@/components/TimerDisplay";
import { QuestionNavigator, QuestionStatusType } from "@/components/QuestionNavigator";
import { AntiCheatGuard } from "@/components/AntiCheatGuard";
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCode,
  Terminal,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface CompetitionArenaProps {
  roundNumber: number;
  roundTitle: string;
  roundSubtitle: string;
  questions: Question[];
  participant: Participant;
  serverDeadlineAt: string;
}

export function CompetitionArena({
  roundNumber,
  roundTitle,
  roundSubtitle,
  questions,
  participant,
  serverDeadlineAt
}: CompetitionArenaProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatusType>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResultItem[]>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState(false);
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState<number | null>(null);
  const [roundCompletionState, setRoundCompletionState] = useState<{
    isCompleted: boolean;
    reason: "timeout" | "manual";
    nextRoundNumber: number | null;
    nextUrl: string;
    nextRoundTitle: string;
  } | null>(null);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Auto-redirect countdown effect when round closes
  useEffect(() => {
    if (!roundCompletionState) return;

    setAutoRedirectSeconds(5);
    const interval = setInterval(() => {
      setAutoRedirectSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          router.push(roundCompletionState.nextUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundCompletionState, router]);

  const activeQuestion = questions[currentIndex];
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize answers with buggy code if not already filled
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    const initialStatuses: Record<number, QuestionStatusType> = {};

    questions.forEach((q, idx) => {
      initialAnswers[q.id] = q.buggy_code;
      initialStatuses[idx] = idx === 0 ? "visited" : "unvisited";
    });

    setAnswers(initialAnswers);
    setQuestionStatuses(initialStatuses);
  }, [questions]);

  // Code change handler with debounced autosave
  const handleCodeChange = useCallback((newCode: string) => {
    if (!activeQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: newCode
    }));

    setSaveStatus("saving");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/student/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: activeQuestion.id,
            roundId: roundNumber,
            submittedCode: newCode,
            isAutoSave: true
          })
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 2000);
  }, [activeQuestion, roundNumber]);

  // Run test cases against current code
  const handleRunTests = async () => {
    if (!activeQuestion) return;
    const currentCode = answers[activeQuestion.id] || activeQuestion.buggy_code;

    setIsEvaluating(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          roundId: roundNumber,
          submittedCode: currentCode,
          isAutoSave: false
        })
      });

      const data = await res.json();

      if (res.ok) {
        setTestResults((prev) => ({
          ...prev,
          [activeQuestion.id]: data.testResults
        }));

        setSubmitFeedback(
          `Evaluated: ${data.score}/${data.maxMarks} Marks. ${data.feedback}`
        );

        // Update status to answered
        setQuestionStatuses((prev) => ({
          ...prev,
          [currentIndex]: "answered"
        }));
      } else {
        setSubmitFeedback(data.error || "Evaluation failed");
      }
    } catch {
      setSubmitFeedback("Failed to reach server. Please check internet connection.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit Answer for Current Question
  const handleSubmitQuestion = async () => {
    await handleRunTests();
  };

  // Question navigation handler
  const handleSelectQuestion = (index: number) => {
    if (index === currentIndex) return;

    // Mark previous as visited if unvisited
    setQuestionStatuses((prev) => {
      const prevStatus = prev[currentIndex];
      return {
        ...prev,
        [currentIndex]: prevStatus === "review" || prevStatus === "answered" ? prevStatus : "visited",
        [index]: prev[index] === "unvisited" ? "visited" : prev[index]
      };
    });

    setCurrentIndex(index);
    setSubmitFeedback(null);
  };

  // Toggle mark for review
  const handleToggleReview = (index: number) => {
    setQuestionStatuses((prev) => ({
      ...prev,
      [index]: prev[index] === "review" ? "visited" : "review"
    }));
  };

  // Next round calculation
  const nextRoundNumber = roundNumber < 3 ? roundNumber + 1 : null;
  const nextRoundTitle =
    roundNumber === 1
      ? "ROUND 2: DEBUGGING CHALLENGE (10 Minutes)"
      : roundNumber === 2
      ? "ROUND 3: FINAL BUG HUNT (15 Minutes)"
      : "OFFICIAL RESULTS & SCORECARD";
  const nextUrl =
    roundNumber === 1
      ? "/competition/round-2"
      : roundNumber === 2
      ? "/competition/final"
      : "/competition/result";

  // Time's Up trigger: automatically closes round when live timer expires
  const handleTimeUp = async () => {
    if (isTimeUp || isRoundSubmitted) return;
    setIsTimeUp(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Auto-save current active question code immediately
    if (activeQuestion) {
      try {
        await fetch("/api/student/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: activeQuestion.id,
            roundId: roundNumber,
            submittedCode: answers[activeQuestion.id] || activeQuestion.buggy_code,
            isAutoSave: true
          })
        });
      } catch {
        // silent
      }
    }

    // Call server to lock round and unlock next round
    try {
      await fetch("/api/student/complete-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundNumber })
      });
    } catch (e) {
      console.error("Error auto-completing round:", e);
    }

    setRoundCompletionState({
      isCompleted: true,
      reason: "timeout",
      nextRoundNumber,
      nextUrl,
      nextRoundTitle
    });
  };

  // Open early finish confirmation modal
  const handleInitiateFinishRound = () => {
    if (isRoundSubmitted || isTimeUp || isCompleting) return;
    setShowFinishConfirmModal(true);
  };

  // Confirm Finish Round early: immediately saves and unlocks next round
  const handleConfirmFinishRound = async () => {
    if (isCompleting || isRoundSubmitted || isTimeUp) return;
    setIsCompleting(true);
    setIsRoundSubmitted(true);
    setShowFinishConfirmModal(false);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Auto-save current active question code immediately
    if (activeQuestion) {
      try {
        await fetch("/api/student/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: activeQuestion.id,
            roundId: roundNumber,
            submittedCode: answers[activeQuestion.id] || activeQuestion.buggy_code,
            isAutoSave: false
          })
        });
      } catch {
        // silent
      }
    }

    // Call server to lock round and unlock next round
    try {
      await fetch("/api/student/complete-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundNumber })
      });
    } catch (e) {
      console.error("Error completing round:", e);
    }

    // Perform full document navigation to reload fresh server session state for next round
    window.location.href = nextUrl;
  };

  if (!activeQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-cyan-400 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading competition arena...
      </div>
    );
  }

  const currentCode = answers[activeQuestion.id] || activeQuestion.buggy_code;
  const currentTests = testResults[activeQuestion.id] || [];

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Anti-cheat telemetry monitor */}
      <AntiCheatGuard registrationId={participant.registration_id} copyPasteDisabled={true} />

      {/* Confirmation Modal when student clicks Finish Round Early */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#0a0f1e] border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 mx-auto flex items-center justify-center mb-4">
              <Send className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
              EARLY SUBMISSION
            </span>

            <h2 className="text-2xl font-extrabold text-white mb-2">
              Finish {roundTitle} Early?
            </h2>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              You still have active time on the live clock. Submitting now will finalize and lock your solutions for {roundTitle} and <strong>immediately unlock access to {nextRoundTitle}</strong>.
            </p>

            {/* Answered summary card */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evaluation Status</span>
                <span className="text-sm font-bold text-white">
                  {Object.values(questionStatuses).filter((s) => s === "answered").length} of {questions.length} Evaluated
                </span>
              </div>
              <div className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Auto-Saved
              </div>
            </div>

            {/* Next stage banner */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-left mb-6">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold block mb-0.5">
                {roundNumber < 3 ? "Immediate Access Granted To:" : "Final Step:"}
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {nextRoundTitle}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleConfirmFinishRound}
                disabled={isCompleting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>UNLOCKING NEXT ROUND...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {roundNumber === 1
                        ? "FINISH & ENTER ROUND 2 NOW"
                        : roundNumber === 2
                        ? "FINISH & ENTER FINAL ROUND NOW"
                        : "FINISH & VIEW FINAL SCORECARD"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setShowFinishConfirmModal(false)}
                disabled={isCompleting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                KEEP CODING (CONTINUE ROUND)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round Completed / Time's Up Overlay Modal */}
      {(roundCompletionState || isTimeUp) && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#0a0f1e] border-2 ${
              roundCompletionState?.reason === "manual"
                ? "border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                : "border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)]"
            } text-center font-mono`}
          >
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 border ${
                roundCompletionState?.reason === "manual"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                  : "bg-red-950/80 border-red-500 text-red-400 animate-pulse"
              }`}
            >
              {roundCompletionState?.reason === "manual" ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8" />
              )}
            </div>

            <div
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2 border ${
                roundCompletionState?.reason === "manual"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/60 border-red-500/40 text-red-300"
              }`}
            >
              {roundCompletionState?.reason === "manual"
                ? "ROUND OFFICIALLY SUBMITTED"
                : "LIVE TIMING COMPLETED"}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {roundTitle} Closed!
            </h2>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {roundCompletionState?.reason === "manual"
                ? `Your solutions for ${roundTitle} have been verified and submitted to the evaluation server.`
                : `The live round timing has completed. Your code solutions have been automatically saved, compiled, and locked on the evaluation server.`}
            </p>

            {/* Next Round Info Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left mb-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                {roundNumber < 3 ? "Next Stage:" : "Final Stage:"}
              </span>
              <p className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                {roundCompletionState?.nextRoundTitle || nextRoundTitle}
              </p>
            </div>

            {/* Live Auto-Redirect countdown pill */}
            <div className="mb-6 flex items-center justify-center gap-2 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-500/30 py-2.5 px-4 rounded-xl">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>
                Auto-advancing in{" "}
                <span className="text-white font-bold text-sm">
                  {autoRedirectSeconds ?? 5}s
                </span>
                ...
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  window.location.href = roundCompletionState?.nextUrl || nextUrl;
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>
                  {roundNumber === 1
                    ? "PROCEED TO ROUND 2 NOW"
                    : roundNumber === 2
                    ? "PROCEED TO FINAL ROUND NOW"
                    : "VIEW MY FINAL SCORECARD"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/competition")}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                DASHBOARD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Bar */}
      <div className="h-14 px-4 sm:px-6 bg-[#070b16] border-b border-cyan-500/20 flex items-center justify-between shrink-0 font-mono text-xs">
        {/* Left: Round & Question Status */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-cyan-400 tracking-wider hidden sm:inline">
            {roundTitle}: {roundSubtitle}
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <span>Question:</span>
            <span className="font-bold text-white">
              {(currentIndex + 1).toString().padStart(2, "0")} / {questions.length.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {activeQuestion.marks} Marks
          </span>
        </div>

        {/* Right: Live Server Timer & Final Submit Button */}
        <div className="flex items-center gap-3">
          <TimerDisplay deadlineAt={serverDeadlineAt} onTimeUp={handleTimeUp} />

          <button
            onClick={handleInitiateFinishRound}
            disabled={isRoundSubmitted || isTimeUp || isCompleting}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 cursor-pointer text-xs"
          >
            {isCompleting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 fill-current" />
            )}
            <span>FINISH ROUND</span>
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Question Description & Navigator (5 cols) */}
        <div className="lg:col-span-5 h-full overflow-y-auto border-r border-cyan-500/20 p-4 sm:p-5 flex flex-col gap-5 bg-[#060913]/60">
          {/* Question Navigator */}
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            questionStatuses={questionStatuses}
            onSelect={handleSelectQuestion}
            onToggleReview={handleToggleReview}
          />

          {/* Question Problem Card */}
          <div className="p-5 rounded-xl border border-cyan-500/20 bg-[#0a0f1e]/80 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  {activeQuestion.category} • {activeQuestion.difficulty}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-mono text-white">
                  {activeQuestion.title}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                +{activeQuestion.marks}m
              </span>
            </div>

            {/* Problem Description */}
            <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line">
              {activeQuestion.description}
            </div>

            {/* Original Buggy Code Reference Box */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-amber-400" />
                Original Buggy Code (Read-Only Reference)
              </span>
              <pre className="p-3 rounded-lg bg-[#04060c] border border-amber-500/30 font-mono text-[11px] text-amber-200/90 overflow-x-auto">
                <code>{activeQuestion.buggy_code}</code>
              </pre>
            </div>

            {/* Public Test Cases Showcase */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                Sample Test Cases
              </span>
              <div className="space-y-2">
                {activeQuestion.test_cases.map((tc, i) => (
                  <div
                    key={tc.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-slate-300"
                  >
                    <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                      <span>Case {i + 1}: {tc.description || "Verification"}</span>
                      {tc.is_hidden && <span className="text-purple-400">[Hidden in Evaluation]</span>}
                    </div>
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <code className="text-cyan-300">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-slate-400">Expected: </span>
                      <code className="text-emerald-300">{tc.expected_output}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor & Execution Results (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col overflow-hidden bg-[#070b16]">
          {/* Editor Container */}
          <div className="flex-1 p-3 overflow-hidden flex flex-col">
            <CodeEditorComponent
              key={activeQuestion.id}
              initialCode={currentCode}
              language={activeQuestion.language}
              onCodeChange={handleCodeChange}
              onRunTest={handleRunTests}
              isRunning={isEvaluating}
              saveStatus={saveStatus}
              readOnly={isTimeUp}
            />
          </div>

          {/* Bottom Execution & Evaluation Console */}
          <div className="h-48 border-t border-cyan-500/20 bg-[#060913] p-3 flex flex-col font-mono text-xs overflow-y-auto shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Test Execution Console
                </span>
                {submitFeedback && (
                  <span className="text-[11px] text-cyan-400 font-semibold ml-2">
                    {submitFeedback}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitQuestion}
                  disabled={isEvaluating || isTimeUp}
                  className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  <Send className="w-3 h-3 fill-current" />
                  <span>SUBMIT ANSWER</span>
                </button>
              </div>
            </div>

            {/* Test Results Output Grid */}
            {currentTests.length > 0 ? (
              <div className="space-y-1.5">
                {currentTests.map((t, idx) => (
                  <div
                    key={t.test_id}
                    className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                      t.passed
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-red-950/40 border-red-500/40 text-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {t.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>Test Case {idx + 1}</span>
                      {t.is_hidden && <span className="text-[10px] text-slate-500">(Private Test)</span>}
                    </div>

                    <div className="flex items-center gap-4">
                      <span>
                        Output: <code className="font-bold">{t.output}</code>
                      </span>
                      <span className="text-slate-500">|</span>
                      <span>
                        Expected: <code className="font-bold">{t.expected}</code>
                      </span>
                      {t.passed ? (
                        <span className="font-bold uppercase text-emerald-400 text-[10px]">
                          [PASSED]
                        </span>
                      ) : (
                        <span className="font-bold uppercase text-red-400 text-[10px]">
                          [FAILED]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-[11px]">
                <span>Click &quot;Run Tests&quot; or &quot;Submit Answer&quot; to compile and verify code against test cases.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
