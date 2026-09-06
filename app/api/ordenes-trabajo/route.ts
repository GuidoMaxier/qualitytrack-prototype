import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({
      include: {
        cotizacion: {
          include: {
            solicitud: {
              include: {
                cliente: true,
              },
            },
            items: { orderBy: { numero_linea: "asc" } },
          },
        },
        fases: {
          include: {
            faseCatalogo: true,
            operario: {
              select: { id: true, name: true, rol: true },
            },
          },
          orderBy: { numero_secuencia: "asc" },
        },
        auditorias: {
          include: {
            checklistRespuestas: true,
            auditor: {
              select: { id: true, name: true },
            },
          },
          orderBy: { numero_auditoria: "asc" },
        },
        notas: {
          include: {
            usuario: {
              select: { id: true, name: true, rol: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        noConformidades: {
          select: {
            id: true,
            numero: true,
            estado: true,
            codigo_control: true,
            descripcion: true,
            disposicion: true,
            fecha_apertura: true,
            fecha_cierre: true,
          },
          orderBy: { fecha_apertura: "desc" },
        },
        documentos: {
          select: {
            id: true,
            tipo: true,
            numero: true,
            titulo: true,
            etapa: true,
            sello: true,
            emision: true,
            firmado_por: true,
            archivo_nombre: true,
            mime_type: true,
          },
          orderBy: { emision: "asc" },
        },
        eventos: {
          select: { id: true, fecha: true, actor: true, texto: true },
          orderBy: { fecha: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const solicitudes = await prisma.solicitud.findMany({
      where: { estado: "PENDIENTE_COTIZACION" },
      include: {
        cliente: true,
        vendedor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Expedientes comerciales (cotizaciones sin OT generada aún)
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { ordenTrabajo: { is: null } },
      include: {
        solicitud: {
          include: {
            cliente: true,
            _count: { select: { documentos: true, eventos: true } },
          },
        },
        items: { orderBy: { numero_linea: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Estadísticas
    const totalActivas = ordenes.filter((o) => o.estado !== "ENTREGADA").length;
    const enProduccion = ordenes.filter((o) => o.estado === "EN_PRODUCCION" || o.estado === "NO_CONFORME").length;
    const enCalidad = ordenes.filter((o) => o.estado === "EN_CALIDAD").length;
    const entregadas = ordenes.filter((o) => o.estado === "ENTREGADA").length;
    const noConformes = await prisma.noConformidad.count({ where: { estado: "ABIERTA" } });
    const cotizacionesPendientes = cotizaciones.filter((c) => c.estado !== "APROBADA").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalActivas,
        enProduccion,
        enCalidad,
        noConformes,
        entregadas,
        cotizacionesPendientes,
      },
      ordenes,
      cotizaciones,
      solicitudesPendientes: solicitudes,
    });
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar la base de datos" },
      { status: 500 }
    );
  }
}
