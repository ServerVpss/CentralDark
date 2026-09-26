# COMANDO - wuzapi-deploy-monitor.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\wuzapi-deploy-monitor.functions.ts
**SHA:** 52141032bbc3f2f9
**Timestamp:** 2026-08-26T19:33:49.427446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- // Bloqueio: cooldown ativo
- // Bloqueio: deploy em andamento

### Ouro Bruto (primeiros 5000 chars)
```
// Fase 4 — Snapshot + monitoramento pós-deploy + rollback automático da WuzAPI.
//
// Fluxo:
//  1) startProductionDeploy: grava snapshot (SHA atual, Whatsmeow ref, compose hash),
//     chama Gateway /api/system/wuzapi-update (mesmo endpoint do trigger antigo),
//     em sucesso transita pra "monitoring".
//  2) runHealthCheck: polling a cada 30s por 5min (10 checks). Cada ciclo chama
//     Gateway /api/system/wuzapi-health. Falha 2x seguidas → rollback automático.
//  3) triggerRollback: força rollback (manual ou automático). Chama Gateway
//     /api/system/wuzapi-rollback com SHA anterior. Cooldown de 30min após rollback.
//
// Tudo grava em audit_log com prefixo admin:wuzapi_deploy_*.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

const MAX_CHECKS = 10;            // 10 ciclos × 30s = 5 min
const FAIL_THRESHOLD = 2;         // 2 falhas seguidas → rollback
const COOLDOWN_MINUTES = 30;      // bloqueio de novo deploy após rollback

type HealthMetric = {
  ts: string;
  ok: boolean;
  service_up: boolean;
  sessions_up: number | null;
  sessions_baseline: number | null;
  webhook_error_rate: number | null;
  messages_per_min: number | null;
  error: string | null;
};

export type ProductionDeploy = {
  id: string;
  triggered_by: string | null;
  triggered_by_email: string | null;
  triggered_at: string;
  previous_sha: string | null;
  previous_whatsmeow_ref: string | null;
  previous_compose_hash: string | null;
  target_sha: string | null;
  target_whatsmeow_ref: string | null;
  status: "deploying" | "monitoring" | "healthy" | "degraded" | "rolled_back" | "rollback_failed";
  health_metrics: HealthMetric[];
  consecutive_failures: number;
  check_count: number;
  rollback_reason: string | null;
  rollback_triggered_manually: boolean;
  rolled_back_at: string | null;
  finished_at: string | null;
  monitoring_started_at: string | null;
  last_check_at: string | null;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function attachEmail(rows: any[]): Promise<ProductionDeploy[]> {
  const ids = Array.from(new Set(rows.map((r) => r.triggered_by).filter(Boolean))) as string[];
  const emails = new Map<string, string>();
  if (ids.length) {
    const { data } = await supabaseAdmin.from("profiles").select("id, email").in("id", ids);
    for (const p of data ?? []) emails.set(p.id, p.email ?? "");
  }
  return rows.map((r) => ({
    ...r,
    triggered_by_email: r.triggered_by ? emails.get(r.triggered_by) ?? null : null,
  })) as ProductionDeploy[];
}

async function getCooldownInfo(): Promise<{ active: boolean; until: string | null; reason: string | null }> {
  const { data } = await supabaseAdmin
    .from("wuzapi_production_deploys")
    .select("rolled_back_at, rollback_reason")
    .eq("status", "rolled_back")
    .order("rolled_back_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.rolled_back_at) return { active: false, until: null, reason: null };
  const until = new Date(new Date(data.rolled_back_at).getTime() + COOLDOWN_MINUTES * 60_000);
  return {
    active: until.getTime() > Date.now(),
    until: until.toISOString(),
    reason: data.rollback_reason,
  };
}

// ── Start production deploy ──────────────────────────────────────────────────

export const startProductionDeploy = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    target_sha: z.string().min(4).max(64).nullable().optional(),
    target_whatsmeow_ref: z.string().max(200).nullable().optional(),
    bypass_cooldown: z.boolean().optional(),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);

    // Bloqueio: cooldown ativo
    const cd = await getCooldownInfo();
    if (cd.active && !data.bypass_cooldown) {
      throw new Error(`Cooldown ativo até ${cd.until} (último rollback: ${cd.reason ?? "sem motivo"}).`);
    }

    // Bloqueio: deploy em andamento
    const { data: active } = await supabaseAdmin
      .from("wuzapi_production_deploys")
      .select("id, status")
      .in("status", ["deploying", "monitoring"])
      .limit(1)
      .maybeSingle();
    if (active) throw new Error("Já existe um deploy em andamento. Aguarde finalizar.");

    // 1) Snapshot do que tá rodando hoje
    const verRes = await gatewayCall<{ repo_digest?: string; digest?: string; whatsmeow_ref?: string; compose_hash?: string }>(
      "/api/system/wuzapi-version", { method: "GET" }, { timeoutMs: 10_000 },
    );
    const previous_sha = verRes.data?.repo_digest
```