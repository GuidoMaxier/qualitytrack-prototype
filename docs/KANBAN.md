# QualityTrack — Tablero Kanban & Backlog

Seguimiento de hitos y tareas del repositorio `GuidoMaxier/qualitytrack-prototype`, alineado con los Milestones e Issues de GitHub.

---

## Milestones

| Milestone | Estado | Descripcion |
| :--- | :---: | :--- |
| **M1: Setup Base & Landing Page** | Completado | Next.js 16, Prisma 7, Neon, Better Auth y Landing CAD Blueprint. |
| **M2: DevOps, Calidad & CI/CD** | Completado | Husky, Commitlint, lint-staged, validacion de tipos y GitHub Actions. |
| **M3: Base de Datos Prisma 7 & Seed** | Completado | Modelado industrial completo (OTs, fases, auditorias) y seed poblado. |
| **M4: Dashboard Industrial & Expediente** | Completado | Tablero Kanban, tabla de OTs, expediente unico y docs con Scalar. |
| **M5: Ciclo Comercial + Clientes + Archivos** | Completado | Schema/seed v3, Nueva Solicitud (buscador de cliente + alta en modal + adjuntar plano del cliente), cotizaciones en tablero, aprobar cotizacion, generar OT, adjuntar/servir archivos. |
| **M6: Expediente por etapas + Planta** | Pendiente | Expediente 6 etapas con docs/bitacora y acciones de planta (operaciones, calidad QL, NC, liberar, entrega). |
| **M7: Roles, Seguridad y Trazabilidad** | Pendiente | Login aplicando permisos por rol en API/UI, vista Trazabilidad, dashboards Gerente/Operario/Calidad. |

---

## Estado de Tareas

### Backlog (To Do)
- [ ] `feat(realtime)`: Webhooks / Server-Sent Events para actualizacion en tiempo real de avances en planta.
- [ ] `feat(reports)`: Exportacion a PDF del certificado de calidad e informe de trazabilidad.

### En Progreso
- [ ] `testing`: Pruebas de usuario y validacion funcional de flujos.
- [ ] `refactor(design)`: `design/dashboard.html` (1.676 líneas) separado en módulos en `design/dashboard/` (index + css + 12 js documentados). Hecho y verificado por sintaxis — falta validación visual en browser.

### Completado
- [x] `feat(db)`: Schema + seed **v3** alineados con `design/dashboard.html` (`CotizacionItem`, `NoConformidad`, `DocumentoExpediente`, `BitacoraEvento`, plan QA QL, `tipo_pieza`). Aplicado en Neon (`prisma db push`) y seed ejecutado con verificacion de conteos: 4 OTs + 2 expedientes comerciales, 31 docs y 33 eventos de bitacora.

### Completado
- [x] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `feat(dashboard)`: Dashboard industrial con metricas, tabla filtrable y expediente tecnico unificado.
- [x] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `docs(api)`: Documentacion interactiva OpenAPI montada en `/api-reference` con Scalar.
- [x] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `feat(api)`: Endpoints de lectura y actualizacion `/api/ordenes-trabajo` y `/api/ot-fases`.

### Completado
- [x] Inicializacion de Next.js 16.3.4 (App Router) y Tailwind CSS v4.
- [x] Configuracion de Prisma 7 con driver serverless de Neon PostgreSQL (`@prisma/adapter-neon`).
- [x] Configuracion de Better Auth y variables de entorno.
- [x] Implementacion de Landing Page industrial (`/`) con plano CAD SVG animado.
- [x] Verificacion de `pnpm lint` y `pnpm build` sin errores.
- [x] Commit atomico en `main` (`d6df4d1`).
- [x] **[#1](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/1)** `feat(devops)`: Husky, Commitlint y `lint-staged` activos.
- [x] **[#2](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/2)** `ci`: Pipeline de GitHub Actions validado en verde en la nube.
- [x] **[#3](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/3)** `feat(db)`: Esquema relacional industrial en Prisma 7 y seed inicial ejecutado.
