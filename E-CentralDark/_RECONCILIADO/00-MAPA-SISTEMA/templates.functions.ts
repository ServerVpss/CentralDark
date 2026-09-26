import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TemplateInput = z.object({
  id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  connection_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120).regex(/^[a-z0-9_]+$/, "use apenas minúsculas, números e _"),
  language: z.string().min(2).max(10).default("pt_BR"),
  category: z.enum(["UTILITY", "MARKETING", "AUTHENTICATION"]).default("UTILITY"),
  body: z.string().min(1).max(1024),
  header: z.string().max(60).nullable().optional(),
  footer: z.string().max(60).nullable().optional(),
  buttons: z.array(z.object({ type: z.string(), text: z.string() })).max(10).default([]),
});

export const listTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id?: string; scope?: "workspace" | "admin" }) => d)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("whatsapp_templates").select("*").order("created_at", { ascending: false });
    if (data.scope !== "admin" && data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TemplateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // extrai variáveis {{1}}, {{2}}...
    const matches = data.body.match(/\{\{\d+\}\}/g) ?? [];
    const variables = Array.from(new Set(matches));
    const common = {
      name: data.name, language: data.language, category: data.category,
      body: data.body, header: data.header ?? null, footer: data.footer ?? null,
      buttons: data.buttons as never, variables: variables as never,
      connection_id: data.connection_id ?? null,
    };
    if (data.id) {
      const { error } = await supabase.from("whatsapp_templates")
        .update({ ...common, status: "draft" }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("whatsapp_templates")
      .insert({ workspace_id: data.workspace_id, created_by: userId, status: "draft", ...common })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("whatsapp_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Sincroniza templates aprovados da Meta Cloud API (Graph) para o workspace.
 *  Lê WABA_ID + access_token da connection_id selecionada. */
export const syncTemplatesFromMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id: string; connection_id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, workspace_id, waba_id, access_token")
      .eq("id", data.connection_id).maybeSingle();
    if (!conn || conn.workspace_id !== data.workspace_id) throw new Error("Conexão inválida.");
    // Segurança: caller precisa ser admin do workspace dono da conexão (ou super admin).
    // Sem isso, qualquer usuário autenticado poderia ler o access_token de qualquer workspace.
    const [{ data: isSuper }, { data: isAdmin }] = await Promise.all([
      supabaseAdmin.rpc("is_super_admin", { _user_id: context.userId }),
      supabaseAdmin.rpc("is_workspace_admin", { _workspace_id: conn.workspace_id, _user_id: context.userId }),
    ]);
    if (!isSuper && !isAdmin) throw new Error("Acesso negado: apenas administradores do workspace podem sincronizar templates.");
    if (!conn.waba_id || !conn.access_token) throw new Error("Conexão sem WABA ID ou token.");

    const url = `https://graph.facebook.com/v20.0/${conn.waba_id}/message_templates?limit=200`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${conn.access_token}` } });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Meta API: ${res.status} ${txt.slice(0, 200)}`);
    }
    const json = await res.json() as {
      data?: Array<{
        id: string; name: string; language: string; category: string; status: string;
        components?: Array<{ type: string; text?: string; format?: string; buttons?: Array<{ type: string; text: string }> }>;
      }>;
    };

    let imported = 0, updated = 0;
    for (const t of json.data ?? []) {
      const body = t.components?.find((c) => c.type === "BODY")?.text ?? "";
      const header = t.components?.find((c) => c.type === "HEADER")?.text ?? null;
      const footer = t.components?.find((c) => c.type === "FOOTER")?.text ?? null;
      const buttons = t.components?.find((c) => c.type === "BUTTONS")?.buttons ?? [];
      const variables = Array.from(new Set(body.match(/\{\{\d+\}\}/g) ?? []));

      const { data: existing } = await supabaseAdmin.from("whatsapp_templates")
        .select("id").eq("workspace_id", data.workspace_id)
        .eq("name", t.name).eq("language", t.language).maybeSingle();

      const row = {
        workspace_id: data.workspace_id, connection_id: conn.id,
        name: t.name, language: t.language, category: t.category,
        body, header, footer, buttons: buttons as never, variables: variables as never,
        status: t.status.toLowerCase(), meta_template_id: t.id,
        last_synced_at: new Date().toISOString(),
      };
      if (existing) {
        await supabaseAdmin.from("whatsapp_templates").update(row).eq("id", existing.id);
        updated++;
      } else {
        await supabaseAdmin.from("whatsapp_templates").insert(row);
        imported++;
      }
    }
    return { ok: true, imported, updated, total: json.data?.length ?? 0 };
  });
