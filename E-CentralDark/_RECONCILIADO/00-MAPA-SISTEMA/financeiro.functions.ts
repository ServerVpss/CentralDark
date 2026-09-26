// Server functions da tela /app/financeiro.
// Métricas, listagem de PIX, fluxo de caixa, eventos de cobrança + ações
// (pausar/reativar cobrança e cancelar PIX). Tudo isolado por workspace via RLS
// e checagem explícita de membership.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertMember(workspaceId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Sem permissão neste workspace.");
}

const rangeSchema = z.object({
  workspaceId: z.string().uuid(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.enum(["PENDENTE", "COMPLETO", "EXPIRADO", "CANCELADO", "all"]).default("all"),
  gateway: z.string().max(40).optional(),
  channel: z.enum(["meta_cloud", "wuzapi_gateway", "baileys_selfhosted", "all"]).default("all"),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export const getFinanceiroOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const startWeek = new Date(Date.now() - 7 * 86400_000);
    const startMonth = new Date(Date.now() - 30 * 86400_000);

    const { data: pixAll } = await supabaseAdmin
      .from("pix_transactions")
      .select("id, status, amount, paid_at, created_at")
      .eq("workspace_id", data.workspaceId)
      .gte("created_at", startMonth.toISOString());

    const rows = (pixAll ?? []) as Array<{ status: string; amount: number; paid_at: string | null; created_at: string }>;

    const sum = (filter: (r: typeof rows[number]) => boolean) =>
      rows.filter(filter).reduce((a, r) => a + Number(r.amount || 0), 0);
    const count = (filter: (r: typeof rows[number]) => boolean) => rows.filter(filter).length;

    const paidToday = rows.filter((r) => r.status === "COMPLETO" && r.paid_at && new Date(r.paid_at) >= startOfDay);
    const ledgerCashOut = await supabaseAdmin
      .from("cash_ledger")
      .select("amount, type, created_at")
      .eq("workspace_id", data.workspaceId)
      .gte("created_at", startOfDay.toISOString());
    const ledger = (ledgerCashOut.data ?? []) as Array<{ amount: number; type: string }>;
    const entradasHoje = ledger.filter((l) => l.type === "income").reduce((a, l) => a + Number(l.amount || 0), 0);
    const saidasHoje = ledger.filter((l) => l.type === "expense").reduce((a, l) => a + Number(l.amount || 0), 0);

    const totalPagos = rows.filter((r) => r.status === "COMPLETO");
    const ticketMedio = totalPagos.length ? totalPagos.reduce((a, r) => a + Number(r.amount), 0) / totalPagos.length : 0;

    return {
      entradas_hoje: entradasHoje,
      saidas_hoje: saidasHoje,
      lucro_bruto: entradasHoje - saidasHoje,
      pix_pagos_hoje: paidToday.length,
      pix_pagos_hoje_valor: paidToday.reduce((a, r) => a + Number(r.amount), 0),
      pix_pendentes: count((r) => r.status === "PENDENTE"),
      pix_expirados: count((r) => r.status === "EXPIRADO"),
      pix_cancelados: count((r) => r.status === "CANCELADO"),
      ticket_medio: ticketMedio,
      receita_semana: sum((r) => r.status === "COMPLETO" && !!r.paid_at && new Date(r.paid_at) >= startWeek),
      receita_mes: sum((r) => r.status === "COMPLETO" && !!r.paid_at && new Date(r.paid_at) >= startMonth),
    };
  });

export const listFinanceiroPix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => rangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    let q = supabaseAdmin
      .from("pix_transactions")
      .select(
        "id, provider, status, amount, payer_name, description, created_at, expires_at, paid_at, cancelled_at, copy_paste, contact_id, conversation_id, connection_id, metadata",
        { count: "exact" },
      )
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.gateway) q = q.eq("provider", data.gateway);
    const { data: rows, count } = await q;

    // Enriquecer com contact name/phone + connection provider
    const contactIds = Array.from(new Set((rows ?? []).map((r) => r.contact_id).filter(Boolean))) as string[];
    const connIds = Array.from(new Set((rows ?? []).map((r) => r.connection_id).filter(Boolean))) as string[];
    const [contacts, conns] = await Promise.all([
      contactIds.length
        ? supabaseAdmin.from("contacts").select("id, name, phone").in("id", contactIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; phone: string }> }),
      connIds.length
        ? supabaseAdmin.from("whatsapp_connections").select("id, name, provider").in("id", connIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; provider: string }> }),
    ]);
    const cm = new Map((contacts.data ?? []).map((c) => [c.id, c]));
    const wm = new Map((conns.data ?? []).map((c) => [c.id, c]));

    let enriched = (rows ?? []).map((r) => ({
      ...r,
      contact_name: r.contact_id ? cm.get(r.contact_id)?.name ?? null : null,
      contact_phone: r.contact_id ? cm.get(r.contact_id)?.phone ?? null : null,
      connection_name: r.connection_id ? wm.get(r.connection_id)?.name ?? null : null,
      connection_provider: r.connection_id ? wm.get(r.connection_id)?.provider ?? null : null,
    }));
    if (data.channel !== "all") {
      enriched = enriched.filter((r) => r.connection_provider === data.channel);
    }
    return { rows: enriched, total: count ?? 0 };
  });

