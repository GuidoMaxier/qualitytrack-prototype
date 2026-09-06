# QualityTrack — Módulo Dashboard (prototipo estático)

Refactor del monolito `design/dashboard.html` (1.676 líneas) a una carpeta modular.
**Contenido idéntico (split verbatim):** no se reescribió lógica; solo se separó y documentó.

## Estructura

```text
design/dashboard/
├── index.html            # Shell: <head> (Tailwind CDN, fuentes, Lucide) + header/nav + overlays
│                         # Carga ordenada de css + js (sin módulos: funciona abriendo el archivo)
├── css/
│   └── dashboard.css     # Tokens (--ink/--paper/…), tipografías, sellos, botones, formularios, grid
├── js/
│   ├── 01-base.js        # Utilidades ($, esc, hash…) + constantes (ST, DT, STAGES) + mkDoc
│   ├── 02-plantillas.js  # Hojas de ruta e inspección (QL) por tipo de pieza (flange/shaft/plate)
│   ├── 03-seed.js        # Datos demo: 6 expedientes (OTs + cotizaciones) con docs y bitácora
│   ├── 04-estado.js      # Estado global, navegación del expediente y componentes comunes de render
│   ├── 05-tablero.js     # Vista Tablero (métricas, tabla, filtros, exportación)
│   ├── 06-expediente.js  # Vista Expediente único (timeline 6 etapas + contenido por etapa)
│   ├── 07-acciones.js    # Acciones: aprobar cotización, generar OT, operaciones, NC, entrega, adjuntar
│   ├── 08-trazabilidad.js# Vista Trazabilidad (cadena de custodia)
│   ├── 09-nueva-solicitud.js # Vista Nueva Solicitud (alta del expediente comercial)
│   ├── 10-visores.js     # Visor de documentos (overlay + zoom/pan) y planos SVG por tipo de pieza
│   ├── 11-documentos.js  # Render de certificado 3.1, QC interno, comerciales (COT/OC/REM/FAC) y notas
│   └── 12-ui.js          # UI global: modales, toasts, navegación, buscador global, reloj, arranque
└── README.md             # Este archivo
```

## Cómo correr

- Doble clic en `design/dashboard/index.html` (los scripts clásicos funcionan desde `file://`).
- O servir la carpeta: `npx serve design/dashboard` (recomendado para verificar rutas relativas).

## Orden de carga (obligatorio)

Los scripts comparten el scope global (sin módulos ES, para que funcione desde `file://`):
`01 base → 02 plantillas → 03 datos → 04 estado → 05-11 vistas/acciones/visores → 12 UI (arranque)`.
Las funciones se invocan recién al final (`12-ui.js`), así que el orden garantiza que todo exista
al renderizar la primera vista. No cambiar el orden sin revisar dependencias.

## Garantías de esta refactor

- Extracción **verbatim por marcadores** del archivo original: paridad de contenido verificada
  (checksum) y `node --check` OK en los 12 archivos.
- El monolito `design/dashboard.html` **se conserva** como referencia; cuando valides la versión
  modular en el browser se puede eliminar.

## Próximo paso natural

Portar cada archivo a la app Next.js (M6): `06-expediente` → componente Expediente por etapas,
`07-acciones` → API + acciones de planta, `05/08/09` → vistas React. Los datos demo de `03-seed`
ya viven en la base (`prisma/seed.ts` v3).
