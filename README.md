# QualityTrack — Trazabilidad para el Mecanizado Industrial

Plataforma integral de gestion de calidad, seguimiento de ordenes de trabajo (OT) y expediente tecnico unificado para talleres de mecanizado y matriceria de alta precision.

- **URL de Produccion:** [https://qualitytrack-prototype.vercel.app](https://qualitytrack-prototype.vercel.app)
- **Repositorio:** [GuidoMaxier/qualitytrack-prototype](https://github.com/GuidoMaxier/qualitytrack-prototype)

---

## Stack Tecnologico

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org) con React 19 y TypeScript 5
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com) con diseno y estetica de terminal industrial CAD
- **Base de Datos:** [Neon PostgreSQL Serverless](https://neon.tech)
- **ORM:** [Prisma 7](https://www.prisma.io) con `@prisma/adapter-neon`
- **Autenticacion:** [Better Auth](https://www.better-auth.com) con sesiones en base de datos
- **Validacion:** [Zod 4](https://zod.dev)
- **Iconografia:** [Lucide React](https://lucide.dev)
- **DevOps & Calidad:** Husky, Commitlint, lint-staged y GitHub Actions CI

---

## Estructura del Proyecto

```text
qualitytrack-prototype/
├── app/                  # Next.js App Router (Landing, Dashboard, Auth API)
├── components/           # Componentes modulares
│   ├── landing/          # Plano CAD animado, metricas, terminal boot, etc.
│   └── dashboard/        # Kanban, tablas OTs y expediente unico
├── docs/                 # Documentacion tecnica, DER, Backlog y KANBAN
├── lib/                  # Clientes Prisma, Better Auth y validaciones Zod
├── prisma/               # Esquema de base de datos y scripts de seed
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

# Generacion de cliente Prisma
pnpm exec prisma generate
```
