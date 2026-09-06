import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed de datos industriales de QualityTrack...");

  // 1. Limpiar datos existentes (en orden inverso de dependencias)
  await prisma.auditoriaChecklistRespuesta.deleteMany({});
  await prisma.auditoriaCalidad.deleteMany({});
  await prisma.oTNota.deleteMany({});
  await prisma.oTFaseReasignacion.deleteMany({});
  await prisma.oTFase.deleteMany({});
  await prisma.ordenTrabajo.deleteMany({});
  await prisma.cotizacionFase.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  await prisma.adjunto.deleteMany({});
  await prisma.solicitud.deleteMany({});
  await prisma.faseOperarioHabilitado.deleteMany({});
  await prisma.faseCatalogo.deleteMany({});
  await prisma.cliente.deleteMany({});

  // 2. Usuarios del sistema (los 5 roles)
  await prisma.user.upsert({
    where: { email: "gerente@qualitytrack.com" },
    update: {},
    create: {
      name: "Ing. Roberto Mancini",
      email: "gerente@qualitytrack.com",
      rol: "GERENTE",
      telefono: "+54 11 4555-0101",
    },
  });

  const jefeProd = await prisma.user.upsert({
    where: { email: "planificacion@qualitytrack.com" },
    update: {},
    create: {
      name: "L. Godoy",
      email: "planificacion@qualitytrack.com",
      rol: "JEFE_PRODUCCION",
      telefono: "+54 11 4555-0102",
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: "comercial@qualitytrack.com" },
    update: {},
    create: {
      name: "P. Lanza",
      email: "comercial@qualitytrack.com",
      rol: "VENDEDOR",
      telefono: "+54 11 4555-0103",
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: "calidad@qualitytrack.com" },
    update: {},
    create: {
      name: "A. Ríos",
      email: "calidad@qualitytrack.com",
      rol: "CALIDAD",
      telefono: "+54 11 4555-0104",
    },
  });

  const opSuarez = await prisma.user.upsert({
    where: { email: "r.suarez@qualitytrack.com" },
    update: {},
    create: {
      name: "R. Suárez",
      email: "r.suarez@qualitytrack.com",
      rol: "OPERARIO",
      tipo_tarea: "Tornero / Operario Sierra",
      telefono: "+54 11 4555-0105",
    },
  });

  const opIbarra = await prisma.user.upsert({
    where: { email: "m.ibarra@qualitytrack.com" },
    update: {},
    create: {
      name: "M. Ibarra",
      email: "m.ibarra@qualitytrack.com",
      rol: "OPERARIO",
      tipo_tarea: "Mecanizador CNC / Fresador",
      telefono: "+54 11 4555-0106",
    },
  });

  const opParedes = await prisma.user.upsert({
    where: { email: "j.paredes@qualitytrack.com" },
    update: {},
    create: {
      name: "J. Paredes",
      email: "j.paredes@qualitytrack.com",
      rol: "OPERARIO",
      tipo_tarea: "Taladrista / Banco y Ajuste",
      telefono: "+54 11 4555-0107",
    },
  });

  console.log("✓ Usuarios con los 5 roles creados.");

  // 3. Catálogo de Fases Industriales
  const fCorte = await prisma.faseCatalogo.create({
    data: { codigo: "CORTE", nombre: "Corte de materia prima", descripcion: "Corte en sierra cinta o plasma CNC" },
  });
  const fTorneado = await prisma.faseCatalogo.create({
    data: { codigo: "TORNEADO_CNC", nombre: "Torneado CNC", descripcion: "Torneado OD, caras y roscado en torno CNC" },
  });
  const fFresado = await prisma.faseCatalogo.create({
    data: { codigo: "FRESADO_CNC", nombre: "Fresado y Ranurado", descripcion: "Centro de mecanizado Haas VF-4" },
  });
  const fTaladrado = await prisma.faseCatalogo.create({
    data: { codigo: "TALADRADO", nombre: "Taladrado radial", descripcion: "Taladro radial Ferrari 1.6m" },
  });
  const fRectificado = await prisma.faseCatalogo.create({
    data: { codigo: "RECTIFICADO", nombre: "Rectificado cilíndrico", descripcion: "Rectificadora R-320 de precisión" },
  });
  await prisma.faseCatalogo.create({
    data: { codigo: "AJUSTE", nombre: "Debaste, ajuste y marcado", descripcion: "Banco de ajuste y marcado de piezas" },
  });
  const fControlFinal = await prisma.faseCatalogo.create({
    data: { codigo: "CONTROL_FINAL", nombre: "Inspección dimensional final", descripcion: "Mesa de control de calidad" },
  });

  console.log("✓ Catálogo de fases industriales creado.");

  // 4. Clientes
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
      contacto_nombre: "S. Molina",
      telefono: "+54 341 555-7800",
      direccion: "Ruta 9 Km 280, Rosario",
      email: "smolina@agroparts.com",
    },
  });

  const cliHidro = await prisma.cliente.create({
    data: {
      codigo: "CLI-007",
      razon_social: "HidroSur S.R.L.",
      contacto_nombre: "D. Aguirre",
      telefono: "+54 299 444-1234",
      direccion: "Av. Del Valle 1250, Neuquén",
      email: "otecnica@hidrosur.com.ar",
    },
  });

  console.log("✓ Clientes industriales creados.");

  // 5. Caso OT-2025-0104 · EN PRODUCCIÓN (Flanza de acople Ø220)
  const solDelta = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2214",
      cliente_id: cliDelta.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Flanza de acople Ø220",
      codigo_plano: "FL-1204",
      revision_plano: "C",
      material: "AISI 4140",
      norma_material: "EN 10204 · 3.1",
      descripcion_pieza: "Fabricación de 12 flanzas de acople según plano FL-1204 rev.C para línea de bombas serie 400. Material AISI 4140 con temple y revenido.",
      cantidad: 12,
      fecha_esperada_entrega: new Date("2026-06-20"),
      estado: "COTIZADA",
    },
  });

  const cotDelta = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0311",
      solicitud_id: solDelta.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 2574000,
      estado: "APROBADA",
      aprobado_por_cliente: "Ing. M. Ferrer (cliente)",
      fecha_envio_cliente: new Date("2026-06-03"),
      fecha_respuesta_cliente: new Date("2026-06-04"),
    },
  });

  const ot104 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0104",
      cotizacion_id: cotDelta.id,
      cantidad: 12,
      numero_colada: "88412",
      prioridad: "ALTA",
      estado: "EN_PRODUCCION",
      fecha_inicio_produccion: new Date("2026-06-05T07:30:00Z"),
    },
  });

  // Fases de OT-2025-0104
  await prisma.oTFase.createMany({
    data: [
      {
        orden_trabajo_id: ot104.id,
        fase_catalogo_id: fCorte.id,
        numero_secuencia: 10,
        operario_id: opSuarez.id,
        maquinaria: "Sierra cinta HEM 260",
        tiempo_estimado_minutos: 45,
        duracion_real_minutos: 52,
        estado: "TERMINADO",
        fecha_inicio_real: new Date("2026-06-05T07:30:00Z"),
        fecha_fin_real: new Date("2026-06-05T08:22:00Z"),
      },
      {
        orden_trabajo_id: ot104.id,
        fase_catalogo_id: fTorneado.id,
        numero_secuencia: 20,
        operario_id: opIbarra.id,
        maquinaria: "Torno CNC Gildemeister",
        tiempo_estimado_minutos: 120,
        duracion_real_minutos: 118,
        estado: "TERMINADO",
        fecha_inicio_real: new Date("2026-06-05T08:30:00Z"),
        fecha_fin_real: new Date("2026-06-05T10:28:00Z"),
      },
      {
        orden_trabajo_id: ot104.id,
        fase_catalogo_id: fFresado.id,
        numero_secuencia: 30,
        operario_id: opIbarra.id,
        maquinaria: "Centro mecanizado Haas VF-4",
        tiempo_estimado_minutos: 75,
        estado: "EN_EJECUCION",
        fecha_inicio_real: new Date("2026-06-06T08:05:00Z"),
      },
      {
        orden_trabajo_id: ot104.id,
        fase_catalogo_id: fTaladrado.id,
        numero_secuencia: 40,
        operario_id: opParedes.id,
        maquinaria: "Taladro radial Ferrari 1.6 m",
        tiempo_estimado_minutos: 40,
        estado: "EN_COLA",
      },
      {
        orden_trabajo_id: ot104.id,
        fase_catalogo_id: fControlFinal.id,
        numero_secuencia: 50,
        operario_id: auditor.id,
        maquinaria: "Mesa de control",
        tiempo_estimado_minutos: 30,
        estado: "EN_COLA",
      },
    ],
  });

  // Notas técnicas de OT-2025-0104
  await prisma.oTNota.createMany({
    data: [
      {
        orden_trabajo_id: ot104.id,
        usuario_id: jefeProd.id,
        origen: "JEFE_PRODUCCION",
        contenido: "Verificar dureza tras tratamiento antes de continuar la secuencia.",
      },
      {
        orden_trabajo_id: ot104.id,
        usuario_id: auditor.id,
        origen: "CALIDAD",
        contenido: "Conservar identificación de colada en cada pieza hasta la inspección final.",
      },
    ],
  });

  // 6. Caso OT-2025-0103 · EN CONTROL DE CALIDAD (Eje excéntrico)
  const solAgro = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2201",
      cliente_id: cliAgro.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Eje excéntrico",
      codigo_plano: "EX-0451",
      revision_plano: "A",
      material: "42CrMo4",
      norma_material: "EN 10204 · 3.1",
      descripcion_pieza: "Fabricación de 4 ejes excéntricos para cabezal de cosechadora según plano EX-0451. Material 42CrMo4 con temple por inducción.",
      cantidad: 4,
      fecha_esperada_entrega: new Date("2026-06-18"),
      estado: "COTIZADA",
    },
  });

  const cotAgro = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0298",
      solicitud_id: solAgro.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 768000,
      estado: "APROBADA",
      aprobado_por_cliente: "S. Molina (cliente)",
    },
  });

  const ot103 = await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0103",
      cotizacion_id: cotAgro.id,
      cantidad: 4,
      numero_colada: "88399",
      prioridad: "NORMAL",
      estado: "EN_CALIDAD",
      fecha_inicio_produccion: new Date("2026-06-02T07:00:00Z"),
      fecha_pase_calidad: new Date("2026-06-08T09:10:00Z"),
    },
  });

  // Fases de OT-2025-0103 completas
  await prisma.oTFase.createMany({
    data: [
      {
        orden_trabajo_id: ot103.id,
        fase_catalogo_id: fCorte.id,
        numero_secuencia: 10,
        operario_id: opSuarez.id,
        tiempo_estimado_minutos: 30,
        duracion_real_minutos: 33,
        estado: "TERMINADO",
      },
      {
        orden_trabajo_id: ot103.id,
        fase_catalogo_id: fTorneado.id,
        numero_secuencia: 20,
        operario_id: opIbarra.id,
        tiempo_estimado_minutos: 110,
        duracion_real_minutos: 121,
        estado: "TERMINADO",
      },
      {
        orden_trabajo_id: ot103.id,
        fase_catalogo_id: fRectificado.id,
        numero_secuencia: 30,
        operario_id: opSuarez.id,
        tiempo_estimado_minutos: 60,
        duracion_real_minutos: 58,
        estado: "TERMINADO",
      },
    ],
  });

  // Auditoría de Calidad para OT-2025-0103
  const audit103 = await prisma.auditoriaCalidad.create({
    data: {
      orden_trabajo_id: ot103.id,
      auditor_id: auditor.id,
      numero_auditoria: 1,
      resultado: "CONFORME",
      observaciones_generales: "Dimensional conforme en las 4 piezas. Primer artículo verificado en mesa de control.",
    },
  });

  await prisma.auditoriaChecklistRespuesta.createMany({
    data: [
      { auditoria_id: audit103.id, item_numero: 1, criterio_nombre: "Conformidad dimensional", resultado_item: "CUMPLE" },
      { auditoria_id: audit103.id, item_numero: 2, criterio_nombre: "Fases completas", resultado_item: "CUMPLE" },
      { auditoria_id: audit103.id, item_numero: 3, criterio_nombre: "Terminación y acabado", resultado_item: "CUMPLE" },
      { auditoria_id: audit103.id, item_numero: 4, criterio_nombre: "Cantidad requerida", resultado_item: "CUMPLE" },
      { auditoria_id: audit103.id, item_numero: 5, criterio_nombre: "Identificación de colada", resultado_item: "CUMPLE" },
      { auditoria_id: audit103.id, item_numero: 6, criterio_nombre: "Prueba funcional", resultado_item: "NO_APLICA" },
      { auditoria_id: audit103.id, item_numero: 7, criterio_nombre: "Documentación y certificados", resultado_item: "CUMPLE" },
    ],
  });

  // 7. Caso OT-2025-0102 · LISTA PARA ENTREGA (Soporte de bomba en 316L)
  const solHidro = await prisma.solicitud.create({
    data: {
      numero_solicitud: "RFQ-2196",
      cliente_id: cliHidro.id,
      vendedor_id: vendedor.id,
      nombre_pieza: "Soporte de bomba",
      codigo_plano: "SB-0779",
      revision_plano: "B",
      material: "AISI 316L",
      norma_material: "EN 10204 · 3.1",
      descripcion_pieza: "Reposición anual de 25 soportes de bomba según plano SB-0779 rev.B. Material 316L para servicio con cloruros.",
      cantidad: 25,
      fecha_esperada_entrega: new Date("2026-06-12"),
      estado: "COTIZADA",
    },
  });

  const cotHidro = await prisma.cotizacion.create({
    data: {
      numero_cotizacion: "COT-2025-0287",
      solicitud_id: solHidro.id,
      jefe_produccion_id: jefeProd.id,
      precio_final: 1530000,
      estado: "APROBADA",
      aprobado_por_cliente: "D. Aguirre (cliente)",
    },
  });

  await prisma.ordenTrabajo.create({
    data: {
      numero_ot: "OT-2025-0102",
      cotizacion_id: cotHidro.id,
      cantidad: 25,
      numero_colada: "88020",
      prioridad: "NORMAL",
      estado: "DESPACHO",
      fecha_inicio_produccion: new Date("2026-05-27T07:00:00Z"),
      fecha_pase_calidad: new Date("2026-06-06T15:40:00Z"),
      fecha_pase_despacho: new Date("2026-06-07T11:30:00Z"),
    },
  });

  console.log("✓ Órdenes de trabajo, fases, notas y auditorías sembradas con éxito.");
}

main()
  .catch((e) => {
    console.error("Error al sembrar la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
