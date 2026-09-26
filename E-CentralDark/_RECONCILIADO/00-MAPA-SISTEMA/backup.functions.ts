// Server functions do painel /admin/backups.
// Apenas super_admin pode ler/agir. Toda ação grava audit_log.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// Lista os últimos backups (mais recente primeiro).
export const listBackupRuns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ limit: z.number().int().min(1).max(200).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("backup_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(data.limit ?? 30);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

// Estatísticas resumidas pro topo do painel.
export const getBackupStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("backup_runs")
      .select("status, size_bytes, finished_at, started_at")
      .order("started_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);

    const list = rows ?? [];
    const last = list[0] ?? null;
    const lastSuccess = list.find((r) => r.status === "success") ?? null;
    const last7 = list.filter((r) => {
      const t = new Date(r.started_at).getTime();
      return t > Date.now() - 7 * 24 * 60 * 60 * 1000;
    });
    const successLast7 = last7.filter((r) => r.status === "success").length;
    const errorLast7 = last7.filter((r) => r.status === "error").length;
    const totalSizeLast7 = last7.reduce((s, r) => s + Number(r.size_bytes || 0), 0);

    // Alerta se as 2 últimas execuções concluídas falharam.
    const lastTwoFinished = list.filter((r) => r.status !== "running").slice(0, 2);
    const consecutiveFailures =
      lastTwoFinished.length === 2 && lastTwoFinished.every((r) => r.status === "error");

    return {
      last,
      lastSuccess,
      successLast7,
      errorLast7,
      totalSizeLast7,
      consecutiveFailures,
    };
  });

// Marca uma solicitação manual. O script da VPS roda em cron curto (a cada 5min)
// e processa qualquer linha com trigger_source='admin_ui' AND status='requested'.
export const requestManualBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    // Evita duplicar pedidos pendentes
    const { data: pending } = await supabaseAdmin
      .from("backup_runs")
      .select("id")
      .eq("status", "requested")
      .limit(1)
      .maybeSingle();
    if (pending) {
      return { ok: true, id: pending.id, alreadyPending: true };
    }

    const { data, error } = await supabaseAdmin
      .from("backup_runs")
      .insert({
        status: "requested",
        trigger_source: "admin_ui",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logAction({
      action: "admin:backup_requested",
      category: "admin",
      actorUserId: context.userId,
      entity: "backup_runs",
      entityId: data.id,
    });

    return { ok: true, id: data.id, alreadyPending: false };
  });

// Marca um backup como baixado (auditoria de quem baixou e quando).
export const markBackupDownloaded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("backup_runs")
      .update({
        downloaded_by: context.userId,
        downloaded_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      action: "admin:backup_downloaded",
      category: "admin",
      actorUserId: context.userId,
      entity: "backup_runs",
      entityId: data.id,
    });

    return { ok: true };
  });

// Lê destino atual do backup (github | b2 | s3 | local).
export const getBackupDestination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select("backup_destination")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { destination: ((data as any)?.backup_destination ?? "github") as "github" | "b2" | "s3" | "local" };
  });

// Atualiza destino do backup. Só super_admin.
export const setBackupDestination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ destination: z.enum(["github", "b2", "s3", "local"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("master_settings")
      .update({ backup_destination: data.destination, updated_at: new Date().toISOString() } as any)
      .eq("id", 1);
    if (error) throw new Error(error.message);
    await logAction({
      action: "admin:backup_destination_changed",
      category: "admin",
      actorUserId: context.userId,
      entity: "master_settings",
    });
    return { ok: true };
  });

// ──────────────────────────────────────────────────────────────
// Cofre de credenciais (GitHub, criptografia, B2, S3 — tudo no banco)
// ──────────────────────────────────────────────────────────────

const SECRET_KEYS = [
  "github_token",
  "github_repo",
  "encryption_password",
  "b2_key_id",
  "b2_application_key",
  "b2_bucket_name",
  "aws_s3_bucket",
  "aws_access_key_id",
  "aws_secret_access_key",
] as const;
const SecretKey = z.enum(SECRET_KEYS);

export const getBackupSecretsStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    // IMPORTANTE: chamar via cliente do usuário (não supabaseAdmin) pra que
    // auth.uid() funcione dentro da função SQL (que valida is_super_admin).
    const { data, error } = await context.supabase.rpc("get_backup_secrets_status");
    if (error) throw new Error(error.message);
    return { status: (data ?? {}) as Record<string, { set: boolean; mask: string | null; inherited?: boolean; source?: string }> & { updated_at?: string } };
  });

export const setBackupSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: SecretKey, value: z.string().min(1).max(4096) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await context.supabase.rpc("set_backup_secret", {
      _key: data.key,
      _value: data.value,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearBackupSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: SecretKey }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await context.supabase.rpc("clear_backup_secret", { _key: data.key });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

