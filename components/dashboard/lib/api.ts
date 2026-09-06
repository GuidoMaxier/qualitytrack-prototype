// Cliente de API tipado para el dashboard. Todas las llamadas a /api/* del front pasan por acá.

import type {
  ClienteOpt,
  CotizacionExpediente,
  DataExpedientes,
  OtExpediente,
  ResultadoAccion,
} from "./tipos";

interface Resp<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/** Interpreta la respuesta JSON estándar del backend: { success, error?, ... }. */
async function parse<T>(res: Response): Promise<Resp<T>> {
  const raw: unknown = await res.json().catch(() => null);
  const obj = (raw ?? {}) as { success?: unknown; error?: unknown };
  const ok = obj.success === true;
  return {
    ok,
    status: res.status,
    data: ok ? (raw as T) : null,
    error: typeof obj.error === "string" ? obj.error : undefined,
  };
}

async function post<T>(url: string, body: unknown, method: "POST" | "PATCH" = "POST"): Promise<Resp<T>> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

type PayloadCliente = { success: boolean; cliente: ClienteOpt };
type PayloadSolicitud = { success: boolean; solicitud_id?: string; cotizacion_id?: string; plano_documento_id?: string | null };
type PayloadSubida = { success: boolean };
type PayloadAccion = { success: boolean; numero_cotizacion?: string; numero_ot?: string };

export const api = {
  // ---------- lectura ----------
  async expedientes(): Promise<DataExpedientes> {
    const r = await parse<{ success: boolean; stats: DataExpedientes["stats"]; ordenes: OtExpediente[]; cotizaciones: CotizacionExpediente[] }>(
      await fetch("/api/ordenes-trabajo")
    );
    if (!r.ok || !r.data) throw new Error(r.error || "No se pudieron cargar los expedientes.");
    return { stats: r.data.stats, ordenes: r.data.ordenes, cotizaciones: r.data.cotizaciones };
  },

  async clientes(): Promise<ClienteOpt[]> {
    const r = await parse<{ clientes: ClienteOpt[] }>(await fetch("/api/clientes"));
    return r.data?.clientes ?? [];
  },

  // ---------- alta ----------
  async crearCliente(datos: {
    razon_social: string;
    contacto_nombre: string;
    telefono?: string;
    direccion?: string;
    email?: string;
  }): Promise<{ ok: boolean; cliente?: ClienteOpt; error?: string }> {
    const r = await post<PayloadCliente>("/api/clientes", datos);
    return r.ok && r.data ? { ok: true, cliente: r.data.cliente } : { ok: false, error: r.error || "No se pudo crear el cliente." };
  },

  async crearSolicitud(datos: Record<string, unknown>): Promise<{ ok: boolean; data?: PayloadSolicitud; error?: string }> {
    const r = await post<PayloadSolicitud>("/api/solicitudes", datos);
    return r.ok && r.data ? { ok: true, data: r.data } : { ok: false, error: r.error || "No se pudo registrar la solicitud." };
  },

  async adjuntarArchivo(formData: FormData): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch("/api/documentos", { method: "POST", body: formData });
    const r = await parse<PayloadSubida>(res);
    return r.ok ? { ok: true } : { ok: false, error: r.error || "No se pudo adjuntar el archivo." };
  },

  // ---------- acciones del ciclo comercial ----------
  async accionCotizacion(id: string, action: "aprobar" | "generar-ot"): Promise<ResultadoAccion> {
    const r = await post<PayloadAccion>(`/api/cotizaciones/${id}`, { action }, "PATCH");
    if (r.ok && r.data) {
      return {
        ok: true,
        msg: action === "aprobar" ? "Cotización aprobada." : "OT generada.",
        numero: action === "aprobar" ? r.data.numero_cotizacion : r.data.numero_ot,
      };
    }
    return { ok: false, msg: r.error || "No se pudo completar la acción." };
  },
};
