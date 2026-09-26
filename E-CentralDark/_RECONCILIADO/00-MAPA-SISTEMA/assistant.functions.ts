// Assistente única do MultiZap.
// - Modo MASTER: super_admin → acesso total, linguagem técnica permitida.
// - Modo USER:  usuário comum → linguagem leiga, só vê próprio workspace.
// - Modo ANON:  visitante (sem login).
// O modo é decidido NO SERVIDOR via is_super_admin. Cliente não escolhe.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAI, friendlyModelName } from "@/lib/ai-gateway.server";
import { callCentralAI, isCentralEnabled } from "@/lib/ai-router.server";
import { sendTelegramAlert } from "@/lib/telegram-alerts.server";

const MODEL = "openai/gpt-5.5";

async function resolveMode(authHeader: string | null): Promise<{
  mode: "master" | "user" | "anon";
  userId: string | null;
}> {
  if (!authHeader?.startsWith("Bearer ")) return { mode: "anon", userId: null };
  const token = authHeader.slice(7);
  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    const userId = data?.user?.id ?? null;
    if (!userId) return { mode: "anon", userId: null };
    const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    return { mode: isMaster ? "master" : "user", userId };
  } catch {
    return { mode: "anon", userId: null };
  }
}

// Documentação oficial que a assistente sempre considera ao falar de WhatsApp/Gateway:
// 1) WuzAPI (asternic/wuzapi) — API HTTP que expõe o Whatsmeow. README e wiki cobrem endpoints
//    /session/connect, /chat/send/*, eventos via webhook (message, receipt, group), formato JSON,
//    subscribedEvents, tipos de mídia, regras de QR/pairing, multi-device.
// 2) Whatsmeow (tulir/whatsmeow) — biblioteca Go que conversa direto com o WhatsApp Web multi-device.
//    Define eventos (Message, Receipt, GroupInfo, Disconnected, PairSuccess, LoggedOut),
//    JID @s.whatsapp.net (privado) e @g.us (grupo), limites de envio, reconexão, presence.
// Regra: WhatsApp QR/WuzAPI NÃO tem janela de 24h da Meta. Janela 24h só vale para Meta Cloud API.
const ASSISTANT_DOCS_CONTEXT = `Documentação oficial de referência (sempre consultar mentalmente):
- WuzAPI (https://github.com/asternic/wuzapi): API HTTP local em 127.0.0.1:8081 que envelopa o Whatsmeow.
  Endpoints típicos: /session/connect, /session/qr, /session/logout, /chat/send/text|image|document|audio,
  /group/list, /webhook. Eventos enviados via webhook: message.received, message.receipt, message.failed,
  group.updated, profile.photo.updated, identity.changed. Campo subscribedEvents define o que chega.
- Whatsmeow (https://github.com/tulir/whatsmeow): biblioteca Go por trás da WuzAPI. Conecta direto no
  WhatsApp Web multi-device. JID @s.whatsapp.net (privado) e @g.us (grupo). Eventos: Message, Receipt,
  GroupInfo, PairSuccess, LoggedOut, Disconnected. Tem rate limit interno e reconexão automática.
Regras do MultiZap:
- Meta Cloud API tem janela 24h (fora dela só template aprovado).
- QR/WuzAPI NÃO tem janela 24h; pode continuar conversa antiga se sessão estiver conectada.
- Fluxo oficial: WuzAPI → Gateway MultiZap (PM2 MultiZap-Gateway, porta 3100, rota POST /wuzapi)
  → CRM (https://multizap.dev/api/public/wuzapi/webhook) → /app/chat.
- Áreas protegidas (Gateway, WuzAPI, Docker, PM2, .env, /wuzapi): só mexer com autorização explícita.`;

