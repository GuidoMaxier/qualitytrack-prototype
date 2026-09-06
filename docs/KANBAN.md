# QualityTrack — Tablero Kanban & Backlog

Seguimiento de hitos y tareas del repositorio `GuidoMaxier/qualitytrack-prototype`, alineado con los Milestones e Issues de GitHub.

---

## Milestones

| Milestone | Estado | Descripcion |
| :--- | :---: | :--- |
| **M1: Setup Base & Landing Page** | Completado | Next.js 16, Prisma 7, Neon, Better Auth y Landing CAD Blueprint. |
| **M2: DevOps, Calidad & CI/CD** | Completado | Husky, Commitlint, lint-staged, validacion de tipos y GitHub Actions. |
| **M3: Base de Datos Prisma 7 & Seed** | Completado | Modelado industrial completo (OTs, fases, auditorias) y seed poblado. |
| **M4: Dashboard Industrial & Expediente** | En Progreso | Tablero Kanban interactivo, tabla de OTs y modal de expediente. |

---

## Estado de Tareas

### Backlog (To Do)
- [ ] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `feat(dashboard)`: Acciones de transición de estado en vivo (Avanzar fase / Registrar auditoría desde UI).

### En Progreso
- [ ] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `feat(dashboard)`: Dashboard industrial con métricas, tabla filtrable y expediente técnico unificado.

### Completado
- [x] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `docs(api)`: Documentación interactiva OpenAPI montada en `/api-reference` con Scalar.
- [x] **[#4](https://github.com/GuidoMaxier/qualitytrack-prototype/issues/4)** `feat(api)`: Endpoints de lectura y actualización `/api/ordenes-trabajo` y `/api/ot-fases`.

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
