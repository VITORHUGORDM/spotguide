import { RegisterInput, LoginInput, UserResponse } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { HashService } from '../../shared/security/hash.js';
import { AppError } from '../../shared/errors/app-error.js';

export class AuthService {
  async register(data: RegisterInput): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Este e-mail já está em uso.', 409);
    }

    const passwordHash = await HashService.hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
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
