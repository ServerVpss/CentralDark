/**
 * Lote 5 (2026-06-09) — Rota interna read-only `GET /v1/whatsapp/contacts`.
 *
 * Consome `service.listContacts()` que reflete `GET /user/contacts` do WuzAPI.
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a `process.env`: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - Erros sanitizados via handleSafeError.
 */

import type {
  WuzApiContactRecord,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppContactsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
}

export interface WhatsAppContactsServiceLike {
  listContacts(): Promise<WuzApiReadOnlyResult<WuzApiContactRecord[]>>;
}

export interface WhatsAppContactsHandlerDeps {
  service: WhatsAppContactsServiceLike;
}

export interface WhatsAppContactsResponseBody {
  ok: true;
  route: '/v1/whatsapp/contacts';
  workspaceId: string;
  requestId: string;
  source: 'wuzapi';
  composedFrom: ['/user/contacts'];
  count: number;
  contacts: WuzApiContactRecord[];
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppContactsResponse {
  statusCode: number;
  body:
    | WhatsAppContactsResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

export function createGetWhatsAppContactsHandler(deps: WhatsAppContactsHandlerDeps) {
  return async function getWhatsAppContacts(
    request: WhatsAppContactsRequest = {},
  ): Promise<WhatsAppContactsResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const result = await deps.service.listContacts();
      const contacts = Array.isArray(result.payload) ? result.payload : [];

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/contacts',
          workspaceId: ctx.workspaceId,
          requestId,
          source: 'wuzapi',
          composedFrom: ['/user/contacts'],
          count: contacts.length,
          contacts,
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

export const WHATSAPP_CONTACTS_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/contacts' as const,
  readOnly: true as const,
  composedFrom: ['/user/contacts'] as const,
};
