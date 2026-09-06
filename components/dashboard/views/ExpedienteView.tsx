"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, FileText, History, CheckCircle2 } from "lucide-react";
import { badgeDe, OT_ESTADO, FASE_ESTADO, NC_ESTADO, AUD_ESTADO } from "../lib/estados";
import { fmtFecha, fmtFechaHora, fmtMin, fmtMoney } from "../lib/format";
import type { DocumentoDto, OtExpediente } from "../lib/tipos";

// ----- helpers de etapa (espejo de design/dashboard.html) -----
type Etapa = "sol" | "cot" | "ot" | "ruta" | "cal" | "ent";

const ETAPAS: Array<{ k: Etapa; n: string; t: string }> = [
  { k: "sol", n: "01", t: "SOLICITUD" },
  { k: "cot", n: "02", t: "COTIZACIÓN" },
  { k: "ot", n: "03", t: "ORDEN DE TRABAJO" },
  { k: "ruta", n: "04", t: "HOJA DE RUTA" },
  { k: "cal", n: "05", t: "CONTROL DE CALIDAD" },
  { k: "ent", n: "06", t: "ENTREGA" },
];

const ETAPA_LABEL: Record<string, string> = {
  sol: "SOLICITUD",
  cot: "COTIZACIÓN",
  ot: "ORDEN DE TRABAJO",
  ruta: "HOJA DE RUTA",
  cal: "CALIDAD",
  ent: "ENTREGA",
};

const TIPO_ABBR: Record<string, string> = {
  SOL: "SOL",
  PLANO: "PLN",
  ET: "ET",
  CERT: "CRT",
  OC: "OCT",
  COTD: "COT",
  QC: "QC",
  REM: "REM",
  FAC: "FAC",
  INF: "INF",
  ADJ: "ADJ",
};

const SELLO_COLOR: Record<string, string> = {
  RECIBIDO: "ink",
  APROBADO: "ok",
  CONFORME: "ok",
  LIBERADO: "ok",
};

function etapaInicial(o: OtExpediente): Etapa {
  switch (o.estado) {
    case "ENTREGADA":
    case "DESPACHO":
      return "ent";
    case "EN_CALIDAD":
    case "NO_CONFORME":
      return "cal";
    default:
      return "ruta";
  }
}

function etapaDone(o: OtExpediente, k: Etapa): 0 | 1 | 2 {
  const todasTerminadas = o.fases.length > 0 && o.fases.every((f) => f.estado === "TERMINADO");
  switch (k) {
    case "sol":
      return 2;
    case "cot":
      return 2;
    case "ot":
      return 2;
    case "ruta":
      return todasTerminadas ? 2 : o.fases.some((f) => f.estado === "TERMINADO" || f.estado === "EN_EJECUCION") ? 1 : 1;
    case "cal":
      return o.estado === "DESPACHO" || o.estado === "ENTREGADA" ? 2 : o.estado === "EN_CALIDAD" || o.estado === "NO_CONFORME" ? 1 : 0;
    case "ent":
      return o.estado === "ENTREGADA" ? 2 : o.estado === "DESPACHO" ? 1 : 0;
  }
}

function EstadoChip({ estadoKey, mapa }: { estadoKey: string; mapa: Record<string, { l: string; c: string }> }) {
  const b = badgeDe(estadoKey, mapa);
  return (
    <span className="inline-block border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: `var(--${b.c})`, borderColor: `var(--${b.c})` }}>
      {b.l}
    </span>
  );
}

