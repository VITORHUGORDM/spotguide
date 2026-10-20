import { describe, expect, it } from 'vitest';
import {
  coordenadasNoBrasil,
  formataCep,
  formataTelefone,
  limpaDocumento,
  mascaraDocumento,
  mascaraDocumentoParcial,
  mascaraTelefone,
  normalizaHorario,
  normalizaTelefone,
  normalizaUrlHttp,
  problemaNaSenha,
  tipoDocumento,
  validaCep,
  validaCnpj,
  validaCpf,
  validaNomePessoa,
} from './validadores.js';

describe('CPF', () => {
  it('aceita CPF válido com ou sem pontuação', () => {
    expect(validaCpf('529.982.247-25')).toBe(true);
    expect(validaCpf('52998224725')).toBe(true);
  });

  it('recusa dígito verificador errado, tamanho errado e sequências repetidas', () => {
    expect(validaCpf('529.982.247-26')).toBe(false);
    expect(validaCpf('529.982.247')).toBe(false);
    expect(validaCpf('111.111.111-11')).toBe(false);
    expect(validaCpf('')).toBe(false);
  });
});

describe('CNPJ', () => {
  it('aceita CNPJ numérico válido', () => {
    expect(validaCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('aceita o CNPJ alfanumérico (exemplo oficial da Receita)', () => {
    expect(validaCnpj('12.ABC.345/01DE-35')).toBe(true);
    expect(validaCnpj('12abc34501de35')).toBe(true);
  });

  it('recusa dígito verificador errado e repetidos', () => {
    expect(validaCnpj('11.222.333/0001-82')).toBe(false);
    expect(validaCnpj('12.ABC.345/01DE-36')).toBe(false);
    expect(validaCnpj('00.000.000/0000-00')).toBe(false);
  });
});

describe('documento', () => {
  it('identifica o tipo', () => {
    expect(tipoDocumento('529.982.247-25')).toBe('CPF');
    expect(tipoDocumento('11.222.333/0001-81')).toBe('CNPJ');
    expect(tipoDocumento('123')).toBeNull();
  });

  it('limpa a pontuação', () => {
    expect(limpaDocumento('529.982.247-25')).toBe('52998224725');
    expect(limpaDocumento('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });

  it('aplica a máscara enquanto digita', () => {
    expect(mascaraDocumento('52998224')).toBe('529.982.24');
    expect(mascaraDocumento('52998224725')).toBe('529.982.247-25');
    expect(mascaraDocumento('112223330001')).toBe('11.222.333/0001');
  });

  it('esconde quase todo o número na máscara parcial', () => {
    expect(mascaraDocumentoParcial('52998224725')).toBe('***.982.247-**');
    expect(mascaraDocumentoParcial('52998224725')).not.toContain('529');
  });
});

describe('CEP', () => {
  it('valida 8 dígitos e recusa zerado', () => {
    expect(validaCep('95670-000')).toBe(true);
    expect(validaCep('95670000')).toBe(true);
    expect(validaCep('00000-000')).toBe(false);
    expect(validaCep('9567')).toBe(false);
  });

  it('formata com hífen', () => {
    expect(formataCep('95670000')).toBe('95670-000');
    expect(formataCep('956')).toBe('956');
  });
});

describe('telefone', () => {
  it('normaliza celular e fixo para só dígitos', () => {
    expect(normalizaTelefone('(54) 99999-0000')).toBe('54999990000');
    expect(normalizaTelefone('(54) 3286-0000')).toBe('5432860000');
  });

  it('aceita o +55 e números 0800', () => {
    expect(normalizaTelefone('+55 54 99999-0000')).toBe('54999990000');
    expect(normalizaTelefone('0800 123 4567')).toBe('08001234567');
  });

  it('recusa DDD inexistente, celular sem 9 e fixo com 9 dígitos', () => {
    expect(normalizaTelefone('(10) 99999-0000')).toBeNull();
    expect(normalizaTelefone('(54) 8999-0000')).toBeNull();
    expect(normalizaTelefone('(54) 9999-0000')).toBeNull();
    expect(normalizaTelefone('12345')).toBeNull();
  });

  it('formata e mascara', () => {
    expect(formataTelefone('54999990000')).toBe('(54) 99999-0000');
    expect(formataTelefone('5432860000')).toBe('(54) 3286-0000');
    expect(mascaraTelefone('5499')).toBe('(54) 99');
  });
});

describe('horário', () => {
  it('padroniza para HH:mm', () => {
    expect(normalizaHorario('9:30')).toBe('09:30');
    expect(normalizaHorario('0930')).toBe('09:30');
    expect(normalizaHorario('23:59')).toBe('23:59');
  });

  it('recusa horas e minutos impossíveis', () => {
    expect(normalizaHorario('24:00')).toBeNull();
    expect(normalizaHorario('12:60')).toBeNull();
    expect(normalizaHorario('abc')).toBeNull();
  });
});

describe('coordenadas', () => {
  it('aceita pontos dentro do Brasil, inclusive ilhas', () => {
    expect(coordenadasNoBrasil(-23.55, -46.63)).toBe(true);
    expect(coordenadasNoBrasil(-3.85, -32.42)).toBe(true); // Fernando de Noronha
  });

  it('recusa pontos fora do Brasil e valores inválidos', () => {
    expect(coordenadasNoBrasil(38.7, -9.1)).toBe(false); // Lisboa
    expect(coordenadasNoBrasil(0, 0)).toBe(false);
    expect(coordenadasNoBrasil(Number.NaN, -46)).toBe(false);
  });
});

describe('links', () => {
  it('completa o https e normaliza', () => {
    expect(normalizaUrlHttp('instagram.com/loja')).toBe('https://instagram.com/loja');
    expect(normalizaUrlHttp('http://exemplo.com.br')).toBe('http://exemplo.com.br/');
  });

  it('recusa esquemas perigosos, hosts sem ponto e espaços', () => {
    expect(normalizaUrlHttp('javascript:alert(1)')).toBeNull();
    expect(normalizaUrlHttp('data:text/html,<script>')).toBeNull();
    expect(normalizaUrlHttp('http://localhost')).toBeNull();
    expect(normalizaUrlHttp('exemplo com')).toBeNull();
    expect(normalizaUrlHttp('https://user:pass@exemplo.com')).toBeNull();
  });
});

describe('nome de pessoa', () => {
  it('exige nome e sobrenome só com letras', () => {
    expect(validaNomePessoa('Maria da Silva')).toBe(true);
    expect(validaNomePessoa("João D'Ávila")).toBe(true);
    expect(validaNomePessoa('Maria')).toBe(false);
    expect(validaNomePessoa('Maria 123')).toBe(false);
  });
});

describe('senha', () => {
  it('aceita uma senha forte', () => {
    expect(problemaNaSenha('Senha#Forte1', 'ana@exemplo.com')).toBeNull();
  });

  it('aponta o motivo quando é fraca', () => {
    expect(problemaNaSenha('abc')).toMatch(/8 caracteres/);
    expect(problemaNaSenha('abcdefg1')).toMatch(/maiúscula/);
    expect(problemaNaSenha('ABCDEFG1')).toMatch(/minúscula/);
    expect(problemaNaSenha('Abcdefgh')).toMatch(/número/);
    expect(problemaNaSenha('Senha123')).toMatch(/comum/);
    expect(problemaNaSenha('Joaosilva1', 'joaosilva@x.com')).toMatch(/e-mail/);
  });

  it('recusa senha maior que o limite de 72 bytes do bcrypt', () => {
    expect(problemaNaSenha(`Aa1${'x'.repeat(80)}`)).toMatch(/72/);
  });
});
