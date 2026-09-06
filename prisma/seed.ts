import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";

// ---------------------------------------------------------------------------
// Seed maestro alineado con el prototipo design/dashboard.html (v3, 2025).
// Expone: 4 OTs (0104 en producción, 0103 en calidad, 0102 en despacho,
// 0101 entregada) + 2 expedientes comerciales sin OT (COT-2025-0089/0090),
// con documentos por etapa, bitácora, plan de inspección QL y entrega.
// ---------------------------------------------------------------------------

/** Convierte "2025-06-02 08:41" en Date UTC estable. */
const dt = (s: string) => new Date(`${s.replace(" ", "T")}:00.000Z`);

async function main() {
  console.log("🌱 Iniciando seed maestro (v3 · alineado a dashboard.html)...");

  // Limpieza inicial (orden: hijos → padres)
  await prisma.auditoriaChecklistRespuesta.deleteMany({});
  await prisma.auditoriaCalidad.deleteMany({});
  await prisma.noConformidad.deleteMany({});
  await prisma.documentoExpediente.deleteMany({});
  await prisma.bitacoraEvento.deleteMany({});
  await prisma.oTNota.deleteMany({});
  await prisma.oTFaseReasignacion.deleteMany({});
  await prisma.oTFase.deleteMany({});
  await prisma.ordenTrabajo.deleteMany({});
  await prisma.cotizacionItem.deleteMany({});
  await prisma.cotizacionFase.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  await prisma.adjunto.deleteMany({});
  await prisma.solicitud.deleteMany({});
  await prisma.faseOperarioHabilitado.deleteMany({});
  await prisma.faseCatalogo.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await hashPassword("Clave/123.");

  // Helper para crear usuario con Account de Better Auth
  async function createUserWithAuth(data: {
    name: string;
    email: string;
    rol: string;
    telefono: string;
    tipo_tarea: string;
  }) {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        rol: data.rol,
        telefono: data.telefono,
        tipo_tarea: data.tipo_tarea,
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: defaultHashedPassword,
        issuer: "local:credential",
      },
    });

    return user;
  }

  // 1. Usuarios (8) con clave universal "Clave/123."
  const gerente = await createUserWithAuth({
    name: "Ing. Roberto Mancini",
    email: "gerente@qualitytrack.com",
    rol: "GERENTE",
    telefono: "+54 11 4555-0101",
    tipo_tarea: "Dirección y Gestión Integral",
  });

  const jefeProd = await createUserWithAuth({
    name: "L. Godoy",
    email: "planificacion@qualitytrack.com",
    rol: "JEFE_PRODUCCION",
    telefono: "+54 11 4555-0102",
    tipo_tarea: "Planificación, Cotizaciones y Asignación",
  });

  const vendedor = await createUserWithAuth({
    name: "P. Lanza",
    email: "comercial@qualitytrack.com",
    rol: "VENDEDOR",
    telefono: "+54 11 4555-0103",
    tipo_tarea: "Gestión Comercial y Clientes",
  });

  const auditor = await createUserWithAuth({
    name: "A. Ríos",
    email: "calidad@qualitytrack.com",
    rol: "CALIDAD",
    telefono: "+54 11 4555-0104",
    tipo_tarea: "Auditoría, Ensayos y Plan de Inspección",
  });

  const opSuarez = await createUserWithAuth({
    name: "R. Suárez",
    email: "r.suarez@qualitytrack.com",
    rol: "OPERARIO",
    telefono: "+54 11 4555-0105",
    tipo_tarea: "Tornero / Operario Sierra CNC",
  });

  const opIbarra = await createUserWithAuth({
    name: "M. Ibarra",
    email: "m.ibarra@qualitytrack.com",
    rol: "OPERARIO",
    telefono: "+54 11 4555-0106",
    tipo_tarea: "Mecanizador CNC / Fresador Haas",
  });

  const opParedes = await createUserWithAuth({
    name: "J. Paredes",
    email: "j.paredes@qualitytrack.com",
    rol: "OPERARIO",
    telefono: "+54 11 4555-0107",
    tipo_tarea: "Taladrista Radial / Banco y Ajuste",
  });

  const opFerrer = await createUserWithAuth({
    name: "C. Ferrer",
    email: "c.ferrer@qualitytrack.com",
    rol: "OPERARIO",
    telefono: "+54 11 4555-0108",
    tipo_tarea: "Rectificador cilíndrico",
  });

  console.log("✓ Usuarios creados (8) con credenciales oficiales (Clave/123.).");

  // 2. Catálogo de Fases Industriales
  const fCorte = await prisma.faseCatalogo.create({
    data: { codigo: "CORTE", nombre: "Corte de materia prima", descripcion: "Corte en sierra cinta, plasma CNC o cizalla" },
  });
  const fTorneado = await prisma.faseCatalogo.create({
    data: { codigo: "TORNEADO_CNC", nombre: "Torneado CNC", descripcion: "Torneado OD, caras y roscado en torno CNC" },
  });
  const fFresado = await prisma.faseCatalogo.create({
    data: { codigo: "FRESADO_CNC", nombre: "Fresado y Ranurado", descripcion: "Centro de mecanizado Haas VF-4" },
  });
  const fTaladrado = await prisma.faseCatalogo.create({
    data: { codigo: "TALADRADO", nombre: "Taladrado radial", descripcion: "Taladro radial Ferrari 1.6 m" },
  });
  const fRectificado = await prisma.faseCatalogo.create({
    data: { codigo: "RECTIFICADO", nombre: "Rectificado cilíndrico", descripcion: "Rectificadora R-320 de precisión" },
  });
  const fAjuste = await prisma.faseCatalogo.create({
    data: { codigo: "AJUSTE", nombre: "Debaste, ajuste y marcado", descripcion: "Banco de ajuste y marcado de piezas" },
  });
  const fControlFinal = await prisma.faseCatalogo.create({
    data: { codigo: "CONTROL_FINAL", nombre: "Inspección dimensional final", descripcion: "Mesa de control de calidad" },
  });

  // Matriz de competencias consistente con las hojas de ruta sembradas
  await prisma.faseOperarioHabilitado.createMany({
    data: [
      { fase_catalogo_id: fCorte.id, operario_id: opSuarez.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fCorte.id, operario_id: opParedes.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fTorneado.id, operario_id: opIbarra.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fTorneado.id, operario_id: opSuarez.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fFresado.id, operario_id: opIbarra.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fTaladrado.id, operario_id: opParedes.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fRectificado.id, operario_id: opSuarez.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fRectificado.id, operario_id: opFerrer.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fAjuste.id, operario_id: opParedes.id, asignado_por_id: gerente.id },
      { fase_catalogo_id: fControlFinal.id, operario_id: auditor.id, asignado_por_id: gerente.id },
    ],
  });

  console.log("✓ Catálogo de fases y matriz de competencias creados.");

  // 3. Clientes (4)
  const cliDelta = await prisma.cliente.create({
    data: {
      codigo: "CLI-014",
      razon_social: "Metalúrgica Delta S.A.",
      contacto_nombre: "Ing. M. Ferrer",
      telefono: "+54 11 4788-9000",
      direccion: "Parque Industrial Norte, Lote 42",
      email: "compras@metaldelta.com.ar",
    },
  });

  const cliAgro = await prisma.cliente.create({
    data: {
      codigo: "CLI-022",
      razon_social: "AgroParts Ltd.",
      contacto_nombre: "Rta. Compras — S. Molina",
      telefono: "+54 341 555-7800",
      direccion: "Ruta 9 Km 280, Rosario",
      email: "smolina@agroparts.com",
    },
  });

  const cliHidro = await prisma.cliente.create({
    data: {
      codigo: "CLI-007",
      razon_social: "HidroSur S.R.L.",
      contacto_nombre: "Of. Técnica — D. Aguirre",
      telefono: "+54 299 444-1234",
      direccion: "Av. Del Valle 1250, Neuquén",
      email: "otecnica@hidrosur.com.ar",
    },
  });

  const cliTecnoFer = await prisma.cliente.create({
    data: {
      codigo: "CLI-031",
      razon_social: "TecnoFer S.A.",
      contacto_nombre: "Ing. R. Kaufmann",
      telefono: "+54 342 456-7800",
      direccion: "Ruta 11 Km 492, Esperanza",
      email: "rkaufmann@tecnofer.com",
    },
  });

  console.log("✓ Clientes industriales creados (4).");

  // Helpers de expediente (docs y bitácora se cuelgan del expediente raíz)
  type DocInput = {
    ordenTrabajoId?: string;
    solicitudId?: string;
    tipo: string;
    numero?: string;
    titulo: string;
    etapa: string;
    sello?: string;
    emision: string;
    firmado_por?: string;
  };

  const mkDocs = (rows: DocInput[]) =>
    prisma.documentoExpediente.createMany({
      data: rows.map((r) => ({
        orden_trabajo_id: r.ordenTrabajoId ?? null,
        solicitud_id: r.solicitudId ?? null,
        tipo: r.tipo,
        numero: r.numero ?? null,
        titulo: r.titulo,
        etapa: r.etapa,
        sello: r.sello ?? null,
        emision: dt(r.emision),
        firmado_por: r.firmado_por ?? null,
      })),
    });

  type EvInput = { ordenTrabajoId?: string; solicitudId?: string; fecha: string; actor: string; texto: string };

  const mkEventos = (rows: EvInput[]) =>
    prisma.bitacoraEvento.createMany({
      data: rows.map((r) => ({
        orden_trabajo_id: r.ordenTrabajoId ?? null,
        solicitud_id: r.solicitudId ?? null,
        fecha: dt(r.fecha),
        actor: r.actor,
        texto: r.texto,
      })),
    });

  // ============================================================
  // A) EXPEDIENTE COMERCIAL — COT-2025-0089 · cotización pendiente (TecnoFer)
  // ============================================================
  const sol0089 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2225",
      cliente_id: cliTecnoFer.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Carcasa de rodamiento PCM-40",
      codigo_plano: "CR-0902",
      revision_plano: "A",
      material: "GGG50",
      norma_material: "A determinar",
      tipo_pieza: "plate",
      descripcion_pieza:
        "Consultamos por 40 carcasas de rodamiento PCM-40 según plano CR-0902 para nueva línea de transporte. Material fundición nodular GGG50. Solicitamos cotización con entrega parcial en dos lotes.",
      cantidad: 40,
      fecha_esperada_entrega: dt("2025-07-15 00:00"),
      canal_contacto: "Correo electrónico",
      estado: "COTIZADA",
    },
  });

  const cot0089 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0318",
      solicitud_id: sol0089.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 4320000,
      estado: "LISTA_PARA_ENVIAR",
      validez_dias: 15,
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot0089.id,
      numero_linea: 10,
      descripcion: "Carcasa de rodamiento PCM-40 — GGG50, según plano CR-0902 rev.A",
      cantidad: 40,
      precio_unitario: 108000,
    },
  });

  await mkDocs([
    { solicitudId: sol0089.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2225", etapa: "sol", sello: "RECIBIDO", emision: "2025-06-09 09:20", firmado_por: "Área Comercial" },
    { solicitudId: sol0089.id, tipo: "PLANO", titulo: "Plano CR-0902 rev.A — Carcasa de rodamiento", etapa: "sol", emision: "2025-06-09 09:30" },
    { solicitudId: sol0089.id, tipo: "COTD", numero: "COT-2025-0318", titulo: "Cotización COT-2025-0318", etapa: "cot", emision: "2025-06-10 11:45" },
  ]);

  await mkEventos([
    { solicitudId: sol0089.id, fecha: "2025-06-09 09:20", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2225)." },
    { solicitudId: sol0089.id, fecha: "2025-06-10 11:45", actor: "Comercial — P. Lanza", texto: "Cotización COT-2025-0318 emitida. Pendiente de aprobación del cliente." },
  ]);

  // ============================================================
  // B) EXPEDIENTE COMERCIAL — COT-2025-0090 · cotización aprobada (AgroParts, lista para OT)
  // ============================================================
  const sol0090 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2221",
      cliente_id: cliAgro.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Piñón M4 Z=21",
      codigo_plano: "PN-0318",
      revision_plano: "A",
      material: "20MnCr5",
      norma_material: "A determinar",
      tipo_pieza: "shaft",
      descripcion_pieza:
        "Necesitamos 8 piñones módulo 4 Z=21 según plano PN-0318 para reposición de equipos de cosecha. Material 20MnCr5 con cementado. Urgente: parada de línea.",
      cantidad: 8,
      fecha_esperada_entrega: dt("2025-07-04 00:00"),
      canal_contacto: "Correo electrónico",
      estado: "COTIZADA",
    },
  });

  const cot0090 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0315",
      solicitud_id: sol0090.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 1975000,
      estado: "APROBADA",
      validez_dias: 10,
      fecha_envio_cliente: dt("2025-06-05 13:50"),
      fecha_respuesta_cliente: dt("2025-06-06 09:12"),
      aprobado_por_cliente: "Rta. Compras — S. Molina (cliente)",
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot0090.id,
      numero_linea: 10,
      descripcion: "Piñón M4 Z=21 — 20MnCr5, cementado, según plano PN-0318 rev.A",
      cantidad: 8,
      precio_unitario: 246875,
    },
  });

  await mkDocs([
    { solicitudId: sol0090.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2221", etapa: "sol", sello: "RECIBIDO", emision: "2025-06-05 08:10", firmado_por: "Área Comercial" },
    { solicitudId: sol0090.id, tipo: "PLANO", titulo: "Plano PN-0318 rev.A — Piñón M4 Z=21", etapa: "sol", emision: "2025-06-05 08:20" },
    { solicitudId: sol0090.id, tipo: "COTD", numero: "COT-2025-0315", titulo: "Cotización COT-2025-0315", etapa: "cot", emision: "2025-06-05 13:50" },
    { solicitudId: sol0090.id, tipo: "INF", titulo: "Conformidad de cliente — COT-2025-0315", etapa: "cot", sello: "APROBADO", emision: "2025-06-06 09:12", firmado_por: "Área Comercial" },
  ]);

  await mkEventos([
    { solicitudId: sol0090.id, fecha: "2025-06-05 08:10", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2221) — marcada urgente." },
    { solicitudId: sol0090.id, fecha: "2025-06-05 13:50", actor: "Comercial — P. Lanza", texto: "Cotización COT-2025-0315 emitida." },
    { solicitudId: sol0090.id, fecha: "2025-06-06 09:12", actor: "Cliente — S. Molina", texto: "Cotización aprobada por el cliente. Lista para generar Orden de Trabajo." },
  ]);

  // ============================================================
  // OT-2025-0104 · EN PRODUCCIÓN (Flanza de acople Ø220, AISI 4140)
  // ============================================================
  const sol104 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2214",
      cliente_id: cliDelta.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Flanza de acople Ø220",
      codigo_plano: "FL-1204",
      revision_plano: "C",
      material: "AISI 4140",
      norma_material: "EN 10204 · 3.1",
      tipo_pieza: "flange",
      descripcion_pieza:
        "Necesitamos la fabricación de 12 flanzas de acople según plano adjunto para línea de bombas serie 400. Material AISI 4140 con temple y revenido. Entrega requerida: 20/06. La certificación 3.1 de materia prima es requisito obligatorio de recepción.",
      cantidad: 12,
      fecha_esperada_entrega: dt("2025-06-20 00:00"),
      canal_contacto: "Correo electrónico",
      estado: "COTIZADA",
    },
  });

  const cot104 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0311",
      solicitud_id: sol104.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 2574000,
      estado: "APROBADA",
      validez_dias: 15,
      fecha_envio_cliente: dt("2025-06-03 16:05"),
      fecha_respuesta_cliente: dt("2025-06-04 10:22"),
      aprobado_por_cliente: "Ing. M. Ferrer (cliente)",
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot104.id,
      numero_linea: 10,
      descripcion: "Flanza de acople Ø220 — AISI 4140, c/ tratamiento 40–44 HRC, según plano FL-1204 rev.C",
      cantidad: 12,
      precio_unitario: 214500,
    },
  });

  const ot104 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0104",
      cotizacion_id: cot104.id,
      cantidad: 12,
      numero_colada: "88412",
      prioridad: "ALTA",
      estado: "EN_PRODUCCION",
      fecha_inicio_produccion: dt("2025-06-05 07:30"),
    },
  });

  await prisma.oTFase.createMany({
    data: [
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fCorte.id, numero_secuencia: 10, operario_id: opSuarez.id, maquinaria: "Sierra cinta HEM 260", tiempo_estimado_minutos: 45, duracion_real_minutos: 52, estado: "TERMINADO", fecha_inicio_real: dt("2025-06-05 07:30"), fecha_fin_real: dt("2025-06-05 08:22") },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 20, operario_id: opIbarra.id, maquinaria: "Torno CNC Gildemeister", tiempo_estimado_minutos: 120, duracion_real_minutos: 118, estado: "TERMINADO", fecha_inicio_real: dt("2025-06-05 08:30"), fecha_fin_real: dt("2025-06-05 10:28") },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 30, operario_id: opSuarez.id, maquinaria: "Torno CNC Gildemeister", tiempo_estimado_minutos: 90, duracion_real_minutos: 96, estado: "TERMINADO", fecha_inicio_real: dt("2025-06-05 12:11"), fecha_fin_real: dt("2025-06-05 13:47") },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fFresado.id, numero_secuencia: 40, operario_id: opIbarra.id, maquinaria: "Centro mecanizado Haas VF-4", tiempo_estimado_minutos: 75, estado: "EN_EJECUCION", fecha_inicio_real: dt("2025-06-06 08:05") },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fTaladrado.id, numero_secuencia: 50, operario_id: opParedes.id, maquinaria: "Taladro radial Ferrari 1.6 m", tiempo_estimado_minutos: 40, estado: "EN_COLA" },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fAjuste.id, numero_secuencia: 60, operario_id: opParedes.id, maquinaria: "Banco — prensa", tiempo_estimado_minutos: 25, estado: "EN_COLA" },
      { orden_trabajo_id: ot104.id, fase_catalogo_id: fControlFinal.id, numero_secuencia: 70, operario_id: auditor.id, maquinaria: "Mesa de control", tiempo_estimado_minutos: 30, estado: "EN_COLA" },
    ],
  });

  await prisma.oTNota.createMany({
    data: [
      { orden_trabajo_id: ot104.id, usuario_id: jefeProd.id, origen: "JEFE_PRODUCCION", contenido: "Verificar dureza tras tratamiento antes de continuar la secuencia." },
      { orden_trabajo_id: ot104.id, usuario_id: auditor.id, origen: "CALIDAD", contenido: "Conservar identificación de colada en cada pieza hasta la inspección final." },
      { orden_trabajo_id: ot104.id, usuario_id: jefeProd.id, origen: "JEFE_PRODUCCION", contenido: "Entregar con lazo de identificación individual por pieza." },
    ],
  });

  await mkDocs([
    { ordenTrabajoId: ot104.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2214", etapa: "sol", sello: "RECIBIDO", emision: "2025-06-02 08:41", firmado_por: "Área Comercial" },
    { ordenTrabajoId: ot104.id, tipo: "PLANO", titulo: "Plano FL-1204 rev.C — Flanza de acople", etapa: "sol", emision: "2025-06-02 08:45" },
    { ordenTrabajoId: ot104.id, tipo: "COTD", numero: "COT-2025-0311", titulo: "Cotización COT-2025-0311", etapa: "cot", emision: "2025-06-03 16:05" },
    { ordenTrabajoId: ot104.id, tipo: "CERT", titulo: "Certificado de materia prima — Colada 88412", etapa: "ot", emision: "2025-06-04 11:30" },
    { ordenTrabajoId: ot104.id, tipo: "OC", numero: "OC-4412", titulo: "Orden de compra OC-4412 — Metalúrgica Delta", etapa: "ot", emision: "2025-06-04 10:25" },
  ]);

  await mkEventos([
    { ordenTrabajoId: ot104.id, fecha: "2025-06-02 08:41", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2214) por correo electrónico." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-02 08:45", actor: "Ingeniería", texto: "Plano FL-1204 rev.C adjuntado al expediente." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-03 16:05", actor: "Comercial — P. Lanza", texto: "Cotización COT-2025-0311 emitida y enviada al cliente." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-04 10:22", actor: "Cliente — Ing. M. Ferrer", texto: "Cotización aprobada. Orden de compra OC-4412 recibida." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-04 11:30", actor: "Compras", texto: "Certificado de materia prima 3.1 — colada 88412 incorporado al expediente." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-05 07:30", actor: "Planificación — L. Godoy", texto: "Orden de Trabajo liberada a producción. Materia prima asignada (colada 88412)." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-05 07:58", actor: "Producción — R. Suárez", texto: "Operación 10 completada (Corte de materia prima) — 52 min / 45 std." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-05 10:12", actor: "Producción — M. Ibarra", texto: "Operación 20 completada (Torneado OD y caras) — 118 min / 120 std." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-05 13:47", actor: "Producción — R. Suárez", texto: "Operación 30 completada (Torneado interior y frente) — 96 min / 90 std." },
    { ordenTrabajoId: ot104.id, fecha: "2025-06-06 08:05", actor: "Producción — M. Ibarra", texto: "Operación 40 iniciada en Centro mecanizado Haas VF-4." },
  ]);

  // ============================================================
  // OT-2025-0103 · EN CONTROL DE CALIDAD (Eje excéntrico, 42CrMo4)
  // ============================================================
  const sol103 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2201",
      cliente_id: cliAgro.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Eje excéntrico",
      codigo_plano: "EX-0451",
      revision_plano: "A",
      material: "42CrMo4",
      norma_material: "EN 10204 · 3.1",
      tipo_pieza: "shaft",
      descripcion_pieza:
        "Fabricación de 4 ejes excéntricos para cabezal de cosechadora según plano EX-0451. Material 42CrMo4 con endurecimiento por inducción en zonas indicadas. Se requiere trazabilidad de colada y reporte de dureza.",
      cantidad: 4,
      fecha_esperada_entrega: dt("2025-06-18 00:00"),
      canal_contacto: "Portal de proveedores",
      estado: "COTIZADA",
    },
  });

  const cot103 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0298",
      solicitud_id: sol103.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 768000,
      estado: "APROBADA",
      validez_dias: 20,
      fecha_envio_cliente: dt("2025-05-27 15:30"),
      fecha_respuesta_cliente: dt("2025-05-29 09:40"),
      aprobado_por_cliente: "Rta. Compras — S. Molina (cliente)",
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot103.id,
      numero_linea: 10,
      descripcion: "Eje excéntrico — 42CrMo4, c/ endurecimiento por inducción, según plano EX-0451 rev.A",
      cantidad: 4,
      precio_unitario: 192000,
    },
  });

  const ot103 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0103",
      cotizacion_id: cot103.id,
      cantidad: 4,
      numero_colada: "88399",
      prioridad: "NORMAL",
      estado: "EN_CALIDAD",
      fecha_inicio_produccion: dt("2025-06-02 07:00"),
      fecha_pase_calidad: dt("2025-06-08 09:10"),
    },
  });

  await prisma.oTFase.createMany({
    data: [
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fCorte.id, numero_secuencia: 10, operario_id: opSuarez.id, maquinaria: "Sierra cinta HEM 260", tiempo_estimado_minutos: 30, duracion_real_minutos: 33, estado: "TERMINADO" },
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 20, operario_id: opSuarez.id, maquinaria: "Torno paralelo SOP-500", tiempo_estimado_minutos: 70, duracion_real_minutos: 74, estado: "TERMINADO" },
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 30, operario_id: opIbarra.id, maquinaria: "Torno CNC Gildemeister", tiempo_estimado_minutos: 110, duracion_real_minutos: 121, estado: "TERMINADO" },
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fFresado.id, numero_secuencia: 40, operario_id: opIbarra.id, maquinaria: "Fresadora Bridgeport", tiempo_estimado_minutos: 45, duracion_real_minutos: 41, estado: "TERMINADO" },
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fRectificado.id, numero_secuencia: 50, operario_id: opFerrer.id, maquinaria: "Rectificadora R-320", tiempo_estimado_minutos: 60, duracion_real_minutos: 58, estado: "TERMINADO" },
      { orden_trabajo_id: ot103.id, fase_catalogo_id: fControlFinal.id, numero_secuencia: 60, operario_id: auditor.id, maquinaria: "Mesa de control", tiempo_estimado_minutos: 30, duracion_real_minutos: 27, estado: "TERMINADO" },
    ],
  });

  // Ronda 1 de auditoría EN PROCESO: solo QL-01 respondido (CUMPLE)
  const audit103 = await prisma.auditoriaCalidad.create({
    data: {
      orden_trabajo_id: ot103.id,
      auditor_id: auditor.id,
      numero_auditoria: 1,
      resultado: "EN_PROCESO",
      observaciones_generales: "QL-01 conforme en las 4 piezas. Pendientes QL-02 (dureza) y QL-03 (acabado).",
      fecha_veredicto: dt("2025-06-09 11:20"),
    },
  });

  await prisma.auditoriaChecklistRespuesta.createMany({
    data: [
      { auditoria_id: audit103.id, item_numero: 1, codigo_item: "QL-01", criterio_nombre: "Control dimensional general", especificacion: "Según plano · ajustes k6", metodo: "Micrómetro, maura", resultado_item: "CUMPLE", observaciones: "Dimensional conforme en las 4 piezas. Primer artículo OK." },
      { auditoria_id: audit103.id, item_numero: 2, codigo_item: "QL-02", criterio_nombre: "Dureza tras tratamiento", especificacion: "58–62 HRC", metodo: "Durómetro Rockwell", resultado_item: null },
      { auditoria_id: audit103.id, item_numero: 3, codigo_item: "QL-03", criterio_nombre: "Acabado superficial rectificado", especificacion: "Ra ≤ 0.8 µm en asientos", metodo: "Rugosímetro", resultado_item: null },
    ],
  });

  await mkDocs([
    { ordenTrabajoId: ot103.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2201", etapa: "sol", sello: "RECIBIDO", emision: "2025-05-26 10:12", firmado_por: "Área Comercial" },
    { ordenTrabajoId: ot103.id, tipo: "PLANO", titulo: "Plano EX-0451 rev.A — Eje excéntrico", etapa: "sol", emision: "2025-05-26 10:20" },
    { ordenTrabajoId: ot103.id, tipo: "COTD", numero: "COT-2025-0298", titulo: "Cotización COT-2025-0298", etapa: "cot", emision: "2025-05-27 15:30" },
    { ordenTrabajoId: ot103.id, tipo: "CERT", titulo: "Certificado de materia prima — Colada 88399", etapa: "ot", emision: "2025-05-30 09:05" },
    { ordenTrabajoId: ot103.id, tipo: "OC", numero: "OC-4436", titulo: "Orden de compra OC-4436 — AgroParts", etapa: "ot", emision: "2025-05-29 09:45" },
  ]);

  await mkEventos([
    { ordenTrabajoId: ot103.id, fecha: "2025-05-26 10:12", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2201) por portal de proveedores." },
    { ordenTrabajoId: ot103.id, fecha: "2025-05-29 09:40", actor: "Cliente — S. Molina", texto: "Cotización aprobada. OC-4436 emitida por el cliente." },
    { ordenTrabajoId: ot103.id, fecha: "2025-06-02 07:00", actor: "Planificación — L. Godoy", texto: "Orden de Trabajo liberada a producción." },
    { ordenTrabajoId: ot103.id, fecha: "2025-06-06 16:20", actor: "Producción — C. Ferrer", texto: "Operación 50 completada (Rectificado cilíndrico) — 58 min / 60 std." },
    { ordenTrabajoId: ot103.id, fecha: "2025-06-08 09:10", actor: "Producción — A. Ríos", texto: "Operación 60 completada. Hoja de ruta finalizada — lote enviado a Control de Calidad." },
    { ordenTrabajoId: ot103.id, fecha: "2025-06-09 11:20", actor: "Calidad — A. Ríos", texto: "Inspección registrada: QL-01 — CONFORME. Pendiente QL-02 (dureza) y QL-03." },
  ]);

  // ============================================================
  // OT-2025-0102 · DESPACHO (Soporte de bomba, AISI 316L) — liberada por calidad
  // ============================================================
  const sol102 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2196",
      cliente_id: cliHidro.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Soporte de bomba",
      codigo_plano: "SB-0779",
      revision_plano: "B",
      material: "AISI 316L",
      norma_material: "EN 10204 · 3.1",
      tipo_pieza: "plate",
      descripcion_pieza:
        "Reposición anual de 25 soportes de bomba según plano SB-0779 rev.B. Material 316L para servicio con cloruros. Acabado pasivado no requerido.",
      cantidad: 25,
      fecha_esperada_entrega: dt("2025-06-12 00:00"),
      canal_contacto: "Correo electrónico",
      estado: "COTIZADA",
    },
  });

  const cot102 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0287",
      solicitud_id: sol102.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 1530000,
      estado: "APROBADA",
      validez_dias: 15,
      fecha_envio_cliente: dt("2025-05-21 14:20"),
      fecha_respuesta_cliente: dt("2025-05-23 12:10"),
      aprobado_por_cliente: "Of. Técnica — D. Aguirre (cliente)",
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot102.id,
      numero_linea: 10,
      descripcion: "Soporte de bomba — AISI 316L, según plano SB-0779 rev.B",
      cantidad: 25,
      precio_unitario: 61200,
    },
  });

  const ot102 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0102",
      cotizacion_id: cot102.id,
      cantidad: 25,
      numero_colada: "88020",
      prioridad: "NORMAL",
      estado: "DESPACHO",
      fecha_inicio_produccion: dt("2025-05-27 07:00"),
      fecha_pase_calidad: dt("2025-06-06 15:40"),
      fecha_pase_despacho: dt("2025-06-07 11:30"),
    },
  });

  await prisma.oTFase.createMany({
    data: [
      { orden_trabajo_id: ot102.id, fase_catalogo_id: fCorte.id, numero_secuencia: 10, operario_id: opParedes.id, maquinaria: "Plasma CNC Hypertherm", tiempo_estimado_minutos: 35, duracion_real_minutos: 38, estado: "TERMINADO" },
      { orden_trabajo_id: ot102.id, fase_catalogo_id: fFresado.id, numero_secuencia: 20, operario_id: opIbarra.id, maquinaria: "Centro mecanizado Haas VF-4", tiempo_estimado_minutos: 60, duracion_real_minutos: 57, estado: "TERMINADO" },
      { orden_trabajo_id: ot102.id, fase_catalogo_id: fFresado.id, numero_secuencia: 30, operario_id: opIbarra.id, maquinaria: "Centro mecanizado Haas VF-4", tiempo_estimado_minutos: 50, duracion_real_minutos: 46, estado: "TERMINADO" },
      { orden_trabajo_id: ot102.id, fase_catalogo_id: fAjuste.id, numero_secuencia: 40, operario_id: opParedes.id, maquinaria: "Banco — prensa", tiempo_estimado_minutos: 25, duracion_real_minutos: 22, estado: "TERMINADO" },
      { orden_trabajo_id: ot102.id, fase_catalogo_id: fControlFinal.id, numero_secuencia: 50, operario_id: auditor.id, maquinaria: "Mesa de control", tiempo_estimado_minutos: 25, duracion_real_minutos: 24, estado: "TERMINADO" },
    ],
  });

  const audit102 = await prisma.auditoriaCalidad.create({
    data: {
      orden_trabajo_id: ot102.id,
      auditor_id: auditor.id,
      numero_auditoria: 1,
      resultado: "CONFORME",
      observaciones_generales: "Plan de inspección completo y conforme. Lote liberado para entrega (CI-0254).",
      fecha_veredicto: dt("2025-06-07 11:02"),
    },
  });

  await prisma.auditoriaChecklistRespuesta.createMany({
    data: [
      { auditoria_id: audit102.id, item_numero: 1, codigo_item: "QL-01", criterio_nombre: "Control dimensional general", especificacion: "Según plano · posiciones de pasadas", metodo: "Calibre cota, galga", resultado_item: "CUMPLE", observaciones: "Posiciones y cotas conforme en muestra de 5/25." },
      { auditoria_id: audit102.id, item_numero: 2, codigo_item: "QL-02", criterio_nombre: "Rugosidad y planitud", especificacion: "Ra ≤ 3.2 µm · planitud 0.05 mm", metodo: "Rugosímetro, mármol", resultado_item: "CUMPLE", observaciones: "Rugosidad y planitud conformes." },
      { auditoria_id: audit102.id, item_numero: 3, codigo_item: "QL-03", criterio_nombre: "Inspección visual", especificacion: "Sin rebabas — marcado legible", metodo: "Visual", resultado_item: "CUMPLE", observaciones: "Visual conforme. Marcado legible en las 25 piezas." },
    ],
  });

  await mkDocs([
    { ordenTrabajoId: ot102.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2196", etapa: "sol", sello: "RECIBIDO", emision: "2025-05-20 09:30", firmado_por: "Área Comercial" },
    { ordenTrabajoId: ot102.id, tipo: "PLANO", titulo: "Plano SB-0779 rev.B — Soporte de bomba", etapa: "sol", emision: "2025-05-20 09:40" },
    { ordenTrabajoId: ot102.id, tipo: "COTD", numero: "COT-2025-0287", titulo: "Cotización COT-2025-0287", etapa: "cot", emision: "2025-05-21 14:20" },
    { ordenTrabajoId: ot102.id, tipo: "CERT", titulo: "Certificado de materia prima — Colada 88020", etapa: "ot", emision: "2025-05-23 16:00" },
    { ordenTrabajoId: ot102.id, tipo: "OC", numero: "OC-4421", titulo: "Orden de compra OC-4421 — HidroSur", etapa: "ot", emision: "2025-05-23 12:15" },
    { ordenTrabajoId: ot102.id, tipo: "QC", numero: "CI-0254", titulo: "Certificado interno de conformidad CI-0254", etapa: "cal", emision: "2025-06-07 11:30", firmado_por: "Calidad — A. Ríos" },
  ]);

  await mkEventos([
    { ordenTrabajoId: ot102.id, fecha: "2025-05-20 09:30", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2196)." },
    { ordenTrabajoId: ot102.id, fecha: "2025-05-27 07:00", actor: "Planificación — L. Godoy", texto: "Orden de Trabajo liberada a producción." },
    { ordenTrabajoId: ot102.id, fecha: "2025-06-06 15:40", actor: "Producción — M. Ibarra", texto: "Hoja de ruta finalizada — lote enviado a Control de Calidad." },
    { ordenTrabajoId: ot102.id, fecha: "2025-06-07 11:02", actor: "Calidad — A. Ríos", texto: "Plan de inspección completo: QL-01, QL-02 y QL-03 conformes." },
    { ordenTrabajoId: ot102.id, fecha: "2025-06-07 11:30", actor: "Calidad — A. Ríos", texto: "Lote de 25 piezas liberado para entrega. Certificado interno CI-0254 emitido." },
  ]);

  // ============================================================
  // OT-2025-0101 · ENTREGADA (expediente cerrado — demo histórica, C45)
  // ============================================================
  const sol101 = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2189",
      cliente_id: cliDelta.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Flanza de acople Ø180",
      codigo_plano: "FL-1180",
      revision_plano: "B",
      material: "C45",
      norma_material: "EN 10204 · 3.1",
      tipo_pieza: "flange",
      descripcion_pieza:
        "Fabricación de 30 flanzas de acople Ø180 según plano FL-1180 rev.B para stock de mantenimiento. Material C45. Entrega antes de fin de mayo.",
      cantidad: 30,
      fecha_esperada_entrega: dt("2025-05-28 00:00"),
      canal_contacto: "Correo electrónico",
      estado: "COTIZADA",
    },
  });

  const cot101 = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0267",
      solicitud_id: sol101.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 2760000,
      estado: "APROBADA",
      validez_dias: 15,
      fecha_envio_cliente: dt("2025-04-23 15:45"),
      fecha_respuesta_cliente: dt("2025-04-25 11:05"),
      aprobado_por_cliente: "Ing. M. Ferrer (cliente)",
    },
  });

  await prisma.cotizacionItem.create({
    data: {
      cotizacion_id: cot101.id,
      numero_linea: 10,
      descripcion: "Flanza de acople Ø180 — C45, según plano FL-1180 rev.B",
      cantidad: 30,
      precio_unitario: 92000,
    },
  });

  const ot101 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0101",
      cotizacion_id: cot101.id,
      cantidad: 30,
      numero_colada: "87902",
      prioridad: "NORMAL",
      estado: "ENTREGADA",
      fecha_inicio_produccion: dt("2025-04-29 07:00"),
      fecha_pase_calidad: dt("2025-05-23 12:00"),
      fecha_pase_despacho: dt("2025-05-25 10:00"),
      fecha_entrega: dt("2025-05-27 16:30"),
      receptor_nombre: "Almacén — Metalúrgica Delta",
      numero_remito: "REM-2025-0188",
      numero_factura: "A 0021-00457",
    },
  });

  // Flanza Ø180: 7 operaciones completadas (actuales según diseño)
  await prisma.oTFase.createMany({
    data: [
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fCorte.id, numero_secuencia: 10, operario_id: opSuarez.id, maquinaria: "Sierra cinta HEM 260", tiempo_estimado_minutos: 45, duracion_real_minutos: 48, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 20, operario_id: opIbarra.id, maquinaria: "Torno CNC Gildemeister", tiempo_estimado_minutos: 120, duracion_real_minutos: 112, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fTorneado.id, numero_secuencia: 30, operario_id: opSuarez.id, maquinaria: "Torno CNC Gildemeister", tiempo_estimado_minutos: 90, duracion_real_minutos: 88, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fFresado.id, numero_secuencia: 40, operario_id: opIbarra.id, maquinaria: "Centro mecanizado Haas VF-4", tiempo_estimado_minutos: 75, duracion_real_minutos: 71, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fTaladrado.id, numero_secuencia: 50, operario_id: opParedes.id, maquinaria: "Taladro radial Ferrari 1.6 m", tiempo_estimado_minutos: 40, duracion_real_minutos: 36, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fAjuste.id, numero_secuencia: 60, operario_id: opParedes.id, maquinaria: "Banco — prensa", tiempo_estimado_minutos: 25, duracion_real_minutos: 20, estado: "TERMINADO" },
      { orden_trabajo_id: ot101.id, fase_catalogo_id: fControlFinal.id, numero_secuencia: 70, operario_id: auditor.id, maquinaria: "Mesa de control", tiempo_estimado_minutos: 30, duracion_real_minutos: 28, estado: "TERMINADO" },
    ],
  });

  const audit101 = await prisma.auditoriaCalidad.create({
    data: {
      orden_trabajo_id: ot101.id,
      auditor_id: auditor.id,
      numero_auditoria: 1,
      resultado: "CONFORME",
      observaciones_generales: "Plan de inspección completo y conforme. Lote liberado (CI-0241).",
      fecha_veredicto: dt("2025-05-23 12:00"),
    },
  });

  await prisma.auditoriaChecklistRespuesta.createMany({
    data: [
      { auditoria_id: audit101.id, item_numero: 1, codigo_item: "QL-01", criterio_nombre: "Control dimensional general", especificacion: "Según plano · ISO 2768-mK", metodo: "Calibre, micrómetro, comparador", resultado_item: "CUMPLE", observaciones: "Dimensional conforme. Muestreo 8/30 + primeros y últimos." },
      { auditoria_id: audit101.id, item_numero: 2, codigo_item: "QL-02", criterio_nombre: "Dureza superficial", especificacion: "40–44 HRC", metodo: "Durómetro Rockwell", resultado_item: "CUMPLE", observaciones: "Dureza conforme 42 HRC promedio." },
      { auditoria_id: audit101.id, item_numero: 3, codigo_item: "QL-03", criterio_nombre: "Inspección visual y acabado", especificacion: "Sin rebabas ni marcas de herramienta", metodo: "Visual — lupa 10×", resultado_item: "CUMPLE", observaciones: "Visual y acabado conformes." },
    ],
  });

  await mkDocs([
    { ordenTrabajoId: ot101.id, tipo: "SOL", titulo: "Solicitud de cliente RFQ-2189", etapa: "sol", sello: "RECIBIDO", emision: "2025-04-22 08:55", firmado_por: "Área Comercial" },
    { ordenTrabajoId: ot101.id, tipo: "PLANO", titulo: "Plano FL-1180 rev.B — Flanza de acople", etapa: "sol", emision: "2025-04-22 09:05" },
    { ordenTrabajoId: ot101.id, tipo: "COTD", numero: "COT-2025-0267", titulo: "Cotización COT-2025-0267", etapa: "cot", emision: "2025-04-23 15:45" },
    { ordenTrabajoId: ot101.id, tipo: "CERT", titulo: "Certificado de materia prima — Colada 87902", etapa: "ot", emision: "2025-04-25 14:20" },
    { ordenTrabajoId: ot101.id, tipo: "OC", numero: "OC-4388", titulo: "Orden de compra OC-4388 — Metalúrgica Delta", etapa: "ot", emision: "2025-04-25 11:10" },
    { ordenTrabajoId: ot101.id, tipo: "QC", numero: "CI-0241", titulo: "Certificado interno de conformidad CI-0241", etapa: "cal", emision: "2025-05-23 12:00", firmado_por: "Calidad — A. Ríos" },
    { ordenTrabajoId: ot101.id, tipo: "REM", numero: "REM-2025-0188", titulo: "Remito REM-2025-0188", etapa: "ent", emision: "2025-05-27 16:30", firmado_por: "Almacén — Metalúrgica Delta" },
    { ordenTrabajoId: ot101.id, tipo: "FAC", numero: "A 0021-00457", titulo: "Factura A 0021-00457", etapa: "ent", emision: "2025-05-27 16:35" },
  ]);

  await mkEventos([
    { ordenTrabajoId: ot101.id, fecha: "2025-04-22 08:55", actor: "Comercial — P. Lanza", texto: "Solicitud de cliente recibida (RFQ-2189)." },
    { ordenTrabajoId: ot101.id, fecha: "2025-04-25 11:05", actor: "Cliente — Ing. M. Ferrer", texto: "Cotización aprobada. OC-4388 recibida." },
    { ordenTrabajoId: ot101.id, fecha: "2025-04-29 07:00", actor: "Planificación — L. Godoy", texto: "Orden de Trabajo liberada a producción." },
    { ordenTrabajoId: ot101.id, fecha: "2025-05-21 14:15", actor: "Producción — M. Ibarra", texto: "Hoja de ruta finalizada — lote enviado a Control de Calidad." },
    { ordenTrabajoId: ot101.id, fecha: "2025-05-23 12:00", actor: "Calidad — A. Ríos", texto: "Plan de inspección completo conforme. Lote liberado (CI-0241)." },
    { ordenTrabajoId: ot101.id, fecha: "2025-05-27 16:30", actor: "Despacho — V. Sanz", texto: "Entrega registrada. Remito REM-2025-0188 firmado por el cliente." },
    { ordenTrabajoId: ot101.id, fecha: "2025-05-27 16:35", actor: "Administración", texto: "Factura A 0021-00457 emitida y vinculada al expediente. Expediente cerrado." },
  ]);

  console.log("✅ Seed maestro v3 completado: 4 OTs + 2 expedientes comerciales, con hoja de ruta, QA, documentos y bitácora.");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
