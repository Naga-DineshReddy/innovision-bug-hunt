import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { updateParticipant, updateRound, getRounds, logAuditEvent } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const roundNumber = Number(body.roundNumber);

    if (!roundNumber || roundNumber < 1 || roundNumber > 3) {
      return NextResponse.json({ error: "Invalid round number" }, { status: 400 });
    }

    const submittedField =
      roundNumber === 1
        ? "round_1_submitted_at"
        : roundNumber === 2
        ? "round_2_submitted_at"
        : "round_3_submitted_at";

    const nowIso = new Date().toISOString();

    // Prepare participant updates
    const updates: Parameters<typeof updateParticipant>[1] = {
      [submittedField]: nowIso,
      current_round: roundNumber < 3 ? roundNumber + 1 : roundNumber,
      status: roundNumber === 3 ? "COMPLETED" : "IN_PROGRESS"
    };

    await updateParticipant(session.registration_id, updates);

    // Auto-unlock next round so student can enter immediately
    const rounds = await getRounds();
    if (roundNumber < 3) {
      const nextRoundNum = roundNumber + 1;
      const nextRound = rounds.find((r) => r.round_number === nextRoundNum);
      if (nextRound && (nextRound.status === "READY" || nextRound.status === "LOCKED")) {
        await updateRound(nextRoundNum, {
          status: "LIVE",
          started_at: nextRound.started_at || nowIso
        });
      }
    }

    await logAuditEvent({
      registration_id: session.registration_id,
      student_name: session.student_name,
      event_type: "SUBMIT",
      details: `Round ${roundNumber} completed and closed. Next round: ${
        roundNumber < 3 ? `Round ${roundNumber + 1}` : "Final Completed"
      }`
    });

    return NextResponse.json({
      success: true,
      roundNumber,
      nextRoundNumber: roundNumber < 3 ? roundNumber + 1 : null,
      isFinalRound: roundNumber === 3,
      message: `Round ${roundNumber} automatically closed successfully.`
    });
  } catch (error: unknown) {
    console.error("Complete round error:", error);
    return NextResponse.json(
      { error: "Failed to automatically complete round" },
      { status: 500 }
    );
  }
}