function systemPrompt(mode: "master" | "user" | "anon", pagePath?: string | null) {
  const base = `Você é a Assistente MultiZap, ajuda integrada ao sistema de atendimento WhatsApp MultiZap.
Sempre responda em português brasileiro simples e direto.
Tela atual do usuário: ${pagePath ?? "desconhecida"}.

${ASSISTANT_DOCS_CONTEXT}`;
  if (mode === "master") {
    return `${base}

MODO MASTER (super administrador). Você pode falar de dados técnicos, IDs, logs, status do Gateway, conexões WhatsApp, audit_log, qualquer workspace.
Quando explicar um erro: dê (1) resumo leigo, (2) causa técnica provável citando WuzAPI/Whatsmeow/Meta quando fizer sentido, (3) sugestão pronta pra colar na Lovable.
Se o erro vier de WhatsApp, identifique se é Meta (janela 24h, template) ou QR/WuzAPI (sessão, reconexão, rate limit, JID inválido).
Seja preciso e curto.`;
  }
  return `${base}

MODO USUÁRIO (leigo). Linguagem 100% simples, empática, passo a passo. Nunca mostre stack trace cru, IDs internos, nomes de tabelas, código.
Se for erro: explique o que aconteceu em uma frase + o que ele pode fazer agora. Se precisar de ajuda do suporte, diga "vou avisar a equipe técnica".`;
}

const SendInput = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(4000),
  pagePath: z.string().max(500).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  capturedErrorId: z.string().uuid().nullable().optional(),
});

export const sendAssistantMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SendInput.parse(input))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const { mode, userId } = await resolveMode(req?.headers?.get("authorization") ?? null);

    // 1. Garante conversa
    let convId = data.conversationId ?? null;
    if (!convId) {
      const { data: conv, error } = await supabaseAdmin
        .from("assistant_conversations")
        .insert({
          user_id: userId,
          mode,
          page_path: data.pagePath ?? null,
          user_agent: data.userAgent ?? null,
          model: MODEL,
          title: data.message.slice(0, 60),
        })
        .select("id")
        .single();
      if (error) throw new Error("Não conseguimos abrir a conversa. Tente de novo.");
      convId = conv.id;
    }

    // 2. Carrega histórico
    const { data: history } = await supabaseAdmin
      .from("assistant_messages")
      .select("role, content")
      .eq("conversation_id", convId!)
      .order("created_at", { ascending: true })
      .limit(30);

    // 3. Carrega erro anexado (se houver)
    let errorCtx = "";
    if (data.capturedErrorId) {
      const { data: err } = await supabaseAdmin
        .from("assistant_errors")
        .select("message, stack, source, page_path")
        .eq("id", data.capturedErrorId)
        .maybeSingle();
      if (err) {
        errorCtx = `\n\n[Erro capturado nesta tela]\nFonte: ${err.source}\nMensagem: ${err.message}\nStack: ${err.stack?.slice(0, 1500) ?? "(sem stack)"}`;
      }
    }

    // 4. Salva mensagem do usuário
    await supabaseAdmin.from("assistant_messages").insert({
      conversation_id: convId!,
      role: "user",
      content: data.message + errorCtx,
    });

    // 5. Chama IA — tenta Central de IA quando habilitada; cai no Lovable AI Gateway em qualquer falha.
    const t0 = Date.now();
    const aiMessages = [
      { role: "system" as const, content: systemPrompt(mode, data.pagePath) },
      ...(history ?? []).map((m) => ({ role: m.role as any, content: m.content })),
      { role: "user" as const, content: data.message + errorCtx },
    ];
    let ai;
    if (isCentralEnabled()) {
      try {
        ai = await callCentralAI({
          profileKey: "chat",
          messages: aiMessages,
          context: { feature: "assistant", userId },
        });
      } catch (e) {
        console.warn("[assistant] central falhou, usando fallback Lovable AI:", (e as Error).message);
        ai = await callLovableAI({ model: MODEL, messages: aiMessages });
      }
    } else {
      ai = await callLovableAI({ model: MODEL, messages: aiMessages });
    }
    const latency = Date.now() - t0;

    // 6. Salva resposta
    await supabaseAdmin.from("assistant_messages").insert({
      conversation_id: convId!,
      role: "assistant",
      content: ai.text,
      model: ai.model,
      tokens_in: ai.usage?.promptTokens ?? null,
      tokens_out: ai.usage?.completionTokens ?? null,
      latency_ms: latency,
    });

    await supabaseAdmin
      .from("assistant_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId!);

    return {
      conversationId: convId,
      reply: ai.text,
      mode,
      model: ai.model,
      modelFriendly: friendlyModelName(ai.model),
      latencyMs: latency,
    };
  });

