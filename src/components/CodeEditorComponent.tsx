"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Play, RotateCcw, Check, Sparkles } from "lucide-react";

// Dynamically import Monaco Editor to prevent SSR window reference issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-white flex flex-col items-center justify-center border border-slate-200 text-slate-700 font-mono text-xs gap-3">
      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span>INITIALIZING CODE EDITOR...</span>
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
    <div className="flex flex-col h-full w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          </div>
          <span className="font-mono text-xs text-slate-700 font-semibold uppercase tracking-wider flex items-center gap-1.5 pl-2 border-l border-slate-300">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            solution.py
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono font-bold">
            {language}
          </span>
        </div>

        {/* Save Status indicator */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono flex items-center gap-1.5">
            {saveStatus === "saving" && (
              <span className="text-amber-600 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-600 font-semibold">
                Save failed — Retrying
              </span>
            )}
          </div>

          {/* Font size control */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-500">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] text-slate-600 font-medium">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
              className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Reset Code */}
          {!readOnly && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded border border-slate-300 transition-all font-medium"
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
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-600 text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-50"
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
          theme="light"
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
