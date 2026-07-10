export type PaneKey = "hermes" | "arsenal" | "gateway" | "hub" | "telepainel" | "enxame";

export interface PaneConfig {
  key: PaneKey;
  titulo: string;
  neon: string; // cor CSS
  logs: string[];
  status: Array<{ texto: string; tom: "ok" | "proc" | "wait" }>;
}

export const PANES: PaneConfig[] = [
  {
    key: "hermes",
    titulo: "Hermes",
    neon: "#10b981",
    status: [
      { texto: "loop ativo", tom: "ok" },
      { texto: "analisando drift", tom: "proc" },
      { texto: "aguardando ciclo", tom: "wait" },
    ],
    logs: [
      "[hermes] loop 4287 · 0 divergências",
      "[hermes] snapshot salvo em memoria-api",
      "[hermes] enxame paralelo iniciado (10 agentes)",
      "[hermes] critic aprovou payload",
      "[hermes] deploy-watcher: sem alertas",
      "[hermes] knowledge-collector: 12 fatos novos",
      "[hermes] auto-diagnóstico OK · uptime 47h",
      "[hermes] mission #204 concluída",
    ],
  },
  {
    key: "arsenal",
    titulo: "Arsenal",
    neon: "#f59e0b",
    status: [
      { texto: "conselho ativo", tom: "ok" },
      { texto: "debate rodada 2", tom: "proc" },
      { texto: "consenso 87%", tom: "ok" },
    ],
    logs: [
      "[arsenal] /router → claude-opus-4 + gpt-5",
      "[arsenal] /debate rodada 2 · consenso 87%",
      "[arsenal] veredito consolidado",
      "[arsenal] refinar → +14% qualidade",
      "[arsenal] 6 modelos votaram · unanimidade",
      "[arsenal] regras.json v1.7 carregado",
    ],
  },
  {
    key: "gateway",
    titulo: "Gateway",
    neon: "#22d3ee",
    status: [
      { texto: "140 modelos", tom: "ok" },
      { texto: "roteando", tom: "proc" },
      { texto: "200 OK", tom: "ok" },
    ],
    logs: [
      "POST /v1/messages 200 · 342ms",
      "GET  /v1/models 200 · 161 modelos",
      "catálogo abacus atualizado",
      "x-api-key OK · cdk_live_***",
      "POST /v1/chat/completions 200 · 218ms",
      "cache hit · reuso de contexto",
      "rate-limit ok · 47/500",
    ],
  },
  {
    key: "hub",
    titulo: "HUB",
    neon: "#a78bfa",
    status: [
      { texto: "health 200", tom: "ok" },
      { texto: "auto-refresh", tom: "proc" },
      { texto: "online", tom: "ok" },
    ],
    logs: [
      "[hub] health 200 · 140 modelos online",
      "[hub] auto-refresh sync ok",
      "[hub] correlation_id abc123",
      "[hub] edge super-admin-status 200",
      "[hub] logs persistidos · 30d retenção",
      "[hub] PM2 id 27 · CentralDark-HubBot",
    ],
  },
  {
    key: "telepainel",
    titulo: "TelePainel",
    neon: "#f472b6",
    status: [
      { texto: "webhook 200", tom: "ok" },
      { texto: "puxada nova", tom: "proc" },
      { texto: "RLS ok", tom: "ok" },
    ],
    logs: [
      "[telepainel] webhook 200 · @SEGREDOPUXADASBOT",
      "[telepainel] puxada registrada",
      "[telepainel] RLS ok · policy authenticated",
      "[telepainel] plano premium ativado",
      "[telepainel] pix confirmado · R$ 29,90",
      "[telepainel] bot 🩸FISCAL🩸 respondeu",
    ],
  },
  {
    key: "enxame",
    titulo: "Enxame Ômega",
    neon: "#ef4444",
    status: [
      { texto: "fase 2/4", tom: "proc" },
      { texto: "20 agentes", tom: "ok" },
      { texto: "cascata", tom: "proc" },
    ],
    logs: [
      "[ômega] fase 2/4 · 20 sub-agentes",
      "[ômega] cascata multiplicada · 47 chamadas",
      "[ômega] veredito → opus",
      "[ômega] debate cruzado ativo",
      "[ômega] mixture-of-agents · 3 rodadas",
      "[ômega] consenso final atingido",
    ],
  },
];

export const PILOTO_MSGS: Array<{ autor: string; texto: string; cor?: string }> = [
  { autor: "Piloto", texto: "bora auditar o gateway", cor: "#f8fafc" },
  { autor: "Hermes", texto: "subindo enxame de 10 agentes ✓", cor: "#10b981" },
  { autor: "Arsenal", texto: "consenso 92% em 2 rodadas", cor: "#f59e0b" },
  { autor: "Gateway", texto: "140 modelos respondendo", cor: "#22d3ee" },
  { autor: "HUB", texto: "correlation_id abc123 · logs ok", cor: "#a78bfa" },
  { autor: "Piloto", texto: "veredito?", cor: "#f8fafc" },
  { autor: "Hermes", texto: "🟢 tudo estável, pivete", cor: "#10b981" },
];
