import { supabaseAdmin } from "@/integrations/supabase/client.server";

const META_API = "https://graph.facebook.com/v22.0";

type DownloadResult = {
  url: string;            // URL pública no Storage
  mime: string;
  filename?: string;
  sizeBytes: number;
} | null;

type MetaMediaPayload = {
  id?: string;
  url?: string;
  mime_type?: string;
  caption?: string;
  filename?: string;
  animated?: boolean;
  voice?: boolean;
};

/**
 * Baixa a mídia da Meta (precisa de Bearer token) e sobe pro bucket `whatsapp-media`.
 * - Pega metadados em /{media_id} → { url, mime_type }
 * - Faz GET na url com Bearer pra puxar os bytes
 * - Sobe em workspace_id/ticket_id/timestamp.ext
 */
export async function downloadAndStoreWhatsappMedia(opts: {
  mediaId?: string | null;
  directUrl?: string | null;
  mimeHint?: string | null;
  accessToken: string;
  workspaceId: string;
  ticketId: string;
  filenameHint?: string;
}): Promise<DownloadResult> {
  try {
    let metaUrl = opts.directUrl ?? null;
    let mimeFromMeta = opts.mimeHint ?? null;

    // 1) Metadados oficiais em /{media_id}. Alguns webhooks também já trazem
    // `url`; deixamos como fallback porque a Meta exige Bearer nos dois casos.
    if (opts.mediaId) {
      const metaRes = await fetch(`${META_API}/${opts.mediaId}`, {
        headers: { Authorization: `Bearer ${opts.accessToken}` },
      });
      if (metaRes.ok) {
        const meta = await metaRes.json() as { url?: string; mime_type?: string; file_size?: number };
        metaUrl = meta.url ?? metaUrl;
        mimeFromMeta = meta.mime_type ?? mimeFromMeta;
      }
    }
    if (!metaUrl) return null;

    // 2) Bytes
    const fileRes = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${opts.accessToken}` },
    });
    if (!fileRes.ok) return null;
    const buf = await fileRes.arrayBuffer();
    const mime = mimeFromMeta ?? fileRes.headers.get("content-type") ?? "application/octet-stream";

    // 3) Extensão a partir do mime
    const ext = mimeToExt(mime) || (opts.filenameHint?.split(".").pop() ?? "bin");
    const suffix = opts.mediaId ? opts.mediaId.slice(-8) : crypto.randomUUID().slice(0, 8);
    const path = `${opts.workspaceId}/${opts.ticketId}/${Date.now()}-${suffix}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("whatsapp-media")
      .upload(path, new Uint8Array(buf), { contentType: mime, upsert: false });
    if (upErr) return null;

    const { data: pub } = supabaseAdmin.storage.from("whatsapp-media").getPublicUrl(path);
    return {
      url: pub.publicUrl,
      mime,
      filename: opts.filenameHint,
      sizeBytes: buf.byteLength,
    };
  } catch {
    return null;
  }
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "video/mp4": "mp4", "video/3gpp": "3gp", "video/quicktime": "mov",
    "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac", "audio/amr": "amr",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt", "text/csv": "csv",
  };
  if (map[mime]) return map[mime];
  const sub = mime.split("/")[1] ?? "bin";
  return sub.split(";")[0];
}

/** Mapeia o tipo de mensagem da Meta no enum `message_kind` do banco. */
export function mapMessageKind(metaType: string): "text" | "image" | "audio" | "video" | "document" {
  switch (metaType) {
    case "image":
    case "sticker":
      return "image";
    case "video":
      return "video";
    case "audio":
    case "voice":
    case "ptt":
      return "audio";
    case "document":
      return "document";
    default:
      return "text";
  }
}

function getMediaPayload(msg: Record<string, unknown>): { type: string; payload: MetaMediaPayload } | null {
  const type = String(msg.type ?? "");
  if (!["image", "video", "audio", "voice", "document", "sticker"].includes(type)) return null;
  const key = type === "voice" ? "voice" : type;
  const payload = msg[key] as MetaMediaPayload | undefined;
  if (!payload?.id && !payload?.url) return null;
  return { type, payload };
}

function mediaBody(type: string, payload: MetaMediaPayload): string {
  if (payload.caption) return payload.caption;
  if (type === "image") return "📷 Imagem";
  if (type === "video") return "🎥 Vídeo";
  if (type === "audio" || type === "voice") return payload.voice ? "🎙️ Mensagem de voz" : "🎵 Áudio";
  if (type === "document") return payload.filename ? `📎 ${payload.filename}` : "📎 Documento";
  if (type === "sticker") return payload.animated ? "💫 Figurinha animada" : "🩹 Figurinha";
  return "[mídia]";
}

