import { PlaceListItem } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { placeListInclude, toPlaceListItem } from '../../shared/place-list-item.js';
import { AppError } from '../../shared/errors/app-error.js';

// evita que uma conta encha a tabela e que a lista cresça sem fim
export const MAX_FAVORITES = 500;

export class FavoritesService {
  async list(userId: string): Promise<PlaceListItem[]> {
    const favs = await prisma.favorite.findMany({
      where: { userId, place: { isActive: true } },
      orderBy: { createdAt: 'desc' },
      take: MAX_FAVORITES,
      include: { place: { include: placeListInclude } },
    });

    return favs.map(({ place }) => toPlaceListItem(place));
  }

  // Idempotente: favoritar duas vezes não dá erro nem duplica (chave primária [userId, placeId])
  async add(userId: string, placeId: string) {
    const place = await prisma.place.findUnique({ where: { id: placeId }, select: { isActive: true } });
    if (!place?.isActive) throw new AppError('Estabelecimento não encontrado.', 404);

    if ((await prisma.favorite.count({ where: { userId } })) >= MAX_FAVORITES) {
      throw new AppError(`Você atingiu o limite de ${MAX_FAVORITES} favoritos.`, 409);
    }
    await prisma.favorite.createMany({ data: [{ userId, placeId }], skipDuplicates: true });
  }

  // O userId vem do token, nunca da URL: ninguém remove favorito de outra pessoa
  async remove(userId: string, placeId: string) {
    await prisma.favorite.deleteMany({ where: { userId, placeId } });
  }
}
