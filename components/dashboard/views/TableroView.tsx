"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Download, Loader2, Plus, Search, ShieldCheck } from "lucide-react";
import { badgeDe, COT_ESTADO, FILTROS, OT_ESTADO } from "../lib/estados";
import { fmtFecha, fmtMoney } from "../lib/format";
import type { FilaExpediente, StatsDto } from "../lib/tipos";

interface Props {
  stats: StatsDto;
  filas: FilaExpediente[];
  loading: boolean;
  busyId: string | null;
  filter: string;
  onFilterChange: (v: string) => void;
  onAccionCOT: (id: string, action: "aprobar" | "generar-ot") => void;
  onAbrirOT: (id: string) => void;
  onNuevaSolicitud: () => void;
  onReload: () => void;
}

const chipCls = (on: boolean) =>
  `font-mono text-[9.5px] font-semibold tracking-wider px-3 py-1.5 border transition-colors ${
    on ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]" : "border-[var(--line2)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
  }`;

const badgeEstilo = (color: string) => ({ color: `var(--${color})`, borderColor: `var(--${color})` });

function MetricCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-5">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">{label}</div>
      <div className="font-mono text-[34px] font-bold mt-2 leading-none" style={{ color: color ? `var(--${color})` : undefined }}>
        {value}
      </div>
    </div>
  );
}

