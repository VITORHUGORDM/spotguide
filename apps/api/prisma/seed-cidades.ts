/**
 * Lugares de demonstração para as cidades da home.
 * Os nomes são inventados (não são estabelecimentos reais) e não têm avaliações:
 * serve para o guia não ficar vazio enquanto os comerciantes de verdade se cadastram.
 * Rodar com: pnpm --filter @guia/api db:seed:cidades
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Lugar {
  nome: string;
  categoria: 'restaurantes' | 'bares' | 'cafes' | 'hospedagem' | 'turismo' | 'comercio';
  descricao: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  lat: number;
  lng: number;
}

interface Cidade {
  cidade: string;
  uf: string;
  lugares: Lugar[];
}

const CIDADES: Cidade[] = [
  {
    cidade: 'Gramado',
    uf: 'RS',
    lugares: [
      { nome: 'Fogão da Serra', categoria: 'restaurantes', descricao: 'Cozinha de fogão a lenha com sopa de capeletti e cortes na brasa, num salão de madeira.', rua: 'Rua Garibaldi', numero: '210', bairro: 'Centro', cep: '95670-000', lat: -29.3794, lng: -50.8738 },
      { nome: 'Chocolateria Flocos', categoria: 'cafes', descricao: 'Chocolate quente espesso, tortas e cafés da serra para esperar o frio passar.', rua: 'Avenida das Hortênsias', numero: '1280', bairro: 'Centro', cep: '95670-000', lat: -29.3771, lng: -50.8765 },
      { nome: 'Pousada Lareira', categoria: 'hospedagem', descricao: 'Pousada com lareira nos quartos, café da manhã colonial e vista para o vale.', rua: 'Rua Pedro Candiago', numero: '95', bairro: 'Planalto', cep: '95670-000', lat: -29.3852, lng: -50.8689 },
      { nome: 'Mirante do Vale', categoria: 'turismo', descricao: 'Mirante com vista para os vales de Gramado e passarela de vidro. Melhor ao pôr do sol.', rua: 'Estrada do Vale', numero: 's/n', bairro: 'Vale do Quilombo', cep: '95670-000', lat: -29.3921, lng: -50.8811 },
    ],
  },
  {
    cidade: 'Campos do Jordão',
    uf: 'SP',
    lugares: [
      { nome: 'Fondue do Pinheiro', categoria: 'restaurantes', descricao: 'Rodízio de fondue de queijo, carne e chocolate em ambiente aquecido por lareira.', rua: 'Rua Djalma Forjaz', numero: '88', bairro: 'Capivari', cep: '12460-000', lat: -22.7395, lng: -45.5912 },
      { nome: 'Café da Araucária', categoria: 'cafes', descricao: 'Cafeteria com grãos de Minas, pães de queijo quentinhos e mesas perto da janela.', rua: 'Avenida Doutor Luiz Arrobas Martins', numero: '420', bairro: 'Vila Abernéssia', cep: '12460-000', lat: -22.7421, lng: -45.5868 },
      { nome: 'Chalé Neblina', categoria: 'hospedagem', descricao: 'Chalés de madeira com hidromassagem, cercados por pinheiros e trilhas curtas.', rua: 'Estrada do Horto', numero: '1500', bairro: 'Horto Florestal', cep: '12460-000', lat: -22.7012, lng: -45.5701 },
      { nome: 'Trilha do Pico', categoria: 'turismo', descricao: 'Trilha guiada de meio dia até o mirante, com cerca de 4 km de subida moderada.', rua: 'Estrada do Pico do Itapeva', numero: 's/n', bairro: 'Itapeva', cep: '12460-000', lat: -22.7078, lng: -45.5503 },
    ],
  },
  {
    cidade: 'Florianópolis',
    uf: 'SC',
    lugares: [
      { nome: 'Ostra Viva', categoria: 'restaurantes', descricao: 'Ostras e frutos do mar direto do cultivo, servidos em deque sobre a baía.', rua: 'Rodovia Baldicero Filomeno', numero: '7640', bairro: 'Ribeirão da Ilha', cep: '88064-001', lat: -27.7329, lng: -48.5642 },
      { nome: 'Bar da Maré', categoria: 'bares', descricao: 'Bar de praia com petiscos, caipirinha de frutas e música ao vivo no fim de tarde.', rua: 'Avenida Pequeno Príncipe', numero: '1020', bairro: 'Campeche', cep: '88063-300', lat: -27.6787, lng: -48.4821 },
      { nome: 'Casa Azul Hostel', categoria: 'hospedagem', descricao: 'Hostel a duas quadras da praia, com cozinha coletiva e quartos privativos.', rua: 'Rua das Gaivotas', numero: '315', bairro: 'Lagoa da Conceição', cep: '88062-100', lat: -27.6037, lng: -48.4631 },
      { nome: 'Mirante da Lagoa', categoria: 'turismo', descricao: 'Ponto de parada com vista da Lagoa da Conceição, ideal para fotos e para ver o pôr do sol.', rua: 'Rodovia SC-406', numero: 'km 5', bairro: 'Lagoa da Conceição', cep: '88062-000', lat: -27.5988, lng: -48.4682 },
    ],
  },
  {
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    lugares: [
      { nome: 'Boteco do Morro', categoria: 'bares', descricao: 'Boteco com bolinho de feijoada, chope gelado e roda de samba aos sábados.', rua: 'Rua Ladeira da Glória', numero: '44', bairro: 'Glória', cep: '22211-120', lat: -22.9206, lng: -43.1742 },
      { nome: 'Padaria Aurora', categoria: 'cafes', descricao: 'Padaria de bairro com pão na chapa, café coado e sucos de fruta na hora.', rua: 'Rua Visconde de Pirajá', numero: '330', bairro: 'Ipanema', cep: '22410-001', lat: -22.9847, lng: -43.2043 },
      { nome: 'Hotel Orla Azul', categoria: 'hospedagem', descricao: 'Hotel de frente para a praia, com piscina na cobertura e café da manhã incluído.', rua: 'Avenida Atlântica', numero: '2100', bairro: 'Copacabana', cep: '22021-001', lat: -22.9733, lng: -43.1869 },
      { nome: 'Mirante do Açúcar', categoria: 'turismo', descricao: 'Subida de bondinho com vista da baía de Guanabara. Chegue cedo para evitar fila.', rua: 'Avenida Pasteur', numero: '520', bairro: 'Urca', cep: '22290-240', lat: -22.9519, lng: -43.1654 },
    ],
  },
  {
    cidade: 'Porto Alegre',
    uf: 'RS',
    lugares: [
      { nome: 'Churrasco do Gaúcho', categoria: 'restaurantes', descricao: 'Churrascaria com espeto corrido, buffet de saladas e sobremesas caseiras.', rua: 'Avenida Protásio Alves', numero: '1500', bairro: 'Petrópolis', cep: '90410-001', lat: -30.0412, lng: -51.1856 },
      { nome: 'Café do Cais', categoria: 'cafes', descricao: 'Café com vista para o Guaíba, bolos caseiros e mesas ao ar livre.', rua: 'Avenida Mauá', numero: '1050', bairro: 'Centro Histórico', cep: '90010-110', lat: -30.0287, lng: -51.2298 },
      { nome: 'Cervejaria Quarta Onda', categoria: 'bares', descricao: 'Cervejaria artesanal com rótulos próprios, tábuas de frios e mesas coletivas.', rua: 'Rua Padre Chagas', numero: '170', bairro: 'Moinhos de Vento', cep: '90570-080', lat: -30.0273, lng: -51.2018 },
      { nome: 'Parque da Orla', categoria: 'turismo', descricao: 'Orla do Guaíba com ciclovia, quadras e o melhor pôr do sol da cidade.', rua: 'Avenida Edvaldo Pereira Paiva', numero: 's/n', bairro: 'Praia de Belas', cep: '90110-150', lat: -30.0462, lng: -51.2386 },
    ],
  },
  {
    cidade: 'Curitiba',
    uf: 'PR',
    lugares: [
      { nome: 'Pinhão & Cia', categoria: 'restaurantes', descricao: 'Cozinha paranaense com barreado, pinhão e pratos de panela para dividir.', rua: 'Rua Mateus Leme', numero: '1200', bairro: 'São Francisco', cep: '80510-190', lat: -25.4262, lng: -49.2713 },
      { nome: 'Torra Curitiba', categoria: 'cafes', descricao: 'Torrefação com cafés especiais, métodos filtrados e lanches rápidos.', rua: 'Rua Presidente Faria', numero: '95', bairro: 'Centro', cep: '80020-290', lat: -25.4304, lng: -49.2697 },
      { nome: 'Ateliê do Batel', categoria: 'comercio', descricao: 'Loja de design e artesanato local com cerâmica, tecidos e objetos para casa.', rua: 'Avenida Batel', numero: '1600', bairro: 'Batel', cep: '80420-090', lat: -25.4414, lng: -49.2838 },
      { nome: 'Jardim da Estufa', categoria: 'turismo', descricao: 'Jardim com estufa de vidro, canteiros floridos e trilhas curtas para caminhar à tarde.', rua: 'Rua Engenheiro Ostoja Roguski', numero: 's/n', bairro: 'Jardim Botânico', cep: '80210-390', lat: -25.4425, lng: -49.2394 },
    ],
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/**
 * Preço e comodidades de exemplo por categoria (os lugares são fictícios).
 * O "i" (posição do lugar na cidade) varia um pouco para os filtros terem o que separar.
 */
