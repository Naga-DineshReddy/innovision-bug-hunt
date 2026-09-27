import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { getRounds, updateParticipant } from "@/lib/store";

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

    // Check round configuration and active status
    const rounds = await getRounds();
    const roundConfig = rounds.find((r) => r.round_number === roundNumber);

    if (!roundConfig) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (roundConfig.status !== "LIVE") {
      return NextResponse.json(
        {
          error: `Round ${roundNumber} is currently ${roundConfig.status}. Submissions are only accepted when the round is LIVE.`
        },
        { status: 403 }
      );
    }

    // Note per competition PDF: All registered students proceed through all three rounds!
    const now = Date.now();
    const startField =
      roundNumber === 1
        ? "round_1_started_at"
        : roundNumber === 2
        ? "round_2_started_at"
        : "round_3_started_at";
    const deadlineField =
      roundNumber === 1
        ? "round_1_deadline_at"
        : roundNumber === 2
        ? "round_2_deadline_at"
        : "round_3_deadline_at";

    let startedAt = session[startField];
    let deadlineAt = session[deadlineField];

    // If not started yet, lock in the start and deadline timestamps right now on the server!
    if (!startedAt || !deadlineAt) {
      const durationMs = roundConfig.duration_minutes * 60 * 1000;
      startedAt = new Date(now).toISOString();
      deadlineAt = new Date(now + durationMs).toISOString();

      await updateParticipant(session.registration_id, {
        [startField]: startedAt,
        [deadlineField]: deadlineAt,
        status: "IN_PROGRESS",
        current_round: roundNumber
      });
    }

    const deadlineTimestamp = new Date(deadlineAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((deadlineTimestamp - now) / 1000));
    const isExpired = remainingSeconds <= 0;

    return NextResponse.json({
      success: true,
      roundNumber,
      roundTitle: roundConfig.name,
      roundSubtitle: roundConfig.subtitle,
      serverTime: new Date(now).toISOString(),
      startedAt,
      deadlineAt,
      remainingSeconds,
      isExpired,
      durationMinutes: roundConfig.duration_minutes,
      totalMarks: roundConfig.total_marks
    });
  } catch (error: unknown) {
    console.error("Round session error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching round session" },
      { status: 500 }
    );
  }
}
