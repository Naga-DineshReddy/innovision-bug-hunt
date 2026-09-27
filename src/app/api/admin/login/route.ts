import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    await setAdminSessionCookie(email);

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      admin: { email, role: "admin" }
    });
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 });
  }
}
