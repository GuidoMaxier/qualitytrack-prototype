// Tipos compartidos del dashboard (M6). Espejan las respuestas de /api/* y el modelo Prisma.

export type ViewId = "board" | "new" | "trace" | "file";

export interface StatsDto {
  totalActivas: number;
  enProduccion: number;
  enCalidad: number;
  noConformes: number; // NC abiertas (entidad NoConformidad), no OTs en estado NO_CONFORME
  entregadas: number;
  cotizacionesPendientes: number;
}

export interface ClienteOpt {
  id: string;
  codigo: string | null;
  razon_social: string;
  contacto_nombre: string;
}

export interface SolicitudClienteDto {
  codigo: string | null;
  razon_social: string;
  contacto_nombre: string;
  email: string | null;
}

export interface SolicitudDto {
  numero_solicitud: string;
  nombre_pieza: string | null;
  codigo_plano: string | null;
  revision_plano: string | null;
  material: string | null;
  norma_material: string | null;
  canal_contacto: string | null;
  cantidad: number;
  fecha_esperada_entrega: string;
  descripcion_pieza: string;
  createdAt: string;
  cliente: SolicitudClienteDto;
}

export interface FaseDto {
  id: string;
  numero_secuencia: number;
  maquinaria: string | null;
  tiempo_estimado_minutos: number;
  duracion_real_minutos: number | null;
  estado: string;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  faseCatalogo: { codigo: string; nombre: string };
  operario: { id: string; name: string; rol: string };
}

export interface ChecklistItemDto {
  item_numero: number;
  codigo_item: string | null;
  criterio_nombre: string;
  especificacion: string | null;
  metodo: string | null;
  resultado_item: string | null;
  observaciones: string | null;
}

export interface AuditoriaDto {
  id: string;
  numero_auditoria: number;
  resultado: string;
  observaciones_generales: string | null;
  checklistRespuestas: ChecklistItemDto[];
}

export interface NotaDto {
  id: string;
  origen: string;
  contenido: string;
  createdAt: string;
  usuario: { name: string; rol: string };
}

export interface DocumentoDto {
  id: string;
  tipo: string;
  numero: string | null;
  titulo: string;
  etapa: string;
  sello: string | null;
  emision: string;
  firmado_por: string | null;
  archivo_nombre: string | null;
  mime_type: string | null;
}

export interface EventoDto {
  id: string;
  fecha: string;
  actor: string;
  texto: string;
}

export interface NcDto {
  id: string;
  numero: string;
  estado: string;
  codigo_control: string | null;
  descripcion: string;
  disposicion: string;
  fecha_apertura: string;
  fecha_cierre: string | null;
}

export interface OtExpediente {
  id: string;
  numero_ot: string;
  cantidad: number;
  numero_colada: string | null;
  prioridad: string;
  estado: string;
  fecha_inicio_produccion: string | null;
  fecha_pase_calidad: string | null;
  fecha_pase_despacho: string | null;
  fecha_entrega: string | null;
  receptor_nombre: string | null;
  numero_remito: string | null;
  numero_factura: string | null;
  createdAt: string;
  cotizacion: {
    numero_cotizacion: string;
    estado: string;
    fecha_envio_cliente: string | null;
    aprobado_por_cliente: string | null;
    precio_final: number | string;
    solicitud: SolicitudDto;
    items: CotizacionItemDto[];
  };
  fases: FaseDto[];
  auditorias: AuditoriaDto[];
  notas: NotaDto[];
  noConformidades: NcDto[];
  documentos: DocumentoDto[];
  eventos: EventoDto[];
}

export interface CotizacionItemDto {
  id: string;
  numero_linea: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CotizacionExpediente {
  id: string;
  numero_cotizacion: string;
  estado: string;
  fecha_envio_cliente: string | null;
  aprobado_por_cliente: string | null;
  precio_final: number | string;
  createdAt: string;
  items: CotizacionItemDto[];
  solicitud: SolicitudDto & { _count: { documentos: number; eventos: number } };
}

// Fila unificada del registro central (tablero): OT o expediente comercial (COT).
export interface FilaExpediente {
  kind: "OT" | "COT";
  id: string; // id del nodo raíz (ordenTrabajo o cotizacion)
  numero: string;
  referencia: string;
  clienteNombre: string;
  clienteCodigo: string | null;
  pieza: string;
  plano: string | null;
  revision: string | null;
  material: string | null;
  cantidad: number;
  colada: string | null;
  estadoKey: string;
  entrega: string | null;
  fasesTotal: number;
  fasesDone: number;
  monto: number | string | null;
  createdAt: string;
}

export interface DataExpedientes {
  stats: StatsDto;
  ordenes: OtExpediente[];
  cotizaciones: CotizacionExpediente[];
}

export interface ResultadoAccion {
  ok: boolean;
  msg?: string;
  numero?: string;
}
