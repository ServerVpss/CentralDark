import type { PayloadLimits, SafeValidationResult, SecurityContext } from '../types/security';
import { badRequest, forbidden } from './errors';
import { sanitizePhone, sanitizeTags, sanitizeText } from './sanitize';

export const DEFAULT_PAYLOAD_LIMITS: PayloadLimits = {
  maxTextLength: 4096,
  maxPhoneLength: 32,
  maxTagCount: 20,
  maxTagLength: 40,
};

export function validateWorkspaceId(workspaceId: unknown): SafeValidationResult<string> {
  if (typeof workspaceId !== 'string' || !workspaceId.trim()) {
    return { ok: false, error: badRequest('workspace_id obrigatório.').toPayload() };
  }

  const value = workspaceId.trim();

  if (!/^[a-zA-Z0-9_-]{6,80}$/.test(value)) {
    return { ok: false, error: badRequest('workspace_id inválido.').toPayload() };
  }

  return { ok: true, value };
}

export function assertSameWorkspace(context: SecurityContext, targetWorkspaceId: string): void {
  if (context.workspaceId !== targetWorkspaceId) {
    throw forbidden('Recurso fora do workspace atual.', context.requestId);
  }
}

export function validateMessageText(input: unknown, limits = DEFAULT_PAYLOAD_LIMITS): SafeValidationResult<string> {
  const value = sanitizeText(input);

  if (!value) {
    return { ok: false, error: badRequest('Texto da mensagem obrigatório.').toPayload() };
  }

  if (value.length > limits.maxTextLength) {
    return { ok: false, error: badRequest('Texto da mensagem acima do limite.').toPayload() };
  }

  return { ok: true, value };
}

export function validatePhone(input: unknown, limits = DEFAULT_PAYLOAD_LIMITS): SafeValidationResult<string> {
  const value = sanitizePhone(input);

  if (!value) {
    return { ok: false, error: badRequest('Telefone obrigatório.').toPayload() };
  }

  if (value.length > limits.maxPhoneLength) {
    return { ok: false, error: badRequest('Telefone acima do limite.').toPayload() };
  }

  return { ok: true, value };
}

export function validateTags(input: unknown, limits = DEFAULT_PAYLOAD_LIMITS): SafeValidationResult<string[]> {
  const value = sanitizeTags(input);

  if (value.length > limits.maxTagCount) {
    return { ok: false, error: badRequest('Quantidade de tags acima do limite.').toPayload() };
  }

  if (value.some((tag) => tag.length > limits.maxTagLength)) {
    return { ok: false, error: badRequest('Tag acima do limite.').toPayload() };
  }

  return { ok: true, value };
}
