import Link from "next/link";
import { LogIn, Route } from "lucide-react";

interface FinalCtaProps {
  onOpenBoot?: () => void;
}

export function FinalCta({ onOpenBoot }: FinalCtaProps) {
  return (
    <section className="relative z-10">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="relative border-2 border-[var(--ink)] bg-[var(--card)] shadow-hard p-8 lg:p-14 text-center overflow-hidden">
          <span className="cm cm-tl" />
          <span className="cm cm-tr" />
          <span className="cm cm-bl" />
          <span className="cm cm-br" />

          <div className="kicker mb-5">
            QUALITYTRACK · SOLICITUD → COTIZACIÓN → OT → PRODUCCIÓN → CALIDAD → ENTREGA
          </div>

          <h2 className="text-[32px] lg:text-[48px] font-extrabold xdisp leading-[1.05] tracking-tight">
            ¿Cuánto cuesta
            <br />
            no poder responder?
          </h2>

          <p className="text-[15px] text-[var(--muted)] leading-relaxed mt-5 max-w-[560px] mx-auto">
            Cada trabajo sin trazabilidad es tiempo perdido, riesgo operativo y evidencia que no
            aparece cuando se la necesita. La solución es un expediente único por trabajo — y arranca
            acá.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-9">
            {onOpenBoot ? (
              <button onClick={onOpenBoot} className="btn btn-acc !px-7 !py-4">
                <LogIn className="w-4 h-4" />
                ENTRAR AL DASHBOARD
              </button>
            ) : (
              <Link href="/dashboard" className="btn btn-acc !px-7 !py-4">
                <LogIn className="w-4 h-4" />
                ENTRAR AL DASHBOARD
              </Link>
            )}
            <Link href="#ciclo" className="btn !px-7 !py-4">
              <Route className="w-4 h-4" />
              REPASAR EL CICLO
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
