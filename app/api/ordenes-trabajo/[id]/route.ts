import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, fecha_entrega, receptor_nombre } = body;

    const otActualizada = await prisma.ordenTrabajo.update({
      where: { id },
      data: {
        ...(estado && { estado }),
        ...(fecha_entrega && { fecha_entrega: new Date(fecha_entrega) }),
        ...(receptor_nombre && { receptor_nombre }),
        ...(estado === "EN_CALIDAD" && { fecha_pase_calidad: new Date() }),
        ...(estado === "DESPACHO" && { fecha_pase_despacho: new Date() }),
      },
    });

    return NextResponse.json({ success: true, ordenTrabajo: otActualizada });
  } catch (error) {
    console.error("Error al actualizar estado de OT:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la orden de trabajo" },
      { status: 500 }
    );
  }
}
