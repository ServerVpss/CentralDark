export type CentralDarkRoleId =
  | 'auditor'
  | 'loop'
  | 'guardrails'
  | 'growth'
  | 'deploy'
  | 'chief-of-staff';

export type CentralDarkRole = {
  id: CentralDarkRoleId;
  role: string;
  defaultDisplayName: string;
  pet: string;
  reportsTo: 'SOL';
  capabilities: string[];
};

export const CENTRALDARK_SOUL = {
  schema: 'centraldark.one-soul-many-capabilities/v1',
  owner: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
  authority: 'SEGREDO/CHEFE',
  managerDefaultName: 'SOL',
  managerNameIsCosmetic: true,
  roleNamesEditable: true,
  modelIsReplaceable: true,
  oneSoul: true,
  oneSystemOnly: true,
  reuseBeforeCreate: true,
  realityIsJudge: true,
} as const;

export const CENTRALDARK_FIXED_ROLES: readonly CentralDarkRole[] = [
  { id: 'auditor', role: 'Auditor Determinístico', defaultDisplayName: 'Auditor Determinístico', pet: '🧿', reportsTo: 'SOL', capabilities: ['observabilidade', 'prova', 'contraprova', 'invariantes', 'diff'] },
  { id: 'loop', role: 'Orquestrador de Loop', defaultDisplayName: 'Orquestrador de Loop', pet: '♻️', reportsTo: 'SOL', capabilities: ['cursor', 'loop', 'continuidade', 'dedupe', 'fixed-point'] },
  { id: 'guardrails', role: 'Arquiteto de Guardrails', defaultDisplayName: 'Arquiteto de Guardrails', pet: '🛡️', reportsTo: 'SOL', capabilities: ['guardrails', 'permissões', 'segurança', 'fail-closed', 'revisão'] },
  { id: 'growth', role: 'Mesa de Growth', defaultDisplayName: 'Mesa de Growth', pet: '🌱', reportsTo: 'SOL', capabilities: ['growth', 'produto', 'distribuição', 'métricas', 'experimentos'] },
  { id: 'deploy', role: 'Governador de Deploy', defaultDisplayName: 'Governador de Deploy', pet: '🚀', reportsTo: 'SOL', capabilities: ['deploy', 'rollback', 'release', 'health', 'passagem'] },
  { id: 'chief-of-staff', role: 'Chefe de Gabinete', defaultDisplayName: 'Chefe de Gabinete', pet: '🧭', reportsTo: 'SOL', capabilities: ['prioridades', 'briefing', 'handoff', 'agenda', 'coordenação'] },
] as const;

export const CENTRALDARK_CAPABILITY_COUNT = new Set(
  CENTRALDARK_FIXED_ROLES.flatMap((role) => role.capabilities),
).size;

export const CENTRALDARK_PROFILE_STORAGE_KEY = 'centraldark.organism.profile.v1';

export type CentralDarkLocalProfile = {
  managerName: string;
  roleNames: Record<CentralDarkRoleId, string>;
};

export function defaultCentralDarkProfile(): CentralDarkLocalProfile {
  return {
    managerName: CENTRALDARK_SOUL.managerDefaultName,
    roleNames: Object.fromEntries(CENTRALDARK_FIXED_ROLES.map((role) => [role.id, role.defaultDisplayName])) as Record<CentralDarkRoleId, string>,
  };
}