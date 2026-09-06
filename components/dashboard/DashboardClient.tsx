"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft, Download, ChevronRight, Check } from "lucide-react";

interface OTItem {
  id: string;
  numero_ot: string;
  cantidad: number;
  numero_colada: string | null;
  prioridad: string;
  estado: string;
  fecha_inicio_produccion: string | null;
  fecha_pase_calidad: string | null;
  createdAt: string;
  cotizacion: {
    numero_cotizacion: string;
    precio_final: number;
    solicitud: {
      numero_solicitud: string;
      nombre_pieza: string | null;
      codigo_plano: string | null;
      revision_plano: string | null;
      material: string | null;
      norma_material: string | null;
      descripcion_pieza: string;
      fecha_esperada_entrega: string;
      cliente: {
        codigo: string | null;
        razon_social: string;
        contacto_nombre: string;
        email: string | null;
      };
    };
  };
  fases: Array<{
    id: string;
    numero_secuencia: number;
    maquinaria: string | null;
    tiempo_estimado_minutos: number;
    duracion_real_minutos: number | null;
    estado: string;
    faseCatalogo: {
      codigo: string;
      nombre: string;
    };
    operario: {
      id: string;
      name: string;
      rol: string;
    };
  }>;
  auditorias: Array<{
    id: string;
    numero_auditoria: number;
    resultado: string;
    observaciones_generales: string | null;
    checklistRespuestas: Array<{
      item_numero: number;
      criterio_nombre: string;
      resultado_item: string | null;
    }>;
  }>;
  notas: Array<{
    id: string;
    origen: string;
    contenido: string;
    createdAt: string;
    usuario: {
      name: string;
      rol: string;
    };
  }>;
}

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState<OTItem[]>([]);
  const [stats, setStats] = useState({
    totalActivas: 0,
    enProduccion: 0,
    enCalidad: 0,
    noConformes: 0,
    entregadas: 0,
  });

  const [activeTab, setActiveTab] = useState<"board" | "trace" | "new">("board");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOT, setSelectedOT] = useState<OTItem | null>(null);
  const [clock, setClock] = useState<string>("--:--:--");

  // Reloj en vivo
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos de la API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ordenes-trabajo");
      const data = await res.json();
      if (data.success) {
        setOrdenes(data.ordenes);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error al cargar OTs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/ordenes-trabajo")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setOrdenes(data.ordenes);
          setStats(data.stats);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar OTs:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "EN_PRODUCCION":
        return <span className="inline-block border border-[var(--accent)] text-[var(--accent)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">EN PRODUCCIÓN</span>;
      case "EN_CALIDAD":
        return <span className="inline-block border border-[var(--ink)] text-[var(--ink)] bg-[var(--ink)]/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">EN CALIDAD</span>;
      case "NO_CONFORME":
        return <span className="inline-block border border-[var(--danger)] text-[var(--danger)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">NO CONFORME</span>;
      case "DESPACHO":
        return <span className="inline-block border border-[var(--ok)] text-[var(--ok)] bg-[var(--ok)]/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">LISTA PARA ENTREGA</span>;
      case "ENTREGADA":
        return <span className="inline-block border border-[var(--muted)] text-[var(--muted)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">ENTREGADA</span>;
      default:
        return <span className="inline-block border border-[var(--line2)] text-[var(--muted)] px-2 py-0.5 font-mono text-[10px] uppercase">{st}</span>;
    }
  };

  const filteredOrdenes = ordenes.filter((o) => {
    const matchFilter =
      filterStatus === "TODOS" ||
      (filterStatus === "PROD" && (o.estado === "EN_PRODUCCION" || o.estado === "NO_CONFORME")) ||
      (filterStatus === "CAL" && o.estado === "EN_CALIDAD") ||
      (filterStatus === "ENT" && o.estado === "ENTREGADA") ||
      (filterStatus === "DESP" && o.estado === "DESPACHO");

    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      o.numero_ot.toLowerCase().includes(q) ||
      o.cotizacion.solicitud.cliente.razon_social.toLowerCase().includes(q) ||
      (o.cotizacion.solicitud.nombre_pieza || "").toLowerCase().includes(q) ||
      (o.numero_colada || "").toLowerCase().includes(q);

    return matchFilter && matchQ;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Sticky Industrial */}
      <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur border-b-2 border-[var(--ink)]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-[64px] flex items-center gap-4 lg:gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[var(--ink)] relative shrink-0">
              <span className="absolute inset-0 grid place-items-center text-[var(--paper)] font-mono font-bold text-[14px]">
                QT
              </span>
              <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]"></span>
            </div>
            <div className="text-left leading-none hidden sm:block">
              <div className="font-extrabold tracking-tight text-[17px]">QUALITYTRACK</div>
              <div className="font-mono text-[8.5px] uppercase tracking-widest text-[var(--muted)] mt-1">
                TRAZABILIDAD · MECANIZADO
              </div>
            </div>
          </Link>

          {/* Nav Tabs */}
          <nav className="flex items-stretch gap-1 ml-4 h-[64px]">
            <button
              onClick={() => { setActiveTab("board"); setSelectedOT(null); }}
              className={`flex items-center gap-2 px-4 border-b-[3px] font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                activeTab === "board"
                  ? "border-[var(--accent)] text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              TRABAJOS
            </button>
            <button
              onClick={() => { setActiveTab("trace"); setSelectedOT(null); }}
              className={`flex items-center gap-2 px-4 border-b-[3px] font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                activeTab === "trace"
                  ? "border-[var(--accent)] text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              TRAZABILIDAD
            </button>
            <Link
              href="/api-reference"
              target="_blank"
              className="flex items-center gap-2 px-4 border-b-[3px] border-transparent font-mono text-[11px] font-bold tracking-wider uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              API DOCS (SCALAR)
            </Link>
          </nav>

          <div className="flex-1"></div>

          {/* Search Header */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar OT · cliente · colada…"
              className="w-[220px] lg:w-[300px] bg-[var(--paper)] border border-[var(--line2)] focus:border-[var(--ink)] outline-none pl-9 pr-3 py-1.5 text-[12.5px] placeholder:text-[var(--muted)]/70"
            />
          </div>

          {/* Clock & User Profile */}
          <div className="hidden lg:block text-right leading-tight border-l border-[var(--line)] pl-5">
            <div className="font-mono text-[12px] font-semibold">{clock}</div>
            <div className="font-mono text-[8.5px] text-[var(--muted)] tracking-wider mt-0.5">
              PLANIFICACIÓN & CALIDAD
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] w-full mx-auto px-4 lg:px-8 py-7 flex-1">
        {selectedOT ? (
          /* Vista Detallada de Expediente Único */
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedOT(null)}
                className="inline-flex items-center gap-2 border border-[var(--ink)] px-3 py-1.5 font-mono text-[11px] font-semibold bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> VOLVER A TRABAJOS
              </button>
              <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
                EXPEDIENTE TÉCNICO UNIFICADO
              </span>
            </div>

            {/* Cabecera del Expediente */}
            <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">ORDEN DE TRABAJO</div>
                  <div className="text-[28px] font-extrabold font-mono text-[var(--ink)] mt-1">{selectedOT.numero_ot}</div>
                  <div className="font-mono text-[11px] text-[var(--muted)] mt-1">
                    PLANO: {selectedOT.cotizacion.solicitud.codigo_plano || "S/D"} REV {selectedOT.cotizacion.solicitud.revision_plano || "A"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">PIEZA INDUSTRIAL</div>
                  <div className="text-[16px] font-bold text-[var(--ink)] mt-1">{selectedOT.cotizacion.solicitud.nombre_pieza || selectedOT.cotizacion.solicitud.descripcion_pieza}</div>
                  <div className="font-mono text-[11px] text-[var(--muted)] mt-1">
                    {selectedOT.cotizacion.solicitud.material || "Acero"} · {selectedOT.cantidad} UNIDADES
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">CLIENTE & COLADA</div>
                  <div className="text-[14px] font-semibold text-[var(--ink)] mt-1">{selectedOT.cotizacion.solicitud.cliente.razon_social}</div>
                  <div className="font-mono text-[11px] text-[var(--muted)] mt-1">
                    COLADA: <span className="font-bold text-[var(--accent)]">{selectedOT.numero_colada || "PENDIENTE"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end justify-center">
                  <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest mb-1">ESTADO ACTUAL</div>
                  {getStatusBadge(selectedOT.estado)}
                </div>
              </div>
            </div>

            {/* Hoja de Ruta de Fases Industriales */}
            <div className="border-2 border-[var(--ink)] bg-[var(--card)] p-6 shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  HOJA DE RUTA — SECUENCIA DE OPERACIONES
                </div>
                <div className="font-mono text-[10px] text-[var(--muted)]">
                  {selectedOT.fases.filter(f => f.estado === "TERMINADO").length} DE {selectedOT.fases.length} COMPLETADAS
                </div>
              </div>

              <div className="divide-y divide-[var(--line)]">
                {selectedOT.fases.map((fase) => (
                  <div key={fase.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 grid place-items-center bg-[var(--paper)] border border-[var(--line2)] font-mono text-[11px] font-bold">
                        {fase.numero_secuencia}
                      </span>
                      <div>
                        <div className="text-[13px] font-bold text-[var(--ink)]">{fase.faseCatalogo.nombre}</div>
                        <div className="font-mono text-[10.5px] text-[var(--muted)]">
                          {fase.maquinaria || "Máquina estándar"} · Operario: {fase.operario.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-[var(--muted)]">TIEMPO: </span>
                        <span className="font-bold">{fase.duracion_real_minutos || fase.tiempo_estimado_minutos} MIN</span>
                      </div>
                      <div>
                        {fase.estado === "TERMINADO" && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[var(--ok)] border border-[var(--ok)] px-2 py-0.5">
                            <Check className="w-3 h-3" /> COMPLETADA
                          </span>
                        )}
                        {fase.estado === "EN_EJECUCION" && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[var(--accent)] border border-[var(--accent)] px-2 py-0.5 animate-pulse">
                            ● EN CURSO
                          </span>
                        )}
                        {fase.estado === "EN_COLA" && (
                          <span className="font-mono text-[10px] text-[var(--muted)] border border-[var(--line2)] px-2 py-0.5">
                            EN COLA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditoría y Checklist de Calidad */}
            <div className="border-2 border-[var(--ink)] bg-[var(--card)] p-6 shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] border-b border-[var(--line)] pb-3 mb-4">
                CONTROL DE CALIDAD — 7 PUNTOS CANÓNICOS
              </div>

              {selectedOT.auditorias.length > 0 ? (
                <div className="space-y-4">
                  {selectedOT.auditorias.map((aud) => (
                    <div key={aud.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[12px] font-bold text-[var(--ink)]">
                          AUDITORÍA N° {aud.numero_auditoria} — VEREDICTO: {aud.resultado}
                        </span>
                        <span className="tag font-mono text-[10px] text-[var(--ok)] border border-[var(--ok)] px-2 py-0.5">
                          {aud.resultado}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[var(--muted)] italic">
                        &quot;{aud.observaciones_generales || "Sin observaciones adicionales."}&quot;
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {aud.checklistRespuestas.map((item) => (
                          <div key={item.item_numero} className="flex items-center justify-between border border-[var(--line)] p-2 text-[12px]">
                            <span>{item.item_numero}. {item.criterio_nombre}</span>
                            <span className="font-mono text-[10px] font-bold text-[var(--ok)]">{item.resultado_item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-[var(--muted)]">
                  Esta orden de trabajo aún no ha ingresado al puesto de Control de Calidad.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Vista Principal de Tablero de Producción */
          <div className="space-y-7">
            {/* Tarjetas Métricas Superiores */}
            <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-[var(--line)]">
                <div className="p-5">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">ÓRDENES ACTIVAS</div>
                  <div className="font-mono text-[34px] font-bold text-[var(--ink)] mt-2 leading-none">{stats.totalActivas}</div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">EN PRODUCCIÓN</div>
                  <div className="font-mono text-[34px] font-bold text-[var(--accent)] mt-2 leading-none">{stats.enProduccion}</div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">EN CALIDAD</div>
                  <div className="font-mono text-[34px] font-bold text-[var(--ink)] mt-2 leading-none">{stats.enCalidad}</div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">NO CONFORMIDADES</div>
                  <div className="font-mono text-[34px] font-bold text-[var(--danger)] mt-2 leading-none">{stats.noConformes}</div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">ENTREGADAS</div>
                  <div className="font-mono text-[34px] font-bold text-[var(--ok)] mt-2 leading-none">{stats.entregadas}</div>
                </div>
              </div>
            </div>

            {/* Acciones de la Tabla y Filtros */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)] mb-1">REGISTRO CENTRAL DE PLANTA</div>
                <h1 className="text-[28px] font-extrabold text-[var(--ink)] tracking-tight">Órdenes de Trabajo</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchData()}
                  className="inline-flex items-center gap-2 border-1.5 border-[var(--ink)] px-3.5 py-2 font-mono text-[10.5px] font-semibold tracking-wider uppercase bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> RECARGAR
                </button>
              </div>
            </div>

            {/* Tabla Principal */}
            <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] overflow-hidden">
              {/* Barra de Filtros */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--line)] bg-[var(--paper)]">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["TODOS", "TODAS"],
                    ["PROD", "EN PRODUCCIÓN"],
                    ["CAL", "EN CALIDAD"],
                    ["DESP", "DESPACHO"],
                    ["ENT", "ENTREGADAS"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilterStatus(val)}
                      className={`font-mono text-[9.5px] font-semibold tracking-wider px-3 py-1.5 border transition-colors ${
                        filterStatus === val
                          ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]"
                          : "border-[var(--line2)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de la Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-[var(--ink)] bg-[var(--card)] font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">
                      <th className="p-3.5">OT / SOLICITUD</th>
                      <th className="p-3.5">CLIENTE</th>
                      <th className="p-3.5">PIEZA INDUSTRIAL</th>
                      <th className="p-3.5">MATERIAL / COLADA</th>
                      <th className="p-3.5">AVANCE FASES</th>
                      <th className="p-3.5">ESTADO</th>
                      <th className="p-3.5 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]/70">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center font-mono text-[12px] text-[var(--muted)]">
                          Consultando base de datos industrial...
                        </td>
                      </tr>
                    ) : filteredOrdenes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center font-mono text-[12px] text-[var(--muted)]">
                          No se encontraron órdenes de trabajo para este filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredOrdenes.map((ot) => {
                        const fasesDone = ot.fases.filter((f) => f.estado === "TERMINADO").length;
                        return (
                          <tr
                            key={ot.id}
                            onClick={() => setSelectedOT(ot)}
                            className="hover:bg-[var(--paper)] cursor-pointer transition-colors"
                          >
                            <td className="p-3.5">
                              <div className="font-mono font-bold text-[13px] text-[var(--ink)]">{ot.numero_ot}</div>
                              <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                                {ot.cotizacion.solicitud.numero_solicitud}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-[var(--ink)]">
                                {ot.cotizacion.solicitud.cliente.razon_social}
                              </div>
                              <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                                {ot.cotizacion.solicitud.cliente.codigo || "CLI"}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-[var(--ink)]">
                                {ot.cotizacion.solicitud.nombre_pieza || ot.cotizacion.solicitud.descripcion_pieza}
                              </div>
                              <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                                DWG: {ot.cotizacion.solicitud.codigo_plano || "S/D"} REV {ot.cotizacion.solicitud.revision_plano || "A"}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-mono text-[12px] text-[var(--ink)]">
                                {ot.cotizacion.solicitud.material || "AISI 4140"}
                              </div>
                              <div className="font-mono text-[10px] text-[var(--accent)] font-semibold mt-0.5">
                                COLADA {ot.numero_colada || "—"}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex gap-1">
                                  {ot.fases.map((f) => (
                                    <span
                                      key={f.id}
                                      className={`w-2.5 h-2.5 inline-block ${
                                        f.estado === "TERMINADO"
                                          ? "bg-[var(--ink)]"
                                          : f.estado === "EN_EJECUCION"
                                          ? "bg-[var(--accent)] animate-pulse"
                                          : "border border-[var(--line2)]"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-mono text-[10px] text-[var(--muted)] ml-2">
                                  {fasesDone}/{ot.fases.length}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">{getStatusBadge(ot.estado)}</td>
                            <td className="p-3.5 text-right">
                              <button className="p-1 hover:text-[var(--accent)] transition-colors">
                                <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
