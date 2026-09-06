// Mapas de estado → etiqueta y color (única fuente para toda la UI).
// Colores referencian variables CSS del tema (--accent, --ok, --warn, --danger, --ink, --muted).

export interface EstadoBadge {
  l: string;
  c: string;
}

export const OT_ESTADO: Record<string, EstadoBadge> = {
  EN_PRODUCCION: { l: "EN PRODUCCIÓN", c: "accent" },
  EN_CALIDAD: { l: "EN CONTROL DE CALIDAD", c: "ink" },
  NO_CONFORME: { l: "NO CONFORME", c: "danger" },
  DESPACHO: { l: "LISTA PARA ENTREGA", c: "ok" },
  ENTREGADA: { l: "ENTREGADA", c: "muted" },
};

export const COT_ESTADO: Record<string, EstadoBadge> = {
  LISTA_PARA_ENVIAR: { l: "COTIZACIÓN PENDIENTE", c: "warn" },
  ENVIADA_A_CLIENTE: { l: "ENVIADA AL CLIENTE", c: "accent" },
  APROBADA: { l: "APROBADA", c: "ok" },
  NO_APROBADA: { l: "NO APROBADA", c: "danger" },
};

export const FASE_ESTADO: Record<string, EstadoBadge> = {
  EN_COLA: { l: "EN COLA", c: "muted" },
  EN_EJECUCION: { l: "EN CURSO", c: "accent" },
  TERMINADO: { l: "COMPLETA", c: "ok" },
};

export const NC_ESTADO: Record<string, EstadoBadge> = {
  ABIERTA: { l: "ABIERTA", c: "danger" },
  CERRADA: { l: "CERRADA", c: "ok" },
};

export const AUD_ESTADO: Record<string, EstadoBadge> = {
  EN_PROCESO: { l: "EN PROCESO", c: "accent" },
  CONFORME: { l: "CONFORME", c: "ok" },
  NO_CONFORME: { l: "NO CONFORME", c: "danger" },
};

export function badgeDe(key: string, mapa: Record<string, EstadoBadge>): EstadoBadge {
  return mapa[key] ?? { l: key, c: "muted" };
}

// Filtros del tablero (valores estables independientes del label).
export const FILTROS: Array<{ val: string; label: string }> = [
  { val: "TODOS", label: "TODAS" },
  { val: "COT", label: "COTIZACIONES" },
  { val: "PROD", label: "EN PRODUCCIÓN" },
  { val: "CAL", label: "EN CALIDAD" },
  { val: "DESP", label: "DESPACHO" },
  { val: "ENT", label: "ENTREGADAS" },
];
