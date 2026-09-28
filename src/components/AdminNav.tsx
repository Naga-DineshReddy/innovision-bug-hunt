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
  { label: "Submissions", href: "/admin/submissions", icon: FileCheck2 },
  { label: "Results & Finalists", href: "/admin/results", icon: Award },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 px-4 bg-white/95 border-b border-slate-200/90 font-mono text-xs scrollbar-none shadow-sm">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
              isActive
                ? "bg-cyan-50 border-cyan-400 text-cyan-800 font-bold shadow-sm"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-600" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
