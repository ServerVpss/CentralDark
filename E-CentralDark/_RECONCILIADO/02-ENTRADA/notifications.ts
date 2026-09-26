import type { MessageStatus } from '../shared/types/domain';

export type BotNotificationKind =
  | 'message.new'
  | 'message.status'
  | 'chat.unread'
  | 'contact.updated'
  | 'profile.avatar.updated'
  | 'group.updated'
  | 'group.participant.updated'
  | 'instance.status'
  | 'security.warning'
  | 'system.info';

export type BotNotificationChannel = 'realtime' | 'webhook' | 'panel' | 'log';

export type BotNotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface BotNotificationPayload {
  externalMessageId?: string;
  messageStatus?: MessageStatus;
  phone?: string;
  chatId?: string;
  groupId?: string;
  avatarUrl?: string;
  unreadCount?: number;
  [key: string]: unknown;
}

export interface BotNotification {
  id?: string;
  workspace_id: string;
  instance_id?: string | null;
  contact_id?: string | null;
  group_id?: string | null;
  kind: BotNotificationKind;
  channel: BotNotificationChannel;
  severity: BotNotificationSeverity;
  title: string;
  body?: string;
  payload?: BotNotificationPayload;
  read?: boolean;
  created_at?: string;
}

export interface CreateBotNotificationInput extends Omit<BotNotification, 'id' | 'created_at'> {
  created_at?: string;
}

export interface BotNotificationFilter {
  workspaceId: string;
  instanceId?: string;
  contactId?: string;
  groupId?: string;
  unreadOnly?: boolean;
  kinds?: BotNotificationKind[];
  limit?: number;
}

export interface NotificationsService {
  list(filter: BotNotificationFilter): Promise<BotNotification[]>;
  create(input: CreateBotNotificationInput): Promise<BotNotification>;
  markRead(workspaceId: string, notificationId: string): Promise<BotNotification>;
  markWorkspaceRead(workspaceId: string): Promise<number>;
}

export interface NotificationPublisher {
  publish(notification: BotNotification): Promise<void>;
}
