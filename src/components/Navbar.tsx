"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, Shield, Bell, LogOut, Code2, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

interface UserInfo {
  registration_id?: string;
  student_name?: string;
  role?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check if on admin page or student competition
    if (typeof window !== "undefined") {
      const storedStudent = localStorage.getItem("innovision_student_cache");
      if (storedStudent) {
        try {
          setUser(JSON.parse(storedStudent));
        } catch {
          // ignore
        }
      }
    }
  }, [pathname]);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isCompetitionRoute = pathname?.startsWith("/competition");

  const handleLogout = async () => {
    if (isAdminRoute) {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } else {
      await fetch("/api/student/logout", { method: "POST" });
      localStorage.removeItem("innovision_student_cache");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Event */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Terminal className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-cyan-700 uppercase font-bold">
                INNOVISION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200 font-bold">
                AI &amp; DS
              </span>
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 font-mono">
              BUG HUNT
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            </span>
          </div>
        </Link>

        {/* Center: Live event details badge (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-mono text-slate-700 shadow-sm">
          <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
            <Cpu className="w-3.5 h-3.5" />
            LAB 4-A
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">29-09-2026</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE PORTAL
          </span>
        </div>

        {/* Right: Navigation Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/announcement"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-all font-semibold"
          >
            <Bell className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Announcements</span>
          </Link>

          {!isAdminRoute ? (
            <>
              {user?.registration_id ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/competition"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{user.registration_id}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-mono font-semibold tracking-wide hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Student Login
                </Link>
              )}

              <Link
                href="/admin/login"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all"
              >
                <Shield className="w-3 h-3" />
                Admin
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Coordinator
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:bg-red-950/40 border border-red-500/30 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
