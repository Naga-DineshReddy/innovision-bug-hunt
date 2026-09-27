"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Play, RotateCcw, Check, Sparkles } from "lucide-react";

// Dynamically import Monaco Editor to prevent SSR window reference issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-[#0a0f1e] flex flex-col items-center justify-center border border-cyan-500/20 text-cyan-400 font-mono text-xs gap-3">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span>INITIALIZING MONACO CYBER EDITOR...</span>
    </div>
  )
});

interface CodeEditorComponentProps {
  initialCode: string;
  language?: string;
  onCodeChange: (code: string) => void;
  onRunTest?: () => void;
  isRunning?: boolean;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  readOnly?: boolean;
}

export function CodeEditorComponent({
  initialCode,
  language = "python",
  onCodeChange,
  onRunTest,
  isRunning = false,
  saveStatus = "saved",
  readOnly = false
}: CodeEditorComponentProps) {
  const [code, setCode] = useState(initialCode);
  const [fontSize, setFontSize] = useState(14);

  const handleEditorChange = (value: string | undefined) => {
    const updated = value || "";
    setCode(updated);
    onCodeChange(updated);
  };

  const handleReset = () => {
    if (confirm("Reset editor back to the initial buggy code snippet?")) {
      setCode(initialCode);
      onCodeChange(initialCode);
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#0a0f1e] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#070b16] border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            solution.py
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono">
            {language}
          </span>
        </div>

        {/* Save Status indicator */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono flex items-center gap-1.5">
            {saveStatus === "saving" && (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-400 font-semibold">
                Save failed — Retrying
              </span>
            )}
          </div>

          {/* Font size control */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-400">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] text-slate-500">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Reset Code */}
          {!readOnly && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded border border-slate-700/60 transition-all"
              title="Reset to original code"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          {/* Run Code Button */}
          {onRunTest && !readOnly && (
            <button
              onClick={onRunTest}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] disabled:opacity-50"
            >
              <Play className={`w-3 h-3 fill-current ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Testing..." : "Run Tests"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full min-h-[420px] relative">
        <Editor
          height="100%"
          language={language === "python" ? "python" : language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            readOnly,
            fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            lineNumbers: "on",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            wordWrap: "on",
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true }
          }}
        />
      </div>
    </div>
  );
}
