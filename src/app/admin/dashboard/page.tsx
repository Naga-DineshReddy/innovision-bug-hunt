"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { RoundInfo, AuditLog } from "@/types";
import {
  Users,
  UserCheck,
  Clock,
  Award,
  AlertTriangle,
  Activity,
  Flame,
  CheckCircle2,
  PlayCircle,
  RefreshCw,
  ChevronRight
} from "lucide-react";

interface DashboardMetrics {
  totalRegistered: number;
  loggedInCount: number;
  notStartedCount: number;
  r1CompletedCount: number;
  r2CompletedCount: number;
  finalistsCount: number;
  submittedCount: number;
  averageScore: string;
  suspiciousSignalsCount: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRegistered: 0,
    loggedInCount: 0,
    notStartedCount: 0,
    r1CompletedCount: 0,
    r2CompletedCount: 0,
    finalistsCount: 0,
    submittedCount: 0,
    averageScore: "0.0",
    suspiciousSignalsCount: 0
  });
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.rounds) setRounds(data.rounds);
        if (data.logs) setLogs(data.logs);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Dashboard telemetry error:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="flex-1 flex flex-col w-full">
      <AdminNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0a0f1e]/90 border border-purple-500/30 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">
                INNOVISION 2026 • LAB 4-A
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE TELEMETRY (4s)
              </span>
              {lastUpdated && (
                <span className="text-[10px] text-slate-500">
                  Synced: {lastUpdated}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Competition Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live monitoring and evaluation system for {metrics.totalRegistered} registered participants.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
              title="Force Immediate Data Sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">SYNC NOW</span>
            </button>

            <Link
              href="/admin/participants"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <Users className="w-4 h-4" />
              <span>VIEW PARTICIPANTS</span>
            </Link>

            <Link
              href="/admin/leaderboard"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <span>LEADERBOARD</span>
            </Link>
          </div>
        </div>

        {/* 8 Primary Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Registered */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Registered</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : metrics.totalRegistered}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">Expected: ~80 in LAB 4-A</span>
          </div>

          {/* Logged In */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Active / Logged In</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {loading ? "..." : metrics.loggedInCount}
            </span>
            <span className="block text-[10px] text-emerald-500/80 mt-1">Online in Session</span>
          </div>

          {/* Not Started */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Not Started</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">
              {loading ? "..." : metrics.notStartedCount}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">Pending terminal login</span>
          </div>

          {/* Round 1 Completed */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Round 1 Done</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
              {loading ? "..." : metrics.r1CompletedCount}
            </span>
            <span className="block text-[10px] text-cyan-500/80 mt-1">Bug Hunt Basics</span>
          </div>

          {/* Round 2 Completed */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Round 2 Done</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-300">
              {loading ? "..." : metrics.r2CompletedCount}
            </span>
            <span className="block text-[10px] text-blue-500/80 mt-1">Debugging Challenge</span>
          </div>

          {/* Finalists */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Selected Finalists</span>
              <Flame className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-300">
              {loading ? "..." : metrics.finalistsCount}
            </span>
            <span className="block text-[10px] text-purple-400/80 mt-1">Target: 10–15</span>
          </div>

          {/* Submitted */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Submitted</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
              {loading ? "..." : metrics.submittedCount}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">Evaluated submissions</span>
          </div>

          {/* Average Score */}
          <div className="p-4 rounded-xl bg-[#0a0f1e]/80 border border-cyan-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-cyan-700 uppercase font-bold">Average Score</span>
              <Activity className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? "..." : metrics.averageScore}
            </span>
            <span className="block text-[10px] text-cyan-700 font-semibold mt-1">Out of 100 Marks</span>
          </div>
        </div>

        {/* Two-Column Overview: Active Rounds Status & Live Audit Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rounds Status Card (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                Competition Rounds Lifecycle
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                ● AUTOPILOT ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {rounds.length > 0 ? (
                rounds.map((r) => (
                  <div
                    key={r.round_number}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        0{r.round_number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{r.subtitle}</h4>
                        <span className="text-[10px] text-slate-400">
                          {r.duration_minutes}m • {r.total_questions} Qs • {r.total_marks} Marks
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded font-bold border uppercase ${
                        r.status === "LIVE"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 animate-pulse"
                          : r.status === "READY"
                          ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                          : r.status === "COMPLETED"
                          ? "bg-blue-950 text-blue-300 border-blue-500/40"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Loading rounds telemetry...
                </div>
              )}
            </div>
          </div>

          {/* Live Anti-Cheat & Telemetry Log Stream (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Live Telemetry &amp; Signals
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                {metrics.suspiciousSignalsCount} Flags
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1"
                  >
                    <div className="flex justify-between items-center text-slate-400 text-[10px]">
                      <span className="font-bold text-cyan-300">{log.registration_id}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 truncate">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {loading ? "Checking security audit logs..." : "No telemetry anomalies recorded yet."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Link to Participants */}
        <div className="text-center pt-4">
          <Link
            href="/admin/participants"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all"
          >
            <Users className="w-4 h-4" />
            <span>OPEN LIVE 80-PARTICIPANT MONITOR</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