function Cabecera({ o }: { o: OtExpediente }) {
  const sol = o.cotizacion.solicitud;
  return (
    <div className="relative border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
      <div className="grid grid-cols-2 md:grid-cols-12">
        <div className="p-4 border-b md:border-r border-[var(--line)] md:col-span-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">ORDEN DE TRABAJO</div>
          <div className="text-[25px] font-extrabold font-mono leading-none mt-1.5 text-[var(--ink)]">{o.numero_ot}</div>
          <div className="font-mono text-[10px] text-[var(--muted)] mt-1.5">
            PLANO {sol.codigo_plano || "S/D"} · REV {sol.revision_plano || "A"}
          </div>
        </div>
        <div className="p-4 border-b md:border-r border-[var(--line)] md:col-span-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">PIEZA</div>
          <div className="text-[15px] font-bold leading-tight mt-1.5 text-[var(--ink)]">{sol.nombre_pieza || sol.descripcion_pieza}</div>
          <div className="font-mono text-[10px] text-[var(--muted)] mt-1">
            {sol.material || "—"} · {o.cantidad} PZ
          </div>
        </div>
        <div className="p-4 border-b md:border-r border-[var(--line)] md:col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">CLIENTE</div>
          <div className="text-[13px] font-semibold leading-snug mt-1.5 text-[var(--ink)]">{sol.cliente.razon_social}</div>
          <div className="font-mono text-[10px] text-[var(--muted)] mt-1">{sol.cliente.codigo || "CLI"}</div>
        </div>
        <div className="p-4 border-b md:border-r border-[var(--line)] md:col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">MATERIAL / COLADA</div>
          <div className="font-mono text-[13px] font-semibold mt-1.5 text-[var(--ink)]">{sol.material || "—"}</div>
          <div className="font-mono text-[10px] text-[var(--muted)] mt-1">
            COLADA {o.numero_colada || "—"} · {sol.norma_material || ""}
          </div>
        </div>
        <div className="p-4 border-b md:border-r border-[var(--line)] md:col-span-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">ENTREGA</div>
          <div className="font-mono text-[14px] font-bold mt-1.5 text-[var(--ink)]">{fmtFecha(sol.fecha_esperada_entrega)}</div>
        </div>
        <div className="p-4 md:col-span-1 flex flex-col items-start justify-center">
          <EstadoChip estadoKey={o.estado} mapa={OT_ESTADO} />
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-mono text-[10.5px] text-[var(--muted)]">
          {o.documentos.length} DOCUMENTO{o.documentos.length === 1 ? "" : "S"} · {o.eventos.length} EVENTO{o.eventos.length === 1 ? "" : "S"} EN BITÁCORA
        </span>
        <span className="font-mono text-[10.5px] text-[var(--muted)]">MONTO: {fmtMoney(o.cotizacion.precio_final)}</span>
        <EstadoChip estadoKey={`PRIORIDAD ${o.prioridad}`} mapa={{}} />
      </div>
    </div>
  );
}

function ContenidoSol({ o }: { o: OtExpediente }) {
  const sol = o.cotizacion.solicitud;
  return (
    <>
      <SeccionTitulo etapa="01 / 06" titulo="Solicitud del cliente" sub={`Recibida ${fmtFecha(sol.createdAt)} · ${sol.canal_contacto || "—"}`} />
      <div className="border border-[var(--line)] border-l-[3px] border-l-[var(--accent)] bg-[var(--card)] px-5 py-4 text-[14px] leading-relaxed text-[var(--ink)]">
        “{sol.descripcion_pieza}”
      </div>
      <InfoGrid
        celdas={[
          ["REFERENCIA", sol.numero_solicitud],
          ["CANAL", sol.canal_contacto || "—"],
          ["CONTACTO", sol.cliente.contacto_nombre],
          ["CORREO", sol.cliente.email || "—"],
        ]}
      />
    </>
  );
}

