import { describe, expect, it } from 'vitest';
import { PlaceDetailSchema } from '@guia/contracts';
import { paraDetalhe } from './places.service.js';

describe('paraDetalhe', () => {
  it('devolve só o PlaceDetail, sem campos internos, e a nota como número', () => {
    const registro = {
      id: '11111111-1111-4111-8111-111111111111', name: 'Café', slug: 'cafe', description: 'bom', city: 'Gramado', state: 'RS',
      category: { id: '22222222-2222-4222-8222-222222222222', name: 'Cafés', slug: 'cafes', iconName: 'coffee', createdAt: new Date() },
      averageRating: '4.50', totalReviews: 2, priceLevel: 2, amenities: [], isVerified: false,
      phone: null, websiteUrl: null, street: 'Rua A', number: '10', neighborhood: 'Centro', postalCode: '95670000',
      latitude: -29.3, longitude: -50.8, hours: [], photos: [{ id: '33333333-3333-4333-8333-333333333333', url: '/u/a.jpg', caption: null, isCover: false }],
      ownerId: 'dono-secreto', isActive: true, createdAt: new Date(), updatedAt: new Date(),
    };

    const out = paraDetalhe(registro as never);

    expect(out).not.toHaveProperty('ownerId');
    expect(out).not.toHaveProperty('isActive');
    expect(out.averageRating).toBe(4.5);
    expect(out.coverPhotoUrl).toBe('/u/a.jpg');
    expect(PlaceDetailSchema.safeParse(out).success).toBe(true);
  });
});
