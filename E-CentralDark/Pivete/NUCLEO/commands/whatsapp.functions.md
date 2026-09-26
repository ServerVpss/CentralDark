# COMANDO - whatsapp.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\whatsapp.functions.ts
**SHA:** f5a8917ce5dc9feb
**Timestamp:** 2026-08-26T19:33:48.606915
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- steps.restart = "ok";
- steps.restart = err instanceof Error ? err.message : String(err);

### Ouro Bruto (primeiros 5000 chars)
```
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage, getTicketWindow } from "@/lib/whatsapp-send.server";
import { logAction } from "@/lib/audit.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";


function maskSecret(s: string | null | undefined) {
  if (!s) return null;
  if (s.length <= 8) return "***";
  return `${s.slice(0, 4)}***${s.slice(-3)}`;
}

const META_API = "https://graph.facebook.com/v22.0";

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return; // super admin bypasses membership
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data) throw new Error("Acesso negado a este workspace.");
}

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// ---------- Connections CRUD (workspace level) ----------

export const listWhatsAppConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,name,phone,display_phone_number,phone_number_id,waba_id,verify_token,status,quality_rating,messaging_tier,error_count,last_error,last_error_at,last_webhook_at,default_sector_id,default_assignee_id,created_at,profile_picture_url,profile_picture_synced_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  phone_number_id: z.string().min(3).max(60),
  waba_id: z.string().min(3).max(60),
  // Podem vir vazios no rascunho inicial; validação real acontece no teste de conexão.
  access_token: z.string().max(4000).optional().default(""),
  app_secret: z.string().max(500).optional().default(""),
  verify_token: z.string().min(6).max(120),
  display_phone_number: z.string().max(40).optional().nullable(),
  default_sector_id: z.string().uuid().nullable().optional(),
  default_assignee_id: z.string().uuid().nullable().optional(),
  // Campos novos do fluxo manual
  meta_app_id: z.string().max(60).optional().nullable(),
  country_code: z.string().max(6).optional().nullable(),
  display_name: z.string().max(120).optional().nullable(),
  connection_mode: z.enum(["manual", "embedded_signup", "baileys"]).optional(),
  initial_status: z.enum(["pending", "approved", "connected"]).optional(),
});

export const upsertWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const payload: Record<string, unknown> = {
      workspace_id: data.workspaceId,
      provider: "meta_cloud",
      name: data.name,
      phone: data.phone ?? null,
      phone_number_id: data.phone_number_id,
      waba_id: data.waba_id,
      verify_token: data.verify_token,
      display_phone_number: data.display_phone_number ?? data.phone ?? null,
      default_sector_id: data.default_sector_id ?? null,
      default_assignee_id: data.default_assignee_id ?? null,
      meta_app_id: data.meta_app_id ?? null,
      country_code: data.country_code ?? null,
      display_name: data.display_name ?? null,
      connection_mode: data.connection_mode ?? "manual",
      status: data.initial_status ?? "connected",
      ...(data.access_token ? { access_token: data.access_token } : {}),
      ...(data.app_secret ? { app_secret: data.app_secret } : {}),
    } as never;
    if (data.id) {
      const { data: prevConn } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("workspace_id,name,phone,phone_number_id,waba_id,display_phone_number,default_sector_id,default_assignee_id,status")
        .eq("id", data.id).maybeSingle();
      if (!prevConn) throw new Error("Conexão não encontrada.");
      // Segurança: bloqueia "roubar" conexão de outro workspace pa
```