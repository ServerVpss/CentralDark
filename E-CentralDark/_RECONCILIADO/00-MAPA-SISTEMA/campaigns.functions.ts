import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";

async function getUserWorkspaceId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("workspace_members").select("workspace_id")
    .eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  return data?.workspace_id ?? null;
}

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// Segurança: campanha é fonte da verdade; só admin/owner do workspace dela ou super_admin pode agir.
async function assertCanManageCampaign(userId: string, campaignId: string): Promise<string> {
  const { data: c } = await supabaseAdmin
    .from("campaigns").select("workspace_id").eq("id", campaignId).maybeSingle();
  if (!c) throw new Error("Campanha não encontrada.");

  // super_admin sempre pode
  const { data: r } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (r) return c.workspace_id;

  // precisa ser admin/owner do workspace da campanha
  const { data: m } = await supabaseAdmin
    .from("workspace_members").select("role")
    .eq("workspace_id", c.workspace_id).eq("user_id", userId).maybeSingle();
  if (!m) throw new Error("Acesso negado: campanha de outro workspace.");
  if (m.role !== "admin") {
    throw new Error("Apenas administradores do workspace podem operar campanhas.");
  }
  return c.workspace_id;
}

async function logCampaignAction(
  actorUserId: string, workspaceId: string, action: string, campaignId: string,
) {
  try {
    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: actorUserId, workspace_id: workspaceId,
      action, category: "campaign", entity: "campaign", entity_id: campaignId,
    });
  } catch { /* auditoria não bloqueia operação */ }
}


const SegmentSchema = z.object({
  tags: z.array(z.string()).default([]),
  sector_id: z.string().uuid().nullable().default(null),
  only_with_tickets: z.boolean().default(false),
});

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  message_body: z.string().min(1).max(4000).optional().nullable(),
  template_name: z.string().max(120).optional().nullable(),
  template_lang: z.string().max(10).default("pt_BR").optional(),
  connection_id: z.string().uuid().optional().nullable(),
  segment: SegmentSchema.default({ tags: [], sector_id: null, only_with_tickets: false }),
  scheduled_at: z.string().datetime().optional().nullable(),
});

export type CampaignRow = {
  id: string; name: string; status: string; channel: string;
  message_body: string | null; template_name: string | null;
  scheduled_at: string | null; started_at: string | null; finished_at: string | null;
  total_recipients: number; total_sent: number; total_failed: number;
  segment: { tags: string[]; sector_id: string | null; only_with_tickets?: boolean };
  workspace_id: string; created_at: string;
};

// ---- LIST ----
export const listCampaigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ scope: z.enum(["workspace", "admin"]).default("workspace") }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const q = supabaseAdmin.from("campaigns").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.scope === "admin") {
      await assertSuperAdmin(userId);
    } else {
      const ws = await getUserWorkspaceId(userId);
      if (!ws) return { campaigns: [] as CampaignRow[] };
      q.eq("workspace_id", ws);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { campaigns: (rows ?? []) as unknown as CampaignRow[] };
  });


// ---- CREATE ----
export const createCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const ws = await getUserWorkspaceId(context.userId);
    if (!ws) throw new Error("Sem workspace.");
    if (!data.message_body && !data.template_name) {
      throw new Error("Informe a mensagem ou um template.");
    }

    // Build recipient set from contacts based on segment
    let q = supabaseAdmin.from("contacts").select("id, name, phone, tags, blocked").eq("workspace_id", ws);
    if (data.segment.tags.length > 0) q = q.overlaps("tags", data.segment.tags);
    const { data: contacts, error } = await q;
    if (error) throw new Error(error.message);

    const recipients = (contacts ?? [])
      .filter((c) => !c.blocked && !!c.phone)
      .map((c) => ({ contact_id: c.id, phone: c.phone!, name: c.name }));

    const status = data.scheduled_at ? "scheduled" : "draft";
    const { data: created, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .insert({
        workspace_id: ws,
        created_by: context.userId,
        name: data.name,
        status,
        message_body: data.message_body ?? null,
        template_name: data.template_name ?? null,
        template_lang: data.template_lang ?? "pt_BR",
        connection_id: data.connection_id ?? null,
        segment: data.segment,
        scheduled_at: data.scheduled_at ?? null,
        total_recipients: recipients.length,
      }).select().single();
    if (cErr) throw new Error(cErr.message);

    if (recipients.length > 0) {
      const rows = recipients.map((r) => ({
        campaign_id: created.id, workspace_id: ws,
        contact_id: r.contact_id, phone: r.phone, name: r.name,
      }));
      // chunk inserts (limit 500 per call)
      for (let i = 0; i < rows.length; i += 500) {
        const slice = rows.slice(i, i + 500);
        const { error: rErr } = await supabaseAdmin.from("campaign_recipients").insert(slice);
        if (rErr) throw new Error(rErr.message);
      }
    }

    return { campaign: created as unknown as CampaignRow };
  });

// ---- CANCEL ----
export const cancelCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const ws = await assertCanManageCampaign(context.userId, data.id);
    const { error } = await supabaseAdmin
      .from("campaigns")
      .update({ status: "canceled", finished_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logCampaignAction(context.userId, ws, "campaign.cancel", data.id);
    return { ok: true };
  });

// ---- SEND NOW (dispara em série, respeitando rate limit do dispatcher) ----
export const runCampaignNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const ws = await assertCanManageCampaign(context.userId, data.id);
    await logCampaignAction(context.userId, ws, "campaign.run", data.id);

    const { data: c } = await supabaseAdmin.from("campaigns").select("*").eq("id", data.id).single();
    if (!c) throw new Error("Campanha não encontrada.");
    if (c.status === "running") return { ok: true, already: true };
    if (!c.connection_id) throw new Error("Selecione a conexão WhatsApp.");

    await supabaseAdmin.from("campaigns").update({
      status: "running", started_at: new Date().toISOString(),
    }).eq("id", c.id);

    const { data: rcpts } = await supabaseAdmin
      .from("campaign_recipients").select("id, phone")
      .eq("campaign_id", c.id).eq("status", "pending").limit(500);

    let sent = 0, failed = 0;
    for (const r of rcpts ?? []) {
      const res = await dispatchWhatsAppMessage({
        connectionId: c.connection_id,
        to: r.phone,
        text: c.message_body ?? undefined,
        templateName: c.template_name ?? undefined,
        templateLang: c.template_lang ?? "pt_BR",
      });
      if (res.ok) {
        sent++;
        await supabaseAdmin.from("campaign_recipients").update({
          status: "sent", message_id: res.messageId, sent_at: new Date().toISOString(),
        }).eq("id", r.id);
      } else {
        failed++;
        await supabaseAdmin.from("campaign_recipients").update({
          status: "failed", error: res.message,
        }).eq("id", r.id);
        // Para em rate-limit / cooldown — campanha continua depois.
        if (res.code === "COOLDOWN" || res.code === "RATE_LIMIT") break;
      }
    }

    const { data: pendingLeft } = await supabaseAdmin
      .from("campaign_recipients").select("id", { count: "exact", head: true })
      .eq("campaign_id", c.id).eq("status", "pending");

    const finished = (pendingLeft as unknown as { count?: number } | null)?.count === 0;
    await supabaseAdmin.from("campaigns").update({
      total_sent: (c.total_sent ?? 0) + sent,
      total_failed: (c.total_failed ?? 0) + failed,
      status: finished ? "completed" : "running",
      finished_at: finished ? new Date().toISOString() : null,
    }).eq("id", c.id);

    return { ok: true, sent, failed, finished };
  });
