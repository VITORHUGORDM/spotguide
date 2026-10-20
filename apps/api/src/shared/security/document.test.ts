import { describe, expect, it } from 'vitest';
import { protegeDocumento } from './document.js';

describe('protegeDocumento', () => {
  it('devolve hash, tipo e máscara, e nunca o número', () => {
    const r = protegeDocumento('529.982.247-25');
    expect(r).not.toBeNull();
    expect(r?.type).toBe('CPF');
    expect(r?.mask).toBe('***.982.247-**');
    expect(r?.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(r)).not.toContain('52998224725');
  });

  it('dá o mesmo hash com ou sem pontuação (impede conta duplicada)', () => {
    expect(protegeDocumento('529.982.247-25')?.hash).toBe(protegeDocumento('52998224725')?.hash);
    expect(protegeDocumento('12.ABC.345/01DE-35')?.hash).toBe(protegeDocumento('12abc34501de35')?.hash);
  });

  it('dá hashes diferentes para documentos diferentes', () => {
    expect(protegeDocumento('529.982.247-25')?.hash).not.toBe(protegeDocumento('11.222.333/0001-81')?.hash);
  });

  it('reconhece CNPJ e recusa documento inválido', () => {
    expect(protegeDocumento('11.222.333/0001-81')?.type).toBe('CNPJ');
    expect(protegeDocumento('529.982.247-26')).toBeNull();
    expect(protegeDocumento('')).toBeNull();
  });
});
