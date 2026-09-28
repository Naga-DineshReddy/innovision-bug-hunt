export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#f8fafc]">
      {/* Light Tech Grid */}
      <div className="absolute inset-0 cyber-grid opacity-60" />

      {/* Luminous Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-400/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-400/10 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
}
