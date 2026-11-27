// Schema real: api.audit_log é VIEW (somente leitura) de hub.audit_log — hash-chain imutável
// (trigger audit_chain). Sem created_at/event_type/result/metadata como o código antigo esperava.
export interface AuditLog {
  id: number;
  ts: string;
  agent_identity: string;
  tool: string;
  args_hash: string;
  decision: string; // 'allow' | 'deny' | 'require_approval' (ver hub.pdp_evaluate)
  tier: number;
  approval_id?: string;
  prev_hash: string;
  row_hash: string;
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