/** Cache em memória com validade curta. Chamadas simultâneas dividem a mesma consulta. */
const todos = new Set<TtlCache<unknown>>();

export class TtlCache<T> {
  private valor?: { em: number; dado: T };
  private pendente?: Promise<T>;

  constructor(private ttlMs: number, private carrega: () => Promise<T>) {
    todos.add(this);
  }

  async get(): Promise<T> {
    if (this.valor && Date.now() - this.valor.em < this.ttlMs) return this.valor.dado;
    this.pendente ??= this.carrega()
      .then((dado) => {
        this.valor = { em: Date.now(), dado };
        return dado;
      })
      .finally(() => {
        this.pendente = undefined;
      });
    return this.pendente;
  }

  limpa() {
    this.valor = undefined;
  }
}

/** Chamado quando um local é criado, editado ou removido. */
export const limpaCaches = () => todos.forEach((c) => c.limpa());
