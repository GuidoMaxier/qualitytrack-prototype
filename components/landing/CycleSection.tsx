export function CycleSection() {
  const stages = [
    {
      num: "01",
      title: "Solicitud del cliente",
      tags: ["RFQ", "PLANO DEL CLIENTE", "ESPECIFICACIONES"],
      desc: "El requerimiento se registra con su texto original, canal de entrada y adjuntos. Desde el primer minuto, el trabajo tiene expediente.",
    },
    {
      num: "02",
      title: "Cotización",
      tags: ["PROPUESTA", "APROBACIÓN REGISTRADA"],
      desc: "Se emite, se envía y se aprueba. La aprobación queda asentada con usuario y fecha en la bitácora — no en un mail perdido.",
    },
    {
      num: "03",
      title: "Orden de Trabajo",
      tags: ["SIN RECAPTURA DE DATOS", "MATERIAL + COLADA"],
      desc: "Se genera automáticamente desde la cotización aprobada, transfiriendo cliente, especificaciones y documentación técnica. Cero tipeo, cero errores.",
    },
    {
      num: "04",
      title: "Hoja de Ruta",
      tags: ["OPERACIONES SECUENCIADAS", "T. EST. VS T. REAL"],
      desc: "Cada operación, máquina y operario definidos antes de arrancar. Planta consulta el plano y las instrucciones desde el mismo expediente.",
    },
    {
      num: "05",
      title: "Control de Calidad",
      tags: ["PLAN DE INSPECCIÓN", "NC Y DISPOSICIÓN", "LIBERACIÓN"],
      desc: "Inspecciones registradas con veredicto, inspector y hora. Las no conformidades abren reproceso trazable; la liberación emite certificado interno.",
    },
    {
      num: "06",
      title: "Entrega",
      tags: ["REMITO", "FACTURA", "EXPEDIENTE CERRADO"],
      desc: "Remito y factura quedan vinculados. El expediente se cierra con la cadena completa verificada: lista para el cliente, para una auditoría o para el histórico.",
    },
  ];

  return (
    <section id="ciclo" className="relative z-10 scroll-mt-24 border-t-2 border-[var(--ink)] bg-[var(--card)]">
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-[.2em]">
            SEC. 02
          </span>
          <span className="w-8 h-px bg-[var(--ink)]" />
          <span className="kicker">EL CICLO DEL TRABAJO</span>
        </div>

        <h2 className="text-[32px] lg:text-[44px] font-extrabold xdisp leading-[1.05] tracking-tight max-w-[720px]">
          Seis etapas. Una sola cadena.
          <br />
          Nada se suelta en el camino.
        </h2>

        <div className="mt-14 relative">
          <div className="absolute left-[13px] lg:left-[15px] top-2 bottom-2 w-[2px] bg-[var(--line)]" />

          {stages.map((st) => (
            <div key={st.num} className="cyc-item relative pl-14 lg:pl-20 pb-12 last:pb-0">
              <span className="cyc-dot absolute left-0 top-1 w-[28px] h-[28px] border-2 border-[var(--line2)] bg-[var(--card)] grid place-items-center font-mono text-[10px] font-bold">
                {st.num}
              </span>
              <div className="flex flex-col lg:flex-row lg:items-baseline gap-2 lg:gap-8">
                <h3 className="text-[20px] font-extrabold xdisp leading-none cyc-num transition-colors">
                  {st.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {st.tags.map((t) => (
                    <span key={t} className="tag" style={{ color: "var(--muted)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed mt-3 max-w-[620px]">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
