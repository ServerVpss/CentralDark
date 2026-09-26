export type WuzApiReadOnlyOperation =
  | 'health'
  | 'listChats'
  | 'listContacts'
  | 'getContactProfile'
  | 'getProfileAvatar'
  | 'listGroups'
  | 'getGroup'
  | 'listGroupParticipants'
  | 'getChatHistory'
  | 'getCentralDarkChats';

export type WuzApiHttpMethod = 'GET' | 'POST';

export type WuzApiReadOnlyEndpoint = {
  operation: WuzApiReadOnlyOperation;
  method: WuzApiHttpMethod;
  path: string;
  documented: boolean;
  notes: string;
};

export type WuzApiReadOnlyConfig = {
  baseUrl: string;
  authValue: string;
  timeoutMs?: number;
  endpoints?: {
    listChats?: string;
  };
};

export type WuzApiReadOnlyResult<T = unknown> = {
  ok: boolean;
  operation: WuzApiReadOnlyOperation;
  method?: WuzApiHttpMethod;
  endpoint?: string;
  httpStatus?: number;
  payload?: T;
  skipped?: boolean;
  reason?: string;
};

export type WuzApiSessionStatus = {
  Connected?: boolean;
  LoggedIn?: boolean;
  [key: string]: unknown;
};

export type WuzApiContactProfile = {
  Devices?: string[];
  PictureID?: string;
  Status?: string;
  VerifiedName?: unknown;
  [key: string]: unknown;
};

export type WuzApiAvatarInfo = {
  URL?: string;
  ID?: string;
  Type?: 'preview' | 'full' | string;
  DirectPath?: string;
  [key: string]: unknown;
};

export type WuzApiGroupParticipant = {
  JID: string;
  IsAdmin?: boolean;
  IsSuperAdmin?: boolean;
  [key: string]: unknown;
};

export type WuzApiGroupInfo = {
  JID: string;
  Name?: string;
  OwnerJID?: string;
  Participants?: WuzApiGroupParticipant[];
  [key: string]: unknown;
};

export type CentralDarkChatSummary = {
  chatId: string;
  /**
   * Chave opaca para o frontend selecionar/carregar conversa sem depender de JID exposto.
   * Não deve ser tratada como segredo permanente; é identificador read-only e sanitizado.
   */
  messageKey?: string;
  title?: string;
  kind: 'contact' | 'group' | 'unknown';
  lastMessageAt?: string;
  unreadCount?: number;
  source: 'wuzapi';
};

export type CentralDarkContactSummary = {
  phoneOrJid: string;
  profile?: WuzApiContactProfile;
  avatar?: WuzApiAvatarInfo;
  source: 'wuzapi';
};

export type CentralDarkGroupSummary = {
  groupJid: string;
  name?: string;
  ownerJid?: string;
  participantsCount?: number;
  source: 'wuzapi';
};

export type WuzApiContactRecord = {
  JID?: string;
  Jid?: string;
  PushName?: string;
  FullName?: string;
  FirstName?: string;
  BusinessName?: string;
  Found?: boolean;
  [key: string]: unknown;
};

export type WuzApiChatMessage = {
  ID?: string;
  ChatJID?: string;
  FromMe?: boolean;
  Timestamp?: string | number;
  Type?: string;
  Body?: string;
  [key: string]: unknown;
};

export type WuzApiChatHistoryQuery = {
  chatJid: string;
  limit?: number;
  cursor?: string;
};

export type WuzApiChatHistoryResult = {
  messages: WuzApiChatMessage[];
  nextCursor?: string;
};

export type WuzApiReadOnlyClient = {
  health(): Promise<WuzApiReadOnlyResult<WuzApiSessionStatus>>;
  listChats(): Promise<WuzApiReadOnlyResult>;
  listContacts(): Promise<WuzApiReadOnlyResult<WuzApiContactRecord[]>>;
  getContactProfile(phoneOrJid: string): Promise<WuzApiReadOnlyResult<Record<string, WuzApiContactProfile>>>;
  getProfileAvatar(phoneOrJid: string, preview?: boolean): Promise<WuzApiReadOnlyResult<WuzApiAvatarInfo>>;
  listGroups(): Promise<WuzApiReadOnlyResult<WuzApiGroupInfo[]>>;
  getGroup(groupJid: string): Promise<WuzApiReadOnlyResult<WuzApiGroupInfo>>;
  listGroupParticipants(groupJid: string): Promise<WuzApiReadOnlyResult<WuzApiGroupParticipant[]>>;
  getChatHistory(query: WuzApiChatHistoryQuery): Promise<WuzApiReadOnlyResult<WuzApiChatHistoryResult>>;
};
