// Helper server-only: busca nome real do grupo via Gateway /group-info
// e atualiza whatsapp_groups + contato-espelho (com regras restritivas).
// NUNCA toca contacts.phone, jid, connection_id, workspace_id.

import { gatewayCall } from "./multizap-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type RawGroupInfo = {
  JID?: string;
  Name?: string;
  Topic?: string;
  ParticipantsCount?: number;
};

type FetchResult =
  | { ok: true; info: { jid: string; name: string; topic: string; participants: number } }
  | { ok: false; reason: string; httpStatus?: number };

function pickInfoFromGatewayPayload(payload: unknown): RawGroupInfo | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  // gatewayCall já desembrulha body.data → payload normalmente é {JID,Name,...}.
  // Mas se algum dia vier o envelope inteiro {ok,data:{...}} ou {success,data:{...}},
  // aceitamos os dois shapes por segurança.
  const isEnvelope = (p.ok === true || p.success === true) && p.data && typeof p.data === "object";
  const obj = (isEnvelope ? (p.data as Record<string, unknown>) : p) as RawGroupInfo;
  return obj;
}

export async function fetchGroupInfoFromGateway(
  connectionId: string,
  jid: string,
): Promise<FetchResult> {
  if (!jid || !jid.endsWith("@g.us")) {
    return { ok: false, reason: "invalid_jid" };
  }
  if (!connectionId) {
    return { ok: false, reason: "missing_connection_id" };
  }

  const res = await gatewayCall<unknown>(
    `/connections/${connectionId}/group-info`,
    { method: "POST", body: JSON.stringify({ jid }) },
    { timeoutMs: 15000 },
  );

  if (!res.ok) {
    return {
      ok: false,
      reason: res.error?.kind ?? "gateway_error",
      httpStatus: res.status,
    };
  }

  const info = pickInfoFromGatewayPayload(res.data);
  if (!info) {
    return { ok: false, reason: "no_data" };
  }

  const name = typeof info.Name === "string" ? info.Name.trim() : "";
  const topic = typeof info.Topic === "string" ? info.Topic.trim() : "";
  const participants =
    typeof info.ParticipantsCount === "number" && Number.isFinite(info.ParticipantsCount)
      ? Math.max(0, Math.floor(info.ParticipantsCount))
      : 0;

  if (!name) {
    return { ok: false, reason: "empty_name" };
  }

  return {
    ok: true,
    info: { jid: (info.JID || jid).toString(), name, topic, participants },
  };
}

export type UpdateGroupResult = {
  ok: boolean;
  reason?: string;
  changed?: {
    name?: { from: string | null; to: string };
    subject?: { from: string | null; to: string };
    participant_count?: { from: number | null; to: number };
    contact_updated?: { contactId: string; from: string | null; to: string };
  };
};

