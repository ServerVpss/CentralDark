import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

import { assertWuzApiReadOnlyPath } from './wuzapi-readonly-audit';
import type {
  WuzApiAvatarInfo,
  WuzApiChatHistoryQuery,
  WuzApiChatHistoryResult,
  WuzApiChatMessage,
  WuzApiContactProfile,
  WuzApiContactRecord,
  WuzApiGroupInfo,
  WuzApiGroupParticipant,
  WuzApiHttpMethod,
  WuzApiReadOnlyClient,
  WuzApiReadOnlyConfig,
  WuzApiReadOnlyOperation,
  WuzApiReadOnlyResult,
  WuzApiSessionStatus,
} from './wuzapi-readonly-types';

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');

  if (!trimmed) {
    throw new Error('WuzAPI baseUrl ausente.');
  }

  const parsed = new URL(trimmed);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('WuzAPI baseUrl deve usar http ou https.');
  }

  return parsed.toString().replace(/\/+$/, '');
}

function normalizeReadOnlyPath(path: string): string {
  const value = path.trim();

  if (!value.startsWith('/')) {
    throw new Error(`Endpoint WuzAPI inválido: ${path}`);
  }

  assertWuzApiReadOnlyPath(value);
  return value;
}

function normalizePhoneQuery(phoneOrJid: string): string {
  return phoneOrJid
    .trim()
    .replace(/@s\.whatsapp\.net$/i, '')
    .replace(/@lid$/i, '')
    .replace(/[^0-9+]/g, '');
}

function assertGroupJid(groupJid: string): string {
  const jid = groupJid.trim();

  if (!jid.endsWith('@g.us')) {
    throw new Error('GroupJID inválido: grupos devem terminar com @g.us.');
  }

  return jid;
}

function headers(authValue: string, hasBody: boolean): Record<string, string> {
  const cleanAuth = authValue.trim();

  if (!cleanAuth) {
    throw new Error('WuzAPI authValue ausente.');
  }

  return {
    Authorization: cleanAuth,
    Token: cleanAuth,
    Accept: 'application/json',
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function requestJson<T>(args: {
  baseUrl: string;
  authValue: string;
  method: WuzApiHttpMethod;
  path: string;
  body?: unknown;
  timeoutMs: number;
}): Promise<{ httpStatus: number; payload: T }> {
  const endpoint = normalizeReadOnlyPath(args.path);
  const url = new URL(`${args.baseUrl}${endpoint}`);
  const bodyText = args.body === undefined ? undefined : JSON.stringify(args.body);
  const requestImpl = url.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const req = requestImpl(
      url,
      {
        method: args.method,
        headers: headers(args.authValue, Boolean(bodyText)),
        timeout: args.timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;

        res.on('data', (chunk: Buffer) => {
          total += chunk.length;

          if (total > MAX_RESPONSE_BYTES) {
            req.destroy(new Error('Resposta WuzAPI maior que o limite seguro de auditoria.'));
            return;
          }

          chunks.push(chunk);
        });

        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          const httpStatus = res.statusCode ?? 0;

          if (!raw) {
            resolve({ httpStatus, payload: {} as T });
            return;
          }

          try {
            resolve({ httpStatus, payload: JSON.parse(raw) as T });
          } catch {
            resolve({ httpStatus, payload: { raw } as T });
          }
        });
      },
    );

    req.on('timeout', () => req.destroy(new Error('Timeout consultando WuzAPI em modo leitura.')));
    req.on('error', reject);

    if (bodyText) {
      req.write(bodyText);
    }

    req.end();
  });
}

