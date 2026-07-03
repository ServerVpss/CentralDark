export interface AuditLog {
  id: string;
  event_type: string;
  agent: string;
  action: string;
  target: string;
  result: 'approved' | 'vetoed' | 'pending' | 'error';
  veto_reason?: string;
  metadata: Record<string, any>;
  immutable: boolean;
  superseded_by?: string;
  created_at: string;
}

export interface AccessLog {
  id: string;
  user_id: string;
  user_role: string;
  action: string;
  ip: string;
  user_agent: string;
  created_at: string;
}