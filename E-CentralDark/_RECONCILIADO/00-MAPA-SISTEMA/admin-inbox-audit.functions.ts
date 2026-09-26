// Audit log do /admin/inbox: toggle de modo + ações em "Modo intervenção".
// Apenas super_admin. Sem conteúdo de mensagem, sem tokens, sem PIX copia-cola, sem QR.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const ToggleSchema = z.object({
  workspace_id: z.string().uuid(),
  workspace_name: z.string().min(1).max(200).optional(),
  mode: z.enum(["intervention", "readonly"]),
  previous_mode: z.enum(["intervention", "readonly"]).optional(),
});

async function assertSuperAdmin(userId: string) {
  const { data: r } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!r) throw new Error("Acesso negado.");
}

export const logAdminInboxModeToggle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ToggleSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const action =
      data.mode === "intervention" ? "admin:inbox_intervention" : "admin:inbox_readonly";
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspace_id,
      actor_user_id: context.userId,
      action,
      category: "admin",
      entity: "inbox",
      entity_id: data.workspace_id,
      payload: {
        route: "/admin/inbox",
        workspace_name: data.workspace_name ?? null,
        previous_mode: data.previous_mode ?? null,
        new_mode: data.mode,
      },
    });
    return { ok: true };
  });

// ──────────────────────────────────────────────────────────────────────────
// Ações operacionais em modo intervenção
// ──────────────────────────────────────────────────────────────────────────

const ActionKind = z.enum([
  "message",       // mensagem comum enviada
  "payment",       // comando financeiro (/pix /cobrar etc)
  "claim",         // assumir
  "transfer",      // transferir
  "close",         // encerrar
  "rename_contact" // renomear contato
]);

const ActionSchema = z.object({
  workspace_id: z.string().uuid(),
  ticket_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  kind: ActionKind,
  // metadados seguros — qualquer string limitada e sanitizada pelo caller
  payment: z.object({
    command_type: z.string().min(1).max(40),
    amount: z.number().nonnegative().optional(),
    gateway: z.string().max(40).optional(),
    payment_request_id: z.string().max(80).optional(),
    status: z.string().max(40).optional(),
  }).optional(),
  message_meta: z.object({
    has_media: z.boolean().optional(),
    is_internal_note: z.boolean().optional(),
    body_length: z.number().int().nonnegative().optional(),
  }).optional(),
  transfer_to_sector_id: z.string().uuid().optional(),
  channel: z.string().max(40).optional(),
});

function actionName(kind: z.infer<typeof ActionKind>) {
  switch (kind) {
    case "message": return "admin:inbox_intervention_message";
    case "payment": return "admin:payment_command_intervention";
    case "claim":   return "admin:inbox_intervention_claim";
    case "transfer":return "admin:inbox_intervention_transfer";
    case "close":   return "admin:inbox_intervention_close";
    case "rename_contact": return "admin:inbox_intervention_rename_contact";
  }
}

export const logAdminInboxAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ActionSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    // Payload defensivo: nunca persistir conteúdo, tokens, copia-cola, QR.
    const payload: Record<string, unknown> = {
      route: "/admin/inbox",
      mode: "intervention",
      ticket_id: data.ticket_id ?? null,
      contact_id: data.contact_id ?? null,
      channel: data.channel ?? null,
    };
    if (data.kind === "message" && data.message_meta) {
      payload.message_meta = {
        has_media: !!data.message_meta.has_media,
        is_internal_note: !!data.message_meta.is_internal_note,
        body_length: data.message_meta.body_length ?? 0,
      };
    }
    if (data.kind === "payment" && data.payment) {
      payload.payment = {
        command_type: data.payment.command_type,
        amount: data.payment.amount ?? null,
        gateway: data.payment.gateway ?? null,
        payment_request_id: data.payment.payment_request_id ?? null,
        status: data.payment.status ?? null,
      };
    }
    if (data.kind === "transfer" && data.transfer_to_sector_id) {
      payload.transfer_to_sector_id = data.transfer_to_sector_id;
    }

    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspace_id,
      actor_user_id: context.userId,
      action: actionName(data.kind),
      category: "admin",
      entity: data.kind === "payment" ? "payment" : "inbox",
      entity_id: data.ticket_id ?? data.workspace_id,
      payload: payload as never,
    });
    return { ok: true };
  });
