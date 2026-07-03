export type RuleType = 'allow' | 'block' | 'require_veto';

export interface Policy {
  id: string;
  name: string;
  description?: string;
  rule_type: RuleType;
  target_tool_id?: string;
  target_server_id?: string;
  enabled: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}