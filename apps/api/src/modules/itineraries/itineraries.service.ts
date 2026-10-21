import { CreateItineraryInput, UpdateItineraryInput, ITINERARY_MAX_PER_USER } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { placeListInclude, toPlaceListItem } from '../../shared/place-list-item.js';

// Roteiro alheio e privado responde 404 (não 403), para não revelar que o id existe
const naoEncontrado = () => new AppError('Roteiro não encontrado.', 404);

export class ItinerariesService {
  async listMine(userId: string) {
    const lista = await prisma.itinerary.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: ITINERARY_MAX_PER_USER,
      select: { id: true, title: true, isPublic: true, _count: { select: { stops: true } } },
    });
    return lista.map(({ _count, ...r }) => ({ ...r, totalStops: _count.stops }));
  }

  async create(userId: string, data: CreateItineraryInput) {
    if ((await prisma.itinerary.count({ where: { ownerId: userId } })) >= ITINERARY_MAX_PER_USER) {
      throw new AppError(`Você atingiu o limite de ${ITINERARY_MAX_PER_USER} roteiros.`, 409);
    }
    return prisma.itinerary.create({ data: { ownerId: userId, title: data.title }, select: { id: true, title: true, isPublic: true } });
  }

  /** viewerId é null para visitante sem login. */
  async get(id: string, viewerId: string | null) {
    const it = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { position: 'asc' }, include: { place: { include: placeListInclude } } },
      },
    });
    const isOwner = !!viewerId && it?.ownerId === viewerId;
    if (!it || (!it.isPublic && !isOwner)) throw naoEncontrado();

    return {
      id: it.id,
      title: it.title,
      isPublic: it.isPublic,
      isOwner,
      stops: it.stops.filter((s) => s.place.isActive).map((s) => toPlaceListItem(s.place)),
    };
  }

  async update(userId: string, id: string, data: UpdateItineraryInput) {
    const { placeIds, ...campos } = data;

    await prisma.$transaction(async (tx) => {
      // dono e id na mesma consulta: quem não é dono recebe 404
      const { count } = await tx.itinerary.updateMany({ where: { id, ownerId: userId }, data: { ...campos, updatedAt: new Date() } }); // updatedAt: com data vazia o Prisma nem consulta e devolve count 0
      if (count === 0) throw naoEncontrado();

      if (placeIds) {
        const existentes = await tx.place.count({ where: { id: { in: placeIds }, isActive: true } });
        if (existentes !== placeIds.length) throw new AppError('Algum local do roteiro não existe mais.', 400, 'placeIds');

        await tx.itineraryStop.deleteMany({ where: { itineraryId: id } });
        await tx.itineraryStop.createMany({ data: placeIds.map((placeId, position) => ({ itineraryId: id, placeId, position })) });
      }
    });

    return this.get(id, userId);
  }

  async remove(userId: string, id: string) {
    const { count } = await prisma.itinerary.deleteMany({ where: { id, ownerId: userId } });
    if (count === 0) throw naoEncontrado();
  }
}
