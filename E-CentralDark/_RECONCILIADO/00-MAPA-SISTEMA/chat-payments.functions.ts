// Etapa 3 — Comandos PIX no chat (atendente + cliente inbound)
// Reutilizado por:
//  - serverFn pública (atendente, /pix no composer)
//  - sendMessage (interceptação de comando do atendente)
//  - webhook WhatsApp inbound (cliente — modo customer)

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { parseChatCommand, type ParsedCommand } from "@/lib/payments/command-parser";
import {
  extractMisticCreds,
  misticCreatePix,
  type MisticPayCreds,
} from "@/lib/payments/misticpay";

type GlobalPay = {
  payments_module_enabled: boolean;
  payments_pix_commands_enabled: boolean;
  payments_default_min_amount: number;
  payments_default_max_amount: number;
  payments_default_pix_expiration_minutes: number;
  payments_allow_workspace_override_limits: boolean;
};

type WsPay = {
  pix_commands_enabled: boolean;
  customer_can_generate_pix: boolean;
  min_amount: number;
  max_amount: number;
  pix_expiration_minutes: number;
  default_gateway_provider_key: string | null;
  msg_pix_template: string | null;
  msg_not_found_template: string | null;
};

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPixMessage(opts: {
  template: string | null;
  nome: string;
  valor: number;
  copiaCola: string | null;
  expiraEm: Date;
}) {
  const expira = opts.expiraEm.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const tpl = opts.template?.trim();
  if (tpl) {
    return tpl
      .replaceAll("{nome}", opts.nome)
      .replaceAll("{valor}", fmtBRL(opts.valor))
      .replaceAll("{pix_copia_e_cola}", opts.copiaCola ?? "(indisponível)")
      .replaceAll("{expira_em}", expira);
  }
  return [
    "🧾 *PIX GERADO COM SUCESSO*",
    "",
    `Olá, *${opts.nome}*!`,
    "Seu pagamento foi criado.",
    "",
    `💰 *Valor:* ${fmtBRL(opts.valor)}`,
    `⏳ *Validade:* ${expira}`,
    "",
    "📋 *PIX Copia e Cola:*",
    `\`${opts.copiaCola ?? "(indisponível — solicite novo PIX)"}\``,
    "",
    "Assim que o pagamento for confirmado, eu aviso você automaticamente por aqui. ✅",
  ].join("\n");
}

