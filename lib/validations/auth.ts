import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const RegisterUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["GERENTE", "JEFE_PRODUCCION", "VENDEDOR", "OPERARIO", "CALIDAD"]),
  tipo_tarea: z.string().optional(),
  telefono: z.string().optional(),
  activo: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
