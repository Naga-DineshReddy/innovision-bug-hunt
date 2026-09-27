import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSubmissions } from "@/lib/store";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getSubmissions();
  return NextResponse.json({ submissions });
}
