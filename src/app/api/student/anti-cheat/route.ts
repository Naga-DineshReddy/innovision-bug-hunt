import { NextRequest, NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { logAuditEvent, getCompetitionSettings } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventType, details } = body;

    const validEvents = [
      "TAB_SWITCH",
      "FULLSCREEN_EXIT",
      "BLUR",
      "PASTE_ATTEMPT",
      "DEVTOOLS"
    ] as const;

    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const log = await logAuditEvent({
      registration_id: session.registration_id,
      student_name: session.student_name,
      event_type: eventType,
      details: details || `Anti-cheat trigger: ${eventType}`
    });

    const settings = await getCompetitionSettings();
    const thresholdExceeded = (session.suspicious_count + 1) >= settings.tab_switch_limit;

    return NextResponse.json({
      success: true,
      loggedAt: log.created_at,
      warning: thresholdExceeded
        ? `Warning: Multiple tab switches detected (${session.suspicious_count + 1}). Coordinator has been notified.`
        : undefined
    });
  } catch (error: unknown) {
    console.error("Anti-cheat signal error:", error);
    return NextResponse.json({ error: "Failed to record signal" }, { status: 500 });
  }
}
