import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

// Regex permissivo pra domínio/subdomínio (letras, dígitos, hífen, pontos)
const domainRegex = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

// LISTAR domínios do workspace
export const listMyDomains = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("workspace_domains")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

// ADICIONAR domínio
export const addDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; domain: string; isPrimary?: boolean }) =>
    z.object({
      workspaceId: z.string().uuid(),
      domain: z.string().min(3).max(253).transform(normalizeDomain)
        .refine((d) => domainRegex.test(d), "Domínio inválido"),
      isPrimary: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Se for marcado como primário, desmarca os outros
    if (data.isPrimary) {
      await supabase.from("workspace_domains")
        .update({ is_primary: false })
        .eq("workspace_id", data.workspaceId);
    }

    const { data: inserted, error } = await supabase
      .from("workspace_domains")
      .insert({
        workspace_id: data.workspaceId,
        domain: data.domain,
        is_primary: data.isPrimary ?? false,
      })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Este domínio já está cadastrado em algum workspace.");
      throw error;
    }
    await logAction({
      category: "user", action: "domain_added",
      actorUserId: userId, workspaceId: data.workspaceId,
      entity: "workspace_domains", entityId: inserted.id,
      after: inserted as unknown as Record<string, unknown>,
    });
    return inserted;
  });

// REMOVER domínio
export const removeDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; domainId: string }) =>
    z.object({
      workspaceId: z.string().uuid(),
      domainId: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: before } = await supabase.from("workspace_domains")
      .select("*").eq("id", data.domainId).eq("workspace_id", data.workspaceId).maybeSingle();
    const { error } = await supabase.from("workspace_domains")
      .delete().eq("id", data.domainId).eq("workspace_id", data.workspaceId);
    if (error) throw error;
    await logAction({
      category: "user", action: "domain_removed",
      actorUserId: userId, workspaceId: data.workspaceId,
      entity: "workspace_domains", entityId: data.domainId,
      before: (before ?? null) as Record<string, unknown> | null,
    });
    return { ok: true };
  });

// RESOLVER branding pelo host (público, usado no login white-label)
export const resolveBrandingByHost = createServerFn({ method: "POST" })
  .inputValidator((input: { host: string }) =>
    z.object({ host: z.string().min(3).max(253) }).parse(input),
  )
  .handler(async ({ data }) => {
    const host = normalizeDomain(data.host);
    const { data: result, error } = await supabaseAdmin
      .rpc("resolve_branding_by_host", { _host: host });
    if (error) return null;
    return result ?? null;
  });

// MASTER: liga/desliga white-label override
export const adminToggleWhiteLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; enabled: boolean | null }) =>
    z.object({
      workspaceId: z.string().uuid(),
      enabled: z.boolean().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Confere se é super admin
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
    if (!roleRow) throw new Error("Acesso negado.");

    const { error } = await supabaseAdmin
      .from("workspace_controls")
      .upsert(
        { workspace_id: data.workspaceId, white_label_override: data.enabled },
        { onConflict: "workspace_id" },
      );
    if (error) throw error;
    await logAction({
      category: "system", action: "admin:white_label_toggle",
      actorUserId: userId, workspaceId: data.workspaceId,
      entity: "workspace_controls", entityId: data.workspaceId,
      after: { white_label_override: data.enabled },
    });
    return { ok: true };
  });

// MASTER: lista todos os domínios de todos os workspaces
export const adminListAllDomains = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
    if (!roleRow) throw new Error("Acesso negado.");

    const { data, error } = await supabaseAdmin
      .from("workspace_domains")
      .select("*, workspaces(id, name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
