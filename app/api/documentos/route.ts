import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (límite de body en serverless)

const str = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v.trim() : "");

// POST /api/documentos — adjunta un archivo a un documento del expediente.
// Multipart fields:
//   doc_id (opcional): si se pasa, completa (sube el archivo a) ese documento existente.
//   solicitud_id | orden_trabajo_id: destino si no hay doc_id (crea un documento nuevo).
//   tipo (PLANO, ET, CERT, ADJ…), etapa (sol|cot|ot|ruta|cal|ent), titulo (opcional), numero (opcional)
//   file: el archivo (requerido).
export async function POST(request: NextRequest) {
  try {
    const fd = await request.formData();
    const doc_id = str(fd.get("doc_id")) || null;
    const solicitud_id = str(fd.get("solicitud_id")) || null;
    const orden_trabajo_id = str(fd.get("orden_trabajo_id")) || null;
    const tipo = (str(fd.get("tipo")) || "ADJ").toUpperCase();
    const etapa = str(fd.get("etapa")) || "sol";
    const numero = str(fd.get("numero")) || null;
    const file = fd.get("file");

    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json({ success: false, error: "Adjuntá un archivo" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "El archivo supera los 4 MB" }, { status: 400 });
    }
    if (!doc_id && !solicitud_id && !orden_trabajo_id) {
      return NextResponse.json({ success: false, error: "Falta el destino del documento" }, { status: 400 });
    }

    const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await file.arrayBuffer());
    const titulo = str(fd.get("titulo")) || file.name;
    const now = new Date();

    const filas = await prisma.$transaction(async (tx) => {
      let data: {
        archivo_nombre: string;
        mime_type: string;
        archivo_bytes: Uint8Array<ArrayBuffer>;
      };
      if (doc_id) {
        const existente = await tx.documentoExpediente.findUnique({ where: { id: doc_id } });
        if (!existente) {
          return { error: "Documento no encontrado" };
        }
        data = { archivo_nombre: file.name, mime_type: file.type || "application/octet-stream", archivo_bytes: bytes };
        await tx.documentoExpediente.update({ where: { id: doc_id }, data });
        return { doc: { id: doc_id, tipo: existente.tipo, titulo: existente.titulo, etapa: existente.etapa, archivo_nombre: data.archivo_nombre, mime_type: data.mime_type } };
      }

      const doc = await tx.documentoExpediente.create({
        data: {
          solicitud_id,
          orden_trabajo_id,
          tipo,
          numero,
          titulo,
          etapa,
          sello: "RECIBIDO",
          emision: now,
          firmado_por: "Área Comercial",
          archivo_nombre: file.name,
          mime_type: file.type || "application/octet-stream",
          archivo_bytes: bytes,
        },
        select: { id: true, tipo: true, titulo: true, etapa: true, archivo_nombre: true, mime_type: true },
      });

      const destinoId = solicitud_id ?? orden_trabajo_id;
      if (destinoId) {
        await tx.bitacoraEvento.create({
          data: {
            solicitud_id: solicitud_id ?? null,
            orden_trabajo_id: orden_trabajo_id ?? null,
            fecha: now,
            actor: "Comercial — carga de archivo",
            texto: `Documento adjuntado al expediente: “${titulo}” (${file.name}).`,
          },
        });
      }
      return { doc };
    });

    if ("error" in filas) {
      return NextResponse.json({ success: false, error: filas.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, documento: filas.doc }, { status: 201 });
  } catch (error) {
    console.error("Error al adjuntar archivo:", error);
    return NextResponse.json({ success: false, error: "Error al adjuntar el archivo" }, { status: 500 });
  }
}
