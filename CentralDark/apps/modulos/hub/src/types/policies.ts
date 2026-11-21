// Schema real: api.policies é VIEW (somente leitura) de hub.policies — sistema PDP oficial
// (Policy Decision Point: tier/needs_approval por tool+environment). Não é CRUD genérico de "regras".
export interface Policy {
  id: string;
  tool: string;
  environment: string; // default '*'
  tier: number; // 0-4
  needs_approval: boolean;
  enabled: boolean;
  created_at: string;
}