export const listFinanceiroLedger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    let q = supabaseAdmin
      .from("cash_ledger")
      .select("id, type, source, amount, description, created_at, payment_request_id, contact_id, conversation_id, metadata", { count: "exact" })
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, count } = await q;
    return { rows: rows ?? [], total: count ?? 0 };
  });

export const listCollectionEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        pixId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(200).default(50),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    let q = supabaseAdmin
      .from("payment_collection_events")
      .select("id, payment_request_id, event_type, status, message_body, error_message, created_at, metadata")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.pixId) q = q.eq("payment_request_id", data.pixId);
    const { data: rows } = await q;
    return { rows: rows ?? [] };
  });

const actionInput = z.object({ workspaceId: z.string().uuid(), pixId: z.string().uuid() });

export const pauseCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => actionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    const { data: pix } = await supabaseAdmin
      .from("pix_transactions").select("metadata, workspace_id").eq("id", data.pixId).maybeSingle();
    if (!pix || pix.workspace_id !== data.workspaceId) throw new Error("PIX não encontrado.");
    const meta = { ...(pix.metadata as Record<string, unknown>), collection_paused: true, paused_at: new Date().toISOString(), paused_by: context.userId };
    await supabaseAdmin.from("pix_transactions").update({ metadata: meta as never }).eq("id", data.pixId);
    await supabaseAdmin.from("payment_collection_events").insert({
      workspace_id: data.workspaceId, payment_request_id: data.pixId, event_type: "paused", status: "sent",
      metadata: { actor: context.userId } as never,
    });
    return { ok: true };
  });

export const resumeCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => actionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    const { data: pix } = await supabaseAdmin
      .from("pix_transactions").select("metadata, workspace_id").eq("id", data.pixId).maybeSingle();
    if (!pix || pix.workspace_id !== data.workspaceId) throw new Error("PIX não encontrado.");
    const m = pix.metadata as Record<string, unknown>;
    delete m.collection_paused; delete m.paused_at; delete m.paused_by;
    await supabaseAdmin.from("pix_transactions").update({ metadata: m as never }).eq("id", data.pixId);
    await supabaseAdmin.from("payment_collection_events").insert({
      workspace_id: data.workspaceId, payment_request_id: data.pixId, event_type: "resumed", status: "sent",
      metadata: { actor: context.userId } as never,
    });
    return { ok: true };
  });

export const cancelPixFromFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => actionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(data.workspaceId, context.userId);
    const { data: pix } = await supabaseAdmin
      .from("pix_transactions").select("workspace_id, status").eq("id", data.pixId).maybeSingle();
    if (!pix || pix.workspace_id !== data.workspaceId) throw new Error("PIX não encontrado.");
    if (pix.status === "COMPLETO") throw new Error("PIX já foi pago — não pode ser cancelado.");
    await supabaseAdmin
      .from("pix_transactions")
      .update({ status: "CANCELADO", cancelled_at: new Date().toISOString() })
      .eq("id", data.pixId)
      .neq("status", "COMPLETO");
    await supabaseAdmin.from("payment_collection_events").insert({
      workspace_id: data.workspaceId, payment_request_id: data.pixId, event_type: "cancelled", status: "sent",
      metadata: { actor: context.userId } as never,
    });
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspaceId, actor_user_id: context.userId, action: "user:pix_cancelled_from_finance",
      entity: "pix_transactions", entity_id: data.pixId, payload: {} as never,
    });
    return { ok: true };
  });
