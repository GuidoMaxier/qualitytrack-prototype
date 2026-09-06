# QualityTrack — M6 · Plan de reescritura del Dashboard

> Estado: propuesta para reescribir **desde cero** los componentes de dashboard de la app Next.js,
> tomando como fuente el diseño modular (`design/dashboard/*`) y alineando contra la documentación
> (`PRD-v2`, `Backlog-v2`, decisiones v3) y el schema/API reales.

## 1. Método

- **Reescribir, no parchear**: se elimina `components/dashboard/DashboardClient.tsx` (monolito React
  de ~700 líneas con ediciones quirúrgicas) y se reconstruye por partes con arquitectura limpia.
- Cada parte se valida con `typecheck` + `lint` + `build` antes de seguir.
- Fuente de verdad funcional: `design/dashboard/js/*` (12 módulos ya separados).
- Fuente de verdad de datos: schema Prisma + API actual (M3–M5 ya alineados al diseño).

## 2. Inventario: lo que falta / está mal / sobra

### ❌ Falta (en la app Next actual)
| Ítem | Diseño | Docs |
|---|---|---|
| Expediente por 6 etapas (timeline + contenido por etapa) | `06-expediente.js` | HU-1.2 (criterio de éxito) |
| Documentos por etapa en el expediente (con archivo descargable) | `11-documentos.js` + visor | "documentación asociada" |
| Bitácora visible en el expediente | seed `log` | HU-1.2 |
| Acciones de planta: iniciar/finalizar op., enviar a calidad | `07-acciones.js` (parcial) | HU-3.1 |
| Auditoría QL: registrar inspección, abrir/cerrar NC, liberar (CI) | `07-acciones.js` | HU-4.2/4.3, HU-2.3 |
| Registrar entrega (remito + factura + cierre) | `07-acciones.js` | HU-1.4 |
| Vista Trazabilidad (cadena de custodia) | `08-trazabilidad.js` | objetivo central |
| Cálculo de vencimiento de fase hacia adelante | DF-1 | HU-3.3 (`fecha_vencimiento` hoy null) |
| Vistas por rol y permisos en API | — | PRD §07 (se difiere a M7) |
| Reasignación de fases (balanceo) | — | HU-2.2 (modelo listo, sin UI/API) |

### ⚠️ Está mal (corregir en la reescritura)
| Problema | Detalle |
|---|---|
| Métrica "NO CONFORMIDADES" | cuenta OTs `NO_CONFORME`, debe contar **NC abiertas** (entidad `NoConformidad`) |
| Doble fetch inicial del tablero | `fetchData()` + `useEffect` duplicados → hook único `useExpedientes` |
| Pestañas "muertas" / placeholders | se reemplazan por vistas reales o se ocultan según fase |
| Mapas de estado duplicados | definir **un** mapa DB↔etiqueta↔color (OT, fase, cotización, auditoría, NC) |
| Fechas/`Decimal` sin formatear en la UI | helpers únicos `fmtFecha`/`fmtMoney` |
| Header "PLANIFICACIÓN & CALIDAD" fijo | debe salir de la sesión (rol + nombre) |
| `NewSolicitudForm` con precio unitario del vendedor | choca con docs (la cotización la arma el Jefe, HU-2.1) → decisión en §4 |
| Seed: OT-103 "EN_PROCESO" con QL-02/03 sin responder | correcto vs diseño; UI debe mostrar "pendiente" sin contarlo conforme |
| Adjunto de archivos solo vía form | falta poder adjuntar a OT (ADJ en etapa ruta/cal/ent) |

### 🗑️ Sobra / no debería estar (en producción)
| Ítem | Motivo |
|---|---|
| Planos SVG paramétricos (flange/shaft/plate) | son **placeholders de demo**, no planos reales del cliente → quedan solo como "vista genérica" cuando no hay archivo |
| Usuario y fecha hardcodeados en el header | demo; en la app sale de la sesión |
| Exportación de registro `.txt` | no pedida por PRD (se conserva solo si la querés como utilidad demo) |
| Botones "APROBAR" sin permiso | la app no aplica roles todavía (M7): cualquier usuario logueado los ve |
| Etiqueta "7 puntos canónicos" | quedó superada por el plan QL por tipo de pieza (V3-6) |

## 3. Arquitectura de la reescritura (objetivo)

```text
components/dashboard/
├── lib/                    # helpers puros (no JSX)
│   ├── tipos.ts            # OTExpediente, CotizacionExpediente, Fase, Documento, Evento, NC…
│   ├── estados.ts          # maps estado→etiqueta/color (OT, fase, cot, auditoría, NC)
│   ├── format.ts           # fmtFecha, fmtMoney, fmtMin
│   └── api.ts              # client API tipado (fetch de /api/*)
├── hooks/
│   └── useExpedientes.ts   # carga única + refetch + acciones (aprobar, generar-ot, ops, QA…)
├── views/
│   ├── DashboardView.tsx   # enrutado local de vistas (board | file | trace | new)
│   ├── TableroView.tsx     # métricas + tabla unificada OTs/cotizaciones + filtros + búsqueda
│   ├── ExpedienteView.tsx  # timeline 6 etapas + panel docs + bitácora + acciones por estado
│   ├── TrazabilidadView.tsx
│   └── NuevaSolicitudView.tsx
├── ui/                     # componentes presentacionales
│   ├── Badge.tsx · MetricCard.tsx · Timeline.tsx · Table*.tsx
│   ├── Modal.tsx · Toast.tsx
│   └── ClientePicker.tsx · AddClienteModal.tsx · AdjuntarDocumento.tsx
└── dashboard/page / layout → montan DashboardView
```