function ContenidoCot({ o }: { o: OtExpediente }) {
  const c = o.cotizacion;
  const totalItems = c.items.reduce((a, i) => a + i.cantidad * Number(i.precio_unitario), 0);
  return (
    <>
      <SeccionTitulo etapa="02 / 06" titulo="Cotización" sub={`N° ${c.numero_cotizacion} · ${fmtFecha(c.fecha_envio_cliente)}`} />
      <div className="border-2 border-[var(--ink)] bg-[var(--card)] overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">
              <th className="p-3 border-b-2 border-[var(--ink)]">DESCRIPCIÓN</th>
              <th className="p-3 text-right border-b-2 border-[var(--ink)]">CANT.</th>
              <th className="p-3 text-right border-b-2 border-[var(--ink)]">P. UNITARIO</th>
              <th className="p-3 text-right border-b-2 border-[var(--ink)]">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]/70">
            {c.items.map((i) => (
              <tr key={i.id}>
                <td className="p-3 text-[12.5px]">{i.descripcion}</td>
                <td className="p-3 font-mono text-right">{i.cantidad}</td>
                <td className="p-3 font-mono text-right">{fmtMoney(i.precio_unitario)}</td>
                <td className="p-3 font-mono text-right font-semibold">{fmtMoney(i.cantidad * Number(i.precio_unitario))}</td>
              </tr>
            ))}
            <tr className="bg-[var(--paper)]">
              <td className="p-3 font-bold" colSpan={3}>
                TOTAL
              </td>
              <td className="p-3 font-mono text-right font-bold">{fmtMoney(c.precio_final || totalItems)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {c.aprobado_por_cliente ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 border border-[var(--ok)] bg-[var(--ok)]/5 px-4 py-2.5 text-[12.5px]">
          <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" />
          <span>
            Aprobada por <b>{c.aprobado_por_cliente}</b> — habilita la Orden de Trabajo.
          </span>
        </div>
      ) : (
        <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">Sin aprobación registrada.</p>
      )}
    </>
  );
}

