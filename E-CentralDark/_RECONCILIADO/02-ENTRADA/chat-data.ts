import type { MessageDirection, MessageStatus } from './domain';

export type ChatProvider = 'whatsapp' | 'telegram';

export type ChatMessageKind =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'reaction'
  | 'unknown';

export interface ChatWorkspaceRow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface ChatInstanceRow {
  id: string;
  workspace_id: string;
  provider: ChatProvider;
  label?: string | null;
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  external_session_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatContactRow {
  id: string;
  workspace_id: string;
  name: string;
  phone: string;
  tags?: string[];
  notes?: string | null;
  is_blocked?: boolean;
  avatar_url?: string | null;
  push_name?: string | null;
  is_business?: boolean | null;
  source?: 'local' | 'provider' | 'webhook';
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessageRow {
  id: string;
  workspace_id: string;
  instance_id?: string | null;
  contact_id: string;
  external_message_id?: string | null;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  kind: ChatMessageKind;
  media_url?: string | null;
  media_mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatGroupRow {
  id: string;
  workspace_id: string;
  instance_id?: string | null;
  external_group_id: string;
  name: string;
  owner_phone?: string | null;
  participants_count?: number | null;
  avatar_url?: string | null;
  description?: string | null;
  invite_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatGroupParticipantRow {
  id: string;
  workspace_id: string;
  group_id: string;
  phone: string;
  name?: string | null;
  role: 'owner' | 'admin' | 'member' | 'unknown';
  is_me?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatAvatarRow {
  id: string;
  workspace_id: string;
  contact_id?: string | null;
  phone_or_group_id: string;
  avatar_url?: string | null;
  source: 'provider' | 'cache' | 'none';
  fetched_at: string;
  created_at?: string;
}