export async function updateGroupFromGateway(groupId: string): Promise<UpdateGroupResult> {
  if (!groupId) return { ok: false, reason: "missing_group_id" };

  const { data: group, error: gErr } = await supabaseAdmin
    .from("whatsapp_groups")
    .select("id, workspace_id, connection_id, jid, name, subject, participant_count")
    .eq("id", groupId)
    .maybeSingle();

  if (gErr) {
    console.warn(`[group-info] select whatsapp_groups erro: ${gErr.message}`);
    return { ok: false, reason: "db_select_failed" };
  }
  if (!group) return { ok: false, reason: "group_not_found_local" };

  const fetched = await fetchGroupInfoFromGateway(group.connection_id, group.jid);
  if (!fetched.ok) {
    console.warn(
      `[group-info] gateway fetch falhou groupId=${groupId} jid=${group.jid} reason=${fetched.reason} status=${fetched.httpStatus ?? "—"}`,
    );
    return { ok: false, reason: fetched.reason };
  }

  const { name, topic, participants } = fetched.info;
  const changed: NonNullable<UpdateGroupResult["changed"]> = {};
  const patch: {
    updated_at: string;
    name?: string;
    subject?: string;
    participant_count?: number;
  } = { updated_at: new Date().toISOString() };



  if (name && name !== group.name) {
    patch.name = name;
    changed.name = { from: group.name ?? null, to: name };
  }
  if (topic && topic !== group.subject) {
    patch.subject = topic;
    changed.subject = { from: group.subject ?? null, to: topic };
  }
  if (participants > 0 && participants !== group.participant_count) {
    patch.participant_count = participants;
    changed.participant_count = { from: group.participant_count ?? null, to: participants };
  }

  // Só faz UPDATE se algo de fato mudou além de updated_at.
  if (Object.keys(patch).length > 1) {
    const { error: uErr } = await supabaseAdmin
      .from("whatsapp_groups")
      .update(patch)
      .eq("id", groupId);
    if (uErr) {
      console.warn(`[group-info] update whatsapp_groups erro: ${uErr.message}`);
      return { ok: false, reason: "db_update_failed" };
    }
  }

  // Contato-espelho: só atualiza se nome atual estiver vazio, igual ao JID, ou genérico.
  // NUNCA toca phone.
  if (name) {
    const { data: mirror } = await supabaseAdmin
      .from("contacts")
      .select("id, name")
      .eq("workspace_id", group.workspace_id)
      .eq("phone", group.jid)
      .maybeSingle();

    if (mirror) {
      const cur = (mirror.name ?? "").trim();
      const lower = cur.toLowerCase();
      const isPlaceholder =
        cur === "" ||
        cur === group.jid ||
        lower.startsWith("grupo whatsapp") ||
        lower === "grupo";
      if (isPlaceholder && cur !== name) {
        const { error: cErr } = await supabaseAdmin
          .from("contacts")
          .update({ name, updated_at: new Date().toISOString() })
          .eq("id", mirror.id);
        if (!cErr) {
          changed.contact_updated = { contactId: mirror.id, from: mirror.name ?? null, to: name };
        } else {
          console.warn(`[group-info] update contacts erro: ${cErr.message}`);
        }
      }
    }
  }

  return { ok: true, changed };
}

// ───────────────────────────────────────────────────────────────────────────
// Lazy refresh: chamado pelo webhook quando chega mensagem em grupo "stale".
// - fire-and-forget; nunca bloqueia recebimento.
// - cooldown em memória 5min/JID, Map limitado a 1000 entradas.
// - só dispara se nome atual estiver vazio, igual ao JID, ou "Grupo WhatsApp".
const LAZY_COOLDOWN_MS = 5 * 60 * 1000;
const LAZY_MAX_ENTRIES = 1000;
const lazyLastCallAt = new Map<string, number>();

function lazyShouldSkip(jid: string): boolean {
  const last = lazyLastCallAt.get(jid);
  return !!last && Date.now() - last < LAZY_COOLDOWN_MS;
}

function lazyMark(jid: string) {
  if (lazyLastCallAt.size >= LAZY_MAX_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestAt = Infinity;
    for (const [k, v] of lazyLastCallAt) {
      if (v < oldestAt) {
        oldestAt = v;
        oldestKey = k;
      }
    }
    if (oldestKey) lazyLastCallAt.delete(oldestKey);
  }
  lazyLastCallAt.set(jid, Date.now());
}

export function maybeRefreshGroupInBackground(params: {
  workspaceId: string;
  connectionId: string;
  groupJid: string;
}) {
  const { workspaceId, connectionId, groupJid } = params;
  if (!groupJid || !groupJid.endsWith("@g.us")) return;
  if (!workspaceId || !connectionId) return;
  if (lazyShouldSkip(groupJid)) return;

  // marca ANTES de disparar pra evitar corrida em rajada
  lazyMark(groupJid);

  // fire-and-forget — nunca lança
  (async () => {
    try {
      const { data: group } = await supabaseAdmin
        .from("whatsapp_groups")
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .eq("connection_id", connectionId)
        .eq("jid", groupJid)
        .maybeSingle();

      if (!group) return;
      const cur = (group.name ?? "").trim();
      const lower = cur.toLowerCase();
      const isStale =
        cur === "" ||
        cur === groupJid ||
        lower === "grupo whatsapp" ||
        lower === "grupo";
      if (!isStale) return;

      const res = await updateGroupFromGateway(group.id);
      if (!res.ok) {
        console.warn(
          `[lazy-refresh] groupId=${group.id} jid=${groupJid} reason=${res.reason ?? "—"}`,
        );
      }
    } catch (err) {
      console.warn(
        `[lazy-refresh] exception jid=${groupJid} msg=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  })();
}
