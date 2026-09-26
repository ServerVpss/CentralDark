import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ============ Helpers ============
async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas Super Admin");
}

async function getActiveGateway() {
  const { data, error } = await supabaseAdmin
    .from("payment_gateways")
    .select("*")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Nenhum gateway de pagamento configurado.");
  if (!data.client_id || !data.client_secret) {
    throw new Error("Gateway sem credenciais (Client ID/Secret).");
  }
  return data;
}

// ============ Gateway config (master) ============
export const listGateways = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("payment_gateways")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { gateways: data ?? [] };
  });

const saveGatewaySchema = z.object({
  id: z.string().uuid().optional(),
  provider: z.string().min(1).max(50),
  label: z.string().max(120).default(""),
  client_id: z.string().max(500).nullable().optional(),
  client_secret: z.string().max(500).nullable().optional(),
  environment: z.enum(["production", "sandbox"]).default("production"),
  webhook_url: z.string().max(500).nullable().optional(),
  base_url: z.string().url().default("https://api.misticpay.com"),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  notes: z.string().max(2000).nullable().optional(),
});

export const saveGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => saveGatewaySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };

    if (data.is_default) {
      await supabaseAdmin
        .from("payment_gateways")
        .update({ is_default: false })
        .neq("id", data.id ?? "00000000-0000-0000-0000-000000000000");
    }

    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("payment_gateways")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return { gateway: row };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("payment_gateways")
        .upsert(payload, { onConflict: "provider" })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return { gateway: row };
    }
  });

export const testGatewayConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: gw, error } = await supabaseAdmin
      .from("payment_gateways")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !gw) throw new Error("Gateway não encontrado");
    if (!gw.client_id || !gw.client_secret) {
      throw new Error("Configure Client ID e Client Secret antes de testar");
    }

    const res = await fetch(`${gw.base_url}/api/users/info`, {
      method: "GET",
      headers: {
        ci: gw.client_id,
        cs: gw.client_secret,
        "Content-Type": "application/json",
      },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, body };
    }
    return { ok: true, status: res.status, body };
  });

// ============ Pix transactions ============
const createPixSchema = z.object({
  amount: z.number().positive().max(50000),
  payerName: z.string().min(1).max(120),
  payerDocument: z.string().min(11).max(14).regex(/^\d+$/),
  description: z.string().min(1).max(200),
  workspace_id: z.string().uuid().optional().nullable(),
  purpose: z.string().max(50).optional(),
  reference_id: z.string().max(120).optional(),
});

export const createPixTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => createPixSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Super admin OR workspace member
    let allowed = false;
    if (data.workspace_id) {
      const { data: m } = await supabaseAdmin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", data.workspace_id)
        .eq("user_id", context.userId)
        .maybeSingle();
      allowed = !!m;
    }
    if (!allowed) {
      const { data: r } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .eq("role", "super_admin")
        .maybeSingle();
      allowed = !!r;
    }
    if (!allowed) throw new Error("Acesso negado");

    const gw = await getActiveGateway();

    const clientTxId = `mz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const body = {
      amount: data.amount,
      payerName: data.payerName,
      payerDocument: data.payerDocument,
      transactionId: clientTxId,
      description: data.description,
      ...(gw.webhook_url ? { projectWebhook: gw.webhook_url } : {}),
    };

    const res = await fetch(`${gw.base_url}/api/transactions/create`, {
      method: "POST",
      headers: {
        ci: gw.client_id!,
        cs: gw.client_secret!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      console.error("MisticPay create error", res.status, json);
      throw new Error(json?.message || `Falha ao criar Pix (${res.status})`);
    }

    const d = json?.data ?? {};

    const { data: row, error } = await supabaseAdmin
      .from("pix_transactions")
      .insert({
        workspace_id: data.workspace_id ?? null,
        provider: gw.provider,
        external_transaction_id: String(d.transactionId ?? ""),
        client_transaction_id: clientTxId,
        transaction_type: d.transactionType ?? "DEPOSITO",
        transaction_method: d.transactionMethod ?? "PIX",
        status: d.transactionState ?? "PENDENTE",
        amount: data.amount,
        fee: d.transactionFee != null ? Number(d.transactionFee) / 100 : null,
        payer_name: data.payerName,
        payer_document: data.payerDocument,
        description: data.description,
        qrcode_base64: d.qrCodeBase64 ?? null,
        qrcode_url: d.qrcodeUrl ?? null,
        copy_paste: d.copyPaste ?? null,
        purpose: data.purpose ?? null,
        reference_id: data.reference_id ?? null,
        raw_payload: json,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return { transaction: row };
  });

export const checkPixTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: tx, error } = await supabaseAdmin
      .from("pix_transactions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !tx) throw new Error("Transação não encontrada");

    const gw = await getActiveGateway();
    const res = await fetch(`${gw.base_url}/api/transactions/check`, {
      method: "POST",
      headers: {
        ci: gw.client_id!,
        cs: gw.client_secret!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId: tx.external_transaction_id }),
    });
    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      return { ok: false, status: res.status, body: json };
    }
    const t = json?.transaction ?? {};
    await supabaseAdmin
      .from("pix_transactions")
      .update({
        status: t.transactionState ?? tx.status,
        fee: t.fee ?? tx.fee,
        paid_at: t.transactionState === "COMPLETO" ? new Date().toISOString() : tx.paid_at,
      })
      .eq("id", tx.id);
    return { ok: true, body: json };
  });

export const listPixTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        workspace_id: z.string().uuid().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(200).default(50),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: r } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    const isMaster = !!r;

    let q = supabaseAdmin
      .from("pix_transactions")
      .select("*, workspace:workspaces(id,name,slug)")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.status) q = q.eq("status", data.status);
    if (data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    else if (!isMaster) {
      // restringe a workspaces do usuário
      const { data: members } = await supabaseAdmin
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", context.userId);
      const ids = (members ?? []).map((m) => m.workspace_id);
      if (ids.length === 0) return { transactions: [] };
      q = q.in("workspace_id", ids);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { transactions: rows ?? [] };
  });

export const getPaymentsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("pix_transactions")
      .select("status, amount");
    if (error) throw new Error(error.message);

    const sum = { total: 0, completed: 0, pending: 0, failed: 0, total_amount: 0, completed_amount: 0 };
    for (const r of data ?? []) {
      sum.total++;
      sum.total_amount += Number(r.amount ?? 0);
      if (r.status === "COMPLETO") {
        sum.completed++;
        sum.completed_amount += Number(r.amount ?? 0);
      } else if (r.status === "PENDENTE") sum.pending++;
      else if (r.status === "FALHA" || r.status === "CANCELADO") sum.failed++;
    }
    return sum;
  });
