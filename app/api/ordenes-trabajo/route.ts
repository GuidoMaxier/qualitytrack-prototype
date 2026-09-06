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
        },
        notas: {
          include: {
            usuario: {
              select: { id: true, name: true, rol: true },
            },
          },
          orderBy: { createdAt: "desc" },
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

    // Estadísticas
    const totalActivas = ordenes.filter((o) => o.estado !== "ENTREGADA").length;
    const enProduccion = ordenes.filter((o) => o.estado === "EN_PRODUCCION" || o.estado === "NO_CONFORME").length;
    const enCalidad = ordenes.filter((o) => o.estado === "EN_CALIDAD").length;
    const entregadas = ordenes.filter((o) => o.estado === "ENTREGADA").length;
    const noConformes = ordenes.filter((o) => o.estado === "NO_CONFORME").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalActivas,
        enProduccion,
        enCalidad,
        noConformes,
        entregadas,
        cotizacionesPendientes: solicitudes.length,
      },
      ordenes,
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
