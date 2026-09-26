/**
 * Lote 8 (2026-06-09) — Rota interna read-only `GET /v1/whatsapp/groups/:groupJid/participants`.
 *
 * Consome `service.listGroupParticipants(groupJid)` que reflete
 * `GET /group/info` do WuzAPI (campo Participants).
 *
 * Garantias:
 *  - 100% read-only (sem SQL, Docker, restart, sessão WhatsApp, CRM, Caddy).
 *  - Sem acesso direto a variáveis de ambiente: o service é injetado via factory.
 *  - Workspace é obrigatório (workspaceGuard) — sem leakage cross-tenant.
 *  - Erros sanitizados via handleSafeError.
 *  - groupJid validado: só aceita JID de grupo (`@g.us`).
 */

import type {
  WuzApiGroupParticipant,
  WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';
import { handleSafeError, resolveRequestId, resolveWorkspaceContext } from '../middlewares';

export interface WhatsAppGroupParticipantsRequest {
  headers?: Record<string, unknown>;
  requestId?: string;
  workspaceId?: unknown;
  contextWorkspaceId?: string;
  userId?: string;
  params?: {
    groupJid?: string;
  };
}

export interface WhatsAppGroupParticipantsServiceLike {
  listGroupParticipants(groupJid: string): Promise<WuzApiReadOnlyResult<WuzApiGroupParticipant[]>>;
}

export interface WhatsAppGroupParticipantsHandlerDeps {
  service: WhatsAppGroupParticipantsServiceLike;
}

export interface WhatsAppGroupParticipantsResponseBody {
  ok: true;
  route: '/v1/whatsapp/groups/:groupJid/participants';
  workspaceId: string;
  requestId: string;
  groupJid: string;
  source: 'wuzapi';
  composedFrom: ['/group/info'];
  count: number;
  participants: WuzApiGroupParticipant[];
  upstream: {
    httpStatus?: number;
    skipped?: boolean;
    reason?: string;
  };
  timestamp: string;
}

export interface WhatsAppGroupParticipantsResponse {
  statusCode: number;
  body:
    | WhatsAppGroupParticipantsResponseBody
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

export function createGetWhatsAppGroupParticipantsHandler(deps: WhatsAppGroupParticipantsHandlerDeps) {
  return async function getWhatsAppGroupParticipants(
    request: WhatsAppGroupParticipantsRequest = {},
  ): Promise<WhatsAppGroupParticipantsResponse> {
    const { requestId } = resolveRequestId(request);

    try {
      const ctx = resolveWorkspaceContext({
        workspaceId: request.workspaceId,
        contextWorkspaceId: request.contextWorkspaceId,
        userId: request.userId,
        requestId,
      });

      const groupJid = assertGroupJidSafe(request.params?.groupJid);
      const result = await deps.service.listGroupParticipants(groupJid);
      const participants = Array.isArray(result.payload) ? result.payload : [];

      return {
        statusCode: result.ok ? 200 : 502,
        body: {
          ok: true,
          route: '/v1/whatsapp/groups/:groupJid/participants',
          workspaceId: ctx.workspaceId,
          requestId,
          groupJid,
          source: 'wuzapi',
          composedFrom: ['/group/info'],
          count: participants.length,
          participants,
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

export const WHATSAPP_GROUP_PARTICIPANTS_ROUTE = {
  method: 'GET' as const,
  path: '/v1/whatsapp/groups/:groupJid/participants' as const,
  readOnly: true as const,
  composedFrom: ['/group/info'] as const,
};