**Estado unificado:** un expediente es `OT` (con fases/docs/eventos/auditorías/NC) o `COT`
(solicitud+cotización sin OT). El tablero y el expediente trabajan sobre el mismo modelo,
como en `design/dashboard.html` (fila = expediente, no tabla por tabla).

## 4. Decisiones de producto a validar

1. **Un solo dashboard "operaciones"** (hoy) vs dashboards por rol del PRD §07 → se mantiene el
   dashboard unificado en M6 y los roles llegan en M7 (login aplica permisos + vistas).
2. **Precio en "Nueva Solicitud"**: docs dicen que la cotización la arma el Jefe (HU-2.1) y el
   vendedor solo levanta el pedido. Opciones: (a) mantener el precio estimado "sugerido" editable
   luego por Jefe (pragmático, desviación documentada) o (b) sacar el precio del form y agregar
   pantalla "armar cotización" del Jefe (más fiel a docs, más trabajo).
3. **Plantillas de ruta por tipo de pieza** (flange/shaft/plate): se mantienen como clasificación
   interna que genera la hoja de ruta (no como "planos a elegir").
4. **Exportación del registro**: opcional; si no se usa, se elimina.
5. **NC como entidad** (v3): el tablero cuenta NC abiertas; el expediente muestra NC y su cierre.
6. **Vencimiento de fase**: implementar cálculo hacia adelante al pasar a cola (DF-1) cuando se
   porten las acciones de planta.

## 5. Plan por partes (orden de ejecución)

| Parte | Contenido | Verificación |
|---|---|---|
| **P0** | `lib/` (tipos, estados, format, api) + hook `useExpedientes` | typecheck |
| **P1** | Shell: header con sesión (rol/nombre), nav por vistas, toasts/notice | build + vista manual |
| **P2** | `TableroView` (reescribe board): métricas con NC de NCs, tabla expedientes unificada, filtros, búsqueda, NUEVA SOLICITUD, acciones aprobar/generar OT | typecheck/lint/build + smoke |
| **P3** | `ExpedienteView` solo lectura: timeline 6 etapas + docs (con archivo) + bitácora | idem |
| **P4** | Acciones: ops de planta, enviar a calidad (crea plan QL), inspección QL, NC, liberar, entrega + endpoints | smoke end-to-end |
| **P5** | `NuevaSolicitudView` final (buscador cliente + modal alta + adjuntos) | smoke |
| **P6** | `TrazabilidadView` | idem |
| **P7** | Limpieza: borrar componentes viejos, unificar copy/etiquetas, revisar docs/PRD/Backlog (nota v3) y KANBAN | git diff + docs |

## 6. Alineación con la documentación (resumen)

- **Alineado**: flujo solicitud→cotización→aprobación→OT (gating); 1 cotización por solicitud;
  estado comercial en la cotización (C-1); notas solo Calidad/Jefe (AR-3); habilitación por
  operario (DF-2); retrabajo con `es_rehacer`/`ciclo` (DF-5); NC con disposición (v3).
- **No alineado (desviación consciente o pendiente de docs)**:
  - Dashboards por rol (M7) · precio cargado por vendedor (§4.2) · "7 puntos" → plan QL
    (PRD/Backlog sin actualizar — se marca con nota v3) · adjuntos de OT (HU-3.2) hoy solo
    metadata en `DocumentoExpediente` · fechas demo 2025 vs docs 2026 (histórico, decidido).

## 7. Avance de la reescritura

- [x] **P0** — `components/dashboard/lib/*` (tipos, estados, format, api tipado) + `hooks/useExpedientes`
      (fetch único + filas unificadas OT/COT). API: `noConformes` ahora cuenta **NC abiertas** reales.
- [x] **P1** — `views/DashboardApp.tsx`: shell con sesión (nombre + rol reales del login), nav por
      vistas, toasts de resultado, cierre de sesión. Se eliminó el header hardcodeado.
- [x] **P2** — `views/TableroView.tsx`: métricas (con NC reales), tabla **unificada** OT+COT con
      filtros/búsqueda, acciones APROBAR / GENERAR OT. Clic en fila OT → abre el expediente (P3).
- [x] **P3** — `views/ExpedienteView.tsx`: **EXPEDIENTE ÚNICO DE TRABAJO** con línea de 6 etapas
      (SOLICITUD→COTIZACIÓN→OT→RUTA→CALIDAD→ENTREGA), contenido por etapa, panel de **documentos**
      (con descarga del archivo real vía `/api/documentos/[id]/archivo`) y **bitácora** + notas.
      API: `GET /api/ordenes-trabajo` ahora incluye `cotizacion.items`, `documentos` (metadata),
      `eventos` y `noConformidades` (sin `Bytes` en JSON). Navegación board→file→board como el diseño.
- [ ] **P4** — Acciones de planta/QA/entrega (operaciones, enviar a calidad, inspección QL, NC,
      liberar con CI, registrar entrega con remito/factura) + endpoints. Hoy el expediente es de lectura.
- [ ] **P5** — NuevaSolicitudView final (hoy: formulario portado 1:1, funcional).
- [ ] **P6** — TrazabilidadView.
- [ ] **P7** — Limpieza de copy/docs y revisión final.

> Nota: se eliminaron `DashboardClient.tsx`, `CotizacionesPanel.tsx` (monolitos viejos).
