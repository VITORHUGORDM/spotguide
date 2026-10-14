import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: 'TRAVELER' | 'MERCHANT' | 'ADMIN';
      email: string;
    };
    user: {
      sub: string;
      role: 'TRAVELER' | 'MERCHANT' | 'ADMIN';
      email: string;
    };
  }
}
