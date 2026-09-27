import { NextResponse } from "next/server";
import { getStudentSession, clearStudentSessionCookie } from "@/lib/auth";
import { logAuditEvent } from "@/lib/store";

export async function POST() {
  const session = await getStudentSession();
  if (session) {
    await logAuditEvent({
      registration_id: session.registration_id,
      student_name: session.student_name,
      event_type: "LOGOUT",
      details: "Participant manually logged out"
    });
  }

  await clearStudentSessionCookie();
  return NextResponse.json({ success: true });
}
