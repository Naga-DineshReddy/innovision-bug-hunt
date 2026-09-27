import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getRounds, updateRound, resetRound, logAuditEvent } from "@/lib/store";
import { RoundStatus } from "@/types";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rounds = await getRounds();
  return NextResponse.json({ rounds });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roundNumber, action } = body;

    if (!roundNumber || !action) {
      return NextResponse.json({ error: "Missing roundNumber or action" }, { status: 400 });
    }

    const roundNum = Number(roundNumber);
    const rounds = await getRounds();
    const targetRound = rounds.find((r) => r.round_number === roundNum);

    if (!targetRound) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    let newStatus: RoundStatus = targetRound.status;
    let startedAt = targetRound.started_at;
    let endedAt = targetRound.ended_at;

    switch (action) {
      case "START":
        newStatus = "LIVE";
        startedAt = startedAt || new Date().toISOString();
        break;
      case "PAUSE":
        newStatus = "PAUSED";
        break;
      case "RESUME":
        newStatus = "LIVE";
        break;
      case "END":
        newStatus = "COMPLETED";
        endedAt = new Date().toISOString();
        break;
      case "RESET":
        await resetRound(roundNum);
        await logAuditEvent({
          registration_id: "ADMIN",
          student_name: admin.email,
          event_type: "LOGIN",
          details: `Admin reset Round ${roundNum}`
        });
        return NextResponse.json({ success: true, message: `Round ${roundNum} reset successfully` });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await updateRound(roundNum, {
      status: newStatus,
      started_at: startedAt,
      ended_at: endedAt
    });

    await logAuditEvent({
      registration_id: "ADMIN",
      student_name: admin.email,
      event_type: "LOGIN",
      details: `Admin changed Round ${roundNum} status to ${newStatus}`
    });

    return NextResponse.json({ success: true, round: updated });
  } catch (error: unknown) {
    console.error("Admin round action error:", error);
    return NextResponse.json({ error: "Failed to perform round action" }, { status: 500 });
  }
}
