import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NewSolicitudSchema } from "@/lib/validations/solicitud";
import { nextSolicitudNumero, nextCotizacionNumero } from "@/lib/seq";

// POST /api/solicitudes — crea el expediente comercial completo:
// Solicitud (RFQ) + Cotización pendiente + ítem + documentos + bitácora.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NewSolicitudSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: first?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const vendedor = await prisma.user.findFirst({
      where: { rol: "VENDEDOR" },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
    if (!vendedor) {
      return NextResponse.json(
        { success: false, error: "No hay un usuario VENDEDOR configurado" },
        { status: 500 }
      );
    }

    const jefeProduccion = await prisma.user.findFirst({
      where: { rol: "JEFE_PRODUCCION" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const numero_solicitud = await nextSolicitudNumero();
    const numero_cotizacion = await nextCotizacionNumero();
    const cantidad = d.cantidad;
    const precio_unitario = d.precio_unitario;
    const total = cantidad * precio_unitario;
    const now = new Date();
    const codigo_plano = d.codigo_plano?.trim() || null;
    const revision_plano = d.revision_plano?.trim() || "A";
    const contacto = d.contacto?.trim() || "—";
    const piezaTitulo = `${d.nombre_pieza} (${d.material}, plano ${codigo_plano ?? "s/código"} rev.${revision_plano})`;

    const resultado = await prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitud.create({
        data: {
          numero_solicitud,
          cliente_id: d.cliente_id,
          vendedor_id: vendedor.id,
          descripcion_pieza: d.requerimiento,
          nombre_pieza: d.nombre_pieza,
          codigo_plano,
          revision_plano,
          material: d.material,
          norma_material: "A determinar",
          tipo_pieza: d.tipo_pieza,
          cantidad,
          fecha_esperada_entrega: d.fecha_esperada_entrega,
          canal_contacto: "Registro manual",
          notas_comerciales: `Contacto: ${contacto}`,
          estado: "COTIZADA",
        },
      });

      const cotizacion = await tx.cotizacion.create({
        data: {
          numero_cotizacion,
          solicitud_id: solicitud.id,
          jefe_produccion_id: jefeProduccion?.id ?? vendedor.id,
          precio_final: total,
          estado: "LISTA_PARA_ENVIAR",
          validez_dias: 15,
        },
      });

      await tx.cotizacionItem.create({
        data: {
          cotizacion_id: cotizacion.id,
          numero_linea: 10,
          descripcion: piezaTitulo,
          cantidad,
          precio_unitario,
        },
      });

      await tx.documentoExpediente.create({
        data: {
          solicitud_id: solicitud.id,
          tipo: "SOL",
          titulo: `Solicitud de cliente ${numero_solicitud}`,
          etapa: "sol",
          sello: "RECIBIDO",
          emision: now,
          firmado_por: "Área Comercial",
        },
      });
      // El documento PLANO se crea si hay código; si el usuario adjunta archivo,
      // el cliente lo "completa" después con el archivo usando plano_documento_id.
      let plano_documento_id: string | null = null;
      if (codigo_plano) {
        const docPlano = await tx.documentoExpediente.create({
          data: {
            solicitud_id: solicitud.id,
            tipo: "PLANO",
            titulo: `Plano ${codigo_plano} rev.${revision_plano} — ${d.nombre_pieza}`,
            etapa: "sol",
            emision: now,
          },
        });
        plano_documento_id = docPlano.id;
      }
      await tx.documentoExpediente.create({
        data: {
          solicitud_id: solicitud.id,
          tipo: "COTD",
          numero: numero_cotizacion,
          titulo: `Cotización ${numero_cotizacion}`,
          etapa: "cot",
          emision: now,
        },
      });

      await tx.bitacoraEvento.createMany({
        data: [
          {
            solicitud_id: solicitud.id,
            fecha: now,
            actor: `Comercial — ${vendedor.name}`,
            texto: `Solicitud de cliente registrada (${numero_solicitud}). Expediente iniciado.`,
          },
          {
            solicitud_id: solicitud.id,
            fecha: now,
            actor: `Comercial — ${vendedor.name}`,
            texto: `Cotización ${numero_cotizacion} emitida y vinculada. Pendiente de aprobación del cliente.`,
          },
        ],
      });

      return {
        solicitud_id: solicitud.id,
        cotizacion_id: cotizacion.id,
        plano_documento_id,
        numero_solicitud,
        numero_cotizacion,
      };
    });

    return NextResponse.json({ success: true, ...resultado }, { status: 201 });
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar la solicitud" },
      { status: 500 }
    );
  }
}