export default function TableroView({
  stats,
  filas,
  loading,
  busyId,
  filter,
  onFilterChange,
  onAccionCOT,
  onAbrirOT,
  onNuevaSolicitud,
  onReload,
}: Props) {
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return filas.filter((f) => {
      if (filter === "COT" && f.kind !== "COT") return false;
      if (filter === "PROD" && !(f.kind === "OT" && (f.estadoKey === "EN_PRODUCCION" || f.estadoKey === "NO_CONFORME"))) return false;
      if (filter === "CAL" && !(f.kind === "OT" && f.estadoKey === "EN_CALIDAD")) return false;
      if (filter === "DESP" && !(f.kind === "OT" && f.estadoKey === "DESPACHO")) return false;
      if (filter === "ENT" && !(f.kind === "OT" && f.estadoKey === "ENTREGADA")) return false;
      if (!query) return true;
      const blob = [f.numero, f.referencia, f.clienteNombre, f.pieza, f.material, f.colada].filter(Boolean).join(" ").toLowerCase();
      return blob.includes(query);
    });
  }, [filas, filter, q]);

  const cotPend = stats.cotizacionesPendientes;

  return (
    <div className="space-y-7">
      {/* Métricas */}
      <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-[var(--line)]">
          <MetricCard label="ÓRDENES ACTIVAS" value={stats.totalActivas} />
          <MetricCard label="EN PRODUCCIÓN" value={stats.enProduccion} color="accent" />
          <MetricCard label="EN CONTROL DE CALIDAD" value={stats.enCalidad} />
          <MetricCard label="NC ABIERTAS" value={stats.noConformes} color="danger" />
          <MetricCard label="ENTREGADAS" value={stats.entregadas} color="ok" />
        </div>
        {cotPend > 0 && (
          <div className="border-t border-[var(--line)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {cotPend} cotización{cotPend === 1 ? "" : "es"} pendiente{cotPend === 1 ? "" : "s"} de aprobación — filtrá por COTIZACIONES para gestionarlas
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)] mb-1">REGISTRO CENTRAL DE PRODUCCIÓN</div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)] tracking-tight">Órdenes de trabajo y cotizaciones</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar OT · RFQ · cliente · pieza · colada…"
              className="w-[220px] lg:w-[320px] bg-[var(--paper)] border border-[var(--line2)] focus:border-[var(--ink)] outline-none pl-9 pr-3 py-2 text-[12.5px] placeholder:text-[var(--muted)]/70"
            />
          </div>
          <button
            onClick={onNuevaSolicitud}
            className="inline-flex items-center gap-2 bg-[var(--accent)] border border-[var(--accent)] text-white px-3.5 py-2 font-mono text-[10.5px] font-semibold tracking-wider uppercase hover:bg-[#A83A0B] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> NUEVA SOLICITUD
          </button>
          <button
            onClick={onReload}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-[var(--ink)] px-3.5 py-2 font-mono text-[10.5px] font-semibold tracking-wider uppercase bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} RECARGAR
          </button>
        </div>
      </div>

      {/* Tabla unificada */}
      <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="flex flex-wrap gap-1.5">
            {FILTROS.map((f) => (
              <button key={f.val} onClick={() => onFilterChange(f.val)} className={chipCls(filter === f.val)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">
            {visible.length} EXPEDIENTE{visible.length === 1 ? "" : "S"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b-2 border-[var(--ink)] bg-[var(--card)] font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">
                <th className="p-3.5">OT / DOCUMENTO</th>
                <th className="p-3.5">CLIENTE</th>
                <th className="p-3.5">PIEZA INDUSTRIAL</th>
                <th className="p-3.5">MATERIAL / COLADA</th>
                <th className="p-3.5">AVANCE / MONTO</th>
                <th className="p-3.5">ESTADO</th>
                <th className="p-3.5 text-right">ENTREGA</th>
                <th className="p-3.5 text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center font-mono text-[12px] text-[var(--muted)]">
                    Consultando base de datos industrial…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center font-mono text-[12px] text-[var(--muted)]">
                    No se encontraron expedientes para este filtro.
                  </td>
                </tr>
              ) : (
                visible.map((f) => {
                  const badge = badgeDe(f.estadoKey, f.kind === "OT" ? OT_ESTADO : COT_ESTADO);
                  const busy = busyId === f.id;
                  const okGenerar = f.kind === "COT" && f.estadoKey === "APROBADA";
                  return (
                    <tr
                      key={f.id}
                      onClick={() => f.kind === "OT" && onAbrirOT(f.id)}
                      className={`${f.kind === "OT" ? "cursor-pointer hover:bg-[var(--paper)]" : ""} transition-colors`}
                    >
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[13px] text-[var(--ink)]">{f.numero}</div>
                        <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                          {f.referencia} · {f.kind === "OT" ? "ORDEN DE TRABAJO" : "COTIZACIÓN"}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[var(--ink)]">{f.clienteNombre}</div>
                        <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">{f.clienteCodigo || "CLI"}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[var(--ink)]">{f.pieza}</div>
                        <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                          DWG: {f.plano || "S/D"} REV {f.revision || "A"}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-[12px] text-[var(--ink)]">{f.material || "A determinar"}</div>
                        <div className="font-mono text-[10px] text-[var(--accent)] font-semibold mt-0.5">
                          {f.kind === "OT" ? `COLADA ${f.colada || "—"}` : `${f.cantidad} PZ`}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {f.kind === "OT" ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-1">
                              {Array.from({ length: f.fasesTotal }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`w-2.5 h-2.5 inline-block ${i < f.fasesDone ? "bg-[var(--ink)]" : "border border-[var(--line2)]"}`}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-[var(--muted)] ml-1">
                              {f.fasesDone}/{f.fasesTotal}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] font-semibold text-[var(--ink)]">{fmtMoney(f.monto)}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider" style={badgeEstilo(badge.c)}>
                          {badge.l}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] text-[var(--ink)]">{fmtFecha(f.entrega)}</td>
                      <td className="p-3.5 text-right">
                        {f.kind === "COT" ? (
                          okGenerar ? (
                            <button
                              disabled={busy}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAccionCOT(f.id, "generar-ot");
                              }}
                              className="inline-flex items-center gap-1.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white px-2.5 py-1.5 font-mono text-[9.5px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                            >
                              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />} GENERAR OT
                            </button>
                          ) : (
                            <button
                              disabled={busy}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAccionCOT(f.id, "aprobar");
                              }}
                              className="inline-flex items-center gap-1.5 border border-[var(--ok)] text-[var(--ok)] hover:bg-[var(--ok)] hover:text-white px-2.5 py-1.5 font-mono text-[9.5px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                            >
                              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />} APROBAR
                            </button>
                          )
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[var(--accent)]"
                            title="Abrir expediente único"
                          >
                            ABRIR <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
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
  );
}
