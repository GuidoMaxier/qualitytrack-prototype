"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type {
  CotizacionExpediente,
  DataExpedientes,
  FilaExpediente,
  OtExpediente,
  ResultadoAccion,
  StatsDto,
} from "../lib/tipos";

const STATS_VACIOS: StatsDto = {
  totalActivas: 0,
  enProduccion: 0,
  enCalidad: 0,
  noConformes: 0,
  entregadas: 0,
  cotizacionesPendientes: 0,
};

function aFilaOT(o: OtExpediente): FilaExpediente {
  const sol = o.cotizacion.solicitud;
  return {
    kind: "OT",
    id: o.id,
    numero: o.numero_ot,
    referencia: sol.numero_solicitud,
    clienteNombre: sol.cliente.razon_social,
    clienteCodigo: sol.cliente.codigo,
    pieza: sol.nombre_pieza || sol.descripcion_pieza,
    plano: sol.codigo_plano,
    revision: sol.revision_plano,
    material: sol.material,
    cantidad: sol.cantidad,
    colada: o.numero_colada,
    estadoKey: o.estado,
    entrega: sol.fecha_esperada_entrega,
    fasesTotal: o.fases.length,
    fasesDone: o.fases.filter((f) => f.estado === "TERMINADO").length,
    monto: o.cotizacion.precio_final,
    createdAt: o.createdAt,
  };
}

function aFilaCOT(c: CotizacionExpediente): FilaExpediente {
  const sol = c.solicitud;
  return {
    kind: "COT",
    id: c.id,
    numero: c.numero_cotizacion,
    referencia: sol.numero_solicitud,
    clienteNombre: sol.cliente.razon_social,
    clienteCodigo: sol.cliente.codigo,
    pieza: sol.nombre_pieza || sol.descripcion_pieza,
    plano: sol.codigo_plano,
    revision: sol.revision_plano,
    material: sol.material,
    cantidad: sol.cantidad,
    colada: null,
    estadoKey: c.estado,
    entrega: sol.fecha_esperada_entrega,
    fasesTotal: 0,
    fasesDone: 0,
    monto: c.precio_final,
    createdAt: c.createdAt,
  };
}

/**
 * Fuente única de datos del tablero: un fetch + refetch tras acciones.
 * Expone stats, OTs, cotizaciones y la lista unificada `filas` (OT + COT) ordenada por creación.
 */
export function useExpedientes() {
  const [data, setData] = useState<DataExpedientes>({ stats: STATS_VACIOS, ordenes: [], cotizaciones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setData(await api.expedientes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial sin setState síncrono dentro del effect (fetch + then)
  useEffect(() => {
    let vivo = true;
    api
      .expedientes()
      .then((d) => {
        if (vivo) setData(d);
      })
      .catch((e) => {
        if (vivo) setError(e instanceof Error ? e.message : "Error al cargar los datos.");
      })
      .finally(() => {
        if (vivo) setLoading(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const filas = useMemo<FilaExpediente[]>(() => {
    const todas: FilaExpediente[] = [...data.ordenes.map(aFilaOT), ...data.cotizaciones.map(aFilaCOT)];
    return todas.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [data.ordenes, data.cotizaciones]);

  const accionCotizacion = useCallback(
    async (id: string, action: "aprobar" | "generar-ot"): Promise<ResultadoAccion> => {
      setBusyId(id);
      const r = await api.accionCotizacion(id, action);
      if (r.ok) await reload();
      setBusyId(null);
      return r;
    },
    [reload]
  );

  return { ...data, filas, loading, error, reload, busyId, accionCotizacion };
}

export type UseExpedientes = ReturnType<typeof useExpedientes>;