const PERFIL: Record<Lugar['categoria'], (i: number) => { priceLevel: number | null; amenities: string[] }> = {
  restaurantes: (i) => ({ priceLevel: 2 + (i % 3), amenities: ['PIX', 'CARD', 'RESERVATIONS', ...(i % 2 ? ['OUTDOOR', 'VEGETARIAN'] : ['PET_FRIENDLY']), ...(i % 3 === 0 ? ['KIDS'] : [])] }),
  cafes: (i) => ({ priceLevel: 1 + (i % 2), amenities: ['WIFI', 'PIX', 'CARD', ...(i % 2 ? ['PET_FRIENDLY', 'VEGETARIAN'] : ['AIR_CONDITIONING'])] }),
  bares: (i) => ({ priceLevel: 2 + (i % 2), amenities: ['PIX', 'CARD', 'LIVE_MUSIC', ...(i % 2 ? ['OUTDOOR', 'PET_FRIENDLY'] : ['DELIVERY'])] }),
  hospedagem: (i) => ({ priceLevel: 2 + (i % 3), amenities: ['WIFI', 'PARKING', 'AIR_CONDITIONING', 'CARD', ...(i % 2 ? ['ACCESSIBLE', 'PET_FRIENDLY'] : ['KIDS'])] }),
  turismo: (i) => ({ priceLevel: i % 2 ? 1 : null, amenities: ['PARKING', ...(i % 2 ? ['ACCESSIBLE', 'KIDS'] : ['PET_FRIENDLY', 'OUTDOOR'])] }),
  comercio: () => ({ priceLevel: 2, amenities: ['PIX', 'CARD', 'AIR_CONDITIONING', 'ACCESSIBLE'] }),
};

