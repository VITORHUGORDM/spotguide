import { z } from 'zod';

export const UserRoleSchema = z.enum(['TRAVELER', 'MERCHANT', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Input para Registro - Proteção contra Mass Assignment (.strict())
export const RegisterInputSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve conter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
  role: z.enum(['TRAVELER', 'MERCHANT']).default('TRAVELER'),
}).strict();

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

// Input para Login
export const LoginInputSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
}).strict();

export type LoginInput = z.infer<typeof LoginInputSchema>;

// Resposta Pública do Usuário - Proteção contra Data Exposure (Sem password_hash)
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  avatarUrl: z.string().nullable(),
  isVerified: z.boolean(),
  createdAt: z.string().or(z.date()),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Resposta de Autenticação (Tokens JWT)
export const AuthResponseSchema = z.object({
  user: UserResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
