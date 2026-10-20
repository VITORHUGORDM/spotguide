/** Faixa de preço e comodidades que o comerciante marca e o viajante filtra. Sem zod: o site usa direto. */

export const FAIXAS_PRECO = [
  { nivel: 1, simbolo: '$', rotulo: 'Econômico' },
  { nivel: 2, simbolo: '$$', rotulo: 'Moderado' },
  { nivel: 3, simbolo: '$$$', rotulo: 'Caro' },
  { nivel: 4, simbolo: '$$$$', rotulo: 'Sofisticado' },
] as const;

export const COMODIDADES = [
  { id: 'WIFI', rotulo: 'Wi-Fi grátis' },
  { id: 'PET_FRIENDLY', rotulo: 'Aceita pets' },
  { id: 'PARKING', rotulo: 'Estacionamento' },
  { id: 'ACCESSIBLE', rotulo: 'Acessível (PCD)' },
  { id: 'RESERVATIONS', rotulo: 'Aceita reservas' },
  { id: 'DELIVERY', rotulo: 'Delivery' },
  { id: 'OUTDOOR', rotulo: 'Área externa' },
  { id: 'KIDS', rotulo: 'Espaço kids' },
  { id: 'AIR_CONDITIONING', rotulo: 'Ar-condicionado' },
  { id: 'LIVE_MUSIC', rotulo: 'Música ao vivo' },
  { id: 'VEGETARIAN', rotulo: 'Opções vegetarianas' },
  { id: 'PIX', rotulo: 'Aceita Pix' },
  { id: 'CARD', rotulo: 'Aceita cartão' },
] as const;

export type ComodidadeId = (typeof COMODIDADES)[number]['id'];

export const COMODIDADE_IDS = COMODIDADES.map((c) => c.id) as [ComodidadeId, ...ComodidadeId[]];

const ROTULOS = new Map<string, string>(COMODIDADES.map((c) => [c.id, c.rotulo]));
export const rotuloComodidade = (id: string) => ROTULOS.get(id) ?? id;

export const simboloPreco = (nivel: number | null | undefined) =>
  FAIXAS_PRECO.find((f) => f.nivel === nivel)?.simbolo ?? null;
