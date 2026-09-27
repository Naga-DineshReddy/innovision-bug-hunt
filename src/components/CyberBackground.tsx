export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#060913]">
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-60" />

      {/* Radial Gradient Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber scanlines overlay */}
      <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none" />
    </div>
  );
}
