import { z } from "zod";

/** Tipo de pieza: define la plantilla de hoja de ruta e inspección (diseño dashboard.html). */
export const tipoPiezaEnum = z.enum(["flange", "shaft", "plate"]);

export const NewSolicitudSchema = z.object({
  cliente_id: z.string().min(1, "Seleccioná el cliente"),
  contacto: z.string().trim().max(120).optional().or(z.literal("")),
  nombre_pieza: z.string().trim().min(2, "Indicá la denominación de la pieza"),
  tipo_pieza: tipoPiezaEnum,
  codigo_plano: z.string().trim().max(20).optional().or(z.literal("")),
  revision_plano: z.string().trim().max(5).optional().or(z.literal("")),
  material: z.string().trim().min(1, "Indicá el material"),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser mayor a cero").max(100000),
  fecha_esperada_entrega: z.coerce.date(),
  precio_unitario: z.coerce.number().min(0),
  requerimiento: z.string().trim().min(10, "Describí el trabajo solicitado por el cliente"),
});

export type NewSolicitudInput = z.infer<typeof NewSolicitudSchema>;
