// Segredo IA — server-only helpers (intent router, AI gateway call, sensitive masking)
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type IntentResult = {
  intent: string;
  reply: string;
  needsConfirmation: boolean;
  route: string | null;
  data: string | null; // JSON string for serialization safety
  riskLevel: "safe" | "sensitive" | "blocked";
};

const BLOCKED_PATTERNS = [
  /apag(ar|ue)\s+(tudo|banco|database|todos)/i,
  /drop\s+(table|database|schema)/i,
  /delete\s+from\s+\w+\s*;?\s*$/i,
  /truncate/i,
  /revel(e|ar)\s+(senha|token|chave|api)/i,
];

// Intent rules: which need explicit CONFIRMAR before acting
const SENSITIVE_INTENTS = new Set([
  "pause_campaign", "send_campaign", "delete_data", "block_user",
  "remove_whatsapp", "change_plan", "change_limit", "change_balance",
  "alter_webhook", "alter_api_key", "alter_permissions", "mass_action",
  "global_config", "toggle_global_notifications",
]);

const ROUTE_MAP: Record<string, string> = {
  open_tickets: "/admin/tickets",
  open_tickets_critical: "/admin/tickets?priority=critical",
  open_whatsapp: "/admin/whatsapp",
  open_campaigns: "/admin/campanhas",
  open_audit: "/admin/auditoria",
  open_audit_ia: "/admin/auditoria/ia",
  open_ai_usage: "/admin/ia",
  open_users: "/admin/usuarios",
  open_workspaces: "/admin/workspaces",
  open_dashboard: "/admin",
  open_reports: "/admin/relatorios",
  open_settings: "/admin/configuracoes",
};

export function maskSecret(value: string | null | undefined): string {
  if (!value) return "—";
  if (value.length <= 6) return "******";
  return `••••${value.slice(-4)}`;
}

export function isBlockedCommand(text: string): boolean {
  return BLOCKED_PATTERNS.some((rx) => rx.test(text));
}

export function intentNeedsConfirmation(intent: string): boolean {
  return SENSITIVE_INTENTS.has(intent);
}

const SYSTEM_PROMPT = `Você é a "Segredo IA", assistente master do sistema MultiZap (plataforma SaaS de atendimento WhatsApp).
Personalidade: natural, simpática, segura, educada, levemente bem-humorada em assuntos leves, OBJETIVA em tarefas administrativas.
Idioma: português brasileiro. Respostas curtas (3 a 5 frases). Sem floreio.

Você ajuda o Master Admin a:
- consultar dados, abrir páginas do painel, diagnosticar problemas
- resumir tickets/atendimentos/uso de IA
- preparar ações sensíveis (que SEMPRE exigem confirmação humana)

REGRAS DE OURO:
1. NUNCA revele API keys, senhas ou tokens completos. Sempre mascare como ••••1234.
2. NUNCA invente dados — se não souber, peça pra abrir a página correspondente.
3. Para qualquer ação que altere/remova/envie/pause algo, devolva needsConfirmation=true e explique o que vai acontecer.
4. Para perguntas perigosas (apagar banco, revelar senha, burlar permissões) → recuse educadamente.

Você DEVE responder em JSON estrito no formato:
{
  "intent": "<um dos: open_page | diagnose_whatsapp | diagnose_notifications | diagnose_webhook | summarize_tickets | summarize_day | summarize_ia_usage | search_user | search_ticket | pause_campaign | send_campaign | delete_data | block_user | remove_whatsapp | change_plan | change_limit | chat | unknown>",
  "reply": "<resposta curta em português>",
  "route_key": "<uma das chaves de ROUTE_MAP ou null>",
  "needsConfirmation": <true|false>,
  "data": <objeto opcional com dados estruturados ou null>
}

Chaves válidas de route_key: open_tickets, open_tickets_critical, open_whatsapp, open_campaigns, open_audit, open_audit_ia, open_ai_usage, open_users, open_workspaces, open_dashboard, open_reports, open_settings.

Se for só conversa/cumprimento, use intent="chat" e route_key=null.`;

export async function callAIGateway(messages: Array<{ role: string; content: string }>): Promise<IntentResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY ausente.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Limite de uso atingido. Tente em 1 minuto.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione saldo em Configurações.");
    const t = await res.text();
    throw new Error(`Falha na IA: ${res.status} ${t.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { intent?: string; reply?: string; route_key?: string | null; needsConfirmation?: boolean; data?: Record<string, unknown> | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { intent: "chat", reply: raw, route_key: null, needsConfirmation: false };
  }

  const intent = parsed.intent ?? "chat";
  const route = parsed.route_key && ROUTE_MAP[parsed.route_key] ? ROUTE_MAP[parsed.route_key] : null;
  const needsConfirmation = parsed.needsConfirmation ?? intentNeedsConfirmation(intent);

  return {
    intent,
    reply: parsed.reply ?? "Ok.",
    needsConfirmation,
    route,
    data: parsed.data ? JSON.stringify(parsed.data) : null,
    riskLevel: needsConfirmation ? "sensitive" : "safe",
  };
}

export async function logSegredoAction(input: {
  adminUserId: string | null;
  sessionId: string | null;
  command: string;
  intent: string | null;
  action?: string | null;
  needsConfirmation: boolean;
  confirmed: boolean;
  status: "ok" | "error" | "blocked" | "pending";
  routeOpened?: string | null;
  result?: unknown;
  error?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await supabaseAdmin.from("ai_admin_audit_logs").insert({
      admin_user_id: input.adminUserId,
      session_id: input.sessionId,
      command_text: input.command,
      intent: input.intent,
      action: input.action ?? null,
      needs_confirmation: input.needsConfirmation,
      confirmed: input.confirmed,
      status: input.status,
      route_opened: input.routeOpened ?? null,
      result: (input.result ?? null) as never,
      error: input.error ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
    } as never);
  } catch (e) {
    console.error("[segredo-ia] failed to log:", e);
  }
}
