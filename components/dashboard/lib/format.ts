// Formateadores comunes del dashboard.

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2025-06-20T00:00:00.000Z" → "20.06.2025" ; vacío → "—" */
export function fmtFecha(s?: string | null): string {
  if (!s) return "—";
  const [y, m, d] = s.slice(0, 10).split("-");
  if (!y || !m || !d) return s.slice(0, 10);
  return `${d}.${m}.${y}`;
}

/** "2025-06-20T08:41:00.000Z" → "20.06.2025 08:41" ; vacío → "—" */
export function fmtFechaHora(s?: string | null): string {
  if (!s) return "—";
  const fecha = fmtFecha(s);
  const t = s.slice(11, 16);
  return t ? `${fecha} ${t}` : fecha;
}

export function fmtMoney(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "—";
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  return "$ " + v.toLocaleString("es-AR");
}

/** minutos → "118′" ; null → "—" */
export function fmtMin(m: number | null | undefined): string {
  return m == null ? "—" : `${m}′`;
}

/** Fecha local en formato input date (YYYY-MM-DD), con desplazamiento opcional en días. */
export function hoyISO(offsetDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
