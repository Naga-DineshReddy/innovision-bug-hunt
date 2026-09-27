import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getCompetitionSettings,
  updateCompetitionSettings,
  logAuditEvent
} from "@/lib/store";

export async function GET() {
  const settings = await getCompetitionSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { updates, newAnnouncement } = body;

    let currentSettings = await getCompetitionSettings();

    if (updates) {
      currentSettings = await updateCompetitionSettings(updates);
    }

    if (newAnnouncement && newAnnouncement.title && newAnnouncement.message) {
      const announcements = [
        {
          id: `ann-${Date.now()}`,
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          is_urgent: Boolean(newAnnouncement.is_urgent)
        },
        ...currentSettings.announcements
      ];

      currentSettings = await updateCompetitionSettings({ announcements });

      await logAuditEvent({
        registration_id: "ADMIN",
        student_name: admin.email,
        event_type: "LOGIN",
        details: `Broadcasted announcement: ${newAnnouncement.title}`
      });
    }

    return NextResponse.json({ success: true, settings: currentSettings });
  } catch (error: unknown) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
