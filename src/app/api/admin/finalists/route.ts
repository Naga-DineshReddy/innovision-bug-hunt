import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { setFinalists, getAllParticipants, logAuditEvent } from "@/lib/store";

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { selectedIds } = body;

    if (!Array.isArray(selectedIds)) {
      return NextResponse.json({ error: "selectedIds array required" }, { status: 400 });
    }

    const count = await setFinalists(selectedIds);

    await logAuditEvent({
      registration_id: "ADMIN",
      student_name: admin.email,
      event_type: "LOGIN",
      details: `Admin confirmed ${count} finalists for Round 3: ${selectedIds.join(", ")}`
    });

    const updatedParticipants = await getAllParticipants();
    const finalists = updatedParticipants.filter((p) => p.is_finalist);

    return NextResponse.json({
      success: true,
      count,
      finalists
    });
  } catch (error: unknown) {
    console.error("Admin finalists error:", error);
    return NextResponse.json({ error: "Failed to confirm finalists" }, { status: 500 });
  }
}
