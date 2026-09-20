export type PaneKey = "hermes" | "arsenal" | "gateway" | "hub" | "telepainel" | "enxame";

export interface PaneConfig {
  key: PaneKey;
  titulo: string;
  neon: string;
  cost?: string;
  logs: string[];
  status: Array<{ texto: string; tom: "ok" | "proc" | "wait" }>;
}

/**
 * Convenção pros logs (o CockpitPane colore automático):
 *   $ comando         → verde-comando
 *   ✓ texto           → verde-ok
 *   ✗ texto           → vermelho-erro
 *   ⚠ texto           → âmbar-warn
 *   → texto           → ciano-arrow
 *   • texto           → cinza-info
 *   [tag] texto       → tag colorida + resto claro
 *   "string"          → rosa-string
 *   números / 200 / R$ → âmbar
 */

export const PANES: PaneConfig[] = [
  {
    key: "hermes",
    titulo: "hermes",
    neon: "#10b981",
    cost: "$0.016",
    status: [
      { texto: "loop ativo", tom: "ok" },
      { texto: "analisando drift", tom: "proc" },
      { texto: "aguardando ciclo", tom: "wait" },
    ],
    logs: [
      "$ hermes loop --watch",
      "[hermes] loop 4287 · 0 divergências",
      "✓ snapshot salvo em memoria-api",
      "→ enxame paralelo iniciado (10 agentes)",
      "✓ critic aprovou payload",
      "• deploy-watcher sem alertas",
      "[hermes] knowledge-collector: 12 fatos novos",
      "✓ auto-diagnóstico OK · uptime 47h",
      "✓ mission #204 concluída",
    ],
  },
  {
    key: "arsenal",
    titulo: "arsenal",
    neon: "#f59e0b",
    cost: "$0.059",
    status: [
      { texto: "conselho ativo", tom: "ok" },
      { texto: "debate rodada 2", tom: "proc" },
      { texto: "consenso 87%", tom: "ok" },
    ],
    logs: [
      "$ arsenal /router",
      "→ claude-opus-4 + gpt-5 + mimo-2.5",
      "[debate] rodada 2 · consenso 87%",
      "✓ veredito consolidado",
      "→ refinar aplicado · +14% qualidade",
      "• 6 modelos votaram · unanimidade",
      "✓ regras.json v1.7 carregado",
    ],
  },
  {
    key: "gateway",
    titulo: "gateway",
    neon: "#22d3ee",
    cost: "$0.019",
    status: [
      { texto: "140 modelos", tom: "ok" },
      { texto: "roteando", tom: "proc" },
      { texto: "200 OK", tom: "ok" },
    ],
    logs: [
      "$ curl api.centralldark.com/v1/models",
      "✓ POST /v1/messages 200 · 342ms",
      "✓ GET  /v1/models 200 · 161 modelos",
      "→ catálogo abacus atualizado",
      "[auth] x-api-key OK · cdk_live_***",
      "✓ POST /v1/chat/completions 200 · 218ms",
      "• cache hit · reuso de contexto",
      "⚠ rate-limit 47/500",
    ],
  },
  {
    key: "hub",
    titulo: "hub",
    neon: "#a78bfa",
    cost: "$0.089",
    status: [
      { texto: "health 200", tom: "ok" },
      { texto: "auto-refresh", tom: "proc" },
      { texto: "online", tom: "ok" },
    ],
    logs: [
      "$ hub status --json",
      "✓ health 200 · 140 modelos online",
      "→ auto-refresh sync ok",
      "[hub] correlation_id \"abc123\"",
      "✓ edge super-admin-status 200",
      "• logs persistidos · 30d retenção",
      "✓ PM2 id 27 · CentralDark-HubBot",
    ],
  },
  {
    key: "telepainel",
    titulo: "telepainel",
    neon: "#f472b6",
    cost: "$0.024",
    status: [
      { texto: "webhook 200", tom: "ok" },
      { texto: "puxada nova", tom: "proc" },
      { texto: "RLS ok", tom: "ok" },
    ],
    logs: [
      "$ telepainel tail --live",
      "✓ webhook 200 · @SEGREDOPUXADASBOT",
      "→ puxada registrada",
      "✓ RLS ok · policy authenticated",
      "[plan] premium ativado",
      "✓ pix confirmado · R$ 29,90",
      "• bot FISCAL respondeu em 812ms",
    ],
  },
  {
    key: "enxame",
    titulo: "enxame-ômega",
    neon: "#ef4444",
    cost: "$0.741",
    status: [
      { texto: "fase 2/4", tom: "proc" },
      { texto: "20 agentes", tom: "ok" },
      { texto: "cascata", tom: "proc" },
    ],
    logs: [
      "$ omega storm --fase=2",
      "→ 20 sub-agentes disparados",
      "[ômega] cascata multiplicada · 47 chamadas",
      "✓ debate cruzado ativo",
      "→ mixture-of-agents · 3 rodadas",
      "✓ veredito → opus",
      "✓ consenso final atingido",
    ],
  },
];

export const PILOTO_MSGS: Array<{ autor: string; texto: string; cor?: string }> = [
  { autor: "@piloto", texto: "bora auditar o gateway", cor: "#f8fafc" },
  { autor: "@hermes", texto: "✓ subindo enxame de 10 agentes", cor: "#10b981" },
  { autor: "@arsenal", texto: "consenso 92% em 2 rodadas", cor: "#f59e0b" },
  { autor: "@gateway", texto: "→ 140 modelos respondendo", cor: "#22d3ee" },
  { autor: "@hub", texto: "correlation_id abc123 · logs ok", cor: "#a78bfa" },
  { autor: "@piloto", texto: "veredito?", cor: "#f8fafc" },
  { autor: "@hermes", texto: "🟢 tudo estável, pivete", cor: "#10b981" },
];