function collectWebhookMessages(raw: unknown) {
  const found = new Map<string, Record<string, unknown>>();
  const contacts = new Map<string, Record<string, unknown>>();
  const entries = (raw as { entry?: Array<{ changes?: Array<{ value?: { messages?: Record<string, unknown>[]; contacts?: Record<string, unknown>[] } }> }> })?.entry ?? [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      for (const contact of value?.contacts ?? []) {
        const id = String(contact.wa_id ?? "");
        if (id) contacts.set(id, contact);
      }
      for (const msg of value?.messages ?? []) {
        const id = String(msg.id ?? "");
        if (id) found.set(id, msg);
      }
    }
  }
  return { found, contacts };
}

function maybeAvatarFromContact(contact: Record<string, unknown> | undefined): string | null {
  const profile = contact?.profile as Record<string, unknown> | undefined;
  const candidates = [
    profile?.picture,
    profile?.picture_url,
    profile?.profile_picture_url,
    contact?.picture,
    contact?.profile_picture_url,
    contact?.avatar_url,
  ];
  const value = candidates.find((v) => typeof v === "string" && /^https?:\/\//.test(v));
  return typeof value === "string" ? value : null;
}

export async function enrichMissingWhatsappMedia(opts: {
  workspaceId: string;
  ticketId: string;
  contactId?: string | null;
  contactAvatarUrl?: string | null;
  messages: Array<Record<string, unknown>>;
}): Promise<boolean> {
  const needsMedia = opts.messages.filter((m) => {
    const externalId = typeof m.external_id === "string" ? m.external_id : "";
    const hasMedia = typeof m.media_url === "string" && m.media_url.length > 0;
    const body = String(m.body ?? "").toLowerCase();
    return externalId && !hasMedia && /\[(video|sticker|image|audio|document)\]|figurinha|vídeo|imagem|áudio|documento/.test(body);
  });
  if (!needsMedia.length && opts.contactAvatarUrl) return false;

  const { data: ticket } = await supabaseAdmin
    .from("tickets")
    .select("connection_id")
    .eq("id", opts.ticketId)
    .maybeSingle();
  if (!ticket?.connection_id) return false;

  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,access_token")
    .eq("id", ticket.connection_id)
    .maybeSingle();
  if (!conn?.access_token) return false;

  const { data: events } = await supabaseAdmin
    .from("whatsapp_webhook_events")
    .select("raw_payload")
    .eq("connection_id", ticket.connection_id)
    .in("event_type", ["message", "message+status", "deduped"])
    .order("created_at", { ascending: false })
    .limit(200);

  const byId = new Map<string, Record<string, unknown>>();
  const contacts = new Map<string, Record<string, unknown>>();
  for (const event of events ?? []) {
    const collected = collectWebhookMessages((event as { raw_payload?: unknown }).raw_payload);
    collected.found.forEach((msg, id) => byId.set(id, msg));
    collected.contacts.forEach((contact, id) => contacts.set(id, contact));
  }

  let changed = false;
  for (const row of needsMedia) {
    const id = String(row.external_id ?? "");
    const rawMsg = byId.get(id);
    if (!rawMsg) continue;
    const media = getMediaPayload(rawMsg);
    if (!media) continue;
    const dl = await downloadAndStoreWhatsappMedia({
      mediaId: media.payload.id ?? null,
      directUrl: media.payload.url ?? null,
      mimeHint: media.payload.mime_type ?? null,
      accessToken: conn.access_token,
      workspaceId: opts.workspaceId,
      ticketId: opts.ticketId,
      filenameHint: media.payload.filename,
    });
    if (!dl) continue;

    await supabaseAdmin
      .from("ticket_messages")
      .update({
        kind: mapMessageKind(media.type),
        body: mediaBody(media.type, media.payload),
        media_url: dl.url,
        media_mime: dl.mime,
      })
      .eq("id", row.id as string);
    changed = true;
  }

  if (opts.contactId && !opts.contactAvatarUrl) {
    const firstContact = Array.from(contacts.values())[0];
    const avatar = maybeAvatarFromContact(firstContact);
    if (avatar) {
      await supabaseAdmin.from("contacts").update({ avatar_url: avatar }).eq("id", opts.contactId);
      changed = true;
    }
  }

  return changed;
}
