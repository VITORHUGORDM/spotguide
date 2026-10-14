import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Categorias Padrão
  const categories = [
    { name: 'Restaurantes', slug: 'restaurantes', iconName: 'utensils' },
    { name: 'Bares & Pubs', slug: 'bares', iconName: 'beer' },
    { name: 'Cafés & Bistrôs', slug: 'cafes', iconName: 'coffee' },
    { name: 'Hotéis & Pousadas', slug: 'hospedagem', iconName: 'hotel' },
    { name: 'Pontos Turísticos', slug: 'turismo', iconName: 'map-pin' },
    { name: 'Comércio Local', slug: 'comercio', iconName: 'shopping-bag' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 2. Usuário Administrador de Testes
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@guiaturistico.com' },
    update: {},
    create: {
      name: 'Administrador Guia',
      email: 'admin@guiaturistico.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // 3. Usuário Comerciante de Testes
  const merchantPasswordHash = await bcrypt.hash('Merchant@123456', 12);
  const merchant = await prisma.user.upsert({
    where: { email: 'comerciante@guiaturistico.com' },
    update: {},
    create: {
      name: 'Comerciante Exemplo',
      email: 'comerciante@guiaturistico.com',
      passwordHash: merchantPasswordHash,
      role: 'MERCHANT',
      isVerified: true,
    },
  });

  // 4. Estabelecimento Exemplo
  const restaurantCategory = await prisma.category.findUnique({
    where: { slug: 'restaurantes' },
  });

  if (restaurantCategory) {
    await prisma.place.upsert({
      where: { slug: 'bistro-da-serra-gramado' },
      update: {},
      create: {
        ownerId: merchant.id,
        categoryId: restaurantCategory.id,
        name: 'Bistrô da Serra',
        slug: 'bistro-da-serra-gramado',
        description: 'Gastronomia aconchegante com pratos típicos da serra e carta de vinhos selecionados.',
        phone: '(54) 99999-1234',
        websiteUrl: 'https://bistrodaserra.com.br',
        street: 'Avenida Borges de Medeiros',
        number: '1500',
        neighborhood: 'Centro',
        city: 'Gramado',
        state: 'RS',
        postalCode: '95670-000',
        latitude: -29.3789,
        longitude: -50.8742,
        averageRating: 4.8,
        totalReviews: 12,
        isActive: true,
        isVerified: true,
        hours: {
          createMany: {
            data: [
              { day: 'TUESDAY', openTime: '12:00', closeTime: '23:00' },
              { day: 'WEDNESDAY', openTime: '12:00', closeTime: '23:00' },
              { day: 'THURSDAY', openTime: '12:00', closeTime: '23:00' },
              { day: 'FRIDAY', openTime: '12:00', closeTime: '00:00' },
              { day: 'SATURDAY', openTime: '12:00', closeTime: '00:00' },
              { day: 'SUNDAY', openTime: '12:00', closeTime: '22:00' },
            ],
          },
        },
        photos: {
          createMany: {
            data: [
              {
                url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
                caption: 'Salão principal do Bistrô',
                isCover: true,
                displayOrder: 0,
              },
            ],
          },
        },
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
