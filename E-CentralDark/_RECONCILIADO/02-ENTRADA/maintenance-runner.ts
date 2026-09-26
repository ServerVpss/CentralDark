// Cron runner da janela de manutenção (chama de minuto em minuto).
// - Pega o próximo agendamento pendente cujo scheduled_for já passou.
// - Marca como "running", executa o tipo correspondente, marca done/failed.
// - Por enquanto só "wuzapi_update" tem execução real; outros tipos ficam como placeholder.

import { createFileRoute } from "@tanstack/react-router";
import { requireCronSecret } from "@/lib/cron-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

async function runWuzapiUpdate(): Promise<{ ok: boolean; error: string | null; logs?: string }> {
  const res = await gatewayCall<{ ok: boolean; logs?: string }>(
    "/api/system/wuzapi-update",
    { method: "POST", body: JSON.stringify({}) },
    { timeoutMs: 180_000 },
  );
  const ok = res.ok && res.data?.ok !== false;
  return {
    ok,
    error: ok ? null : res.error?.message || "Falha ao atualizar WuzAPI.",
    logs: (res.data?.logs ?? "").slice(-2000),
  };
}

export const Route = createFileRoute("/api/public/cron/maintenance-runner")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);

        // Pega 1 agendamento "due"
        const { data: due } = await supabaseAdmin
          .from("maintenance_schedules")
          .select("id,type,params")
          .eq("status", "pending")
          .lte("scheduled_for", new Date().toISOString())
          .order("scheduled_for", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!due) {
          return new Response(JSON.stringify({ ok: true, ran: 0 }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const id = (due as { id: string }).id;
        const type = (due as { type: string }).type;

        // Marca como running
        await supabaseAdmin
          .from("maintenance_schedules")
          .update({ status: "running", started_at: new Date().toISOString() } as never)
          .eq("id", id);

        let result: { ok: boolean; error: string | null; logs?: string } = {
          ok: false,
          error: "Tipo não suportado.",
        };
        try {
          if (type === "wuzapi_update") {
            result = await runWuzapiUpdate();
          } else {
            result = { ok: true, error: null };
          }
        } catch (e) {
          result = { ok: false, error: e instanceof Error ? e.message : String(e) };
        }

        await supabaseAdmin
          .from("maintenance_schedules")
          .update({
            status: result.ok ? "done" : "failed",
            finished_at: new Date().toISOString(),
            error: result.error,
          } as never)
          .eq("id", id);

        await supabaseAdmin.from("audit_log").insert({
          action: result.ok ? "admin:maintenance_run_success" : "admin:maintenance_run_failed",
          payload: { schedule_id: id, type, error: result.error, logs_tail: result.logs ?? null },
        } as never);

        return new Response(
          JSON.stringify({ ok: result.ok, ran: 1, schedule_id: id, type, error: result.error }),
          { headers: { "Content-Type": "application/json" }, status: result.ok ? 200 : 500 },
        );
      },
    },
  },
});
