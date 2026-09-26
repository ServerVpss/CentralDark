import { createHash } from 'node:crypto';
import type {
  CentralDarkChatSummary,
  CentralDarkContactSummary,
  CentralDarkGroupSummary,
  WuzApiAvatarInfo,
  WuzApiContactProfile,
  WuzApiContactRecord,
  WuzApiGroupInfo,
} from './wuzapi-readonly-types';

export function buildReadOnlyMessageKey(chatId: string): string {
  const normalized = String(chatId || '').trim();
  if (!normalized) return '';
  const digest = createHash('sha256')
    .update(`centraldark:readonly-chat:${normalized}`)
    .digest('base64url')
    .slice(0, 24);
  return `ck_${digest}`;
}

export function mapWuzApiContactToSummary(args: {
  phoneOrJid: string;
  profile?: WuzApiContactProfile;
  avatar?: WuzApiAvatarInfo;
}): CentralDarkContactSummary {
  return {
    phoneOrJid: args.phoneOrJid,
    profile: args.profile,
    avatar: args.avatar,
    source: 'wuzapi',
  };
}

export function mapWuzApiGroupToSummary(group: WuzApiGroupInfo): CentralDarkGroupSummary {
  return {
    groupJid: group.JID,
    name: group.Name,
    ownerJid: group.OwnerJID,
    participantsCount: Array.isArray(group.Participants) ? group.Participants.length : undefined,
    source: 'wuzapi',
  };
}

export function mapUnknownChatToSummary(chat: Record<string, unknown>): CentralDarkChatSummary {
  const chatId = String(chat.id ?? chat.JID ?? chat.jid ?? chat.chatId ?? 'unknown');

  return {
    chatId,
    messageKey: chatId === 'unknown' ? undefined : buildReadOnlyMessageKey(chatId),
    title: typeof chat.name === 'string' ? chat.name : undefined,
    kind: chatId.endsWith('@g.us') ? 'group' : chatId === 'unknown' ? 'unknown' : 'contact',
    unreadCount: typeof chat.unreadCount === 'number' ? chat.unreadCount : undefined,
    lastMessageAt: typeof chat.lastMessageAt === 'string' ? chat.lastMessageAt : undefined,
    source: 'wuzapi',
  };
}

function pickContactTitle(contact: WuzApiContactRecord): string | undefined {
  for (const key of ['PushName', 'FullName', 'FirstName', 'BusinessName', 'Name']) {
    const value = contact[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function mapWuzApiContactRecordToChatSummary(
  contact: WuzApiContactRecord,
): CentralDarkChatSummary | null {
  const chatId = String(contact.JID ?? contact.Jid ?? '').trim();
  if (!chatId) return null;

  return {
    chatId,
    messageKey: buildReadOnlyMessageKey(chatId),
    title: pickContactTitle(contact),
    kind: chatId.endsWith('@g.us') ? 'group' : 'contact',
    source: 'wuzapi',
  };
}

export function mapWuzApiGroupInfoToChatSummary(group: WuzApiGroupInfo): CentralDarkChatSummary | null {
  const chatId = String(group.JID ?? '').trim();
  if (!chatId) return null;

  return {
    chatId,
    messageKey: buildReadOnlyMessageKey(chatId),
    title: typeof group.Name === 'string' ? group.Name : undefined,
    kind: 'group',
    source: 'wuzapi',
  };
}

export function composeCentralDarkChats(args: {
  contacts: WuzApiContactRecord[];
  groups: WuzApiGroupInfo[];
}): CentralDarkChatSummary[] {
  const seen = new Map<string, CentralDarkChatSummary>();

  for (const contact of args.contacts) {
    const summary = mapWuzApiContactRecordToChatSummary(contact);
    if (summary) seen.set(summary.chatId, summary);
  }

  for (const group of args.groups) {
    const summary = mapWuzApiGroupInfoToChatSummary(group);
    if (summary) seen.set(summary.chatId, summary);
  }

  return Array.from(seen.values()).sort((a, b) => {
    const titleA = (a.title ?? a.chatId).toLowerCase();
    const titleB = (b.title ?? b.chatId).toLowerCase();
    return titleA.localeCompare(titleB);
  });
}
