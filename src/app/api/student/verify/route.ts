import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationId, updateParticipant, logAuditEvent } from "@/lib/store";
import { setStudentSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId } = body;

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const participant = await verifyRegistrationId(registrationId);

    if (!participant) {
      return NextResponse.json(
        {
          error:
            "Invalid Registration ID. No registration found for INNOVISION — BUG HUNT with this ID."
        },
        { status: 404 }
      );
    }

    if (participant.status === "DISQUALIFIED") {
      return NextResponse.json(
        {
          error: "Your registration has been suspended or disqualified by event coordinators."
        },
        { status: 403 }
      );
    }

    if (participant.status === "LOCKED") {
      return NextResponse.json(
        {
          error: "Your session is currently locked by the coordinator. Please notify an invigilator."
        },
        { status: 403 }
      );
    }

    // Update status to LOGGED_IN if it was NOT_STARTED
    if (participant.status === "NOT_STARTED") {
      await updateParticipant(participant.registration_id, {
        status: "LOGGED_IN"
      });
    }

    // Log the successful login
    await logAuditEvent({
      registration_id: participant.registration_id,
      student_name: participant.student_name,
      event_type: "LOGIN",
      details: "Student logged into BUG HUNT portal"
    });

    // Set secure server-side HttpOnly cookie
    await setStudentSessionCookie(participant);

    return NextResponse.json({
      success: true,
      participant: {
        registration_id: participant.registration_id,
        student_name: participant.student_name,
        department: participant.department,
        event: participant.event,
        status: participant.status,
        current_round: participant.current_round,
        is_finalist: participant.is_finalist
      }
    });
  } catch (error: unknown) {
    console.error("Student verify API error:", error);
    return NextResponse.json(
      { error: "Internal server error verifying registration ID" },
      { status: 500 }
    );
  }
}