async function main() {
  const dono = await prisma.user.findUnique({ where: { email: 'comerciante@guiaturistico.com' } });
  if (!dono) throw new Error('Rode antes: pnpm --filter @guia/api db:seed');

  const categorias = await prisma.category.findMany();
  const porSlug = new Map(categorias.map((c) => [c.slug, c.id]));

  let criados = 0;
  for (const c of CIDADES) {
    for (const [i, l] of c.lugares.entries()) {
      const categoryId = porSlug.get(l.categoria);
      if (!categoryId) throw new Error(`Categoria ausente: ${l.categoria}`);
      const slug = slugify(`${l.nome}-${c.cidade}`);

      await prisma.place.upsert({
        where: { slug },
        // reaplicar o seed completa preço e comodidades, sem mexer no que o comerciante já editou nos outros campos
        update: PERFIL[l.categoria](i),
        create: {
          ...PERFIL[l.categoria](i),
          ownerId: dono.id,
          categoryId,
          name: l.nome,
          slug,
          description: l.descricao,
          street: l.rua,
          number: l.numero,
          neighborhood: l.bairro,
          city: c.cidade,
          state: c.uf,
          postalCode: l.cep,
          latitude: l.lat,
          longitude: l.lng,
          isActive: true,
        },
      });
      criados++;
    }
  }
  console.log(`✅ ${criados} lugares de demonstração em ${CIDADES.length} cidades`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
