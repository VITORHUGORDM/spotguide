/**
 * Validadores de dados brasileiros, sem dependências: rodam no navegador (mensagem na hora de digitar)
 * e na API (a palavra final). Importe de "@guia/contracts/validadores".
 */

export const soDigitos = (s: string) => s.replace(/\D/g, '');

/* ---------- CPF e CNPJ ---------- */

export function validaCpf(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digito = (qtd: number) => {
    let soma = 0;
    for (let i = 0; i < qtd; i++) soma += Number(d[i]) * (qtd + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/** Letras e números do CNPJ, sem pontuação e em maiúsculas. */
export const limpaCnpj = (s: string) => s.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

/**
 * CNPJ numérico ou alfanumérico (formato novo, em vigor desde julho de 2026).
 * Cada caractere vale seu código ASCII menos 48 ('0'=0 ... '9'=9, 'A'=17 ... 'Z'=42).
 */
export function validaCnpj(valor: string): boolean {
  const c = limpaCnpj(valor);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c) || /^(.)\1{13}$/.test(c)) return false;

  const digito = (qtd: number) => {
    const pesos = qtd === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < qtd; i++) soma += (c.charCodeAt(i) - 48) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12) === Number(c[12]) && digito(13) === Number(c[13]);
}

export type TipoDocumento = 'CPF' | 'CNPJ';

export function tipoDocumento(valor: string): TipoDocumento | null {
  if (validaCpf(valor)) return 'CPF';
  if (validaCnpj(valor)) return 'CNPJ';
  return null;
}

/** Só os caracteres que contam: CPF em dígitos, CNPJ em letras/dígitos maiúsculos. */
export const limpaDocumento = (valor: string) => (tipoDocumento(valor) === 'CPF' ? soDigitos(valor) : limpaCnpj(valor));

export function formataCpf(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  let saida = d.slice(0, 3);
  if (d.length > 3) saida += `.${d.slice(3, 6)}`;
  if (d.length > 6) saida += `.${d.slice(6, 9)}`;
  if (d.length > 9) saida += `-${d.slice(9, 11)}`;
  return saida;
}

export function formataCnpj(valor: string) {
  const c = limpaCnpj(valor).slice(0, 14);
  const partes = [c.slice(0, 2), c.slice(2, 5), c.slice(5, 8), c.slice(8, 12), c.slice(12, 14)];
  let saida = partes[0];
  if (partes[1]) saida += `.${partes[1]}`;
  if (partes[2]) saida += `.${partes[2]}`;
  if (partes[3]) saida += `/${partes[3]}`;
  if (partes[4]) saida += `-${partes[4]}`;
  return saida;
}

/** Máscara enquanto digita: até 11 dígitos é CPF, passou disso (ou tem letra) é CNPJ. */
export function mascaraDocumento(valor: string) {
  const limpo = limpaCnpj(valor);
  return limpo.length <= 11 && /^\d*$/.test(limpo) ? formataCpf(limpo) : formataCnpj(limpo);
}

/** "***.456.789-**": o suficiente para a pessoa reconhecer, sem guardar o número inteiro. */
export function mascaraDocumentoParcial(valor: string) {
  const tipo = tipoDocumento(valor);
  if (tipo === 'CPF') {
    const d = soDigitos(valor);
    return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  }
  const c = limpaCnpj(valor);
  return `**.***.${c.slice(5, 8)}/${c.slice(8, 12)}-**`;
}

/* ---------- CEP ---------- */

export function validaCep(valor: string): boolean {
  const d = soDigitos(valor);
  return d.length === 8 && d !== '00000000';
}

export function formataCep(valor: string) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/* ---------- Telefone ---------- */

const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53,
  54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96,
  97, 98, 99,
]);

/**
 * Devolve o número só com dígitos (DDD + número, sem o +55) ou null se não for um telefone brasileiro válido.
 * Aceita celular (9 dígitos começando em 9), fixo (8 dígitos começando em 2 a 5) e 0800/0300/0500/0900.
 */
export function normalizaTelefone(valor: string): string | null {
  let d = soDigitos(valor);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);

  if (/^0[3589]00\d{6,7}$/.test(d)) return d;
  if (d.length !== 10 && d.length !== 11) return null;
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return null;

  const numero = d.slice(2);
  if (numero.length === 9) return numero[0] === '9' && !/^(\d)\1+$/.test(numero) ? d : null;
  return /^[2-5]/.test(numero) && !/^(\d)\1+$/.test(numero) ? d : null;
}

export const validaTelefone = (valor: string) => normalizaTelefone(valor) !== null;

export function formataTelefone(valor: string) {
  const d = soDigitos(valor);
  if (/^0[3589]00/.test(d)) return d.replace(/^(\d{4})(\d{3})(\d{0,4})$/, '$1 $2 $3').trim();
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return valor;
}

/** Máscara enquanto digita: (54) 99999-0000. */
export function mascaraTelefone(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ---------- Horário, coordenadas, links, nomes ---------- */

/** "9:30", "0930" ou "09:30" viram "09:30"; qualquer outra coisa é null. */
export function normalizaHorario(valor: string): string | null {
  const m = valor.trim().match(/^([01]?\d|2[0-3]):?([0-5]\d)$/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
}

/** Retângulo que contém o Brasil inteiro, ilhas oceânicas incluídas. */
const BRASIL = { latMin: -33.75, latMax: 5.3, lngMin: -73.99, lngMax: -28.8 };

export const coordenadasNoBrasil = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= BRASIL.latMin &&
  lat <= BRASIL.latMax &&
  lng >= BRASIL.lngMin &&
  lng <= BRASIL.lngMax;

/**
 * Só http/https (nada de javascript: ou data:, que viram XSS quando o link é exibido).
 * Aceita "instagram.com/negocio" sem esquema e completa com https://.
 */
export function normalizaUrlHttp(valor: string): string | null {
  const texto = valor.trim();
  if (!texto || texto.length > 300 || /\s/.test(texto)) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(texto) ? texto : `https://${texto}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.') || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Nome de pessoa: pelo menos nome e sobrenome, só letras, espaço, apóstrofo, ponto e hífen. */
export function validaNomePessoa(valor: string): boolean {
  const nome = valor.trim().replace(/\s+/g, ' ');
  return /^\p{L}[\p{L}'’.-]*(?: \p{L}[\p{L}'’.-]*)+$/u.test(nome) && nome.length >= 5;
}

const SENHAS_COMUNS = new Set(['senha123', 'password1', 'senha1234', 'brasil123', '12345678', 'qwerty123', 'abc12345', 'spotguide1']);

/** Motivo pelo qual a senha é fraca, ou null se estiver boa. */
export function problemaNaSenha(senha: string, email?: string): string | null {
  if (senha.length < 8) return 'A senha deve conter no mínimo 8 caracteres';
  // o bcrypt só lê os primeiros 72 bytes; o resto seria ignorado em silêncio
  if (new TextEncoder().encode(senha).length > 72) return 'A senha pode ter no máximo 72 caracteres';
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter ao menos uma letra maiúscula';
  if (!/[a-z]/.test(senha)) return 'A senha deve conter ao menos uma letra minúscula';
  if (!/[0-9]/.test(senha)) return 'A senha deve conter ao menos um número';
  if (SENHAS_COMUNS.has(senha.toLowerCase())) return 'Essa senha é muito comum. Escolha outra';
  const usuario = email?.split('@')[0]?.toLowerCase();
  if (usuario && usuario.length >= 4 && senha.toLowerCase().includes(usuario)) return 'A senha não pode conter o seu e-mail';
  return null;
}
