// Foto de perfil — contatos privados, participantes de grupo e grupos (@g.us).
// Recurso exclusivo do QR/WuzAPI (Meta Cloud não permite buscar foto de terceiros).
//
// URL retornada pelo WhatsApp expira em ~24h. Estratégia:
//   - salva URL em contacts.avatar_url / whatsapp_groups.picture_url
//   - carimba *_synced_at = now()
//   - rebusca quando > 24h OU evento profile.photo.updated
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

type Conn = {
  id: string;
  workspace_id: string;
  provider: string | null;
  status: string | null;
  baileys_session_id: string | null;
  phone_number_id: string | null;
  session_data: unknown;
};

function resolveGatewayConnId(c: Conn): string | null {
  const sd = (c.session_data ?? null) as { gateway_connection_id?: string } | null;
  return sd?.gateway_connection_id || c.baileys_session_id || c.phone_number_id || null;
}

const QR_PROVIDERS = new Set(["wuzapi_gateway", "multizap_qr", "wuzapi", "qr"]);
const STALE_MS = 24 * 60 * 60 * 1000; // 24h

function maskPhone(p: string | null | undefined): string {
  if (!p) return "";
  const s = String(p);
  return s.length > 6 ? s.slice(0, 3) + "***" + s.slice(-3) : "***";
}

// Resolve uma conexão QR utilizável.
// Aceita a conexão preferida MESMO se status != connected — o webhook
// chamador já provou que ela está respondendo (do contrário a mensagem
// nem chegaria). Só rejeita se provider não for QR.
async function resolveQrConnection(args: {
  workspaceId: string;
  preferredConnectionId?: string | null;
}): Promise<Conn | null> {
  if (args.preferredConnectionId) {
    const { data } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,provider,status,baileys_session_id,phone_number_id,session_data")
      .eq("id", args.preferredConnectionId)
      .maybeSingle();
    if (data && QR_PROVIDERS.has(String(data.provider || ""))) {
      return data as Conn;
    }
  }
  const { data } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,provider,status,baileys_session_id,phone_number_id,session_data")
    .eq("workspace_id", args.workspaceId)
    .in("provider", Array.from(QR_PROVIDERS))
    .order("status", { ascending: true }) // connected vem antes alfabeticamente em alguns casos; tanto faz, fallback
    .limit(1)
    .maybeSingle();
  return (data as Conn) || null;
}

// Pede foto ao gateway. Aceita phone (E164/dígitos) OU jid (privado/grupo).
// Timeout curto: foto é best-effort, não pode travar o lote inteiro.
async function fetchPictureFromGateway(args: {
  gwConnId: string;
  phone?: string;
  jid?: string;
}): Promise<
  | { ok: true; url: string | null }
  | { ok: false; reason: string; message?: string }
> {
  const body: Record<string, string> = {};
  if (args.jid) body.jid = args.jid;
  if (args.phone) body.phone = args.phone;
  const call = await gatewayCall<unknown>(
    `/connections/${encodeURIComponent(args.gwConnId)}/profile-picture`,
    { method: "POST", body: JSON.stringify(body) },
    { timeoutMs: 4000 },
  );
  if (!call.ok) {
    return { ok: false, reason: call.error?.kind || "gateway_error", message: call.error?.message };
  }
  const data = call.data as {
    data?: { picture?: { url?: string } | null };
    picture?: { url?: string } | null;
  } | undefined;
  const pic = data?.data?.picture ?? data?.picture ?? null;
  return { ok: true, url: pic?.url || null };
}

// "Contato/grupo não tem foto" ou "escondeu foto" NÃO é erro real do sistema.
function isNoPictureMessage(msg?: string): boolean {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("does not have a profile picture") ||
    m.includes("hidden their profile picture") ||
    m.includes("no profile picture") ||
    m.includes("not found")
  );
}

// ─── CONTATO PRIVADO / PARTICIPANTE DE GRUPO ──────────────────────────────
export async function refreshContactAvatarFromQr(args: {
  workspaceId: string;
  phone: string;
  contactId?: string | null;
  preferredConnectionId?: string | null;
  force?: boolean;
}): Promise<
  | { ok: true; updated: true; url: string }
  | { ok: true; skipped: string }
  | { ok: false; reason: string }
