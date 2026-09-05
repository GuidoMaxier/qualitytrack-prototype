export function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--ink)] text-[var(--paper)]">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--paper)] relative">
            <span className="absolute inset-0 grid place-items-center text-[var(--ink)] font-mono font-bold text-[13px]">
              QT
            </span>
            <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]" />
          </div>
          <div className="leading-none">
            <div className="font-extrabold xdisp text-[15px]">QUALITYTRACK</div>
            <div className="font-mono text-[9px] text-[var(--paper)]/50 tracking-[.22em] mt-1">
              TRAZABILIDAD PARA EL MECANIZADO INDUSTRIAL
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="font-mono text-[10px] text-[var(--paper)]/50 tracking-[.18em] leading-relaxed">
          PROTOTIPO CONCEPTUAL · 2026
          <br />
          SOLICITUD → COTIZACIÓN → OT → HOJA DE RUTA → CALIDAD → ENTREGA
        </div>
      </div>
    </footer>
  );
}
