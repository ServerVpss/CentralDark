import type { MessageDirection, MessageStatus } from '../shared/types/domain';

export type WebhookEventType = 'message.received' | 'message.status' | 'contact.updated' | 'instance.status';

export interface BaseWebhookEvent {
  eventId: string;
  type: WebhookEventType;
  workspaceId?: string;
  instanceId?: string;
  receivedAt: string;
  rawProvider?: string;
}

export interface MessageReceivedEvent extends BaseWebhookEvent {
  type: 'message.received';
  externalMessageId?: string;
  phone: string;
  text: string;
  direction: MessageDirection;
}

export interface MessageStatusEvent extends BaseWebhookEvent {
  type: 'message.status';
  externalMessageId: string;
  status: MessageStatus;
}

export interface ContactUpdatedEvent extends BaseWebhookEvent {
  type: 'contact.updated';
  phone: string;
  name?: string;
  avatarUrl?: string;
}

export interface InstanceStatusEvent extends BaseWebhookEvent {
  type: 'instance.status';
  status: 'pending' | 'connected' | 'disconnected' | 'error';
}

export type BotWebhookEvent =
  | MessageReceivedEvent
  | MessageStatusEvent
  | ContactUpdatedEvent
  | InstanceStatusEvent;

export interface WebhookHandler {
  validate(event: unknown): Promise<BotWebhookEvent>;
  handle(event: BotWebhookEvent): Promise<void>;
}
