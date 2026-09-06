import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nextClienteCodigo } from "@/lib/seq";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { activo: true },
      select: {
        id: true,
        codigo: true,
        razon_social: true,
        contacto_nombre: true,
        email: true,
      },
      orderBy: { razon_social: "asc" },
    });

    return NextResponse.json({ success: true, clientes });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar la base de datos" },
      { status: 500 }
    );
  }
}

const NewClienteSchema = z.object({
  razon_social: z.string().trim().min(2, "Indicá la razón social del cliente"),
  contacto_nombre: z.string().trim().min(1, "Indicá el nombre del contacto"),
  telefono: z.string().trim().optional().or(z.literal("")),
  direccion: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
});

// POST /api/clientes — alta rápida de cliente (nuevo, aún sin expedientes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NewClienteSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: first?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const codigo = await nextClienteCodigo();
    const cliente = await prisma.cliente.create({
      data: {
        codigo,
        razon_social: d.razon_social,
        contacto_nombre: d.contacto_nombre,
        telefono: d.telefono?.trim() || "—",
        direccion: d.direccion?.trim() || "—",
        email: d.email?.trim() || null,
      },
      select: { id: true, codigo: true, razon_social: true, contacto_nombre: true },
    });
    return NextResponse.json({ success: true, cliente }, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar el cliente" },
      { status: 500 }
    );
  }
}
