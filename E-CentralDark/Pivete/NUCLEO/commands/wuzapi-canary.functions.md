# COMANDO - wuzapi-canary.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\wuzapi-canary.functions.ts
**SHA:** 001d7cfe82c1ba0c
**Timestamp:** 2026-08-26T19:33:49.249314
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export type CanaryRun = {
- export const startCanaryRun = createServerFn({ method: "POST" })
- export const getActiveCanaryRun = createServerFn({ method: "GET" })

### Ouro Bruto (primeiros 5000 chars)
```
// Fase 3 — Canary / Teste isolado antes de atualizar produção.
// Um canary roda a nova imagem do WuzAPI em paralelo (porta/container separado)
// e só depois de TODOS os health checks passarem é que o master pode promover.
//
// Modos:
//  - "gateway": chama endpoints opcionais no Gateway da VPS
//      POST /api/system/wuzapi-canary/start  → sobe container canary
//      GET  /api/system/wuzapi-canary/status → status do container
//      POST /api/system/wuzapi-canary/promote → swap canary → prod
//      POST /api/system/wuzapi-canary/abort  → derruba canary
//  - "manual": se o Gateway responder 404/501 (endpoint não existe),
//      o master valida manualmente via checkboxes e promove sob responsabilidade.
//
// Tudo grava em wuzapi_canary_runs + audit_log (via trigger).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

type CanaryStatus =
  | "pending" | "starting" | "running" | "healthy"
  | "failed" | "promoted" | "aborted";

type HealthChecks = {
  build_ok: boolean;
  service_up: boolean;
  qr_generated: boolean;
  test_message_sent: boolean;
};

export type CanaryRun = {
  id: string;
  started_by: string | null;
  started_by_email: string | null;
  started_at: string;
  finished_at: string | null;
  target_sha: string | null;
  target_ref: string | null;
  whatsmeow_ref: string | null;
  status: CanaryStatus;
  mode: "gateway" | "manual";
  gateway_endpoint: string | null;
  health_checks: HealthChecks;
  notes: string | null;
  last_error: string | null;
  promoted_at: string | null;
  aborted_at: string | null;
  abort_reason: string | null;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function attachEmail(rows: any[]): Promise<CanaryRun[]> {
  const ids = Array.from(new Set(rows.map((r) => r.started_by).filter(Boolean))) as string[];
  const emails = new Map<string, string>();
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles").select("id, email").in("id", ids);
    for (const p of profs ?? []) emails.set(p.id, p.email ?? "");
  }
  return rows.map((r) => ({
    ...r,
    started_by_email: r.started_by ? emails.get(r.started_by) ?? null : null,
  })) as CanaryRun[];
}

// ── Start canary ─────────────────────────────────────────────────────────────

export const startCanaryRun = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    target_sha: z.string().min(4).max(64).nullable().optional(),
    whatsmeow_ref: z.string().max(200).nullable().optional(),
    notes: z.string().max(500).optional(),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);

    // Bloqueia se já houver canary "em voo"
    const { data: existing } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .select("id, status")
      .in("status", ["pending", "starting", "running", "healthy"])
      .limit(1)
      .maybeSingle();
    if (existing) {
      throw new Error("Já existe um canary em andamento. Promova ou aborte antes de iniciar outro.");
    }

    // Tenta acionar o Gateway
    let mode: "gateway" | "manual" = "manual";
    let status: CanaryStatus = "pending";
    let last_error: string | null = null;
    let gateway_endpoint: string | null = null;

    const res = await gatewayCall<{ ok?: boolean; endpoint?: string; container?: string }>(
      "/api/system/wuzapi-canary/start",
      { method: "POST", body: JSON.stringify({ target_sha: data.target_sha ?? null }) },
      { timeoutMs: 30_000 },
    );

    if (res.ok && res.data?.ok !== false) {
      mode = "gateway";
      status = "starting";
      gateway_endpoint = res.data?.endpoint ?? null;
    } else {
      // 404/501 → modo manual; outros erros → grava mas em pending pra master decidir
      const code = res.status ?? 0;
      if (code === 404 || code === 501 || code === 0) {
        mode = "manual";
        status = "pending";
        last_error = "Gateway sem suporte a canary automático — modo manual ativado.";
      } else {
        mode = "manual";
        status = "pending";
        last_error = res.error?.message || `Gateway HTTP ${code} — caiu em modo manual.`;
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .insert({
        started_by: context.userId,
        target_sha: data.target_sha ?? null,
        whatsmeow_ref: data.whatsmeow_ref ?? null,
        notes: data.notes ?? null,
        status,
        mode,
        gateway_endpoint,
        last_error,
      })
     
```