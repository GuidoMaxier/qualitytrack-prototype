import { prisma } from "@/lib/prisma";

// Secuencias de numeración de expedientes (formato consistente con seed v3):
//   Solicitud   → RFQ-2226
//   Cotizacion  → COT-2025-0319
//   OrdenTrabajo→ OT-2025-0105
// Si la tabla está vacía, se parte de un número inicial de referencia.

const pad4 = (n: number) => String(n).padStart(4, "0");

async function maxSuffix(
  rows: Array<{ numero: string }>,
  regex: RegExp
): Promise<{ max: number; found: boolean; sample?: string }> {
  let max = 0;
  let found = false;
  let sample: string | undefined;
  for (const r of rows) {
    const m = regex.exec(r.numero);
    if (m) {
      const v = parseInt(m[m.length - 1], 10);
      if (!found || v > max) {
        found = true;
        max = v;
        sample = r.numero;
      }
    }
  }
  return { max, found, sample };
}

export async function nextSolicitudNumero(): Promise<string> {
  const rows = await prisma.solicitud.findMany({ select: { numero_solicitud: true } });
  const { max, found } = await maxSuffix(
    rows.map((r) => ({ numero: r.numero_solicitud })),
    /^RFQ-(\d+)$/
  );
  return `RFQ-${found ? max + 1 : 2226}`;
}

export async function nextCotizacionNumero(): Promise<string> {
  const rows = await prisma.cotizacion.findMany({ select: { numero_cotizacion: true } });
  const { max, found, sample } = await maxSuffix(
    rows.map((r) => ({ numero: r.numero_cotizacion })),
    /^COT-(\d{4})-(\d{4})$/
  );
  const year = sample ? /^COT-(\d{4})-\d{4}$/.exec(sample)![1] : "2025";
  return `COT-${year}-${pad4(found ? max + 1 : 101)}`;
}

export async function nextOtNumero(): Promise<string> {
  const rows = await prisma.ordenTrabajo.findMany({ select: { numero_ot: true } });
  const { max, found, sample } = await maxSuffix(
    rows.map((r) => ({ numero: r.numero_ot })),
    /^OT-(\d{4})-(\d{4})$/
  );
  const year = sample ? /^OT-(\d{4})-\d{4}$/.exec(sample)![1] : "2025";
  return `OT-${year}-${pad4(found ? max + 1 : 101)}`;
}

export async function nextClienteCodigo(): Promise<string> {
  const rows = await prisma.cliente.findMany({ select: { codigo: true } });
  let max = 0;
  let found = false;
  for (const r of rows) {
    const m = r.codigo ? /^CLI-(\d+)$/.exec(r.codigo) : null;
    if (m) {
      const v = parseInt(m[1], 10);
      if (!found || v > max) {
        found = true;
        max = v;
      }
    }
  }
  return `CLI-${String(found ? max + 1 : 1).padStart(3, "0")}`;
}
