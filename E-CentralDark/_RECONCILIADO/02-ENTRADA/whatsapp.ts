import type {
  WhatsAppConnectionState,
  WhatsAppInboundMessageEvent,
  WhatsAppContactProfile,
  WhatsAppGroupSummary,
  WhatsAppProfileAvatar,
} from '../gateways/whatsapp/contracts';

export type WhatsAppWebhookEventType =
  | 'whatsapp.message.received'
  | 'whatsapp.message.status'
  | 'whatsapp.contact.updated'
  | 'whatsapp.profile.avatar.updated'
  | 'whatsapp.group.updated'
  | 'whatsapp.instance.status';

export interface WhatsAppWebhookBaseEvent {
  eventId: string;
  type: WhatsAppWebhookEventType;
  provider: 'wuzapi';
  instanceId: string;
  workspaceId?: string;
  receivedAt: string;
  signatureVerified: boolean;
}

export interface WhatsAppMessageReceivedWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.message.received';
  message: WhatsAppInboundMessageEvent;
}

export interface WhatsAppMessageStatusWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.message.status';
  externalMessageId: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppContactUpdatedWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.contact.updated';
  contact: WhatsAppContactProfile;
}

export interface WhatsAppProfileAvatarUpdatedWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.profile.avatar.updated';
  avatar: WhatsAppProfileAvatar;
}

export interface WhatsAppGroupUpdatedWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.group.updated';
  group: WhatsAppGroupSummary;
}

export interface WhatsAppInstanceStatusWebhookEvent extends WhatsAppWebhookBaseEvent {
  type: 'whatsapp.instance.status';
  state: WhatsAppConnectionState;
}

export type WhatsAppWebhookEvent =
  | WhatsAppMessageReceivedWebhookEvent
  | WhatsAppMessageStatusWebhookEvent
  | WhatsAppContactUpdatedWebhookEvent
  | WhatsAppProfileAvatarUpdatedWebhookEvent
  | WhatsAppGroupUpdatedWebhookEvent
  | WhatsAppInstanceStatusWebhookEvent;
