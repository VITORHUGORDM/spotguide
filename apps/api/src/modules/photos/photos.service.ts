import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { env } from '../../shared/env.js';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MAX_FOTOS_POR_LOCAL = 8;

/** Confere o conteúdo do arquivo (não confia no Content-Type enviado pelo cliente). */
function detectaTipo(buf: Buffer): { ext: 'jpg' | 'png' | 'webp' } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg' };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png' };
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp' };
  return null;
}

/** Apaga do disco a foto enviada para cá; links externos (capa por URL, dados de exemplo) ficam como estão. */
export async function apagaArquivoDaFoto(url: string) {
  if (!url.startsWith(`${env.PUBLIC_URL}/uploads/places/`)) return;
  const nome = path.basename(new URL(url).pathname);
  await unlink(path.join(UPLOADS_DIR, 'places', nome)).catch(() => {});
}

export class PhotosService {
  async add(placeId: string, buf: Buffer, caption?: string) {
    const tipo = detectaTipo(buf);
    if (!tipo) throw new AppError('Envie uma imagem JPG, PNG ou WebP.', 415);

    const nome = `${randomUUID()}.${tipo.ext}`;
    const url = `${env.PUBLIC_URL}/uploads/places/${nome}`;

    try {
      return await prisma.$transaction(async (tx) => {
        // trava o local: dois envios ao mesmo tempo contavam 7 fotos cada e passavam do limite
        await tx.$queryRaw`SELECT id FROM places WHERE id = ${placeId}::uuid FOR UPDATE`;

        const total = await tx.placePhoto.count({ where: { placeId } });
        if (total >= MAX_FOTOS_POR_LOCAL) {
          throw new AppError(`Limite de ${MAX_FOTOS_POR_LOCAL} fotos por estabelecimento.`, 400);
        }

        await mkdir(path.join(UPLOADS_DIR, 'places'), { recursive: true });
        await writeFile(path.join(UPLOADS_DIR, 'places', nome), buf);

        return tx.placePhoto.create({
          data: {
            placeId,
            url,
            caption: caption?.slice(0, 100) || null,
            displayOrder: total,
            isCover: total === 0, // a primeira foto vira a capa
          },
        });
      });
    } catch (err) {
      // não deixa arquivo sem registro no banco
      await apagaArquivoDaFoto(url);
      throw err;
    }
  }

  async remove(placeId: string, photoId: string) {
    const foto = await prisma.placePhoto.findFirst({ where: { id: photoId, placeId } });
    if (!foto) throw new AppError('Foto não encontrada.', 404);

    await prisma.placePhoto.delete({ where: { id: foto.id } });
    await apagaArquivoDaFoto(foto.url);

    // se removeu a capa, a primeira que sobrar assume
    if (foto.isCover) {
      const proxima = await prisma.placePhoto.findFirst({ where: { placeId }, orderBy: { displayOrder: 'asc' } });
      if (proxima) await prisma.placePhoto.update({ where: { id: proxima.id }, data: { isCover: true } });
    }
  }

  async setCover(placeId: string, photoId: string) {
    const foto = await prisma.placePhoto.findFirst({ where: { id: photoId, placeId } });
    if (!foto) throw new AppError('Foto não encontrada.', 404);

    await prisma.$transaction([
      prisma.placePhoto.updateMany({ where: { placeId }, data: { isCover: false } }),
      prisma.placePhoto.update({ where: { id: photoId }, data: { isCover: true } }),
    ]);
  }
}
