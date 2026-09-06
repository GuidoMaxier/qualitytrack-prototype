import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/documentos/[id]/archivo — sirve el archivo real adjunto (si existe)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.documentoExpediente.findUnique({
      where: { id },
      select: { archivo_bytes: true, mime_type: true, archivo_nombre: true },
    });

    if (!doc?.archivo_bytes) {
      return new NextResponse("Archivo no disponible", { status: 404 });
    }

    const buf = Buffer.from(doc.archivo_bytes);
    const name = encodeURIComponent(doc.archivo_nombre || "archivo");
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": doc.mime_type || "application/octet-stream",
        "Content-Length": String(buf.length),
        "Content-Disposition": `inline; filename*=UTF-8''${name}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al servir archivo:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
