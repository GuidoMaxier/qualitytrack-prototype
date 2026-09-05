# Skills Sugeridas (skills.sh) para QualityTrack

Documento de referencia con las Skills de [skills.sh](https://www.skills.sh) recomendadas para el stack técnico del proyecto:
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos & UI:** Tailwind CSS v4
- **Persistencia & DB:** Prisma 7 + Neon PostgreSQL (Driver Adapter)
- **Autenticación & Validaciones:** Better Auth + Zod

---

## 1. Autenticación & Seguridad (Better Auth)

### `better-auth-best-practices`
- **Propósito:** Patrones de arquitectura oficiales para Better Auth en Next.js App Router.
- **Cuándo incorporarla:** Al implementar el middleware de protección de rutas, endpoints de sesión, hooks de cliente y roles de usuario.
- **Instalación futura:** `npx skills add better-auth-best-practices`

### `better-auth-security-best-practices`
- **Propósito:** Endurecimiento de seguridad en autenticación: configuración de cookies de sesión, mitigación de CSRF y almacenamiento seguro de tokens.
- **Instalación futura:** `npx skills add better-auth-security-best-practices`

---

## 2. Base de Datos & ORM (Prisma 7 & PostgreSQL)

### `prisma`
- **Propósito:** Buenas prácticas en el modelado de esquemas relacionales complejos, optimización de queries con `PrismaClient` (evitar el problema N+1) y gestión de migraciones.
- **Cuándo incorporarla:** Al extender `prisma/schema.prisma` con las tablas de negocio de QualityTrack (órdenes de trabajo, fases, clientes, etc.).
- **Instalación futura:** `npx skills add prisma`

### `postgres-best-practices`
- **Propósito:** Convenciones específicas para bases de datos PostgreSQL: índices compuestos, restricciones de integridad referencial y tipos eficientes (`BIGINT`, `TIMESTAMP WITH TIME ZONE`).
- **Instalación futura:** `npx skills add postgres-best-practices`

---

## 3. Frontend & Diseño UI (Tailwind CSS v4)

### `tailwind-design-system`
- **Propósito:** Creación y mantenimiento de sistemas de diseño con Tailwind CSS v4 (variables de tema, tokens semánticos, componentes accesibles y micro-animaciones).
- **Cuándo incorporarla:** Al trasladar los prototipos de `design/landing.html` y `design/dashboard.html` a componentes modulares de Next.js.
- **Instalación futura:** `npx skills add tailwind-design-system`

### `frontend-tailwind-best-practices`
- **Propósito:** Organización de layouts responsivos (mobile-first), jerarquía visual y estandarización de clases CSS.
- **Instalación futura:** `npx skills add frontend-tailwind-best-practices`

---

## 4. Arquitectura y Código Limpio (Next.js & TypeScript)

### `nextjs-app-router-best-practices`
- **Propósito:** Separación adecuada entre Server Components (RSC) y Client Components (`"use client"`), Server Actions, revalidación de caché y streaming con Suspense.
- **Instalación futura:** `npx skills add nextjs-app-router-best-practices`

### `improve-codebase-architecture`
- **Propósito:** Auditoría y refactorización continua de la estructura del código, modularidad y separación estricta de capas de negocio.
- **Instalación futura:** `npx skills add mattpocock/skills/improve-codebase-architecture`
