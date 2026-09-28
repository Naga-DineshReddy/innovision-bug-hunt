import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllParticipants,
  getRounds,
  getAuditLogs,
  getCompetitionSettings
} from "@/lib/store";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const participants = await getAllParticipants();
  const rounds = await getRounds();
  const logs = await getAuditLogs(20);
  const settings = await getCompetitionSettings();

  // Metrics
  const totalRegistered = participants.length;
  const loggedInCount = participants.filter(
    (p) => p.status === "LOGGED_IN" || p.status === "IN_PROGRESS"
  ).length;
  const notStartedCount = participants.filter((p) => p.status === "NOT_STARTED").length;
  const r1CompletedCount = participants.filter(
    (p) => p.round_1_submitted_at || p.round_1_score > 0
  ).length;
  const r2CompletedCount = participants.filter(
    (p) => p.round_2_submitted_at || p.round_2_score > 0
  ).length;
  const finalistsCount = participants.filter((p) => p.is_finalist).length;
  const submittedCount = participants.filter(
    (p) => p.status === "SUBMITTED" || p.status === "COMPLETED"
  ).length;
  const totalScoresSum = participants.reduce((acc, p) => {
    const r1 = Number(p.round_1_score) || 0;
    const r2 = Number(p.round_2_score) || 0;
    const r3 = Number(p.round_3_score) || 0;
    const tb = Number(p.tie_breaker_score) || 0;
    const score =
      p.total_score != null && !isNaN(Number(p.total_score)) && Number(p.total_score) > 0
        ? Number(p.total_score)
        : r1 + r2 + r3 + tb;
    return acc + score;
  }, 0);
  const averageScore =
    totalRegistered > 0 ? (totalScoresSum / totalRegistered).toFixed(1) : "0.0";
  const suspiciousSignalsCount = participants.reduce(
    (acc, p) => acc + p.suspicious_count,
    0
  );

  return NextResponse.json({
    metrics: {
      totalRegistered,
      loggedInCount,
      notStartedCount,
      r1CompletedCount,
      r2CompletedCount,
      finalistsCount,
      submittedCount,
      averageScore,
      suspiciousSignalsCount
    },
    rounds,
    logs,
    settings
  });
}