function ContenidoOt({ o }: { o: OtExpediente }) {
  return (
    <>
      <SeccionTitulo etapa="03 / 06" titulo="Orden de Trabajo" sub={`Liberada ${fmtFechaHora(o.fecha_inicio_produccion)}`} />
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div className="border-2 border-[var(--ink)] bg-[var(--card)]">
          <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">NOTAS DE PROCESO</span>
            <EstadoChip estadoKey={o.prioridad} mapa={{}} />
          </div>
          <div className="p-4 grid gap-3">
            {o.notas.length === 0 && <p className="text-[12.5px] text-[var(--muted)]">Sin notas registradas.</p>}
            {o.notas.map((n) => (
              <div key={n.id} className="border-l-[3px] border-l-[var(--accent)] pl-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">{n.origen === "CALIDAD" ? "CALIDAD" : "JEFE DE PRODUCCIÓN"} · {n.usuario.name}</div>
                <p className="text-[12.5px] mt-0.5 leading-snug">{n.contenido}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-[var(--ink)] bg-[var(--card)]">
          <div className="px-4 py-3 border-b border-[var(--line)]">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MATERIA PRIMA ASIGNADA</span>
          </div>
          <div className="p-4">
            <div className="font-mono text-[18px] font-bold text-[var(--ink)]">{o.cotizacion.solicitud.material || "—"}</div>
            <InfoGrid
              celdas={[
                ["COLADA", o.numero_colada || "—"],
                ["CERTIFICACIÓN", o.cotizacion.solicitud.norma_material || "—"],
                ["CANTIDAD", `${o.cantidad} PZ`],
                ["ENTREGA", fmtFecha(o.cotizacion.solicitud.fecha_esperada_entrega)],
              ]}
              simple
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ContenidoRuta({ o }: { o: OtExpediente }) {
  const done = o.fases.filter((f) => f.estado === "TERMINADO").length;
  return (
    <>
      <SeccionTitulo etapa="04 / 06" titulo="Hoja de Ruta" sub={`${done}/${o.fases.length} operaciones completadas`} />
      <div className="border border-[var(--ink)] bg-[var(--card)] overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">
              <th className="p-3 border-b-2 border-[var(--ink)]">N°</th>
              <th className="p-3 border-b-2 border-[var(--ink)]">OPERACIÓN</th>
              <th className="p-3 border-b-2 border-[var(--ink)]">MÁQUINA</th>
              <th className="p-3 border-b-2 border-[var(--ink)]">OPERARIO</th>
              <th className="p-3 text-right border-b-2 border-[var(--ink)]">T. EST.</th>
              <th className="p-3 text-right border-b-2 border-[var(--ink)]">T. REAL</th>
              <th className="p-3 border-b-2 border-[var(--ink)]">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]/70">
            {o.fases.map((f) => (
              <tr key={f.id}>
                <td className="p-3 font-mono font-bold">{f.numero_secuencia}</td>
                <td className="p-3 font-semibold">{f.faseCatalogo.nombre}</td>
                <td className="p-3 font-mono text-[11px] text-[var(--muted)]">{f.maquinaria || "—"}</td>
                <td className="p-3 text-[12px]">{f.operario.name}</td>
                <td className="p-3 font-mono text-right">{fmtMin(f.tiempo_estimado_minutos)}</td>
                <td className="p-3 font-mono text-right">{fmtMin(f.duracion_real_minutos)}</td>
                <td className="p-3">
                  <EstadoChip estadoKey={f.estado} mapa={FASE_ESTADO} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ContenidoCal({ o }: { o: OtExpediente }) {
  const ncAbiertas = o.noConformidades.filter((n) => n.estado === "ABIERTA");
  return (
    <>
      <SeccionTitulo
        etapa="05 / 06"
        titulo="Control de Calidad"
        sub={`${o.auditorias.length} ronda(s) · ${ncAbiertas.length} NC abierta(s)`}
      />
      {ncAbiertas.length > 0 && (
        <div className="mb-4 border-2 border-[var(--danger)] bg-[var(--danger)]/5 px-4 py-3">
          <p className="text-[12.5px] font-semibold text-[var(--danger)]">La OT tiene no conformidades abiertas pendientes de reproceso.</p>
        </div>
      )}
      {o.noConformidades.length > 0 && (
        <div className="mb-4 grid gap-2">
          {o.noConformidades.map((n) => (
            <div key={n.id} className="border border-[var(--danger)] bg-[var(--card)] p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-[var(--danger)]">
                  {n.numero} {n.codigo_control ? `· ${n.codigo_control}` : ""}
                </span>
                <EstadoChip estadoKey={n.estado} mapa={NC_ESTADO} />
              </div>
              <p className="text-[12px] mt-1">{n.descripcion}</p>
              <p className="font-mono text-[10px] text-[var(--muted)] mt-1">DISPOSICIÓN: {n.disposicion} · {fmtFechaHora(n.fecha_apertura)}</p>
            </div>
          ))}
        </div>
      )}
      {o.auditorias.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--line2)] bg-[var(--card)] p-8 text-center">
          <p className="text-[12.5px] text-[var(--muted)]">Esta OT aún no ingresó al puesto de Control de Calidad.</p>
        </div>
      ) : (
        o.auditorias.map((a) => (
          <div key={a.id} className="mb-4 border-2 border-[var(--ink)] bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper)]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">AUDITORÍA N° {a.numero_auditoria}</span>
              <EstadoChip estadoKey={a.resultado} mapa={AUD_ESTADO} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">
                    <th className="p-2.5 border-b border-[var(--line)]">CÓD.</th>
                    <th className="p-2.5 border-b border-[var(--line)]">CONTROL</th>
                    <th className="p-2.5 border-b border-[var(--line)]">ESPECIFICACIÓN</th>
                    <th className="p-2.5 border-b border-[var(--line)]">MÉTODO</th>
                    <th className="p-2.5 border-b border-[var(--line)]">RESULTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]/60">
                  {a.checklistRespuestas.map((i) => (
                    <tr key={i.item_numero}>
                      <td className="p-2.5 font-mono font-bold">{i.codigo_item || i.item_numero}</td>
                      <td className="p-2.5 font-semibold">{i.criterio_nombre}</td>
                      <td className="p-2.5 font-mono text-[11px] text-[var(--muted)]">{i.especificacion || "—"}</td>
                      <td className="p-2.5 font-mono text-[11px] text-[var(--muted)]">{i.metodo || "—"}</td>
                      <td className="p-2.5">
                        {i.resultado_item ? (
                          <span
                            className="font-mono text-[9.5px] font-bold uppercase tracking-wider"
                            style={{ color: `var(--${i.resultado_item === "CUMPLE" ? "ok" : i.resultado_item === "NO_CUMPLE" ? "danger" : "muted"})` }}
                          >
                            {i.resultado_item === "CUMPLE" ? "CUMPLE" : i.resultado_item === "NO_CUMPLE" ? "NO CUMPLE" : "NO APLICA"}
                          </span>
                        ) : (
                          <span className="font-mono text-[9.5px] text-[var(--muted)] uppercase tracking-wider">PENDIENTE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  );
}

function ContenidoEnt({ o }: { o: OtExpediente }) {
  if (o.estado !== "ENTREGADA") {
    return (
      <>
        <SeccionTitulo etapa="06 / 06" titulo="Entrega" sub={o.estado === "DESPACHO" ? "Lote liberado por Calidad — pendiente de registrar la entrega" : "Etapa pendiente"} />
        <div className="border-2 border-dashed border-[var(--line2)] bg-[var(--card)] p-8 text-center">
          <p className="text-[12.5px] text-[var(--muted)]">
            {o.estado === "DESPACHO"
              ? "El lote está listo. La entrega se registra con remito, factura y receptor (próxima parte M6-P4)."
              : "La entrega se habilita cuando Control de Calidad libere el lote."}
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <SeccionTitulo etapa="06 / 06" titulo="Entrega" sub={`Expediente cerrado · ${fmtFecha(o.cotizacion.solicitud.fecha_esperada_entrega)}`} />
      <div className="border-2 border-[var(--ink)] bg-[var(--card)] p-6 relative overflow-hidden">
        <div className="absolute right-6 top-6 -rotate-3 border-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)", borderColor: "var(--muted)" }}>
          ENTREGADA
        </div>
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]">CONFORMIDAD DE ENTREGA</div>
        <p className="text-[14px] mt-2 max-w-[560px] leading-relaxed">
          Lote de <b>{o.cantidad} piezas</b> entregado a <b>{o.cotizacion.solicitud.cliente.razon_social}</b> y recibido por <b>{o.receptor_nombre || "—"}</b>.
        </p>
        <InfoGrid
          celdas={[
            ["REMITO", o.numero_remito || "—"],
            ["FACTURA", o.numero_factura || "—"],
            ["RECIBIDO POR", o.receptor_nombre || "—"],
          ]}
          simple
        />
      </div>
    </>
  );
}

function SeccionTitulo({ etapa, titulo, sub }: { etapa: string; titulo: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mb-1">ETAPA {etapa}</div>
      <h2 className="text-[20px] font-extrabold tracking-tight text-[var(--ink)]">{titulo}</h2>
      {sub && <div className="text-[12px] text-[var(--muted)] mt-1">{sub}</div>}
      <div className="h-px bg-[var(--ink)] mt-3 mb-4" />
    </div>
  );
}

function InfoGrid({ celdas, simple }: { celdas: Array<[string, string]>; simple?: boolean }) {
  return (
    <div className={`${simple ? "grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)] mt-4" : "grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] mt-4"}`}>
      {celdas.map(([k, v]) => (
        <div key={k} className="bg-[var(--card)] p-3.5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">{k}</div>
          <div className="text-[12.5px] font-semibold mt-1 text-[var(--ink)]">{v}</div>
        </div>
      ))}
    </div>
  );
}

function PanelDocs({ docs }: { docs: DocumentoDto[] }) {
  return (
    <div className="border-2 border-[var(--ink)] bg-[var(--card)]">
      <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">DOCUMENTOS ({docs.length})</span>
        <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
      </div>
      <div className="max-h-[380px] overflow-auto p-2.5 grid gap-2 content-start">
        {docs.length === 0 && <p className="text-[12px] text-[var(--muted)] p-2">Sin documentos registrados.</p>}
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 border border-[var(--line)] bg-[var(--card)] hover:border-[var(--ink)] px-3 py-2.5 transition-colors">
            <span className="font-mono text-[9px] font-bold w-8 h-8 grid place-items-center border border-[var(--line2)] shrink-0">
              {TIPO_ABBR[d.tipo] ?? d.tipo.slice(0, 3).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold leading-tight truncate">{d.titulo}</div>
              <div className="font-mono text-[9px] text-[var(--muted)] mt-0.5">
                {ETAPA_LABEL[d.etapa] ?? d.etapa} · {fmtFechaHora(d.emision)}
              </div>
              {d.sello && (
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: `var(--${SELLO_COLOR[d.sello] ?? "ink"})` }}>
                  {d.sello}
                </span>
              )}
            </div>
            {d.archivo_nombre ? (
              <a
                href={`/api/documentos/${d.id}/archivo`}
                target="_blank"
                rel="noreferrer"
                title={d.archivo_nombre}
                className="shrink-0 border border-[var(--ok)] text-[var(--ok)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider hover:bg-[var(--ok)] hover:text-white transition-colors"
              >
                VER
              </a>
            ) : (
              <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wider text-[var(--muted)]">SIN ARCHIVO</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelBitacora({ o }: { o: OtExpediente }) {
  return (
    <div className="border-2 border-[var(--ink)] bg-[var(--card)]">
      <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">BITÁCORA DEL EXPEDIENTE</span>
        <History className="w-3.5 h-3.5 text-[var(--muted)]" />
      </div>
      <div className="max-h-[460px] overflow-auto p-4 grid gap-3.5 content-start">
        {o.eventos.length === 0 && <p className="text-[12px] text-[var(--muted)]">Sin eventos registrados.</p>}
        {o.eventos.map((e) => (
          <div key={e.id} className="relative pl-3 border-l-2 border-[var(--accent)]">
            <div className="font-mono text-[10px] text-[var(--muted)]">{fmtFechaHora(e.fecha)}</div>
            <div className="text-[12px] leading-snug mt-0.5 text-[var(--ink)]">{e.texto}</div>
            <div className="font-mono text-[9px] text-[var(--muted)] mt-0.5 uppercase tracking-wider">{e.actor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExpedienteView({ ot, onBack }: { ot: OtExpediente; onBack: () => void }) {
  const [etapa, setEtapa] = useState<Etapa>(() => etapaInicial(ot));
  const done = useMemo(() => {
    const m: Record<Etapa, number> = { sol: 0, cot: 0, ot: 0, ruta: 0, cal: 0, ent: 0 };
    for (const k of ETAPAS.map((e) => e.k)) m[k] = etapaDone(ot, k);
    return m;
  }, [ot]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 border border-[var(--ink)] px-3 py-1.5 font-mono text-[11px] font-semibold bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> TRABAJOS
        </button>
        <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">EXPEDIENTE ÚNICO DE TRABAJO</span>
      </div>

      <Cabecera o={ot} />

      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_330px] gap-6 items-start">
        {/* Timeline */}
        <nav className="border-2 border-[var(--ink)] bg-[var(--card)] p-3.5 lg:sticky lg:top-[84px]">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-widest text-[var(--muted)] px-1.5 pb-2 pt-1">LÍNEA DE PROCESO</div>
          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--line2)]" />
            {ETAPAS.map(({ k, n, t }) => {
              const st = done[k];
              const act = etapa === k;
              const mark = st === 2 ? "bg-[var(--ink)]" : st === 1 ? "bg-[var(--accent)]" : "bg-[var(--card)] border-[1.5px] border-[var(--line2)]";
              return (
                <button key={k} onClick={() => setEtapa(k)} className="relative w-full text-left flex gap-3 items-start py-2.5 group">
                  <span className={`relative z-10 mt-0.5 w-[15px] h-[15px] shrink-0 ${mark} ${act ? "ring-2 ring-offset-2 ring-offset-[var(--card)] ring-[var(--ink)]" : ""}`} />
                  <span className="min-w-0">
                    <span className={`font-mono text-[9px] tracking-[.2em] ${act ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>ETAPA {n}</span>
                    <span className="block text-[12px] font-bold leading-tight mt-0.5 group-hover:underline underline-offset-2 decoration-[var(--line2)]">{t}</span>
                    <span className="block font-mono text-[9px] text-[var(--muted)] mt-0.5">
                      {st === 2 ? "COMPLETA" : st === 1 ? "EN PROCESO" : "PENDIENTE"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Contenido de etapa */}
        <div className="min-w-0">
          {etapa === "sol" && <ContenidoSol o={ot} />}
          {etapa === "cot" && <ContenidoCot o={ot} />}
          {etapa === "ot" && <ContenidoOt o={ot} />}
          {etapa === "ruta" && <ContenidoRuta o={ot} />}
          {etapa === "cal" && <ContenidoCal o={ot} />}
          {etapa === "ent" && <ContenidoEnt o={ot} />}
        </div>

        {/* Panel derecho */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-[84px]">
          <PanelDocs docs={ot.documentos} />
          <PanelBitacora o={ot} />
        </aside>
      </div>
    </div>
  );
}
