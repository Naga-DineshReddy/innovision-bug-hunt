"use client";

import { Bookmark, CheckCircle2, Circle } from "lucide-react";

export type QuestionStatusType = "unvisited" | "visited" | "answered" | "review";

interface QuestionNavProps {
  totalQuestions: number;
  currentIndex: number;
  questionStatuses: Record<number, QuestionStatusType>;
  onSelect: (index: number) => void;
  onToggleReview: (index: number) => void;
  allowNavigation?: boolean;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  questionStatuses,
  onSelect,
  onToggleReview,
  allowNavigation = true
}: QuestionNavProps) {
  const currentStatus = questionStatuses[currentIndex] || "visited";
  const isMarkedForReview = currentStatus === "review";

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-cyan-500/20 bg-[#0a0f1e]/90 backdrop-blur-md">
      {/* Top Header & Review Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Question Navigator
        </h4>
        <button
          onClick={() => onToggleReview(currentIndex)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all border ${
            isMarkedForReview
              ? "bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-purple-300"
          }`}
          title="Mark this question for later review"
        >
          <Bookmark className="w-3 h-3 fill-current" />
          <span>{isMarkedForReview ? "Marked for Review" : "Mark for Review"}</span>
        </button>
      </div>

      {/* Grid of Numbered Question Buttons */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const status = questionStatuses[i] || "unvisited";
          const isCurrent = currentIndex === i;

          let btnStyles = "bg-slate-900/60 border-slate-800 text-slate-500"; // unvisited default

          if (status === "answered") {
            btnStyles = "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
          } else if (status === "review") {
            btnStyles = "bg-purple-950/80 border-purple-500/70 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)]";
          } else if (status === "visited") {
            btnStyles = "bg-cyan-950/40 border-cyan-500/40 text-cyan-300";
          }

          if (isCurrent) {
            btnStyles += " ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#060913] font-bold";
          }

          return (
            <button
              key={i}
              disabled={!allowNavigation && !isCurrent}
              onClick={() => onSelect(i)}
              className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center border transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 ${btnStyles}`}
            >
              {(i + 1).toString().padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80 border border-emerald-400 inline-block" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500/80 border border-purple-400 inline-block" />
          <span>For Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-400 inline-block" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700 inline-block" />
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
}
