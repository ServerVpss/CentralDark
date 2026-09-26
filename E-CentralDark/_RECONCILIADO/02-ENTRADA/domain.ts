export type WorkspaceStatus = 'active' | 'inactive' | 'suspended';

export type InstanceProvider = 'whatsapp' | 'telegram';

export type InstanceStatus = 'pending' | 'connected' | 'disconnected' | 'error';

export type MessageDirection = 'inbound' | 'outbound';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Workspace {
  id: string;
  name: string;
  status: WorkspaceStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Instance {
  id: string;
  workspace_id: string;
  provider: InstanceProvider;
  label?: string;
  status: InstanceStatus;
  external_session_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id?: string;
  workspace_id: string;
  name: string;
  phone: string;
  tags?: string[];
  notes?: string;
  is_blocked?: boolean;
}

export interface Message {
  id?: string;
  workspace_id: string;
  instance_id: string | null;
  contact_id: string;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  created_at?: string;
}
