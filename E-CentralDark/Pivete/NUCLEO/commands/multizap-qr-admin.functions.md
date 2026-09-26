# COMANDO - multizap-qr-admin.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\multizap-qr-admin.functions.ts
**SHA:** d4080af09a99f55b
**Timestamp:** 2026-08-26T19:33:46.015404
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- steps.restart = "ok";

### Ouro Bruto (primeiros 5000 chars)
```
// Painel Master — controle das conexões WhatsApp QR (MultiZap-Gateway) de
// TODOS os workspaces. Restrito a super_admin. Toda ação grava em audit_log
// com prefixo `admin:` pra rastreabilidade.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  gatewayCall,
  gatewayFetch,
  getGatewayDiagnostic,
} from "./multizap-gateway.server";

// --- helpers ---------------------------------------------------------------


async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function logAdminQrAction(params: {
  actorUserId: string;
  workspaceId: string | null;
  action: string; // já vem com prefixo "admin:"
  connectionId: string;
  extra?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: params.workspaceId,
      actor_user_id: params.actorUserId,
      action: params.action,
      category: "whatsapp_qr",
      entity: "qr_connection",
      entity_id: params.connectionId,
      payload: { connection_id: params.connectionId, ...(params.extra ?? {}) },
    });
  } catch {
    // log não pode quebrar a ação
  }
}

// --- server functions ------------------------------------------------------

type GatewayConn = {
  connection_id?: string;
  workspace_id?: string | null;
  name?: string | null;
  label?: string | null;
  status?: string;
  phone_number?: string | null;
  last_connected_at?: string | null;
  last_disconnected_at?: string | null;
  created_at?: string | null;
};

export const adminListAllQrConnections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    // 1) Busca todas as conexões do Gateway (sem filtro de workspace).
    const res = await gatewayCall<GatewayConn[]>(`/connections`, {}, { timeoutMs: 8000 });
    const gatewayUp = res.ok;
    const conns: GatewayConn[] = res.ok && Array.isArray(res.data) ? (res.data as GatewayConn[]) : [];
    const gatewayError = res.ok
      ? null
      : {
          kind: res.error?.kind ?? "unknown",
          message: res.error?.message ?? "Falha desconhecida.",
          http_status: res.status ?? null,
          latency_ms: res.latency_ms,
        };

    // 2) Junta nome da empresa pra exibição.
    const workspaceIds = Array.from(
      new Set(conns.map((c) => c.workspace_id).filter((v): v is string => !!v)),
    );
    const wsMap = new Map<string, string>();
    if (workspaceIds.length > 0) {
      const { data: wsRows } = await supabaseAdmin
        .from("workspaces")
        .select("id, name")
        .in("id", workspaceIds);
      (wsRows ?? []).forEach((w) => wsMap.set(w.id as string, (w.name as string) ?? ""));
    }

    const connections = conns.map((c) => ({
      connection_id: c.connection_id ?? "",
      workspace_id: c.workspace_id ?? null,
      workspace_name: c.workspace_id ? wsMap.get(c.workspace_id) ?? null : null,
      name: c.name ?? null,
      label: c.label ?? null,
      status: c.status ?? "unknown",
      phone_number: c.phone_number ?? null,
      last_connected_at: c.last_connected_at ?? null,
      last_disconnected_at: c.last_disconnected_at ?? null,
      created_at: c.created_at ?? null,
    }));

    // 3) Resumo pra cards do topo.
    const totals = connections.reduce(
      (acc, c) => {
        acc.total += 1;
        if (c.status === "connected") acc.connected += 1;
        else if (c.status === "qr") acc.waiting_qr += 1;
        else if (c.status === "error") acc.error += 1;
        else acc.offline += 1;
        return acc;
      },
      { total: 0, connected: 0, waiting_qr: 0, error: 0, offline: 0 },
    );

    return { gateway_up: gatewayUp, gateway_error: gatewayError, totals, connections };
  });

// Diagnóstico detalhado do Gateway — chama /health e devolve tudo que ajuda
// a entender por que falhou (sem nunca expor o token).
export const diagnoseMultizapGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const cfg = getGatewayDiagnostic();
    const res = await gatewayCall<{ ok?: boolean; service?: string; port?: number }>(
      `/health`,
      {},
      { timeoutMs: 6000 },
    );
    return {
      url_configured: cfg.url_configured,
      token_configured: cfg.token_configured,
      url_masked: cfg.url_masked,
      reachable: res.ok,
      http_status: res.status ?? null,
      latency_ms: res.latency_ms,
      health: res.ok ? res.data ?? null : null,
      error: res.ok
        ? null
        : {
            k
```