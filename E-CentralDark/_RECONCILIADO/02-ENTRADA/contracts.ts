import type { Instance, Message } from '../shared/types/domain';

export interface GatewaySendTextInput {
  instance: Instance;
  phone: string;
  text: string;
  localMessage?: Message;
}

export interface GatewaySendTextResult {
  ok: boolean;
  externalMessageId?: string;
  status: 'sent' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

export interface GatewayContactProfile {
  phone: string;
  name?: string;
  avatarUrl?: string;
}

export interface GatewayGroup {
  id: string;
  name: string;
  participantsCount?: number;
}

export interface MessagingGateway {
  getConnectionStatus(instance: Instance): Promise<Instance['status']>;
  sendText(input: GatewaySendTextInput): Promise<GatewaySendTextResult>;
  getContactProfile(instance: Instance, phone: string): Promise<GatewayContactProfile | null>;
  listGroups(instance: Instance): Promise<GatewayGroup[]>;
}

export type {
  WhatsAppGatewayPort,
  WhatsAppHealthStatus,
  WhatsAppChatSummary,
  WhatsAppContactProfile,
  WhatsAppProfileAvatar,
  WhatsAppGroupSummary,
  WhatsAppGroupParticipant,
  WhatsAppInboundMessageEvent,
  WhatsAppSendTextInput,
  WhatsAppSendResult,
} from './whatsapp/contracts';
