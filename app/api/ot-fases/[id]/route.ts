import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, duracion_real_minutos, operario_id } = body;

    const fase = await prisma.oTFase.update({
      where: { id },
      data: {
        ...(estado && { estado }),
        ...(operario_id && { operario_id }),
        ...(estado === "EN_EJECUCION" && { fecha_inicio_real: new Date() }),
        ...(estado === "TERMINADO" && {
          fecha_fin_real: new Date(),
          duracion_real_minutos: duracion_real_minutos || 45,
        }),
      },
    });

    return NextResponse.json({ success: true, fase });
  } catch (error) {
    console.error("Error al actualizar fase de OT:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la operación" },
      { status: 500 }
    );
  }
}
