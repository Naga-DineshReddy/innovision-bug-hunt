"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Code2,
  PlayCircle,
  FileCheck2,
  Trophy,
  Award,
  Settings
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Questions", href: "/admin/questions", icon: Code2 },
  { label: "Rounds Control", href: "/admin/rounds", icon: PlayCircle },
  { label: "Submissions", href: "/admin/submissions", icon: FileCheck2 },
  { label: "Results & Finalists", href: "/admin/results", icon: Award },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 px-4 bg-[#0a0f1e]/90 border-b border-cyan-500/20 font-mono text-xs scrollbar-none">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
              isActive
                ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
