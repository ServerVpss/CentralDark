// Dados mock tipados — SEM chamadas reais. Somente protótipo visual.
export type EstadoSoldado = "ativo" | "ocioso" | "isolado";
export type NivelSeveridade = "baixa" | "media" | "alta" | "critica";
export type EstadoMissao = "executando" | "aguardando" | "concluida" | "falhou";

export interface Soldado {
  id: string;
  nome: string;
  funcao: string;
  estado: EstadoSoldado;
  permissao: string;
  ultimaAtividade: string;
  cor: "roxo" | "verde" | "ciano" | "ouro" | "branco";
}

export interface Incidente {
  id: string;
  titulo: string;
  ipMascarado: string;
  origem: string;
  regra: string;
  horario: string;
  severidade: NivelSeveridade;
  traceId: string;
  resumo: string;
}

export interface Missao {
  id: string;
  sender: string;
  recipient: string;
  action: string;
  resource: string;
  permissions: string[];
  forbidden: string[];
  expiresAt: string;
  traceId: string;
  estado: EstadoMissao;
}

export interface Aprovacao {
  id: string;
  titulo: string;
  solicitante: string;
  criticidade: NivelSeveridade;
  traceId: string;
}

export interface Infra {
  servico: string;
  estado: "saudavel" | "degradado" | "critico";
  latenciaMs: number;
}

export const hud = {
  estado: "🟢 PROTEGIDO · 1 AMEAÇA CONTIDA",
  soldados: "7/7 ativos",
  missoes: "3 executando",
  aprovacoes: "2 aguardando",
  incidentes: "1 bloqueado",
  infra: "saudável",
  ultimaVarredura: "agora",
  postura: "ZERO TRUST",
};

export const soldados: Soldado[] = [
  { id: "grok", nome: "Grok", funcao: "Executor bounded", estado: "ativo", permissao: "missões · leitura", ultimaAtividade: "há 12s", cor: "roxo" },
  { id: "gpt", nome: "GPT / Codex", funcao: "Orquestrador", estado: "ativo", permissao: "planejar · delegar", ultimaAtividade: "há 4s", cor: "verde" },
  { id: "claude", nome: "Claude", funcao: "Auditor de código", estado: "ativo", permissao: "revisar · comentar", ultimaAtividade: "há 30s", cor: "ouro" },
  { id: "gemini", nome: "Gemini", funcao: "Análise ampla", estado: "ocioso", permissao: "leitura", ultimaAtividade: "há 3m", cor: "ciano" },
  { id: "sentinela", nome: "Sentinela", funcao: "Vigia SSH/Fail2Ban", estado: "ativo", permissao: "bloquear IP", ultimaAtividade: "há 1s", cor: "verde" },
  { id: "auditor", nome: "Auditor", funcao: "Trilha e evidência", estado: "ativo", permissao: "log · export", ultimaAtividade: "há 8s", cor: "ouro" },
  { id: "guardiao", nome: "Guardião", funcao: "RLS · secrets", estado: "ativo", permissao: "policy_read", ultimaAtividade: "há 2s", cor: "branco" },
];

export const incidente: Incidente = {
  id: "INC-8842",
  titulo: "Tentativas SSH bloqueadas",
  ipMascarado: "43.155.xxx.91",
  origem: "SG · Ásia",
  regra: "Fail2Ban · sshd-agressivo",
  horario: "22:57 BRT",
  severidade: "alta",
  traceId: "trc_9f4c…a71",
  resumo: "12 tentativas em 40s, banimento automático aplicado por 24h.",
};

export const missoes: Missao[] = [
  {
    id: "MIS-014",
    sender: "GPT/Codex",
    recipient: "Grok",
    action: "mapear.infra",
    resource: "vps://centraldark/*",
    permissions: ["read:pm2", "read:status"],
    forbidden: ["write:*", "deploy:*"],
    expiresAt: "23:30 BRT",
    traceId: "trc_a12…e04",
    estado: "executando",
  },
  {
    id: "MIS-015",
    sender: "Claude",
    recipient: "Auditor",
    action: "revisar.pr",
    resource: "gh://ServerVpss/CentralDark#206",
    permissions: ["read:diff", "comment"],
    forbidden: ["merge", "close"],
    expiresAt: "23:45 BRT",
    traceId: "trc_b77…c19",
    estado: "executando",
  },
  {
    id: "MIS-016",
    sender: "Sentinela",
    recipient: "Guardião",
    action: "validar.policy",
    resource: "supabase://hub/policies",
    permissions: ["read:policy"],
    forbidden: ["write:policy"],
    expiresAt: "23:20 BRT",
    traceId: "trc_c34…d02",
    estado: "aguardando",
  },
];

export const aprovacoes: Aprovacao[] = [
  { id: "APR-021", titulo: "Deploy edge abacus-router", solicitante: "GPT/Codex", criticidade: "media", traceId: "trc_ap1…001" },
  { id: "APR-022", titulo: "Rotação de chave gateway", solicitante: "Guardião", criticidade: "alta", traceId: "trc_ap2…002" },
];

export const infra: Infra[] = [
  { servico: "gateway api.centralldark.com", estado: "saudavel", latenciaMs: 87 },
  { servico: "hub supabase", estado: "saudavel", latenciaMs: 42 },
  { servico: "pm2 · vps", estado: "saudavel", latenciaMs: 9 },
  { servico: "telegram bridge", estado: "saudavel", latenciaMs: 118 },
];

export const rodape = {
  policyVersion: "v2026.07.14",
  integridadeGateway: "OK · assinado",
};
