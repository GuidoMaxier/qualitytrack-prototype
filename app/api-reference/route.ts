import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  theme: "saturn" as const,
  spec: {
    content: {
      openapi: "3.1.0",
      info: {
        title: "QualityTrack API — Trazabilidad Industrial",
        version: "1.0.0",
        description: "API de gestión de producción, trazabilidad por colada, auditorías de calidad y expediente único para talleres de mecanizado.",
      },
      paths: {
        "/api/ordenes-trabajo": {
          get: {
            summary: "Listar Órdenes de Trabajo y Estadísticas",
            description: "Devuelve el resumen de métricas de planta, el listado de OTs con sus fases y cotizaciones pendientes.",
            responses: {
              "200": {
                description: "Listado obtenido correctamente.",
              },
            },
          },
        },
        "/api/ordenes-trabajo/{id}": {
          patch: {
            summary: "Actualizar Estado de OT",
            description: "Permite transicionar el estado de la OT (EN_PRODUCCION, EN_CALIDAD, DESPACHO, ENTREGADA).",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ],
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      estado: { type: "string", example: "EN_CALIDAD" },
                      receptor_nombre: { type: "string", example: "Ing. Ferrer" },
                    },
                  },
                },
              },
            },
            responses: {
              "200": { description: "OT actualizada." },
            },
          },
        },
        "/api/ot-fases/{id}": {
          patch: {
            summary: "Actualizar Fase u Operación de la OT",
            description: "Permite iniciar o finalizar una fase industrial en el taller con registro de tiempos reales.",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": { description: "Fase actualizada." },
            },
          },
        },
      },
    },
  },
};

export const GET = ApiReference(config);
