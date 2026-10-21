import { z } from 'zod';
import { problemaNaSenha, tipoDocumento, validaNomePessoa } from './validadores.js';

export const UserRoleSchema = z.enum(['TRAVELER', 'MERCHANT', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Input para Registro - Proteção contra Mass Assignment (.strict())
export const RegisterInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(100)
      .refine(validaNomePessoa, 'Informe nome e sobrenome (apenas letras)'),
    email: z.string().trim().max(254, 'E-mail muito longo').email('E-mail inválido').toLowerCase(),
    password: z.string(),
    role: z.enum(['TRAVELER', 'MERCHANT']).default('TRAVELER'),
    // CPF ou CNPJ: obrigatório para comerciante, não se aplica a viajante
    document: z.string().trim().max(20).optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const problema = problemaNaSenha(d.password, d.email);
    if (problema) ctx.addIssue({ code: 'custom', path: ['password'], message: problema });

    if (d.role === 'MERCHANT') {
      if (!d.document) {
        ctx.addIssue({ code: 'custom', path: ['document'], message: 'Informe o CPF ou CNPJ do responsável pelo negócio' });
      } else if (!tipoDocumento(d.document)) {
        ctx.addIssue({ code: 'custom', path: ['document'], message: 'CPF ou CNPJ inválido. Confira os números' });
      }
    } else if (d.document) {
      ctx.addIssue({ code: 'custom', path: ['document'], message: 'Documento só é pedido para comerciantes' });
    }
  });

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type RegisterFormInput = z.input<typeof RegisterInputSchema>;

// Input para Login
export const LoginInputSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória').max(200),
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

// Renovação do login: troca o refresh token (7 dias) por um novo access token (15 min)
export const RefreshInputSchema = z.object({ refreshToken: z.string().min(1) }).strict();
