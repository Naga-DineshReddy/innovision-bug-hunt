import { getCompetitionSettings } from "@/lib/store";
import { Bell, AlertCircle, Info, Calendar, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementPage() {
  const settings = await getCompetitionSettings();

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 font-mono text-xs mb-3">
          <Bell className="w-3.5 h-3.5" />
          <span>OFFICIAL EVENT BROADCAST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
          Live Announcements
        </h1>
        <p className="text-slate-400 font-mono text-xs sm:text-sm mt-2">
          Real-time updates, timeline milestones, and instructions from the LAB 4-A coordinator desk.
        </p>
      </div>

      {/* Quick Event Summary Strip */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>{settings.event_date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{settings.event_time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{settings.venue} (E-Class Room)</span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {settings.announcements && settings.announcements.length > 0 ? (
          settings.announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-xl border backdrop-blur-md transition-all font-mono ${
                ann.is_urgent
                  ? "bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-[#0a0f1e]/80 border-cyan-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  {ann.is_urgent ? (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <h3
                    className={`text-sm sm:text-base font-bold ${
                      ann.is_urgent ? "text-red-300" : "text-white"
                    }`}
                  >
                    {ann.title}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {ann.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{ann.message}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 font-mono text-xs text-slate-500">
            No live announcements posted yet. Check back during event hours.
          </div>
        )}
      </div>

      {/* Coordinator Note */}
      <div className="mt-12 p-5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 font-mono text-xs text-slate-300">
        <h4 className="font-bold text-cyan-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4" /> Invigilator Note
        </h4>
        <p className="text-slate-400 leading-relaxed">
          If you experience hardware faults, power interruptions, or network disruptions in LAB 4-A, immediately raise your hand. The coordinators have access to administrative tools to preserve and resume your active timer session without penalty.
        </p>
      </div>
    </div>
  );
}
