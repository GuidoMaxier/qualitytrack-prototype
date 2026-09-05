export function SuccessCriteria() {
  return (
    <section className="relative z-10 bg-[var(--ink)] text-[var(--paper)]">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-20 lg:py-24">
        <div className="kicker !text-[var(--paper)]/50 mb-8">CRITERIO DE ÉXITO DEL PROYECTO</div>

        <blockquote className="text-[24px] sm:text-[30px] lg:text-[36px] font-bold xdisp leading-[1.25]">
          “Un usuario puede tomar una Orden de Trabajo y, sin buscar en sistemas, planillas o
          carpetas,{" "}
          <span className="text-[var(--accent)]">reconstruir el historial completo del trabajo</span>{" "}
          y acceder a la documentación asociada.”
        </blockquote>

        <div className="flex flex-wrap items-center gap-4 mt-10">
          <span className="stamp -rotate-2" style={{ color: "var(--ok)" }}>
            ESE ES EL PRODUCTO
          </span>
          <span className="font-mono text-[11px] text-[var(--paper)]/50 tracking-[.2em]">
            Y CADA PANTALLA DE QUALITYTRACK EXISTE PARA ESO
          </span>
        </div>
      </div>
    </section>
  );
}
