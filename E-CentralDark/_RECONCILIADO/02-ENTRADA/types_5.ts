export type NexChannelKind = "meta" | "multizap_qr" | "wuzapi" | "webchat";
export type NexConnectionStatus = "connected" | "disconnected" | "error" | "pending";
export type NexMessageAuthor = "me" | "them" | "system" | "bot" | "ai";

export interface NexContact {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
  channel?: NexChannelKind;
  tags?: string[];
}

export interface NexConversation {
  id: string;
  contact: NexContact;
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  /** Aguardando resposta do atendente (última mensagem foi do contato e ainda não foi respondida). */
  waitingResponse?: boolean;
  channel?: NexChannelKind;
  connectionStatus?: NexConnectionStatus;
  isActive?: boolean;
  /** "private" (DM) ou "group" (grupo WhatsApp). Usado para separar a aba Grupos. */
  channelType?: "private" | "group";
  /** Nome do grupo (quando channelType='group'). Vem de whatsapp_groups.name. */
  groupName?: string | null;
  /** Avatar/foto do grupo. Vem de whatsapp_groups.picture_url. */
  groupPictureUrl?: string | null;
  /** Nome do participante da última mensagem do grupo (preview "Fulano: msg"). */
  lastSenderName?: string | null;
}

export interface NexMessage {
  id: string;
  author: NexMessageAuthor;
  body?: string;
  time?: string;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
  payment?: NexPaymentInfo;
  media?: NexMediaInfo;
  /** Canal real por onde a bolha entrou/saiu (META/QR/etc). */
  channel?: NexChannelKind;
  /** "private" ou "group" — separa timeline. */
  channelType?: "private" | "group";
  /** Nome do participante do grupo que enviou (renderizado acima da bolha). */
  senderName?: string | null;
}

export interface NexMediaInfo {
  kind: "image" | "audio" | "document";
  url?: string;
  fileName?: string;
  sizeLabel?: string;
  durationLabel?: string;
}

export interface NexPaymentInfo {
  amount: number;
  currency?: string;
  status: "pending" | "paid" | "expired" | "canceled";
  gateway?: string;
  validUntil?: string;
  pixCopyPaste?: string;
  qrImageUrl?: string;
}

