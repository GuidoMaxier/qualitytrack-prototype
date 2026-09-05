import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      rol: {
        type: "string",
        required: false,
        defaultValue: "OPERARIO",
        input: true,
      },
      tipo_tarea: {
        type: "string",
        required: false,
        input: true,
      },
      telefono: {
        type: "string",
        required: false,
        input: true,
      },
      activo: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
});
