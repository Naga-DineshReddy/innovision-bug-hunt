"use client";

import { useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { INITIAL_QUESTIONS } from "@/data/questions";
import { Question } from "@/types";
import {
  Code2,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Eye,
  FileCode,
  Check,
  Search
} from "lucide-react";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [selectedRound, setSelectedRound] = useState<number | "ALL">("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toggle active/inactive
  const handleToggleActive = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_active: !q.is_active } : q))
    );
  };

  // Duplicate question
  const handleDuplicate = (q: Question) => {
    const copy: Question = {
      ...q,
      id: `copy-${Date.now()}`,
      question_number: questions.length + 1,
      title: `${q.title} (Copy)`
    };
    setQuestions([...questions, copy]);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (confirm("Delete this question from competition question bank?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const filtered = questions.filter((q) => {
    const matchesRound = selectedRound === "ALL" || q.round_id === selectedRound;
    const matchesDiff = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    return matchesRound && matchesDiff && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-400" />
              Question Bank &amp; Problem Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curate, edit, and inspect algorithmic test cases across Round 1, Round 2, and Final Hunt.
            </p>
          </div>

          <button
            onClick={() => {
              const newQ: Question = {
                id: `new-${Date.now()}`,
                round_id: 1,
                question_number: questions.length + 1,
                title: "New Debugging Challenge",
                description: "Describe the programming bug and expected resolution...",
                language: "python",
                difficulty: "Easy",
                marks: 2,
                category: "Logic",
                buggy_code: "def solve():\n    # Enter buggy code here\n    pass",
                test_cases: [
                  { id: "tc1", input: "1", expected_output: "1", is_hidden: false }
                ],
                is_active: true
              };
              setQuestions([newQ, ...questions]);
              setActiveModalQuestion(newQ);
              setIsEditing(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE QUESTION</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0a0f1e]/90 border border-cyan-500/20">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Title or Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={selectedRound}
              onChange={(e) =>
                setSelectedRound(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Rounds ({questions.length} Questions)</option>
              <option value="1">Round 1: Easy (8 Qs • 20m)</option>
              <option value="2">Round 2: Moderate (5 Qs • 30m)</option>
              <option value="3">Round 3: Hard (3 Qs • 50m)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`p-5 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between gap-4 ${
                q.is_active
                  ? "bg-[#0a0f1e]/80 border-cyan-500/30 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                  : "bg-slate-900/40 border-slate-800 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                      Round {q.round_id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {q.marks} Marks
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(q.id)}
                    className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                      q.is_active
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {q.is_active ? "Active" : "Inactive"}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{q.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {q.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Category: {q.category}</span>
                  <span>•</span>
                  <span>Test Cases: {q.test_cases.length}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setActiveModalQuestion(q);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Problem &amp; Tests</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(q)}
                    title="Duplicate"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    title="Delete"
                    className="p-1.5 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspect Modal */}
      {activeModalQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-[#0a0f1e] border border-cyan-500/40 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-cyan-400 font-bold block mb-1">
                  Round {activeModalQuestion.round_id} • {activeModalQuestion.difficulty} • {activeModalQuestion.marks} Marks
                </span>
                <h3 className="text-base font-bold text-white">
                  {activeModalQuestion.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalQuestion(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 text-[11px] font-bold">Problem Description:</span>
              <p className="text-slate-200 leading-relaxed bg-[#060913] p-3 rounded-lg border border-slate-800">
                {activeModalQuestion.description}
              </p>
            </div>

            <div>
              <span className="text-amber-400 block mb-1 text-[11px] font-bold">Buggy Starter Code:</span>
              <pre className="bg-[#04060c] p-3 rounded-lg border border-amber-500/30 text-amber-200 overflow-x-auto text-[11px]">
                <code>{activeModalQuestion.buggy_code}</code>
              </pre>
            </div>

            {activeModalQuestion.solution_code && (
              <div>
                <span className="text-emerald-400 block mb-1 text-[11px] font-bold">Solution Reference (Admin Only):</span>
                <pre className="bg-[#04060c] p-3 rounded-lg border border-emerald-500/30 text-emerald-200 overflow-x-auto text-[11px]">
                  <code>{activeModalQuestion.solution_code}</code>
                </pre>
              </div>
            )}

            <div>
              <span className="text-cyan-400 block mb-1 text-[11px] font-bold">Test Cases ({activeModalQuestion.test_cases.length}):</span>
              <div className="space-y-2">
                {activeModalQuestion.test_cases.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                  >
                    <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                      <span>Case {idx + 1}: {tc.description || "Verification"}</span>
                      <span className={tc.is_hidden ? "text-purple-400 font-bold" : "text-slate-400"}>
                        {tc.is_hidden ? "Private / Hidden" : "Public"}
                      </span>
                    </div>
                    <div>Input: <code className="text-cyan-300">{tc.input}</code></div>
                    <div>Expected Output: <code className="text-emerald-300">{tc.expected_output}</code></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
