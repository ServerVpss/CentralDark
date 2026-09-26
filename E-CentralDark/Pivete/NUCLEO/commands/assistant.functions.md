# COMANDO - assistant.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\assistant.functions.ts
**SHA:** 28321a67a893894f
**Timestamp:** 2026-08-26T19:33:43.881423
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Regra: WhatsApp QR/WuzAPI NÃO tem janela de 24h da Meta. Janela 24h só vale para Meta Cloud API.

### Ouro Bruto (primeiros 5000 chars)
```
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
    co
```