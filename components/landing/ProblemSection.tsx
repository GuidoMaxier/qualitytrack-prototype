"use client";

import { useState } from "react";
import {
  SearchX,
  Unlink,
  AlertTriangle,
  Timer,
  FolderSearch,
  BarChart3,
} from "lucide-react";

export function ProblemSection() {
  const [mode, setMode] = useState<"chaos" | "order">("chaos");

  const nodes = [
    { num: "S-01", lbl: "SOLICITUD", chaos: { left: "6%", top: "8%", rot: "-6deg" }, order: { left: "10%", top: "6%", rot: "0deg" } },
    { num: "S-02", lbl: "COTIZACIÓN", chaos: { left: "64%", top: "5%", rot: "4deg" }, order: { left: "10%", top: "18%", rot: "0deg" } },
    { num: "S-03", lbl: "PLANO", chaos: { left: "34%", top: "22%", rot: "-3deg" }, order: { left: "10%", top: "30%", rot: "0deg" } },
    { num: "S-04", lbl: "CERT. 3.1", chaos: { left: "70%", top: "30%", rot: "7deg" }, order: { left: "10%", top: "42%", rot: "0deg" } },
    { num: "S-05", lbl: "OC CLIENTE", chaos: { left: "8%", top: "42%", rot: "5deg" }, order: { left: "10%", top: "54%", rot: "0deg" } },
    { num: "S-06", lbl: "HOJA DE RUTA", chaos: { left: "46%", top: "52%", rot: "-5deg" }, order: { left: "10%", top: "66%", rot: "0deg" } },
    { num: "S-07", lbl: "INSPECCIÓN", chaos: { left: "20%", top: "68%", rot: "3deg" }, order: { left: "10%", top: "78%", rot: "0deg" } },
    { num: "S-08", lbl: "ENTREGA", chaos: { left: "62%", top: "78%", rot: "-7deg" }, order: { left: "10%", top: "90%", rot: "0deg" } },
  ];

  return (
    <section id="problema" className="relative z-10 scroll-mt-24">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-start">
          {/* Columna izquierda: Diagnóstico */}
          <div className="lg:sticky lg:top-28">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-[.2em]">
                SEC. 01
              </span>
              <span className="w-8 h-px bg-[var(--ink)]" />
              <span className="kicker">DIAGNÓSTICO</span>
            </div>

            <h2 className="text-[32px] lg:text-[44px] font-extrabold xdisp leading-[1.05] tracking-tight">
              El problema nunca fue la cantidad de información.
              <br />
              <span className="text-[var(--accent)]">Es no poder responder.</span>
            </h2>

            <div className="border-l-[3px] border-[var(--accent)] bg-[var(--card)] border border-[var(--line)] px-5 py-4 mt-8">
              <p className="font-mono text-[12.5px] leading-relaxed text-[var(--ink)]/85">
                “¿Qué trabajo se realizó, para qué cliente, bajo qué especificaciones, con qué
                material, qué operaciones se realizaron, quién intervino, qué controles se
                efectuaron y qué documentación respalda el proceso?”
              </p>
              <p className="kicker mt-3">LA PREGUNTA QUE HOY TARDA DÍAS EN CONTESTARSE</p>
            </div>

            <div className="mt-10">
              <div className="grid gap-0 border-t-2 border-[var(--ink)]">
                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <SearchX className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Falta de trazabilidad</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      Reconstruir el historial de una pieza exige recorrer archivos, carpetas y
                      recuerdos.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <Unlink className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Información dispersa</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      Planos, certificados y cotizaciones viven sueltos, sin vínculo con la Orden de
                      Trabajo.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <AlertTriangle className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Errores de carga manual</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      Cada pase de mano entre cotización, OT y hoja de ruta es una oportunidad de
                      equivocarse.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <Timer className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Consulta lenta en planta</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      El operario necesita el plano ahora, no después de buscarlo en tres lugares.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <FolderSearch className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Auditorías cuesta arriba</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      Reunir evidencia ordenada del proceso puede tomar días que nadie tiene.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-[var(--line)]">
                  <BarChart3 className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-bold text-[14px]">Cero indicadores</div>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      Sin datos estructurados no hay tiempos, estados, NC ni oportunidades de
                      mejora.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Diagrama interactivo Caos vs Orden */}
          <div>
            <div className="relative border-2 border-[var(--ink)] bg-[var(--card)] shadow-hard">
              <span className="cm cm-tl" />
              <span className="cm cm-tr" />
              <span className="cm cm-bl" />
              <span className="cm cm-br" />

              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--line)] bg-[var(--paper)] flex-wrap">
                <span className="kicker" style={{ color: "var(--ink)" }}>
                  EL MISMO TRABAJO · DOS MUNDOS
                </span>
                <div className="flex gap-2">
                  <button
                    className={`mode-btn ${mode === "chaos" ? "on" : ""}`}
                    onClick={() => setMode("chaos")}
                  >
                    HOY / SIN SISTEMA
                  </button>
                  <button
                    className={`mode-btn ${mode === "order" ? "on" : ""}`}
                    onClick={() => setMode("order")}
                  >
                    CON QUALITYTRACK
                  </button>
                </div>
              </div>

              <div
                id="diagram"
                className={`relative h-[520px] overflow-hidden ${
                  mode === "order" ? "mode-order" : ""
                }`}
              >
                {/* Líneas enredadas de caos */}
                <svg
                  id="chaosLines"
                  className="absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                  style={{ opacity: mode === "chaos" ? 0.65 : 0 }}
                >
                  <g
                    stroke="#B23A2E"
                    strokeWidth=".35"
                    strokeDasharray="1.6 1.6"
                    fill="none"
                  >
                    <path d="M14,18 C35,45 60,20 74,42" />
                    <path d="M74,42 C55,60 30,40 18,58" />
                    <path d="M18,58 C40,70 70,55 76,78" />
                    <path d="M46,34 C60,50 40,62 30,80" />
                    <path d="M14,18 C30,55 55,65 46,62" />
                    <path d="M74,42 C60,68 50,75 30,80" />
                    <path d="M46,34 C25,50 15,48 18,58" />
                  </g>
                </svg>

                {/* Línea recta ordenada del expediente */}
                <div
                  id="orderLine"
                  className="absolute left-[38px] top-[30px] bottom-[24px] w-[2px] bg-[var(--ink)] origin-top transition-transform duration-700"
                  style={{ transform: mode === "order" ? "scaleY(1)" : "scaleY(0)" }}
                />

                {/* Sello Caos */}
                <div
                  id="stampChaos"
                  className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block transition-opacity duration-400"
                  style={{
                    transform: "translateY(-50%) rotate(6deg)",
                    opacity: mode === "chaos" ? 1 : 0,
                  }}
                >
                  <span className="stamp" style={{ color: "var(--danger)" }}>
                    INFORMACIÓN
                    <br />
                    DISPERSA
                  </span>
                </div>

                {/* Sello Orden */}
                <div
                  id="stampOrder"
                  className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden md:block transition-opacity duration-500 delay-300"
                  style={{
                    transform: "translateY(-50%) rotate(-4deg)",
                    opacity: mode === "order" ? 1 : 0,
                  }}
                >
                  <span className="stamp" style={{ color: "var(--ok)" }}>
                    EXPEDIENTE
                    <br />
                    ÚNICO
                  </span>
                </div>

                {/* Nodos interactivos */}
                {nodes.map((n, i) => {
                  const pos = mode === "order" ? n.order : n.chaos;
                  return (
                    <div
                      key={n.num}
                      className="dnode"
                      style={{
                        left: pos.left,
                        top: pos.top,
                        transform: `rotate(${pos.rot})`,
                        transitionDelay: `${i * 0.05}s`,
                      }}
                    >
                      <span className="dn-num">{n.num}</span>
                      <span className="dn-lbl">{n.lbl}</span>
                    </div>
                  );
                })}

                {/* Caption inferior */}
                <div className="absolute left-4 bottom-3 right-4 font-mono text-[10px] tracking-[.18em] text-[var(--muted)]">
                  <span>
                    {mode === "order"
                      ? "TODO VINCULADO AL EXPEDIENTE · RELACIONES VERIFICABLES EN SEGUNDOS"
                      : "CADA DOCUMENTO EN UN LUGAR DISTINTO · RELACIONES SOSTENIDAS A MEMORIA"}
                  </span>
                </div>
              </div>
            </div>
            <p className="kicker mt-3 text-center">
              COMPARÁ HACIENDO CLIC EN LOS BOTONES DE ARRIBA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
