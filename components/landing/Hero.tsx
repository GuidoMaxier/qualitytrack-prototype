"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LogIn, ScanSearch, FlaskConical, Link2, History } from "lucide-react";

interface HeroProps {
  onOpenBoot?: () => void;
}

export function Hero({ onOpenBoot }: HeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage || !sheet) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
    };

    const handleMouseLeave = () => {
      tx = 0;
      ty = 0;
    };

    stage.addEventListener("mousemove", handleMouseMove);
    stage.addEventListener("mouseleave", handleMouseLeave);

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      sheet.style.transform = `rotate(-1.2deg) translate(${cx}px, ${cy}px)`;
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      stage.removeEventListener("mousemove", handleMouseMove);
      stage.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="inicio" className="relative z-10">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-[1.02fr_1fr] gap-12 lg:gap-16 items-center">
        {/* Texto principal */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--accent)]" />
            <span className="kicker">GESTIÓN · TRAZABILIDAD · DOCUMENTACIÓN</span>
          </div>

          <h1 className="text-[38px] sm:text-[52px] lg:text-[60px] font-extrabold xdisp leading-[1.02] tracking-tight">
            Un{" "}
            <span className="relative inline-block">
              expediente único
              <span
                className="uline absolute left-0 -bottom-1 w-full h-[5px] bg-[var(--accent)]"
                style={{ ["--d" as string]: "1.3s" }}
              />
            </span>{" "}
            para cada trabajo.
            <br />
            De la solicitud a la entrega.
          </h1>

          <p className="text-[16px] lg:text-[17.5px] text-[var(--muted)] leading-relaxed mt-7 max-w-[560px]">
            QualityTrack centraliza cotizaciones, órdenes de trabajo, planos, certificados de
            materia prima, hojas de ruta y controles de calidad en una sola cadena trazable.{" "}
            <b className="text-[var(--ink)]">
              Sin planillas sueltas. Sin papeles perdidos. Sin buscar en carpetas.
            </b>
          </p>

          <div className="flex flex-wrap gap-3.5 mt-9">
            {onOpenBoot ? (
              <button onClick={onOpenBoot} className="btn btn-acc !px-6 !py-3.5">
                <LogIn className="w-4 h-4" />
                ENTRAR AL DASHBOARD
              </button>
            ) : (
              <Link href="/dashboard" className="btn btn-acc !px-6 !py-3.5">
                <LogIn className="w-4 h-4" />
                ENTRAR AL DASHBOARD
              </Link>
            )}
            <Link href="#problema" className="btn !px-6 !py-3.5">
              <ScanSearch className="w-4 h-4" />
              VER CÓMO FUNCIONA
            </Link>
          </div>

          {/* Strip de especificaciones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--ink)] bg-[var(--card)] mt-12 divide-x divide-[var(--line)] max-w-[620px]">
            <div className="p-3.5 border-b sm:border-b-0 border-[var(--line)]">
              <div className="font-mono text-[22px] font-bold leading-none">6</div>
              <div className="kicker mt-1.5" style={{ fontSize: "8.5px" }}>
                ETAPAS VINCULADAS
              </div>
            </div>
            <div className="p-3.5 border-b sm:border-b-0 border-[var(--line)]">
              <div className="font-mono text-[22px] font-bold leading-none">1</div>
              <div className="kicker mt-1.5" style={{ fontSize: "8.5px" }}>
                FUENTE DE VERDAD
              </div>
            </div>
            <div className="p-3.5">
              <div className="font-mono text-[22px] font-bold leading-none">100%</div>
              <div className="kicker mt-1.5" style={{ fontSize: "8.5px" }}>
                DOCS ASOCIADOS
              </div>
            </div>
            <div className="p-3.5">
              <div className="font-mono text-[22px] font-bold leading-none">0</div>
              <div className="kicker mt-1.5" style={{ fontSize: "8.5px" }}>
                CARPETAS QUE REVISAR
              </div>
            </div>
          </div>
        </div>

        {/* Plano animado industrial */}
        <div id="heroStage" ref={stageRef} className="relative">
          <div
            id="heroSheet"
            ref={sheetRef}
            className="relative border-2 border-[var(--ink)] bg-[var(--card)] shadow-hard2 will-change-transform"
            style={{ transform: "rotate(-1.2deg)" }}
          >
            <span className="cm cm-tl" />
            <span className="cm cm-tr" />
            <span className="cm cm-bl" />
            <span className="cm cm-br" />

            {/* Escáner láser */}
            <div className="scanner absolute left-4 right-4 h-10 bg-[var(--accent)]/[.06] z-10 pointer-events-none">
              <div className="h-[2px] w-full bg-[var(--accent)]" />
            </div>

            <svg viewBox="0 0 640 520" className="w-full block">
              <defs>
                <pattern
                  id="hx"
                  width="7"
                  height="7"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="7"
                    stroke="#22262D"
                    strokeWidth="1"
                    opacity=".7"
                  />
                </pattern>
                <marker
                  id="ar"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6.5"
                  markerHeight="6.5"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0L10,5L0,10z" fill="#22262D" />
                </marker>
              </defs>
              <rect width="640" height="520" fill="none" />

              {/* Vista frontal */}
              <circle
                cx="320"
                cy="240"
                r="120"
                pathLength="1"
                className="draw"
                style={{ ["--d" as string]: ".25s" }}
                fill="none"
                stroke="#22262D"
                strokeWidth="2.2"
              />
              <circle
                cx="320"
                cy="240"
                r="78"
                pathLength="1"
                className="draw"
                style={{ ["--d" as string]: ".55s" }}
                fill="none"
                stroke="#22262D"
                strokeWidth="1.5"
              />
              <circle
                cx="320"
                cy="240"
                r="34"
                pathLength="1"
                className="draw"
                style={{ ["--d" as string]: ".8s" }}
                fill="none"
                stroke="#22262D"
                strokeWidth="1.5"
              />
              <circle
                cx="320"
                cy="240"
                r="99"
                className="fd"
                style={{ ["--d" as string]: "1.5s" }}
                fill="none"
                stroke="#22262D"
                strokeWidth=".8"
                strokeDasharray="5 5"
              />

              {/* Perforaciones */}
              <g className="fd" style={{ ["--d" as string]: "1.6s" }}>
                <circle cx="320" cy="141" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
                <circle cx="234.3" cy="190.5" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
                <circle cx="234.3" cy="289.5" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
                <circle cx="320" cy="339" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
                <circle cx="405.7" cy="289.5" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
                <circle cx="405.7" cy="190.5" r="14" fill="none" stroke="#22262D" strokeWidth="1.3" />
              </g>

              {/* Ejes de centro */}
              <g
                className="fd"
                style={{ ["--d" as string]: "1.2s" }}
                stroke="#22262D"
                strokeWidth=".7"
                strokeDasharray="15 4 3 4"
              >
                <line x1="180" y1="240" x2="460" y2="240" />
                <line x1="320" y1="100" x2="320" y2="380" />
              </g>

              {/* Sección A-A */}
              <g className="fd" style={{ ["--d" as string]: "1.9s" }}>
                <path
                  d="M500,240 L500,268 L560,268 L560,212 L532,212 L532,240 Z"
                  fill="url(#hx)"
                  stroke="#22262D"
                  strokeWidth="1.4"
                />
                <line
                  x1="546"
                  y1="200"
                  x2="546"
                  y2="282"
                  stroke="#22262D"
                  strokeWidth=".6"
                  strokeDasharray="12 4 3 4"
                />
                <text
                  x="546"
                  y="194"
                  fontFamily="'JetBrains Mono'"
                  fontSize="9"
                  fontWeight="700"
                  fill="#22262D"
                  textAnchor="middle"
                >
                  A-A
                </text>
              </g>

              {/* Acotado */}
              <g className="fd" style={{ ["--d" as string]: "2.1s" }} stroke="#22262D" strokeWidth=".8">
                <line x1="200" y1="252" x2="200" y2="408" />
                <line x1="440" y1="252" x2="440" y2="408" />
                <line
                  x1="200"
                  y1="402"
                  x2="440"
                  y2="402"
                  strokeWidth=".9"
                  markerStart="url(#ar)"
                  markerEnd="url(#ar)"
                />
                <text
                  x="320"
                  y="394"
                  fontFamily="'JetBrains Mono'"
                  fontSize="11"
                  fill="#22262D"
                  textAnchor="middle"
                  stroke="none"
                >
                  Ø240
                </text>
                <line x1="405.7" y1="190.5" x2="520" y2="120" markerStart="url(#ar)" />
                <text
                  x="526"
                  y="116"
                  fontFamily="'JetBrains Mono'"
                  fontSize="10"
                  fontWeight="600"
                  fill="#22262D"
                  stroke="none"
                >
                  6× Ø24
                </text>
                <text
                  x="526"
                  y="129"
                  fontFamily="'JetBrains Mono'"
                  fontSize="8.5"
                  fill="#7B7565"
                  stroke="none"
                >
                  PCD Ø198 · EQ. SP
                </text>
                <line x1="354" y1="240" x2="470" y2="330" markerStart="url(#ar)" />
                <text
                  x="476"
                  y="334"
                  fontFamily="'JetBrains Mono'"
                  fontSize="10"
                  fontWeight="600"
                  fill="#22262D"
                  stroke="none"
                >
                  Ø60 H7
                </text>
                <path d="M418,296 l4.5,-8 l4.5,8" fill="none" stroke="#22262D" strokeWidth="1" />
                <line x1="413" y1="296" x2="429" y2="296" stroke="#22262D" strokeWidth="1" />
                <text
                  x="434"
                  y="300"
                  fontFamily="'JetBrains Mono'"
                  fontSize="9"
                  fontWeight="600"
                  fill="#22262D"
                  stroke="none"
                >
                  Ra 3.2
                </text>
              </g>

              {/* Rótulo interno */}
              <text
                x="36"
                y="52"
                fontFamily="'JetBrains Mono'"
                fontSize="11"
                fontWeight="700"
                fill="#22262D"
                className="fd"
                style={{ ["--d" as string]: ".1s" }}
              >
                PLANO DE FABRICACIÓN — FL-1204
              </text>
              <text
                x="36"
                y="68"
                fontFamily="'JetBrains Mono'"
                fontSize="8.5"
                fill="#7B7565"
                className="fd"
                style={{ ["--d" as string]: ".2s" }}
              >
                TODAS LAS COTAS EN mm · TOLERANCIAS ISO 2768-mK
              </text>
            </svg>

            {/* Cajetín */}
            <div className="border-t-2 border-[var(--ink)] bg-[var(--card)] grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--line)] text-[10px] font-mono font-semibold">
              <div className="px-3 py-2.5">FLANZA Ø220 · REV C</div>
              <div className="px-3 py-2.5 hidden sm:block">MATERIAL: AISI 4140</div>
              <div className="px-3 py-2.5 hidden sm:block">ESC 1:2 · A3</div>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--accent)]" />
                APROB. V. SANZ
              </div>
            </div>

            {/* Sello de aprobación */}
            <div className="absolute right-5 bottom-16 stamp-anim" style={{ ["--d" as string]: "2.7s" }}>
              <span className="stamp" style={{ color: "var(--ok)", fontSize: "13px" }}>
                TRAZADO · OK
              </span>
            </div>

            {/* Tags flotantes técnicos */}
            <div className="absolute -left-3 top-10 fd" style={{ ["--d" as string]: "3.1s" }}>
              <div className="flex items-center gap-2 bg-[var(--ink)] text-[var(--paper)] px-3 py-2 shadow-hard">
                <FlaskConical className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-mono text-[9.5px] font-bold tracking-[.14em]">
                  CERT. 3.1 · COLADA 88412
                </span>
              </div>
            </div>

            <div className="absolute -right-2 top-[44%] fd" style={{ ["--d" as string]: "3.45s" }}>
              <div className="flex items-center gap-2 bg-[var(--card)] border-[1.5px] border-[var(--ink)] px-3 py-2 shadow-hard">
                <Link2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-mono text-[9.5px] font-bold tracking-[.14em]">
                  VINCULADO A OT-2025-0104
                </span>
              </div>
            </div>

            <div className="absolute -left-2 bottom-24 fd" style={{ ["--d" as string]: "3.8s" }}>
              <div className="flex items-center gap-2 bg-[var(--card)] border-[1.5px] border-[var(--ink)] px-3 py-2 shadow-hard">
                <History className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-mono text-[9.5px] font-bold tracking-[.14em]">
                  BITÁCORA · 12 EVENTOS
                </span>
              </div>
            </div>
          </div>

          {/* Anotaciones técnicas */}
          <div className="hidden lg:flex justify-between mt-4 font-mono text-[9px] text-[var(--muted)] tracking-[.22em]">
            <span>REF: HERO-PLN-01</span>
            <span>HOJA 1/1</span>
            <span>QUALITYTRACK · 2025</span>
          </div>
        </div>
      </div>
    </section>
  );
}
