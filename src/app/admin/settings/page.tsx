"use client";

import { useState, useEffect } from "react";
import { AdminNav } from "@/components/AdminNav";
import { CompetitionSettings } from "@/types";
import {
  Settings,
  Bell,
  Shield,
  Shuffle,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    is_urgent: false
  });
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: settings })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Failed to save settings");
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAnnouncement })
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNewAnnouncement({ title: "", message: "", is_urgent: false });
        setAnnouncementSuccess(true);
        setTimeout(() => setAnnouncementSuccess(false), 3000);
      }
    } catch {
      alert("Failed to broadcast announcement");
    }
  };

  if (!settings) {
    return (
      <div className="flex-1 flex flex-col w-full font-mono">
        <AdminNav />
        <div className="p-8 text-center text-cyan-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full font-mono">
      <AdminNav />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Competition Rules &amp; Broadcast Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure anti-cheating sensitivity, tie-breaker policies, and broadcast urgent lab announcements.
          </p>
        </div>

        {/* Broadcast Live Announcement Form */}
        <div className="p-6 rounded-2xl bg-[#0a0f1e]/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Broadcast Live Announcement
            </h2>
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Announcement Title:</label>
              <input
                type="text"
                placeholder="e.g. 5 Minutes Remaining in Round 1"
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Message Body:</label>
              <textarea
                rows={2}
                placeholder="Message displayed immediately to all students on the announcement feed..."
                value={newAnnouncement.message}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={newAnnouncement.is_urgent}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, is_urgent: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-red-500 focus:ring-0"
                />
                <span className="text-red-400 font-bold">Mark as Urgent Alert</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>BROADCAST NOW</span>
              </button>
            </div>

            {announcementSuccess && (
              <p className="text-emerald-400 text-xs font-semibold">
                ✓ Announcement broadcasted successfully to all participant terminals!
              </p>
            )}
          </form>
        </div>

        {/* Global Configuration Controls Form */}
        <form
          onSubmit={handleSaveSettings}
          className="p-6 rounded-2xl bg-[#0a0f1e]/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Event Security &amp; Tie-Breaker Parameters
              </h2>
            </div>
            {savedSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Copy-Paste Prevention Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Disable Editor Copy / Paste</span>
                <input
                  type="checkbox"
                  checked={!settings.copy_paste_allowed}
                  onChange={(e) =>
                    setSettings({ ...settings, copy_paste_allowed: !e.target.checked })
                  }
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Prevents external code pasting into Monaco Editor and alerts coordinators on clipboard attempts.
              </p>
            </div>

            {/* Question Navigation Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Allow Free Navigation</span>
                <input
                  type="checkbox"
                  checked={settings.allow_navigation}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_navigation: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Permits students to jump back and forth freely between questions (01 to 10).
              </p>
            </div>

            {/* Randomize Questions */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Randomize Question Sequence</span>
                <input
                  type="checkbox"
                  checked={settings.randomize_questions}
                  onChange={(e) =>
                    setSettings({ ...settings, randomize_questions: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-cyan-500"
                />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Presents questions in shuffled order across adjacent lab terminals to deter visual copying.
              </p>
            </div>

            {/* Tab Switch Tolerance Threshold */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Tab Switch Warning Limit</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.tab_switch_limit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tab_switch_limit: Number(e.target.value)
                    })
                  }
                  className="w-16 px-2 py-1 rounded bg-[#060913] border border-slate-700 text-center font-bold text-white"
                />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Number of tab switches or window blurs before student receives high-priority compliance warning.
              </p>
            </div>
          </div>

          {/* Tie-breaker Rules Configuration */}
          <div className="space-y-2 pt-2">
            <label className="text-slate-300 font-bold block">
              Configured Tie-Breaker Priority Rules:
            </label>
            <textarea
              rows={3}
              value={settings.tie_breaker_rules}
              onChange={(e) =>
                setSettings({ ...settings, tie_breaker_rules: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[11px] text-slate-500">
              Specifies the rule hierarchy when 2 or more participants finish with equal points.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            >
              SAVE SETTINGS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
