# QualityTrack — Trazabilidad para el Mecanizado Industrial

Plataforma integral de gestion de calidad, seguimiento de ordenes de trabajo (OT) y expediente tecnico unificado para talleres de mecanizado y matriceria de alta precision.

- **URL de Produccion:** [https://qualitytrack-prototype.vercel.app](https://qualitytrack-prototype.vercel.app)
- **API Reference (Scalar / OpenAPI):** [https://qualitytrack-prototype.vercel.app/api-reference](https://qualitytrack-prototype.vercel.app/api-reference)
- **Repositorio:** [GuidoMaxier/qualitytrack-prototype](https://github.com/GuidoMaxier/qualitytrack-prototype)

---

## Usuarios Institucionales y Roles para Pruebas

Todos los usuarios institucionales han sido inicializados en la base de datos con la contrasena universal:
**`Clave/123.`**

| Rol | Usuario / Email | Contrasena | Facultades y Responsabilidades |
| :--- | :--- | :--- | :--- |
| **GERENTE** | `gerente@qualitytrack.com` | `Clave/123.` | Supervision ejecutiva de planta, configuracion del catalogo de fases y matriz de competencias de operarios. |
| **JEFE_PRODUCCION** | `planificacion@qualitytrack.com` | `Clave/123.` | Planificacion de hojas de ruta, cotizaciones tecnicas, liberacion de OTs a produccion y balanceo de carga. |
| **VENDEDOR** | `comercial@qualitytrack.com` | `Clave/123.` | Registro de clientes, carga de solicitudes (RFQ), seguimiento de presupuestos y confirmacion de aprobacion. |
| **CALIDAD** | `calidad@qualitytrack.com` | `Clave/123.` | Auditorias segun plan de inspeccion por tipo de pieza (QL), liberacion a despacho o apertura de No Conformidades (NC). |
| **OPERARIO (Tornero)** | `r.suarez@qualitytrack.com` | `Clave/123.` | Ejecucion de corte y torneado en Sierra HEM / Torno CNC, registro de tiempos reales. |
| **OPERARIO (CNC)** | `m.ibarra@qualitytrack.com` | `Clave/123.` | Mecanizado de precision en Centro Haas VF-4 y torno CNC. |
| **OPERARIO (Ajuste)** | `j.paredes@qualitytrack.com` | `Clave/123.` | Taladrado radial Ferrari, tareas de banco, ajuste y marcado de colada. |
| **OPERARIO (Rectificador)** | `c.ferrer@qualitytrack.com` | `Clave/123.` | Rectificado cilindrico en rectificadora R-320, acabado de precision. |

---

## Stack Tecnologico

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org) con React 19 y TypeScript 5
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com) con diseno y estetica de terminal industrial CAD
- **Base de Datos:** [Neon PostgreSQL Serverless](https://neon.tech)
- **ORM:** [Prisma 7](https://www.prisma.io) con `@prisma/adapter-neon`
- **Autenticacion:** [Better Auth](https://www.better-auth.com) con sesiones en base de datos
- **Proteccion de Rutas:** Proxy nativo de Next.js 16 (`proxy.ts`)
- **Documentacion API:** [Scalar API Reference](https://scalar.com) montado en `/api-reference`
- **Validacion:** [Zod 4](https://zod.dev)
- **Iconografia:** [Lucide React](https://lucide.dev)
- **DevOps & Calidad:** Husky, Commitlint, lint-staged y GitHub Actions CI

---

## Estructura del Proyecto

```text
qualitytrack-prototype/
├── app/                  # Next.js App Router (Landing, Dashboard, Login, Auth API, Scalar)
├── components/           # Componentes modulares
│   ├── landing/          # Plano CAD animado, metricas, terminal boot
│   └── dashboard/        # Kanban, tablas OTs y expediente unico
├── docs/                 # Documentacion tecnica, DER, Backlog y KANBAN
├── lib/                  # Clientes Prisma, Better Auth y validaciones Zod
├── prisma/               # Esquema de base de datos y scripts de seed
├── proxy.ts              # Proxy de proteccion de rutas para Next.js 16
└── .github/workflows/    # Pipeline automatizado de CI
```

---

## Comandos Principales

```bash
# Desarrollo local
pnpm dev

# Verificacion estricta de tipos
pnpm typecheck

# Linting
pnpm lint

# Compilacion de produccion
pnpm build

# Sincronizacion de esquema con base de datos
pnpm exec prisma db push

# Poblar datos industriales y credenciales
pnpm exec tsx prisma/seed.ts
```
