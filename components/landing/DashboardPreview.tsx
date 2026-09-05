"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, ChevronRight, LogIn } from "lucide-react";

interface DashboardPreviewProps {
  onOpenBoot?: () => void;
}

export function DashboardPreview({ onOpenBoot }: DashboardPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = stageRef.current;
    const card = cardRef.current;
    if (!st || !card) return;

    if (!window.matchMedia("(pointer:fine)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const r = st.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -7;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 6;
    };

    const handleMouseLeave = () => {
      tx = 0;
      ty = 0;
    };

    st.addEventListener("mousemove", handleMouseMove);
    st.addEventListener("mouseleave", handleMouseLeave);

    const loop = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      card.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`;
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      st.removeEventListener("mousemove", handleMouseMove);
      st.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="sistema"
      className="relative z-10 scroll-mt-24 border-t-2 border-[var(--ink)] overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-16 items-center">
          {/* Info izquierda */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-[.2em]">
                SEC. 03
              </span>
              <span className="w-8 h-px bg-[var(--ink)]" />
              <span className="kicker">EL SISTEMA</span>
            </div>

            <h2 className="text-[32px] lg:text-[42px] font-extrabold xdisp leading-[1.05] tracking-tight">
              El tablero donde vive
              <br />
              todo el trabajo.
            </h2>

            <p className="text-[15px] text-[var(--muted)] leading-relaxed mt-6">
              Cada fila es un expediente. Un clic abre la línea de proceso completa: etapas,
              documentos vinculados, hoja de ruta y bitácora — sin salir de la pantalla, sin abrir
              una sola carpeta.
            </p>

            <ul className="grid gap-3 mt-7">
              <li className="flex gap-3 items-start text-[13.5px]">
                <Check className="w-4 h-4 mt-0.5 text-[var(--ok)] shrink-0" />
                Estados en vivo: producción, calidad, NC, entrega
              </li>
              <li className="flex gap-3 items-start text-[13.5px]">
                <Check className="w-4 h-4 mt-0.5 text-[var(--ok)] shrink-0" />
                Visor de planos con zoom directamente en el expediente
              </li>
              <li className="flex gap-3 items-start text-[13.5px]">
                <Check className="w-4 h-4 mt-0.5 text-[var(--ok)] shrink-0" />
                Cadena de trazabilidad verificable extremo a extremo
              </li>
              <li className="flex gap-3 items-start text-[13.5px]">
                <Check className="w-4 h-4 mt-0.5 text-[var(--ok)] shrink-0" />
                Bitácora inmutable: quién hizo qué, y cuándo
              </li>
            </ul>

            {onOpenBoot ? (
              <button onClick={onOpenBoot} className="btn btn-acc mt-8 !px-6 !py-3.5">
                <LogIn className="w-4 h-4" />
                ABRIR EL SISTEMA
              </button>
            ) : (
              <Link href="/dashboard" className="btn btn-acc mt-8 !px-6 !py-3.5">
                <LogIn className="w-4 h-4" />
                ABRIR EL SISTEMA
              </Link>
            )}
          </div>

          {/* Mock del tablero interactivo con perspectiva 3D */}
          <div id="tiltStage" ref={stageRef}>
            <div
              id="tiltCard"
              ref={cardRef}
              className="relative border-2 border-[var(--ink)] bg-[var(--card)] shadow-hard2"
            >
              <span className="cm cm-tl" />
              <span className="cm cm-tr" />
              <span className="cm cm-bl" />
              <span className="cm cm-br" />

              {/* Topbar del mock */}
              <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-[var(--ink)] bg-[var(--paper)]">
                <div className="w-7 h-7 bg-[var(--ink)] relative">
                  <span className="absolute inset-0 grid place-items-center text-[var(--paper)] font-mono font-bold text-[11px]">
                    QT
                  </span>
                  <span className="absolute right-0 bottom-0 w-2 h-2 bg-[var(--accent)]" />
                </div>
                <span className="font-mono text-[10px] font-bold tracking-[.18em]">
                  REGISTRO CENTRAL DE PRODUCCIÓN
                </span>
                <span className="flex-1" />
                <span className="font-mono text-[11px] font-semibold hidden sm:block">10:42:17</span>
                <span
                  className="w-2.5 h-2.5 bg-[var(--accent)]"
                  style={{ animation: "blink 1s steps(1) infinite" }}
                />
              </div>

              {/* Filtros de chips */}
              <div className="flex gap-1.5 px-4 py-2.5 border-b border-[var(--line)] overflow-hidden">
                <span className="mode-btn on !cursor-default">TODOS</span>
                <span className="mode-btn !cursor-default">EN PRODUCCIÓN</span>
                <span className="mode-btn !cursor-default">EN CALIDAD</span>
                <span className="mode-btn !cursor-default">ENTREGADOS</span>
              </div>

              {/* Tabla de expedientes */}
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left font-mono text-[9.5px] uppercase tracking-[.18em] text-[var(--muted)] border-b-2 border-[var(--ink)]">
                      <th className="px-4 py-2.5">OT</th>
                      <th className="px-4 py-2.5">CLIENTE</th>
                      <th className="px-4 py-2.5 hidden sm:table-cell">PIEZA</th>
                      <th className="px-4 py-2.5 hidden md:table-cell">MATERIAL</th>
                      <th className="px-4 py-2.5">AVANCE</th>
                      <th className="px-4 py-2.5">ESTADO</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="mrow border-t border-[var(--line)] cursor-pointer">
                      <td className="px-4 py-3 font-mono font-bold">OT-2025-0104</td>
                      <td className="px-4 py-3">Metalúrgica Delta</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-semibold">
                        Flanza de acople Ø220
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] hidden md:table-cell">
                        AISI 4140
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--accent)] animate-pulse" />
                          <span className="w-2.5 h-2.5 border border-[var(--line2)]" />
                          <span className="w-2.5 h-2.5 border border-[var(--line2)]" />
                          <span className="w-2.5 h-2.5 border border-[var(--line2)]" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tag" style={{ color: "var(--accent)" }}>
                          EN PRODUCCIÓN
                        </span>
                      </td>
                      <td className="px-4 py-3 w-8">
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] mgo" />
                      </td>
                    </tr>

                    <tr className="mrow border-t border-[var(--line)] cursor-pointer">
                      <td className="px-4 py-3 font-mono font-bold">OT-2025-0103</td>
                      <td className="px-4 py-3">AgroParts Ltd.</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-semibold">
                        Eje excéntrico
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] hidden md:table-cell">
                        42CrMo4
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tag" style={{ color: "var(--ink)" }}>
                          EN CALIDAD
                        </span>
                      </td>
                      <td className="px-4 py-3 w-8">
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] mgo" />
                      </td>
                    </tr>

                    <tr className="mrow border-t border-[var(--line)] cursor-pointer">
                      <td className="px-4 py-3 font-mono font-bold">OT-2025-0102</td>
                      <td className="px-4 py-3">HidroSur S.R.L.</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-semibold">
                        Soporte de bomba
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] hidden md:table-cell">
                        AISI 316L
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tag" style={{ color: "var(--ok)" }}>
                          LISTA
                        </span>
                      </td>
                      <td className="px-4 py-3 w-8">
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] mgo" />
                      </td>
                    </tr>

                    <tr className="mrow border-t border-[var(--line)] cursor-pointer">
                      <td className="px-4 py-3 font-mono font-bold">OT-2025-0101</td>
                      <td className="px-4 py-3">Metalúrgica Delta</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-semibold">
                        Flanza de acople Ø180
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] hidden md:table-cell">C45</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                          <span className="w-2.5 h-2.5 bg-[var(--ink)]" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tag" style={{ color: "var(--muted)" }}>
                          ENTREGADA
                        </span>
                      </td>
                      <td className="px-4 py-3 w-8">
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] mgo" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[var(--line)] px-4 py-2.5 font-mono text-[9.5px] text-[var(--muted)] tracking-[.18em]">
                4 EXPEDIENTES · 23 DOCUMENTOS VINCULADOS · BITÁCORA ACTIVA
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
