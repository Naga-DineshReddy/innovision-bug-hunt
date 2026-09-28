import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CyberBackground } from "@/components/CyberBackground";

export const metadata: Metadata = {
  title: "INNOVISION — BUG HUNT | Find the Bug. Fix the Code. Beat the Clock.",
  description:
    "Official high-stakes live debugging competition platform for INNOVISION, Department of Artificial Intelligence and Data Science.",
  keywords: [
    "INNOVISION",
    "BUG HUNT",
    "Artificial Intelligence and Data Science",
    "Debugging Competition",
    "Python",
    "Programming Contest"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        <CyberBackground />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