function isSuccessPayload(payload: unknown, httpStatus: number): boolean {
  if (httpStatus < 200 || httpStatus >= 300) {
    return false;
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    return Boolean((payload as { success?: unknown }).success);
  }

  return true;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export function createWuzApiReadOnlyClient(config: WuzApiReadOnlyConfig): WuzApiReadOnlyClient {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function call<T>(
    operation: WuzApiReadOnlyOperation,
    method: WuzApiHttpMethod,
    path: string,
    body?: unknown,
  ): Promise<WuzApiReadOnlyResult<T>> {
    const endpoint = normalizeReadOnlyPath(path);
    const { httpStatus, payload } = await requestJson<unknown>({
      baseUrl,
      authValue: config.authValue,
      method,
      path: endpoint,
      body,
      timeoutMs,
    });

    return {
      ok: isSuccessPayload(payload, httpStatus),
      operation,
      method,
      endpoint,
      httpStatus,
      payload: unwrapData<T>(payload),
    };
  }

  return {
    health: () => call<WuzApiSessionStatus>('health', 'GET', '/session/status'),

    listChats: async () => {
      const configuredEndpoint = config.endpoints?.listChats?.trim();

      if (!configuredEndpoint) {
        return {
          ok: false,
          operation: 'listChats',
          skipped: true,
          reason:
            'Endpoint de lista de chats ainda não confirmado no runtime. Configure endpoints.listChats após auditoria read-only.',
        } satisfies WuzApiReadOnlyResult;
      }

      return call('listChats', 'GET', configuredEndpoint);
    },

    listContacts: async () => {
      const result = await call<Record<string, WuzApiContactRecord> | WuzApiContactRecord[]>(
        'listContacts',
        'GET',
        '/user/contacts',
      );

      const raw = result.payload;
      let contacts: WuzApiContactRecord[] = [];

      if (Array.isArray(raw)) {
        contacts = raw;
      } else if (raw && typeof raw === 'object') {
        contacts = Object.entries(raw).map(([jid, value]) => ({
          JID: jid,
          ...(value as WuzApiContactRecord),
        }));
      }

      return {
        ...result,
        payload: contacts,
      } as WuzApiReadOnlyResult<WuzApiContactRecord[]>;
    },

    getContactProfile: (phoneOrJid: string) =>
      call<Record<string, WuzApiContactProfile>>('getContactProfile', 'POST', '/user/info', {
        Phone: [normalizePhoneQuery(phoneOrJid)],
      }),

    getProfileAvatar: (phoneOrJid: string, preview = true) =>
      call<WuzApiAvatarInfo>('getProfileAvatar', 'GET', '/user/avatar', {
        Phone: normalizePhoneQuery(phoneOrJid),
        Preview: preview,
      }),

    listGroups: async () => {
      const result = await call<{ Groups?: WuzApiGroupInfo[] }>('listGroups', 'GET', '/group/list');

      return {
        ...result,
        payload: Array.isArray(result.payload?.Groups) ? result.payload.Groups : [],
      };
    },

    getGroup: async (groupJid: string) => {
      return call<WuzApiGroupInfo>('getGroup', 'GET', '/group/info', {
        GroupJID: assertGroupJid(groupJid),
      });
    },

    listGroupParticipants: async (groupJid: string) => {
      const result = await call<WuzApiGroupInfo>('listGroupParticipants', 'GET', '/group/info', {
        GroupJID: assertGroupJid(groupJid),
      });

      return {
        ...result,
        payload: Array.isArray(result.payload?.Participants) ? result.payload.Participants : [],
      } as WuzApiReadOnlyResult<WuzApiGroupParticipant[]>;
    },

    getChatHistory: async (query: WuzApiChatHistoryQuery) => {
      const body: Record<string, unknown> = {
        ChatJID: query.chatJid,
        Limit: query.limit,
      };

      if (query.cursor) {
        body.Cursor = query.cursor;
      }

      const result = await call<{ Messages?: WuzApiChatMessage[]; NextCursor?: string } | WuzApiChatMessage[]>(
        'getChatHistory',
        'GET',
        '/chat/history',
        body,
      );

      const raw = result.payload;
      let messages: WuzApiChatMessage[] = [];
      let nextCursor: string | undefined;

      if (Array.isArray(raw)) {
        messages = raw;
      } else if (raw && typeof raw === 'object') {
        messages = Array.isArray(raw.Messages) ? raw.Messages : [];
        nextCursor = typeof raw.NextCursor === 'string' && raw.NextCursor ? raw.NextCursor : undefined;
      }

      return {
        ...result,
        payload: { messages, nextCursor } satisfies WuzApiChatHistoryResult,
      } as WuzApiReadOnlyResult<WuzApiChatHistoryResult>;
    },
  };
}
