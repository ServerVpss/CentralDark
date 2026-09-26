// Server functions do painel /admin/monitor (super_admin only).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runAllChecks, persistAndAlert } from "@/lib/monitor.server";
import { sendTelegramAlert } from "@/lib/telegram-alerts.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!data) throw new Error("Acesso restrito ao master.");
}

export const listMonitorHeartbeats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("monitor_heartbeat")
      .select("id,target,status,latency_ms,details,alert_sent,last_alert_at,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const forceMonitorCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const checks = await runAllChecks();
    await persistAndAlert(checks);
    // Devolve só campos serializáveis (sem details como Record<string, unknown>)
    return {
      ok: true as const,
      checks: checks.map((c) => ({
        target: c.target,
        label: c.label,
        status: c.status,
        latency_ms: c.latency_ms,
        friendly: c.friendly,
      })),
    };
  });

export const sendMonitorTestAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const r = await sendTelegramAlert({
      title: "🧪 Teste do painel /admin/monitor",
      friendlySummary: "Disparo manual pelo super admin via painel.",
      technicalReport: `ran_by=${context.userId}\nat=${new Date().toISOString()}`,
    });
    return r;
  });
