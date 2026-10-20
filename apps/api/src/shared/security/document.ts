import { createHmac } from 'node:crypto';
import { limpaDocumento, mascaraDocumentoParcial, tipoDocumento, type TipoDocumento } from '@guia/contracts/validadores';
import { env } from '../env.js';

export interface DocumentoProtegido {
  hash: string;
  type: TipoDocumento;
  mask: string;
}

/**
 * CPF/CNPJ é dado pessoal (LGPD): guardamos só um HMAC, que basta para impedir duas contas com o
 * mesmo documento, e uma máscara para a pessoa se reconhecer. Não dá para voltar ao número original.
 */
export function protegeDocumento(valor: string): DocumentoProtegido | null {
  const type = tipoDocumento(valor);
  if (!type) return null;
  const hash = createHmac('sha256', env.DOCUMENT_PEPPER ?? env.JWT_SECRET).update(`doc:${limpaDocumento(valor)}`).digest('hex');
  return { hash, type, mask: mascaraDocumentoParcial(valor) };
}
