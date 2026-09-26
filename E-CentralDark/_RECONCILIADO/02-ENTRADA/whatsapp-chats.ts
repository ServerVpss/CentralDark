/**
 * Lote 4 (2026-06-09) — Rota interna read-only `GET /v1/whatsapp/chats`.
 *
 * Consome `service.getCentralDarkChats()` (Lote 3) que compõe
 * `/user/contacts` + `/group/list` do WuzAPI num único array
 * `CentralDarkChatSummary[]`.
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a `process.env`: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - Erros sanitizados via handleSafeError.
 */

import type {
  CentralDarkChatSummary,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppChatsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
}

export interface WhatsAppChatsServiceLike {
  getCentralDarkChats(): Promise<WuzApiReadOnlyResult<CentralDarkChatSummary[]>>;
}

export interface WhatsAppChatsHandlerDeps {
  service: WhatsAppChatsServiceLike;
}

export interface WhatsAppChatsResponseBody {
  ok: true;
  route: '/v1/whatsapp/chats';
  workspaceId: string;
  requestId: string;
  source: 'wuzapi';
  composedFrom: ['/user/contacts', '/group/list'];
  count: number;
  chats: CentralDarkChatSummary[];
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppChatsResponse {
  statusCode: number;
  body:
    | WhatsAppChatsResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

export function createGetWhatsAppChatsHandler(deps: WhatsAppChatsHandlerDeps) {
  return async function getWhatsAppChats(
    request: WhatsAppChatsRequest = {},
  ): Promise<WhatsAppChatsResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const result = await deps.service.getCentralDarkChats();
      const chats = Array.isArray(result.payload) ? result.payload : [];

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/chats',
          workspaceId: ctx.workspaceId,
          requestId,
          source: 'wuzapi',
          composedFrom: ['/user/contacts', '/group/list'],
          count: chats.length,
          chats,
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

export const WHATSAPP_CHATS_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/chats' as const,
  readOnly: true as const,
  composedFrom: ['/user/contacts', '/group/list'] as const,
};
