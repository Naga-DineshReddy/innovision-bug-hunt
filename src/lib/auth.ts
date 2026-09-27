import { cookies } from "next/headers";
import crypto from "crypto";
import { Participant } from "@/types";
import { getParticipant } from "@/lib/store";

const STUDENT_COOKIE_NAME = "innovision_student_session";
const ADMIN_COOKIE_NAME = "innovision_admin_session";

const STUDENT_SECRET =
  process.env.STUDENT_SESSION_SECRET || "innovision-student-default-secret-2026";
const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || "innovision-admin-default-secret-2026";

export interface StudentSessionPayload {
  registration_id: string;
  student_name: string;
  department: string;
  created_at: number;
}

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  created_at: number;
}

// ==========================================
// CRYPTO SIGNING HELPERS
// ==========================================

function signPayload(payload: object, secret: string): string {
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

function verifyPayload<T>(token: string, secret: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(base64Data)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig)
      )
    ) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

// ==========================================
// STUDENT SESSION
// ==========================================

export async function setStudentSessionCookie(participant: Participant) {
  const cookieStore = await cookies();
  const payload: StudentSessionPayload = {
    registration_id: participant.registration_id,
    student_name: participant.student_name,
    department: participant.department,
    created_at: Date.now()
  };

  const token = signPayload(payload, STUDENT_SECRET);

  cookieStore.set(STUDENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6 // 6 hours
  });
}

export async function getStudentSession(): Promise<Participant | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyPayload<StudentSessionPayload>(token, STUDENT_SECRET);
  if (!payload || !payload.registration_id) return null;

  const participant = await getParticipant(payload.registration_id);
  return participant;
}

export async function clearStudentSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE_NAME);
}

// ==========================================
// ADMIN SESSION
// ==========================================

export async function setAdminSessionCookie(email: string) {
  const cookieStore = await cookies();
  const payload: AdminSessionPayload = {
    email,
    role: "admin",
    created_at: Date.now()
  };

  const token = signPayload(payload, ADMIN_SECRET);

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12 // 12 hours
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyPayload<AdminSessionPayload>(token, ADMIN_SECRET);
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "dineshh2519@gmail.com";
  const expectedPass = process.env.ADMIN_PASSWORD || "dinesh@2580#";

  return (
    email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
    password === expectedPass
  );
}