> {
  const { workspaceId, phone, force } = args;
  if (!workspaceId || !phone) return { ok: false, reason: "missing_args" };

  // Cooldown: se já tem foto fresca (<24h), pula.
  if (!force) {
    const { data: existing } = await supabaseAdmin
      .from("contacts")
      .select("id,avatar_url,avatar_synced_at")
      .eq("workspace_id", workspaceId)
      .eq("phone", phone)
      .maybeSingle();
    if (existing?.avatar_synced_at) {
      const age = Date.now() - new Date(existing.avatar_synced_at).getTime();
      if (existing.avatar_url && age < STALE_MS) {
        return { ok: true, skipped: "fresh" };
      }
      // Sem foto + sincronizado há pouco: evita refetch agressivo (6h).
      if (!existing.avatar_url && age < 6 * 60 * 60 * 1000) {
        return { ok: true, skipped: "recent_empty" };
      }
    }
  }

  const conn = await resolveQrConnection({
    workspaceId,
    preferredConnectionId: args.preferredConnectionId,
  });
  if (!conn) return { ok: true, skipped: "no_qr_connection" };
  const gwConnId = resolveGatewayConnId(conn);
  if (!gwConnId) return { ok: true, skipped: "no_gateway_id" };

  console.info("[avatar] contact_refresh_started", { phone: maskPhone(phone), conn: conn.id });

  const r = await fetchPictureFromGateway({ gwConnId, phone });
  if (!r.ok) {
    // "Sem foto / foto escondida" não é falha — carimba e segue.
    if (isNoPictureMessage(r.message)) {
      await supabaseAdmin
        .from("contacts")
        .update({ avatar_synced_at: new Date().toISOString() })
        .eq("workspace_id", workspaceId)
        .eq("phone", phone);
      return { ok: true, skipped: "no_picture" };
    }
    console.warn("[avatar] contact_refresh_failed", { phone: maskPhone(phone), reason: r.reason });
    return { ok: false, reason: r.reason };
  }

  if (!r.url) {
    await supabaseAdmin
      .from("contacts")
      .update({ avatar_synced_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("phone", phone);
    console.info("[avatar] contact_refresh_empty", { phone: maskPhone(phone) });
    return { ok: true, skipped: "no_picture" };
  }

  await supabaseAdmin
    .from("contacts")
    .update({ avatar_url: r.url, avatar_synced_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("phone", phone);
  console.info("[avatar] contact_refresh_success", { phone: maskPhone(phone) });
  return { ok: true, updated: true, url: r.url };
}

export function refreshContactAvatarAsync(args: Parameters<typeof refreshContactAvatarFromQr>[0]) {
  Promise.resolve()
    .then(() => refreshContactAvatarFromQr(args))
    .catch((e) => console.warn("[avatar] contact_async_failed", { message: String(e?.message || e) }));
}

// ─── GRUPO (@g.us) ────────────────────────────────────────────────────────
export async function refreshGroupAvatarFromQr(args: {
  workspaceId: string;
  connectionId?: string | null;
  groupJid: string;
  force?: boolean;
}): Promise<
  | { ok: true; updated: true; url: string }
  | { ok: true; skipped: string }
  | { ok: false; reason: string }
> {
  const { workspaceId, groupJid, force } = args;
  if (!workspaceId || !groupJid || !groupJid.includes("@g.us")) {
    return { ok: false, reason: "invalid_group_jid" };
  }

  if (!force) {
    const { data: existing } = await supabaseAdmin
      .from("whatsapp_groups")
      .select("picture_url,picture_synced_at")
      .eq("workspace_id", workspaceId)
      .eq("jid", groupJid)
      .maybeSingle();
    if (existing?.picture_synced_at) {
      const age = Date.now() - new Date(existing.picture_synced_at).getTime();
      if (existing.picture_url && age < STALE_MS) return { ok: true, skipped: "fresh" };
      if (!existing.picture_url && age < 6 * 60 * 60 * 1000) return { ok: true, skipped: "recent_empty" };
    }
  }

  const conn = await resolveQrConnection({
    workspaceId,
    preferredConnectionId: args.connectionId,
  });
  if (!conn) return { ok: true, skipped: "no_qr_connection" };
  const gwConnId = resolveGatewayConnId(conn);
  if (!gwConnId) return { ok: true, skipped: "no_gateway_id" };

  console.info("[avatar] group_refresh_started", { jid: groupJid, conn: conn.id });

  const r = await fetchPictureFromGateway({ gwConnId, jid: groupJid });
  if (!r.ok) {
    if (isNoPictureMessage(r.message)) {
      await supabaseAdmin
        .from("whatsapp_groups")
        .update({ picture_synced_at: new Date().toISOString() })
        .eq("workspace_id", workspaceId)
        .eq("jid", groupJid);
      return { ok: true, skipped: "no_picture" };
    }
    console.warn("[avatar] group_refresh_failed", { jid: groupJid, reason: r.reason });
    return { ok: false, reason: r.reason };
  }

  if (!r.url) {
    await supabaseAdmin
      .from("whatsapp_groups")
      .update({ picture_synced_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("jid", groupJid);
    console.info("[avatar] group_refresh_empty", { jid: groupJid });
    return { ok: true, skipped: "no_picture" };
  }

  await supabaseAdmin
    .from("whatsapp_groups")
    .update({ picture_url: r.url, picture_synced_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("jid", groupJid);
  console.info("[avatar] group_refresh_success", { jid: groupJid });
  return { ok: true, updated: true, url: r.url };
}

export function refreshGroupAvatarAsync(args: Parameters<typeof refreshGroupAvatarFromQr>[0]) {
  Promise.resolve()
    .then(() => refreshGroupAvatarFromQr(args))
    .catch((e) => console.warn("[avatar] group_async_failed", { message: String(e?.message || e) }));
}
