export interface Cidade {
  slug: string;
  nome: string;
  uf: string;
  tag: string;
  subtitulo: string;
  /** texto da página da cidade (também usado na descrição para o Google) */
  texto: string;
  /** melhor época para ir, em uma linha */
  epoca: string;
}

export const CIDADES: Cidade[] = [
  {
    slug: 'gramado',
    nome: 'Gramado',
    uf: 'RS',
    tag: 'Mais procurado',
    subtitulo: 'Serra Gaúcha • Alta gastronomia e charme',
    texto:
      'Chocolate quente, fondue e hortênsias na serra gaúcha. Gramado funciona o ano todo, mas é no inverno, com neblina e lareira acesa, que a cidade mostra o que tem de melhor.',
    epoca: 'Junho a agosto para o frio; dezembro para o Natal Luz',
  },
  {
    slug: 'campos-do-jordao',
    nome: 'Campos do Jordão',
    uf: 'SP',
    tag: 'Inverno e luxo',
    subtitulo: 'Clima europeu • Vinhos e fondue',
    texto:
      'A cidade mais alta do Brasil troca o calor por pinheiros, chalés e trilhas curtas. Boa para um fim de semana de descanso, com restaurante de lareira e passeio no fim da tarde.',
    epoca: 'Junho a agosto, quando o festival de inverno enche a cidade',
  },
  {
    slug: 'florianopolis',
    nome: 'Florianópolis',
    uf: 'SC',
    tag: 'Litoral e agito',
    subtitulo: 'Ilha da Magia • Praias e frutos do mar',
    texto:
      'Mais de quarenta praias numa ilha só. Ostra fresca no sul, lagoa e bar à noite no centro-leste, trilha para quem quer fugir da areia cheia.',
    epoca: 'Dezembro a março para praia; setembro a novembro para menos gente',
  },
  {
    slug: 'rio-de-janeiro',
    nome: 'Rio de Janeiro',
    uf: 'RJ',
    tag: 'Cartão-postal',
    subtitulo: 'Cidade Maravilhosa • Cultura e paisagens',
    texto:
      'Morro, mar e boteco no mesmo mapa. Dá para subir ao mirante de manhã, almoçar perto da praia e fechar o dia numa roda de samba sem pegar carro.',
    epoca: 'Abril a junho e setembro a novembro: calor ameno e menos chuva',
  },
  {
    slug: 'porto-alegre',
    nome: 'Porto Alegre',
    uf: 'RS',
    tag: 'Capital sulista',
    subtitulo: 'Orla do Guaíba • Gastronomia e parques',
    texto:
      'Churrasco, chimarrão e o pôr do sol mais famoso do sul, na orla do Guaíba. Ótima para quem quer cidade grande com bairros caminháveis e cervejaria boa.',
    epoca: 'Março a maio e setembro a novembro',
  },
  {
    slug: 'curitiba',
    nome: 'Curitiba',
    uf: 'PR',
    tag: 'Inovação e café',
    subtitulo: 'Cidade modelo • Parques e café especial',
    texto:
      'Parques grandes, transporte que funciona e uma cena de café especial que cresce a cada ano. Combina bem com um roteiro a pé pelo Batel, pelo Centro e pelo Jardim Botânico.',
    epoca: 'O ano todo; leve casaco entre maio e setembro',
  },
];

export const cidadePorSlug = (slug: string) => CIDADES.find((c) => c.slug === slug);

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
