/**
 * Lote 7 (2026-06-09) — Rota interna read-only `GET /v1/whatsapp/groups`.
 *
 * Consome `service.listGroups()` que reflete `GET /group/list` do WuzAPI.
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a `process.env`: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - Erros sanitizados via handleSafeError.
 */

import type {
  CentralDarkGroupSummary,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppGroupsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
}

export interface WhatsAppGroupsServiceLike {
  listGroups(): Promise<WuzApiReadOnlyResult<CentralDarkGroupSummary[]>>;
}

export interface WhatsAppGroupsHandlerDeps {
  service: WhatsAppGroupsServiceLike;
}

export interface WhatsAppGroupsResponseBody {
  ok: true;
  route: '/v1/whatsapp/groups';
  workspaceId: string;
  requestId: string;
  source: 'wuzapi';
  composedFrom: ['/group/list'];
  count: number;
  groups: CentralDarkGroupSummary[];
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppGroupsResponse {
  statusCode: number;
  body:
    | WhatsAppGroupsResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

export function createGetWhatsAppGroupsHandler(deps: WhatsAppGroupsHandlerDeps) {
  return async function getWhatsAppGroups(
    request: WhatsAppGroupsRequest = {},
  ): Promise<WhatsAppGroupsResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const result = await deps.service.listGroups();
      const groups = Array.isArray(result.payload) ? result.payload : [];

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/groups',
          workspaceId: ctx.workspaceId,
          requestId,
          source: 'wuzapi',
          composedFrom: ['/group/list'],
          count: groups.length,
          groups,
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

export const WHATSAPP_GROUPS_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/groups' as const,
  readOnly: true as const,
  composedFrom: ['/group/list'] as const,
};
