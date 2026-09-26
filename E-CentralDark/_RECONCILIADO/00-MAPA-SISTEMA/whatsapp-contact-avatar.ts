/**
 * Lote 6 (2026-06-09) — Rota interna read-only
 * `GET /v1/whatsapp/contacts/:phone/avatar`.
 *
 * Consome `service.getContactAvatar(phone, preview)` que reflete
 * `GET /user/avatar` do WuzAPI (read-only puro).
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a `process.env`: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - `:phone` é normalizado e validado antes de bater no upstream.
 *  - Erros sanitizados via handleSafeError.
 *  - Nenhum byte de mídia binária é decodificado/persistido aqui — apenas
 *    metadados (URL, ID, Type, DirectPath) são devolvidos.
 */

import type {
  WuzApiAvatarInfo,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppContactAvatarParams {
  phone?: string;
}

export interface WhatsAppContactAvatarQuery {
  preview?: string | boolean;
}

export interface WhatsAppContactAvatarRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
  params?: WhatsAppContactAvatarParams;
  query?: WhatsAppContactAvatarQuery;
}

export interface WhatsAppContactAvatarServiceLike {
  getContactAvatar(
    phoneOrJid: string,
    preview?: boolean,
  ): Promise<WuzApiReadOnlyResult<WuzApiAvatarInfo>>;
}

export interface WhatsAppContactAvatarHandlerDeps {
  service: WhatsAppContactAvatarServiceLike;
}

export interface WhatsAppContactAvatarResponseBody {
  ok: true;
  route: '/v1/whatsapp/contacts/:phone/avatar';
  workspaceId: string;
  requestId: string;
  source: 'wuzapi';
  composedFrom: ['/user/avatar'];
  phone: string;
  preview: boolean;
  avatar: WuzApiAvatarInfo;
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppContactAvatarResponse {
  statusCode: number;
  body:
    | WhatsAppContactAvatarResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

/** Normaliza o `:phone` da URL: aceita E.164, JID (`@s.whatsapp.net`) e LID. */
function normalizePhoneParam(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new Error('Parâmetro :phone ausente ou inválido.');
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('Parâmetro :phone ausente ou inválido.');
  }

  const sanitized = trimmed
    .replace(/@s\.whatsapp\.net$/i, '')
    .replace(/@lid$/i, '')
    .replace(/[^0-9+]/g, '');

  if (!sanitized || sanitized.replace(/\+/g, '').length < 5) {
    throw new Error('Parâmetro :phone inválido.');
  }

  return sanitized;
}

function resolvePreviewFlag(raw: unknown): boolean {
  if (raw === undefined || raw === null || raw === '') {
    return true;
  }

  if (typeof raw === 'boolean') {
    return raw;
  }

  const value = String(raw).trim().toLowerCase();

  if (['false', '0', 'no', 'off', 'full'].includes(value)) {
    return false;
  }

  return true;
}

export function createGetWhatsAppContactAvatarHandler(
  deps: WhatsAppContactAvatarHandlerDeps,
) {
  return async function getWhatsAppContactAvatar(
    request: WhatsAppContactAvatarRequest = {},
  ): Promise<WhatsAppContactAvatarResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const phone = normalizePhoneParam(request.params?.phone);
      const preview = resolvePreviewFlag(request.query?.preview);

      const result = await deps.service.getContactAvatar(phone, preview);
      const avatar = (result.payload ?? {}) as WuzApiAvatarInfo;

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/contacts/:phone/avatar',
          workspaceId: ctx.workspaceId,
          requestId,
          source: 'wuzapi',
          composedFrom: ['/user/avatar'],
          phone,
          preview,
          avatar,
          upstream: {
            httpStatus: result.httpStatus,
            skipped: result.skipped,
            reason: result.reason,
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const handled = handleSafeError(error, requestId);
      return {
        statusCode: handled.statusCode,
        body: handled.body,
      };
    }
  };
}

export const WHATSAPP_CONTACT_AVATAR_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/contacts/:phone/avatar' as const,
  readOnly: true as const,
  composedFrom: ['/user/avatar'] as const,
};
