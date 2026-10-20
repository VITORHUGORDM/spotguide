import { RegisterInput, LoginInput, UserResponse } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { HashService } from '../../shared/security/hash.js';
import { AppError } from '../../shared/errors/app-error.js';
import { protegeDocumento } from '../../shared/security/document.js';

export class AuthService {
  async register(data: RegisterInput): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Este e-mail já está em uso.', 409);
    }

    // comerciante: o documento já foi validado no contrato; aqui só vira hash e checa duplicidade
    const documento = data.role === 'MERCHANT' && data.document ? protegeDocumento(data.document) : null;
    if (data.role === 'MERCHANT' && !documento) throw new AppError('CPF ou CNPJ inválido.', 400, 'document');
    if (documento) {
      const dono = await prisma.user.findUnique({ where: { documentHash: documento.hash }, select: { id: true } });
      if (dono) throw new AppError('Já existe uma conta cadastrada com este CPF/CNPJ.', 409, 'document');
    }

    const passwordHash = await HashService.hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        ...(documento && { documentHash: documento.hash, documentType: documento.type, documentMask: documento.mask }),
      },
    });

    // Sanitização para Data Exposure (retorna somente UserResponse)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async validateCredentials(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Mensagem genérica contra User Enumeration
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const isPasswordValid = await HashService.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    return user;
  }
}
