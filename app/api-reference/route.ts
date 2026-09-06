import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  theme: "saturn" as const,
  spec: {
    content: {
      openapi: "3.1.0",
      info: {
        title: "QualityTrack API",
        version: "1.0.0",
        description: "API de Trazabilidad Industrial y Gestión de Órdenes de Trabajo",
      },
      paths: {
        "/api/stats": {
          get: {
            summary: "Obtener métricas consolidadas de planta",
            responses: {
              "200": {
                description: "Métricas actuales de OTs y fases",
              },
            },
          },
        },
      },
    },
  },
};

export const GET = ApiReference(config);
