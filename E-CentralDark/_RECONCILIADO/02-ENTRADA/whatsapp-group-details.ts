/**
 * Lote 9 (2026-06-09) — Rota interna read-only `GET /v1/whatsapp/groups/:groupJid`.
 *
 * Consome `service.getGroup(groupJid)` que reflete `GET /group/info` do WuzAPI,
 * retornando os detalhes completos de um grupo (metadados + participantes).
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a variáveis de ambiente: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - Erros sanitizados via handleSafeError.
 *  - groupJid validado: só aceita JID de grupo (`@g.us`).
 */

import type { WuzApiGroupInfo, WuzApiReadOnlyResult } from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppGroupDetailsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
  params?: {
    groupJid?: string;
  };
}

export interface WhatsAppGroupDetailsServiceLike {
  getGroup(groupJid: string): Promise<WuzApiReadOnlyResult<WuzApiGroupInfo>>;
}

export interface WhatsAppGroupDetailsHandlerDeps {
  service: WhatsAppGroupDetailsServiceLike;
}

export interface WhatsAppGroupDetailsResponseBody {
  ok: true;
  route: '/v1/whatsapp/groups/:groupJid';
  workspaceId: string;
  requestId: string;
  groupJid: string;
  source: 'wuzapi';
  composedFrom: ['/group/info'];
  group: WuzApiGroupInfo;
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppGroupDetailsResponse {
  statusCode: number;
  body:
    | WhatsAppGroupDetailsResponseBody
    | {
        ok: false;
        error: ReturnType<typeof handleSafeError>['body']['error'];
      };
}

function assertGroupJidSafe(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('groupJid obrigatório.');
  }
  const jid = value.trim();
  if (!jid.endsWith('@g.us')) {
    throw new Error('groupJid inválido: deve terminar com @g.us.');
  }
  return jid;
}

export function createGetWhatsAppGroupDetailsHandler(deps: WhatsAppGroupDetailsHandlerDeps) {
  return async function getWhatsAppGroupDetails(
    request: WhatsAppGroupDetailsRequest = {},
  ): Promise<WhatsAppGroupDetailsResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const groupJid = assertGroupJidSafe(request.params?.groupJid);
      const result = await deps.service.getGroup(groupJid);
      const group = result.payload ?? { JID: groupJid };

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/groups/:groupJid',
          workspaceId: ctx.workspaceId,
          requestId,
          groupJid,
          source: 'wuzapi',
          composedFrom: ['/group/info'],
          group,
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

export const WHATSAPP_GROUP_DETAILS_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/groups/:groupJid' as const,
  readOnly: true as const,
  composedFrom: ['/group/info'] as const,
};