const ReportErrorInput = z.object({
  source: z.enum(["auto", "manual", "network", "serverfn", "boundary"]),
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).nullable().optional(),
  pagePath: z.string().max(500).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  payload: z.any().optional(),
  notifyTelegram: z.boolean().optional().default(true),
});

export const reportAssistantError = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReportErrorInput.parse(input))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const { mode, userId } = await resolveMode(req?.headers?.get("authorization") ?? null);

    // Gera resumo leigo + relatório técnico + sugestão via IA (best-effort)
    let friendlySummary = "Algo deu errado nesta tela.";
    let technicalReport = `${data.message}\n${data.stack ?? ""}`.slice(0, 4000);
    let aiSuggestion: string | null = null;

    try {
      const ai = await callLovableAI({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `Você analisa erros do app MultiZap. Responda em JSON puro com 3 campos:
{"friendly":"...uma frase simples pro usuário leigo...","technical":"...diagnóstico técnico curto e preciso (causa provável, módulo afetado)...","suggestion":"...sugestão pronta pra colar no chat do Lovable explicando o que consertar e onde..."}`,
          },
          {
            role: "user",
            content: `Tela: ${data.pagePath ?? "?"}\nFonte: ${data.source}\nMensagem: ${data.message}\nStack:\n${(data.stack ?? "").slice(0, 2500)}`,
          },
        ],
        // temperature omitida: gpt-5.5 só aceita valor padrão (1)
      });
      const m = ai.text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        if (parsed.friendly) friendlySummary = String(parsed.friendly).slice(0, 600);
        if (parsed.technical) technicalReport = String(parsed.technical).slice(0, 4000);
        if (parsed.suggestion) aiSuggestion = String(parsed.suggestion).slice(0, 2000);
      }
    } catch {
      /* segue com fallback */
    }

    const { data: row, error } = await supabaseAdmin
      .from("assistant_errors")
      .insert({
        user_id: userId,
        mode,
        source: data.source,
        page_path: data.pagePath ?? null,
        user_agent: data.userAgent ?? null,
        message: data.message,
        stack: data.stack ?? null,
        payload: data.payload ?? null,
        friendly_summary: friendlySummary,
        technical_report: technicalReport,
        ai_suggestion: aiSuggestion,
      })
      .select("id")
      .single();

    if (error) throw new Error("Não conseguimos registrar o erro.");

    // Fire-and-forget Telegram
    if (data.notifyTelegram !== false) {
      sendTelegramAlert({
        title: `Erro no MultiZap (${mode})`,
        friendlySummary,
        technicalReport,
        aiSuggestion,
        pagePath: data.pagePath ?? null,
        userId,
        errorId: row.id,
      })
        .then(async (r) => {
          await supabaseAdmin
            .from("assistant_errors")
            .update({
              telegram_sent_at: r.ok ? new Date().toISOString() : null,
              telegram_error: r.ok ? null : r.error ?? null,
            })
            .eq("id", row.id);
        })
        .catch(() => {});
    }

    return {
      errorId: row.id,
      friendlySummary,
      technicalReport,
      aiSuggestion,
    };
  });

export const listAssistantConversations = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const { mode, userId } = await resolveMode(req?.headers?.get("authorization") ?? null);
    if (mode !== "master") throw new Error("Acesso restrito ao administrador.");

    const { data: convs } = await supabaseAdmin
      .from("assistant_conversations")
      .select("id, mode, page_path, model, title, user_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);

    const { data: errors } = await supabaseAdmin
      .from("assistant_errors")
      .select("id, source, page_path, message, friendly_summary, telegram_sent_at, created_at, user_id, mode")
      .order("created_at", { ascending: false })
      .limit(100);

    return { conversations: convs ?? [], errors: errors ?? [], requestedBy: userId };
  },
);