async function loadSettings(workspaceId: string): Promise<{ global: GlobalPay; ws: WsPay | null }> {
  const [{ data: ms }, { data: ws }] = await Promise.all([
    supabaseAdmin
      .from("master_settings")
      .select(
        "payments_module_enabled, payments_pix_commands_enabled, payments_default_min_amount, payments_default_max_amount, payments_default_pix_expiration_minutes, payments_allow_workspace_override_limits",
      )
      .eq("id", 1)
      .single(),
    supabaseAdmin
      .from("workspace_payment_settings")
      .select(
        "pix_commands_enabled, customer_can_generate_pix, min_amount, max_amount, pix_expiration_minutes, default_gateway_provider_key, msg_pix_template, msg_not_found_template",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  ]);
  return { global: ms as GlobalPay, ws: (ws as WsPay) ?? null };
}

async function loadGatewayCreds(workspaceId: string, providerKey: string | null): Promise<
  | { ok: true; creds: MisticPayCreds; row: { id: string; webhook_url: string | null } }
  | { ok: false; reason: string }
> {
  let q = supabaseAdmin
    .from("workspace_payment_gateways")
    .select("id, provider_key, credentials, webhook_url, status, is_enabled")
    .eq("workspace_id", workspaceId)
    .eq("is_enabled", true);
  if (providerKey) q = q.eq("provider_key", providerKey);
  else q = q.eq("is_default", true);
  const { data, error } = await q.maybeSingle();
  if (error) return { ok: false, reason: error.message };
  if (!data) {
    const { data: any2 } = await supabaseAdmin
      .from("workspace_payment_gateways")
      .select("id, provider_key, credentials, webhook_url, status, is_enabled")
      .eq("workspace_id", workspaceId)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();
    if (!any2) return { ok: false, reason: "no_gateway" };
    if (any2.provider_key !== "misticpay") return { ok: false, reason: "unsupported_provider" };
    const creds = extractMisticCreds(any2.credentials);
    if (!creds) return { ok: false, reason: "no_credentials" };
    return { ok: true, creds, row: { id: any2.id, webhook_url: any2.webhook_url } };
  }
  if (data.provider_key !== "misticpay") return { ok: false, reason: "unsupported_provider" };
  const { data: cat } = await supabaseAdmin
    .from("payment_gateway_catalog")
    .select("global_status, enabled_globally, is_implemented")
    .eq("provider_key", data.provider_key)
    .single();
  if (!cat?.enabled_globally || !cat.is_implemented || cat.global_status !== "ativo") {
    return { ok: false, reason: "gateway_blocked_by_master" };
  }
  const creds = extractMisticCreds(data.credentials);
  if (!creds) return { ok: false, reason: "no_credentials" };
  return { ok: true, creds, row: { id: data.id, webhook_url: data.webhook_url } };
}

const inputSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export type RunCommandResult =
  | { kind: "none" }
  | { kind: "reply"; message: string; commandName: string; pixId?: string };

type RunArgs = {
  ticketId: string;
  body: string;
  /** "agent" exige userId + membership. "customer" roda no webhook inbound. */
  mode?: "agent" | "customer";
  userId?: string;
  /** external_id da mensagem WhatsApp (msg.id) — usado pra idempotência customer. */
  messageExternalId?: string | null;
};

export async function runChatPaymentCommandInternal(args: RunArgs): Promise<RunCommandResult> {
  const mode = args.mode ?? "agent";
  const data = { ticketId: args.ticketId, body: args.body };
  const parsed: ParsedCommand = parseChatCommand(data.body, { isAgent: mode === "agent" });
  if (parsed.kind === "none") return { kind: "none" };

  // Idempotência customer: se já processamos essa msg, ignora
  if (mode === "customer" && args.messageExternalId) {
    const { data: prev } = await supabaseAdmin
      .from("command_events")
      .select("id")
      .eq("message_id", args.messageExternalId)
      .limit(1)
      .maybeSingle();
    if (prev) return { kind: "none" };
  }

  const { data: ticket, error: tErr } = await supabaseAdmin
    .from("tickets")
    .select("id, workspace_id, contact_id, connection_id, contact:contacts(id, name, phone)")
    .eq("id", data.ticketId)
    .single();
  if (tErr || !ticket) throw new Error("Ticket não encontrado");

  const workspaceId = ticket.workspace_id as string;
  const contactId = ticket.contact_id as string;
  const contact = ticket.contact as { id: string; name: string | null; phone: string | null } | null;
  const nome = (contact?.name ?? "Cliente").split(" ")[0];

  let memRole: string | null = null;
  if (mode === "agent") {
    if (!args.userId) throw new Error("userId obrigatório no modo agent");
    const { data: mem } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", args.userId)
      .maybeSingle();
    if (!mem) throw new Error("Sem acesso a este workspace");
    memRole = (mem.role as string) ?? null;
  }

  const log = (
    name: string,
    status: "success" | "blocked" | "invalid" | "error",
    payload: Record<string, unknown>,
  ) =>
    supabaseAdmin.from("command_events").insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      conversation_id: ticket.id,
      command_raw: data.body,
      command_name: name,
      command_args: JSON.parse(JSON.stringify({ parsed })) as never,
      source: mode,
      status,
      result_payload: JSON.parse(JSON.stringify(payload)) as never,
      message_id: args.messageExternalId ?? null,
    });

  const reply = async (commandName: string, message: string, extra: { pixId?: string } = {}) => {
    await log(commandName, "success", { message_preview: message.slice(0, 120), ...extra });
    return { kind: "reply" as const, message, commandName, ...extra };
  };
  const block = async (commandName: string, message: string, reason: string) => {
    await log(commandName, "blocked", { reason });
    return { kind: "reply" as const, message, commandName };
  };
  const invalid = async (commandName: string, message: string) => {
    await log(commandName, "invalid", {});
    return { kind: "reply" as const, message, commandName };
  };

  // Cliente não pode comandos admin
  if (mode === "customer" && (parsed.kind === "pix_cancel" || parsed.kind === "pix_list_pending" || parsed.kind === "cash_summary")) {
    return block(parsed.kind, "⚠️ *Comando não disponível*\n\nEsse comando só pode ser usado por um atendente autorizado.", "customer_forbidden");
  }

  // Cliente afirmando "paguei" — antifraude
  if (parsed.kind === "paid_claim") {
    return reply("paid_claim", [
      "🕵️ *Pagamento ainda não confirmado*",
      "",
      "Ainda não localizei a confirmação automática do seu pagamento.",
      "",
      "✅ Se você acabou de pagar, aguarde alguns instantes.",
      "📌 Assim que o gateway confirmar, eu aviso automaticamente por aqui.",
    ].join("\n"));
  }

  if (parsed.kind === "help") {
    const lines = mode === "agent"
      ? [
          "🤖 *Comandos disponíveis*",
          "",
          "• `/pix 50` — gera cobrança PIX de R$ 50",
          "• `/cobrar 100` — idem",
          "• `/ver pix` — mostra PIX pendente desta conversa",
          "• `/cancelar pix` — cancela PIX pendente",
          "• `/pendentes` — lista PIX pendentes do workspace",
        ]
      : [
          "🤖 *Comandos disponíveis*",
          "",
          "• *pix 50* — gera um PIX de R$ 50",
          "• *status pagamento* — mostra seu PIX pendente",
          "• *paguei* — registra aviso (aguardamos confirmação automática)",
        ];
    return reply("help", lines.join("\n"));
  }

  const { global, ws } = await loadSettings(workspaceId);
  if (!global?.payments_module_enabled || !global?.payments_pix_commands_enabled) {
    return block(parsed.kind, "⚠️ *Pagamento indisponível*\n\nA geração de PIX pelo chat está temporariamente indisponível.", "global_off");
  }
  if (mode === "agent" && !ws?.pix_commands_enabled) {
    return block(parsed.kind, "⚠️ *Comandos de pagamento desativados*\n\nEste workspace não permite gerar PIX pelo chat no momento.", "ws_off");
  }
  if (mode === "customer" && !ws?.customer_can_generate_pix) {
    return block(parsed.kind, "⚠️ *Comandos de pagamento desativados*\n\nEste atendimento não permite gerar PIX pelo chat no momento.", "ws_customer_off");
  }

  if (parsed.kind === "pix_status" || parsed.kind === "pix_list_pending") {
    const { data: pend } = await supabaseAdmin
      .from("pix_transactions")
      .select("id, amount, status, copy_paste, expires_at, created_at")
      .eq("workspace_id", workspaceId)
      .eq("contact_id", contactId)
      .eq("status", "PENDENTE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!pend) {
      return reply(parsed.kind, "ℹ️ Não há PIX pendente para este contato.");
    }
    const expira = pend.expires_at ? new Date(pend.expires_at as string).toLocaleString("pt-BR") : "—";
    return reply(parsed.kind, [
      "📌 *PIX pendente desta conversa*",
      "",
      `💰 *Valor:* ${fmtBRL(Number(pend.amount))}`,
      `⏳ *Validade:* ${expira}`,
      "",
      "📋 *PIX Copia e Cola:*",
      `\`${pend.copy_paste ?? "(indisponível)"}\``,
    ].join("\n"), { pixId: pend.id });
  }

  if (parsed.kind === "pix_cancel") {
    if (mode !== "agent" || memRole !== "admin") {
      return block("pix_cancel", "🚫 Apenas administradores podem cancelar PIX.", "role");
    }
    const { data: pend } = await supabaseAdmin
      .from("pix_transactions")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("contact_id", contactId)
      .eq("status", "PENDENTE")
      .maybeSingle();
    if (!pend) return reply("pix_cancel", "ℹ️ Nenhum PIX pendente para cancelar.");
    await supabaseAdmin
      .from("pix_transactions")
      .update({ status: "CANCELADO", cancelled_at: new Date().toISOString() })
      .eq("id", pend.id);
    return reply("pix_cancel", "✅ PIX pendente cancelado.", { pixId: pend.id });
  }

  if (parsed.kind === "pix_create") {
    if (!ws) {
      return block("pix_create", "⚠️ *Pagamento indisponível*\n\nEste workspace ainda não configurou pagamentos.", "ws_missing");
    }
    if (!Number.isFinite(parsed.amount) || parsed.amount <= 0) {
      return invalid("pix_create", "⚠️ *Valor inválido*\n\nInforme um valor válido. Exemplo: *pix 50*");
    }
    const minAllowed = global.payments_allow_workspace_override_limits
      ? ws.min_amount
      : Math.max(ws.min_amount, global.payments_default_min_amount);
    const maxAllowed = global.payments_allow_workspace_override_limits
      ? ws.max_amount
      : Math.min(ws.max_amount, global.payments_default_max_amount);
    if (parsed.amount < minAllowed || parsed.amount > maxAllowed) {
      return invalid("pix_create", `⚠️ Valor fora do intervalo permitido (${fmtBRL(minAllowed)} – ${fmtBRL(maxAllowed)}).`);
    }

    const { data: pend } = await supabaseAdmin
      .from("pix_transactions")
      .select("id, amount, copy_paste, expires_at")
      .eq("workspace_id", workspaceId)
      .eq("contact_id", contactId)
      .eq("status", "PENDENTE")
      .maybeSingle();
    if (pend) {
      return block("pix_create", [
        "⚠️ *PIX PENDENTE ENCONTRADO*",
        "",
        "Você já possui um PIX em aberto.",
        "",
        `💰 *Valor:* ${fmtBRL(Number(pend.amount))}`,
        "⏳ *Status:* Aguardando pagamento",
        "",
        "Finalize esse pagamento ou solicite o cancelamento antes de gerar outro PIX.",
        "",
        "📋 *PIX Copia e Cola:*",
        `\`${pend.copy_paste ?? "(indisponível)"}\``,
      ].join("\n"), "pix_pending_exists");
    }

    const gw = await loadGatewayCreds(workspaceId, ws.default_gateway_provider_key);
    if (!gw.ok) {
      const msg = gw.reason === "gateway_blocked_by_master"
        ? "🚫 *Gateway bloqueado pelo Master.* Contate o suporte."
        : "⚠️ *Gateway de pagamento não configurado*\n\nO PIX ainda não está disponível para este atendimento.";
      return block("pix_create", msg, gw.reason);
    }

    const clientTxId = `mz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await misticCreatePix(gw.creds, {
      amount: parsed.amount,
      payerName: contact?.name ?? "Cliente",
      description: `Cobrança via chat - ticket ${ticket.id.slice(0, 8)}`,
      clientTransactionId: clientTxId,
      webhookUrl: gw.row.webhook_url ?? undefined,
    });
    if (!res.ok) {
      return block("pix_create", `❌ Falha ao gerar PIX (${res.status}). ${res.message}`, "gateway_error");
    }

    const expirationMinutes = ws.pix_expiration_minutes ?? global.payments_default_pix_expiration_minutes ?? 30;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60_000);

    const { data: row, error } = await supabaseAdmin
      .from("pix_transactions")
      .insert({
        workspace_id: workspaceId,
        contact_id: contactId,
        conversation_id: ticket.id,
        connection_id: ticket.connection_id,
        provider: "misticpay",
        external_transaction_id: res.externalId,
        client_transaction_id: clientTxId,
        status: res.status || "PENDENTE",
        amount: parsed.amount,
        payer_name: contact?.name ?? "Cliente",
        description: `Chat ${ticket.id.slice(0, 8)}`,
        copy_paste: res.copyPaste,
        qrcode_base64: res.qrcodeBase64,
        qrcode_url: res.qrcodeUrl,
        expires_at: expiresAt.toISOString(),
        created_by: args.userId ?? null,
        created_by_type: mode === "agent" ? "agent" : "customer",
        raw_payload: res.raw as never,
        metadata: {
          source: mode === "agent" ? "chat_command" : "customer_inbound",
          note: (parsed as { note?: string }).note ?? null,
        },
      })
      .select("id")
      .single();
    if (error) {
      return block("pix_create", `❌ PIX gerado no gateway mas não pôde ser salvo: ${error.message}`, "db_error");
    }

    await supabaseAdmin.from("audit_log").insert({
      workspace_id: workspaceId,
      actor_user_id: args.userId ?? null,
      action: mode === "agent" ? "user:pix_created_via_chat" : "system:pix_created_via_customer_inbound",
      category: mode === "agent" ? "user" : "system",
      entity: "pix_transactions",
      entity_id: row.id,
      payload: { amount: parsed.amount, ticket_id: ticket.id, contact_id: contactId } as never,
    });

    const message = fmtPixMessage({
      template: ws.msg_pix_template,
      nome,
      valor: parsed.amount,
      copiaCola: res.copyPaste,
      expiraEm: expiresAt,
    });
    return reply("pix_create", message, { pixId: row.id });
  }

  return { kind: "none" };
}

export const runChatPaymentCommand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data, context }) =>
    runChatPaymentCommandInternal({ ticketId: data.ticketId, body: data.body, userId: context.userId, mode: "agent" }),
  );

// ===== Leitura do PIX pendente do ticket (banner/UI no chat) =====
const pendingInput = z.object({ ticketId: z.string().uuid() });

export const getPendingPixForTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => pendingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: ticket } = await supabaseAdmin
      .from("tickets")
      .select("id, workspace_id, contact_id")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (!ticket) return { pending: null as null | {
      id: string; amount: number; copy_paste: string | null;
      expires_at: string | null; created_at: string; status: string;
    } };
    const { data: mem } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", ticket.workspace_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!mem) return { pending: null };

    const { data: pend } = await supabaseAdmin
      .from("pix_transactions")
      .select("id, amount, copy_paste, expires_at, created_at, status")
      .eq("workspace_id", ticket.workspace_id)
      .eq("contact_id", ticket.contact_id)
      .eq("status", "PENDENTE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { pending: (pend as never) ?? null };
  });
