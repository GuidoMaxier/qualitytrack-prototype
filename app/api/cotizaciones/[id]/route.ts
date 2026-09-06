import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextOtNumero } from "@/lib/seq";

// Plantillas de hoja de ruta por tipo de pieza (diseño dashboard.html).
// Cada operación: [codigo de fase, máquina, tiempo estándar (min), email del operario].
const PLANTILLAS: Record<string, Array<[string, string, number, string]>> = {
  flange: [
    ["CORTE", "Sierra cinta HEM 260", 45, "r.suarez@qualitytrack.com"],
    ["TORNEADO_CNC", "Torno CNC Gildemeister", 120, "m.ibarra@qualitytrack.com"],
    ["TORNEADO_CNC", "Torno CNC Gildemeister", 90, "r.suarez@qualitytrack.com"],
    ["FRESADO_CNC", "Centro mecanizado Haas VF-4", 75, "m.ibarra@qualitytrack.com"],
    ["TALADRADO", "Taladro radial Ferrari 1.6 m", 40, "j.paredes@qualitytrack.com"],
    ["AJUSTE", "Banco — prensa", 25, "j.paredes@qualitytrack.com"],
    ["CONTROL_FINAL", "Mesa de control", 30, "calidad@qualitytrack.com"],
  ],
  shaft: [
    ["CORTE", "Sierra cinta HEM 260", 30, "r.suarez@qualitytrack.com"],
    ["TORNEADO_CNC", "Torno paralelo SOP-500", 70, "r.suarez@qualitytrack.com"],
    ["TORNEADO_CNC", "Torno CNC Gildemeister", 110, "m.ibarra@qualitytrack.com"],
    ["FRESADO_CNC", "Fresadora Bridgeport", 45, "m.ibarra@qualitytrack.com"],
    ["RECTIFICADO", "Rectificadora R-320", 60, "c.ferrer@qualitytrack.com"],
    ["CONTROL_FINAL", "Mesa de control", 30, "calidad@qualitytrack.com"],
  ],
  plate: [
    ["CORTE", "Plasma CNC Hypertherm", 35, "j.paredes@qualitytrack.com"],
    ["FRESADO_CNC", "Centro mecanizado Haas VF-4", 60, "m.ibarra@qualitytrack.com"],
    ["FRESADO_CNC", "Centro mecanizado Haas VF-4", 50, "m.ibarra@qualitytrack.com"],
    ["AJUSTE", "Banco — prensa", 25, "j.paredes@qualitytrack.com"],
    ["CONTROL_FINAL", "Mesa de control", 25, "calidad@qualitytrack.com"],
  ],
};

