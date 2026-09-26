import type { SafeErrorPayload } from '../types/security';

export class BotServerSafeError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly requestId?: string;

  constructor(code: string, message: string, statusCode = 400, requestId?: string) {
    super(message);
    this.name = 'BotServerSafeError';
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }

  toPayload(): SafeErrorPayload {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      requestId: this.requestId,
    };
  }
}

export function toSafeErrorPayload(error: unknown, requestId?: string): SafeErrorPayload {
  if (error instanceof BotServerSafeError) {
    return error.toPayload();
  }

  return {
    code: 'internal_error',
    message: 'Erro interno seguro.',
    statusCode: 500,
    requestId,
  };
}

export function badRequest(message: string, requestId?: string): BotServerSafeError {
  return new BotServerSafeError('bad_request', message, 400, requestId);
}

export function unauthorized(message = 'Não autorizado.', requestId?: string): BotServerSafeError {
  return new BotServerSafeError('unauthorized', message, 401, requestId);
}

export function forbidden(message = 'Acesso negado.', requestId?: string): BotServerSafeError {
  return new BotServerSafeError('forbidden', message, 403, requestId);
}

export function notFound(message = 'Não encontrado.', requestId?: string): BotServerSafeError {
  return new BotServerSafeError('not_found', message, 404, requestId);
}
