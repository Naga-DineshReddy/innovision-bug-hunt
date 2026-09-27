import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllParticipants, updateParticipant, logAuditEvent, getParticipant } from "@/lib/store";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");
  const round = searchParams.get("round");

  let list = await getAllParticipants();

  if (search) {
    list = list.filter(
      (p) =>
        p.student_name.toLowerCase().includes(search) ||
        p.registration_id.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
    );
  }

  if (status && status !== "ALL") {
    list = list.filter((p) => p.status === status);
  }

  if (round && round !== "ALL") {
    list = list.filter((p) => p.current_round === Number(round));
  }

  return NextResponse.json({ participants: list });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, action, scoreOverrides, reason } = body;

    if (!registrationId) {
      return NextResponse.json({ error: "registrationId required" }, { status: 400 });
    }

    const participant = await getParticipant(registrationId);
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    let updates: Partial<typeof participant> = {};

    switch (action) {
      case "LOCK":
        updates = { status: "LOCKED" };
        await logAuditEvent({
          registration_id: participant.registration_id,
          student_name: participant.student_name,
          event_type: "LOCK",
          details: `Admin locked participant session: ${reason || "No reason specified"}`
        });
        break;

      case "UNLOCK":
        updates = { status: "LOGGED_IN" };
        await logAuditEvent({
          registration_id: participant.registration_id,
          student_name: participant.student_name,
          event_type: "UNLOCK",
          details: `Admin unlocked participant session`
        });
        break;

      case "DISQUALIFY":
        updates = { status: "DISQUALIFIED" };
        await logAuditEvent({
          registration_id: participant.registration_id,
          student_name: participant.student_name,
          event_type: "LOCK",
          details: `Admin marked participant as DISQUALIFIED: ${reason || "Rule violation"}`
        });
        break;

      case "RESTORE":
        updates = { status: "IN_PROGRESS" };
        await logAuditEvent({
          registration_id: participant.registration_id,
          student_name: participant.student_name,
          event_type: "UNLOCK",
          details: `Admin restored participant status to IN_PROGRESS`
        });
        break;

      case "OVERRIDE_SCORE":
        if (scoreOverrides) {
          updates = {
            ...(scoreOverrides.round_1 !== undefined && { round_1_score: Number(scoreOverrides.round_1) }),
            ...(scoreOverrides.round_2 !== undefined && { round_2_score: Number(scoreOverrides.round_2) }),
            ...(scoreOverrides.round_3 !== undefined && { round_3_score: Number(scoreOverrides.round_3) }),
            ...(scoreOverrides.tie_breaker !== undefined && { tie_breaker_score: Number(scoreOverrides.tie_breaker) })
          };
          await logAuditEvent({
            registration_id: participant.registration_id,
            student_name: participant.student_name,
            event_type: "SUBMIT",
            details: `Admin manual score override: ${JSON.stringify(scoreOverrides)}. Reason: ${reason || "Organizer review"}`
          });
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await updateParticipant(registrationId, updates);
    return NextResponse.json({ success: true, participant: updated });
  } catch (error: unknown) {
    console.error("Admin participant PATCH error:", error);
    return NextResponse.json({ error: "Failed to update participant" }, { status: 500 });
  }
}
