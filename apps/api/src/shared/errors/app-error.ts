export class AppError extends Error {
  public readonly statusCode: number;

  /** campo do formulário que causou o erro (ex.: "city"), quando houver */
  public readonly field?: string;

  constructor(message: string, statusCode = 400, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
