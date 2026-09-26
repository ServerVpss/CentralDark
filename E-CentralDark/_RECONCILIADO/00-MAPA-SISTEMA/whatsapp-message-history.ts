/**
 * Lote 10 (2026-06-09) — Rota interna read-only
 * `GET /v1/whatsapp/messages/:chatId/history`.
 *
 * Consome `service.getChatHistory({ chatJid, limit, cursor })` que reflete
 * `GET /chat/history` do WuzAPI. Aceita JID de contato (`@s.whatsapp.net`),
 * grupo (`@g.us`) ou LID (`@lid`). Sem envio, sem write, sem mídia binária.
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a `process.env`: o service é injetado via factory.
 *  - `resolveWorkspaceContext` obrigatório (multi-tenant).
 *  - `requestId` propagado, erros sanitizados via `handleSafeError`.
 *  - `chatId` validado antes do upstream (sufixos `@s.whatsapp.net|@g.us|@lid`).
 *  - `limit` limitado a um teto seguro pra não puxar histórico gigante.
 *  - `cursor` opcional para paginação se o upstream suportar.
 */

import type {
  WuzApiChatHistoryResult,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export const WHATSAPP_HISTORY_DEFAULT_LIMIT = 50;
export const WHATSAPP_HISTORY_MAX_LIMIT = 200;

export interface WhatsAppMessageHistoryParams {
  chatId?: string;
}

export interface WhatsAppMessageHistoryQuery {
  limit?: string | number;
  cursor?: string;
}

export interface WhatsAppMessageHistoryRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
  params?: WhatsAppMessageHistoryParams;
  query?: WhatsAppMessageHistoryQuery;
}

export interface WhatsAppMessageHistoryServiceLike {
  getChatHistory(query: {
    chatJid: string;
    limit?: number;
    cursor?: string;
  }): Promise<WuzApiReadOnlyResult<WuzApiChatHistoryResult>>;
}

export interface WhatsAppMessageHistoryHandlerDeps {
  service: WhatsAppMessageHistoryServiceLike;
}

export interface WhatsAppMessageHistoryResponseBody {
  ok: true;
  route: '/v1/whatsapp/messages/:chatId/history';
  workspaceId: string;
  requestId: string;
  source: 'wuzapi';
  composedFrom: ['/chat/history'];
  chatId: string;
  chatKind: 'contact' | 'group' | 'lid';
  limit: number;
  cursor?: string;
  nextCursor?: string;
  messages: WuzApiChatHistoryResult['messages'];
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppMessageHistoryResponse {
  statusCode: number;
  body:
    | WhatsAppMessageHistoryResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

function assertChatIdSafe(raw: unknown): { chatId: string; kind: 'contact' | 'group' | 'lid' } {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Parâmetro :chatId ausente.');
  }

  const chatId = raw.trim();

  if (chatId.endsWith('@g.us')) {
    return { chatId, kind: 'group' };
  }
  if (chatId.endsWith('@s.whatsapp.net')) {
    return { chatId, kind: 'contact' };
  }
  if (chatId.endsWith('@lid')) {
    return { chatId, kind: 'lid' };
  }

  throw new Error('chatId inválido: deve terminar com @s.whatsapp.net, @g.us ou @lid.');
}

function resolveLimit(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') {
    return WHATSAPP_HISTORY_DEFAULT_LIMIT;
  }

  const value = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);

  if (!Number.isFinite(value) || value <= 0) {
    return WHATSAPP_HISTORY_DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(value), WHATSAPP_HISTORY_MAX_LIMIT);
}

function resolveCursor(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed ? trimmed : undefined;
}

export function createGetWhatsAppMessageHistoryHandler(
  deps: WhatsAppMessageHistoryHandlerDeps,
) {
  return async function getWhatsAppMessageHistory(
    request: WhatsAppMessageHistoryRequest = {},
  ): Promise<WhatsAppMessageHistoryResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const { chatId, kind } = assertChatIdSafe(request.params?.chatId);
      const limit = resolveLimit(request.query?.limit);
      const cursor = resolveCursor(request.query?.cursor);

      const result = await deps.service.getChatHistory({ chatJid: chatId, limit, cursor });
      const payload = result.payload ?? { messages: [] };

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/messages/:chatId/history',
          workspaceId: ctx.workspaceId,
          requestId,
          source: 'wuzapi',
          composedFrom: ['/chat/history'],
          chatId,
          chatKind: kind,
          limit,
          cursor,
          nextCursor: payload.nextCursor,
          messages: Array.isArray(payload.messages) ? payload.messages : [],
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

export const WHATSAPP_MESSAGE_HISTORY_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/messages/:chatId/history' as const,
  readOnly: true as const,
  composedFrom: ['/chat/history'] as const,
};