// PATCH /api/cotizaciones/[id] — acciones del ciclo comercial:
//   { action: "aprobar" }    → aprueba la cotización (registra conformidad + bitácora)
//   { action: "generar-ot" } → genera la Orden de Trabajo con su hoja de ruta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action: string = body?.action;

    if (action === "aprobar") {
      const cotizacion = await prisma.cotizacion.findUnique({
        where: { id },
        include: { solicitud: true },
      });
      if (!cotizacion) {
        return NextResponse.json({ success: false, error: "Cotización no encontrada" }, { status: 404 });
      }
      if (cotizacion.estado === "APROBADA") {
        return NextResponse.json({ success: true, yaAprobada: true, numero_cotizacion: cotizacion.numero_cotizacion });
      }

      const now = new Date();
      const vendedor = await prisma.user.findFirst({
        where: { rol: "VENDEDOR" },
        select: { name: true },
        orderBy: { createdAt: "asc" },
      });
      const actor = vendedor ? `Comercial — ${vendedor.name}` : "Comercial";

      await prisma.$transaction(async (tx) => {
        await tx.cotizacion.update({
          where: { id },
          data: {
            estado: "APROBADA",
            fecha_envio_cliente: cotizacion.fecha_envio_cliente ?? now,
            fecha_respuesta_cliente: now,
            aprobado_por_cliente: `${actor} (registro en representación del cliente)`,
          },
        });
        await tx.documentoExpediente.create({
          data: {
            solicitud_id: cotizacion.solicitud_id,
            tipo: "INF",
            titulo: `Conformidad de cliente — ${cotizacion.numero_cotizacion}`,
            etapa: "cot",
            sello: "APROBADO",
            emision: now,
            firmado_por: "Área Comercial",
          },
        });
        await tx.bitacoraEvento.create({
          data: {
            solicitud_id: cotizacion.solicitud_id,
            fecha: now,
            actor,
            texto: `Cotización ${cotizacion.numero_cotizacion} aprobada. Se habilita la generación de la Orden de Trabajo.`,
          },
        });
      });

      return NextResponse.json({ success: true, numero_cotizacion: cotizacion.numero_cotizacion });
    }

    if (action === "generar-ot") {
      const cotizacion = await prisma.cotizacion.findUnique({
        where: { id },
        include: { solicitud: true },
      });
      if (!cotizacion) {
        return NextResponse.json({ success: false, error: "Cotización no encontrada" }, { status: 404 });
      }
      if (cotizacion.estado !== "APROBADA") {
        return NextResponse.json(
          { success: false, error: "La cotización debe estar aprobada para generar la OT" },
          { status: 409 }
        );
      }
      const existente = await prisma.ordenTrabajo.findUnique({ where: { cotizacion_id: id }, select: { numero_ot: true } });
      if (existente) {
        return NextResponse.json(
          { success: false, error: `La cotización ya fue convertida en ${existente.numero_ot}` },
          { status: 409 }
        );
      }

      const kind = cotizacion.solicitud.tipo_pieza ?? "flange";
      const plantilla = PLANTILLAS[kind];
      const emails = [...new Set(plantilla.map((r) => r[3]))];
      const usuarios = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
      const usuarioPorEmail = new Map(usuarios.map((u) => [u.email, u.id]));
      const faltantes = emails.filter((e) => !usuarioPorEmail.has(e));
      if (faltantes.length) {
        return NextResponse.json(
          { success: false, error: `Faltan operarios configurados: ${faltantes.join(", ")}` },
          { status: 500 }
        );
      }

      const codigosFase = [...new Set(plantilla.map((r) => r[0]))];
      const fases = await prisma.faseCatalogo.findMany({ where: { codigo: { in: codigosFase } }, select: { id: true, codigo: true } });
      const fasePorCodigo = new Map(fases.map((f) => [f.codigo, f.id]));
      const faseFaltante = codigosFase.find((c) => !fasePorCodigo.has(c));
      if (faseFaltante) {
        return NextResponse.json(
          { success: false, error: `Falta la fase de catálogo: ${faseFaltante}` },
          { status: 500 }
        );
      }

      const numero_ot = await nextOtNumero();
      const now = new Date();
      const jefe = await prisma.user.findFirst({ where: { rol: "JEFE_PRODUCCION" }, select: { id: true, name: true } });
      const auditor = await prisma.user.findFirst({ where: { rol: "CALIDAD" }, select: { id: true } });
      const textoUrgente = `${cotizacion.solicitud.descripcion_pieza} ${cotizacion.solicitud.nombre_pieza ?? ""}`;
      const prioridad = /rgente/i.test(textoUrgente) ? "ALTA" : "NORMAL";

      await prisma.$transaction(async (tx) => {
        const ot = await tx.ordenTrabajo.create({
          data: {
            numero_ot,
            cotizacion_id: id,
            cantidad: cotizacion.solicitud.cantidad,
            prioridad,
            estado: "EN_PRODUCCION",
            fecha_inicio_produccion: now,
          },
        });

        await tx.oTFase.createMany({
          data: plantilla.map(([codigo, maquinaria, std], i) => ({
            orden_trabajo_id: ot.id,
            fase_catalogo_id: fasePorCodigo.get(codigo)!,
            numero_secuencia: (i + 1) * 10,
            operario_id: usuarioPorEmail.get(plantilla[i][3])!,
            maquinaria,
            tiempo_estimado_minutos: std,
            estado: "EN_COLA",
          })),
        });

        // Transfiere SOL / PLANO / COTD / INF al nuevo expediente de producción
        const docsOrigen = await tx.documentoExpediente.findMany({
          where: { solicitud_id: cotizacion.solicitud_id, tipo: { in: ["SOL", "PLANO", "COTD", "INF"] } },
        });
        if (docsOrigen.length) {
          await tx.documentoExpediente.createMany({
            data: docsOrigen.map((doc) => ({
              orden_trabajo_id: ot.id,
              tipo: doc.tipo,
              numero: doc.numero,
              titulo: doc.titulo,
              etapa: doc.etapa,
              sello: doc.sello,
              emision: doc.emision,
              firmado_por: doc.firmado_por,
            })),
          });
        }

        if (jefe && auditor) {
          await tx.oTNota.createMany({
            data: [
              { orden_trabajo_id: ot.id, usuario_id: jefe.id, origen: "JEFE_PRODUCCION", contenido: "Verificar plano y revisión vigente antes de iniciar." },
              { orden_trabajo_id: ot.id, usuario_id: auditor.id, origen: "CALIDAD", contenido: "Conservar identificación de material y colada en todo el proceso." },
            ],
          });
        }

        await tx.bitacoraEvento.createMany({
          data: [
            {
              orden_trabajo_id: ot.id,
              fecha: now,
              actor: "sistema",
              texto: `Expediente generado automáticamente a partir de la solicitud ${cotizacion.solicitud.numero_solicitud} y la cotización aprobada ${cotizacion.numero_cotizacion}.`,
            },
            {
              orden_trabajo_id: ot.id,
              fecha: now,
              actor: jefe ? `Planificación — ${jefe.name}` : "Planificación",
              texto: `Orden de Trabajo ${numero_ot} generada y puesta en cola de producción.`,
            },
          ],
        });
      });

      return NextResponse.json({ success: true, numero_ot });
    }

    return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error al procesar la cotización:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}
