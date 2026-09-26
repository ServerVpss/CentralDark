import {
  composeCentralDarkChats,
  createWuzApiReadOnlyClient,
  mapUnknownChatToSummary,
  mapWuzApiContactToSummary,
  mapWuzApiGroupToSummary,
  type CentralDarkChatSummary,
  type CentralDarkContactSummary,
  type CentralDarkGroupSummary,
  type WuzApiAvatarInfo,
  type WuzApiChatHistoryQuery,
  type WuzApiChatHistoryResult,
  type WuzApiContactRecord,
  type WuzApiGroupInfo,
  type WuzApiReadOnlyClient,
  type WuzApiReadOnlyConfig,
  type WuzApiReadOnlyResult,
} from '../../gateways/whatsapp';

export type WhatsAppReadOnlyService = {
  health: WuzApiReadOnlyClient['health'];
  listChats(): Promise<WuzApiReadOnlyResult<CentralDarkChatSummary[]>>;
  /**
   * Lote 3 (2026-06-09): chats reais da CentralDark.
   * WuzAPI não tem endpoint nativo de chats — esta função compõe
   * contatos 1:1 (/user/contacts) com grupos (/group/list) num único
   * CentralDarkChatSummary[] ordenado por título. Tudo read-only.
   */
  getCentralDarkChats(): Promise<WuzApiReadOnlyResult<CentralDarkChatSummary[]>>;
  listContacts(): Promise<WuzApiReadOnlyResult<WuzApiContactRecord[]>>;
  getContact(phoneOrJid: string): Promise<WuzApiReadOnlyResult<CentralDarkContactSummary>>;
  /**
   * Lote 6 (2026-06-09): avatar de contato — reflete `GET /user/avatar` do WuzAPI.
   * Read-only: nunca grava, nunca abre sessão, nunca toca em mídia binária local.
   */
  getContactAvatar(
    phoneOrJid: string,
    preview?: boolean,
  ): Promise<WuzApiReadOnlyResult<WuzApiAvatarInfo>>;
  listGroups(): Promise<WuzApiReadOnlyResult<CentralDarkGroupSummary[]>>;
  getGroup(groupJid: string): Promise<WuzApiReadOnlyResult<WuzApiGroupInfo>>;
  listGroupParticipants: WuzApiReadOnlyClient['listGroupParticipants'];
  /**
   * Lote 10 (2026-06-09): histórico read-only de mensagens.
   * Reflete `GET /chat/history` do WuzAPI. Aceita ChatJID de contato ou grupo.
   * Limit/Cursor opcionais (cursor para paginação se o upstream suportar).
   */
  getChatHistory(
    query: WuzApiChatHistoryQuery,
  ): Promise<WuzApiReadOnlyResult<WuzApiChatHistoryResult>>;
};

export function createWhatsAppReadOnlyService(config: WuzApiReadOnlyConfig): WhatsAppReadOnlyService {
  const client = createWuzApiReadOnlyClient(config);

  return {
    health: client.health,

    listChats: async () => {
      const result = await client.listChats();

      if (result.skipped) {
        return result as WuzApiReadOnlyResult<CentralDarkChatSummary[]>;
      }

      const raw = Array.isArray(result.payload) ? result.payload : [];
      const payload = raw.map((item) => mapUnknownChatToSummary(item as Record<string, unknown>));

      return {
        ...result,
        payload,
      };
    },

    getCentralDarkChats: async () => {
      const [contactsResult, groupsResult] = await Promise.all([
        client.listContacts(),
        client.listGroups(),
      ]);

      const contacts = Array.isArray(contactsResult.payload) ? contactsResult.payload : [];
      const groups = Array.isArray(groupsResult.payload) ? groupsResult.payload : [];

      const payload = composeCentralDarkChats({ contacts, groups });

      return {
        ok: contactsResult.ok && groupsResult.ok,
        operation: 'getCentralDarkChats',
        endpoint: '/user/contacts + /group/list',
        httpStatus: contactsResult.httpStatus ?? groupsResult.httpStatus,
        payload,
      } satisfies WuzApiReadOnlyResult<CentralDarkChatSummary[]>;
    },

    listContacts: async () => {
      const result = await client.listContacts();
      return result;
    },

    getContactAvatar: async (phoneOrJid: string, preview = true) => {
      return client.getProfileAvatar(phoneOrJid, preview);
    },



    getContact: async (phoneOrJid: string) => {
      const [profileResult, avatarResult] = await Promise.all([
        client.getContactProfile(phoneOrJid),
        client.getProfileAvatar(phoneOrJid, true),
      ]);

      const profilePayload = profileResult.payload ?? {};
      const firstProfile = Object.values(profilePayload)[0];

      return {
        ok: profileResult.ok || avatarResult.ok,
        operation: 'getContactProfile',
        payload: mapWuzApiContactToSummary({
          phoneOrJid,
          profile: firstProfile,
          avatar: avatarResult.payload,
        }),
      };
    },

    listGroups: async () => {
      const result = await client.listGroups();

      return {
        ...result,
        payload: Array.isArray(result.payload) ? result.payload.map(mapWuzApiGroupToSummary) : [],
      };
    },

    getGroup: client.getGroup,

    listGroupParticipants: client.listGroupParticipants,

    getChatHistory: client.getChatHistory,
  };
}
