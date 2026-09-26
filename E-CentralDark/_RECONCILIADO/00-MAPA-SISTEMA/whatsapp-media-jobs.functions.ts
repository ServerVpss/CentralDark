// Worker de mídia QR/WuzAPI — baixa em background do Gateway, sobe no Storage e
// atualiza ticket_messages. Concorrência limitada via Map em memória do worker.
//
// Fluxo:
//   1) enqueueAndDispatchMediaJob (chamado pelo webhook): cria job + dispara processMediaJob.
//   2) processMediaJob: marca processando, chama Gateway /media/download, sobe no bucket
//      whatsapp-media, atualiza ticket_messages (media_status=ready) e job (done).
//   3) Em erro: incrementa attempts, agenda backoff ou marca failed.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "whatsapp-media";

// Concorrência por workspace (in-memory; aceitável — cron supre se worker reiniciar).
const inFlight = new Map<string, number>();
const MAX_CONCURRENT_PER_WORKSPACE = 2;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4", "video/3gpp": "3gp", "video/quicktime": "mov", "video/webm": "webm",
  "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac",
  "audio/amr": "amr", "audio/wav": "wav", "audio/webm": "weba",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt", "text/csv": "csv",
};

function extFromMime(mime: string): string {
  if (EXT_BY_MIME[mime]) return EXT_BY_MIME[mime];
  const sub = mime.split("/")[1]?.split(";")[0];
  return sub || "bin";
}

function backoffMinutes(attempt: number): number {
  // attempts já incrementado: 1→1min, 2→5min, 3→15min, 4→60min, 5→360min
  const steps = [1, 5, 15, 60, 360];
  return steps[Math.min(attempt - 1, steps.length - 1)];
}

function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  // Remove tokens, URLs longas, base64
  return msg
    .replace(/Bearer\s+[A-Za-z0-9_\-.]+/gi, "Bearer ***")
    .replace(/Token:\s*[A-Za-z0-9_\-.]+/gi, "Token: ***")
    .replace(/[A-Za-z0-9+/=]{100,}/g, "[long-data]")
    .slice(0, 500);
}

async function callGatewayDownload(opts: {
  connectionId: string;
  mediaType: string;
  rawMessage: unknown;
}): Promise<{ buffer: ArrayBuffer; mime: string; size: number }> {
  const gatewayUrl = process.env.MULTIZAP_GATEWAY_URL;
  const gatewayToken = process.env.MULTIZAP_GATEWAY_TOKEN;
  if (!gatewayUrl || !gatewayToken) throw new Error("gateway_env_missing");

  const url = `${gatewayUrl.replace(/\/+$/, "")}/media/download`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${gatewayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connection_id: opts.connectionId,
        media_type: opts.mediaType,
        raw_message: opts.rawMessage,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let msg = `gateway_http_${res.status}`;
      try {
        const j = await res.json();
        msg = (j as { error?: { message?: string } }).error?.message || msg;
      } catch (_e) { /* ignore */ }
      throw new Error(msg);
    }
    const buf = await res.arrayBuffer();
    const mime = res.headers.get("x-media-mime")
      || res.headers.get("content-type")
      || "application/octet-stream";
    const size = Number(res.headers.get("x-media-size") || buf.byteLength);
    return { buffer: buf, mime, size };
  } finally {
    clearTimeout(timeout);
  }
}

// ===== Núcleo: processa 1 job. NÃO exportado como serverFn — chamado internamente. =====
export async function processMediaJobInternal(jobId: string): Promise<void> {
  // Pega o job + workspace pra controle de concorrência
  const { data: job } = await supabaseAdmin
    .from("whatsapp_media_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return;
  if (job.status === "done" || job.status === "failed") return;

  const wsKey = job.workspace_id;
  const current = inFlight.get(wsKey) || 0;
  if (current >= MAX_CONCURRENT_PER_WORKSPACE) {
    // Reagenda em 30s pra evitar atropelar workspace muito ativo.
    await supabaseAdmin
      .from("whatsapp_media_jobs")
      .update({
        next_attempt_at: new Date(Date.now() + 30_000).toISOString(),
        status: "pending",
      })
      .eq("id", jobId);
    return;
  }
  inFlight.set(wsKey, current + 1);

  try {
    const attempts = (job.attempts || 0) + 1;
    await supabaseAdmin
      .from("whatsapp_media_jobs")
      .update({ status: "processing", attempts })
      .eq("id", jobId);

    console.log("[media_jobs] media_download_started", { job_id: jobId, attempts, type: job.media_type });

    const { buffer, mime, size } = await callGatewayDownload({
      connectionId: job.connection_id,
      mediaType: job.media_type,
      rawMessage: job.raw_message,
    });

    const ext = extFromMime(mime);
    // ticket_id é necessário pro path — busca rápido
    const { data: msg } = await supabaseAdmin
      .from("ticket_messages")
      .select("ticket_id")
      .eq("id", job.ticket_message_id)
      .maybeSingle();
    const ticketId = msg?.ticket_id || "no-ticket";
    const path = `${job.workspace_id}/${ticketId}/${jobId}.${ext}`;

    const { error: upErr } = await supabaseAdmin
      .storage
      .from(BUCKET)
      .upload(path, new Uint8Array(buffer), {
        contentType: mime,
        upsert: true,
      });
    if (upErr) throw new Error(`storage_upload: ${upErr.message}`);

    // Gera URL pública canônica (privada na real, mas o hook useSignedMediaUrl
    // extrai o path e re-assina) — preserva compat com componentes do chat.
    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    await supabaseAdmin
      .from("ticket_messages")
      .update({
        media_status: "ready",
        media_storage_path: path,
        media_url: pub?.publicUrl ?? null,
        media_mime: mime,
        media_size_bytes: size,
      } as never)
      .eq("id", job.ticket_message_id);

    await supabaseAdmin
      .from("whatsapp_media_jobs")
      .update({
        status: "done",
        processed_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", jobId);

    console.log("[media_jobs] media_upload_success", { job_id: jobId, path, size, mime });
  } catch (err) {
    const attempts = (job.attempts || 0) + 1;
    const errMsg = sanitizeError(err);
    const failed = attempts >= (job.max_attempts || 5);
    const updates: Record<string, unknown> = {
      status: failed ? "failed" : "pending",
      last_error: errMsg,
      attempts,
    };
    if (!failed) {
      const minutes = backoffMinutes(attempts);
      updates.next_attempt_at = new Date(Date.now() + minutes * 60_000).toISOString();
    } else {
      updates.processed_at = new Date().toISOString();
      // Marca mensagem como falhou pra UI exibir "tentar novamente"
      await supabaseAdmin
        .from("ticket_messages")
        .update({ media_status: "failed" })
        .eq("id", job.ticket_message_id);
    }
    await supabaseAdmin.from("whatsapp_media_jobs").update(updates as never).eq("id", jobId);
    console.warn("[media_jobs] media_download_failed", { job_id: jobId, attempts, failed, error: errMsg });
  } finally {
    const after = (inFlight.get(wsKey) || 1) - 1;
    if (after <= 0) inFlight.delete(wsKey);
    else inFlight.set(wsKey, after);
  }
}

// ===== Entrypoint do webhook: cria job + dispara processamento async =====
export async function enqueueAndDispatchMediaJob(opts: {
  workspaceId: string;
  connectionId: string;
  ticketMessageId: string;
  externalMessageId: string | null;
  mediaType: "image" | "video" | "audio" | "document" | "sticker";
  rawMessage: Record<string, unknown>;
}): Promise<void> {
  const { data: job, error } = await (supabaseAdmin
    .from("whatsapp_media_jobs") as never as { insert: (v: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> } } })
    .insert({
      workspace_id: opts.workspaceId,
      connection_id: opts.connectionId,
      ticket_message_id: opts.ticketMessageId,
      external_message_id: opts.externalMessageId,
      media_type: opts.mediaType,
      status: "pending",
      raw_message: opts.rawMessage,
    })
    .select("id")
    .single();
  if (error || !job) {
    console.warn("[media_jobs] media_job_create_failed", { error: error?.message });
    return;
  }
  console.log("[media_jobs] media_job_created", { job_id: job.id, type: opts.mediaType });
  // Fire-and-forget
  void processMediaJobInternal(job.id).catch((e) => {
    console.warn("[media_jobs] processMediaJobInternal_threw", { job_id: job.id, err: sanitizeError(e) });
  });
}

// ===== ServerFn: signed URL pra exibir mídia no chat =====
export const getMediaSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ messageId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    // Busca msg + valida acesso via workspace
    const { data: msg, error } = await supabaseAdmin
      .from("ticket_messages")
      .select("id, workspace_id, media_storage_path, media_mime, media_status")
      .eq("id", data.messageId)
      .maybeSingle();
    if (error || !msg) throw new Error("message_not_found");
    if (!msg.media_storage_path) throw new Error("media_not_ready");

    // Confere membership
    const { data: membership } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", msg.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!membership && !isAdmin) throw new Error("forbidden");

    const { data: signed, error: sErr } = await supabaseAdmin
      .storage
      .from(BUCKET)
      .createSignedUrl(msg.media_storage_path, 60 * 60); // 1h
    if (sErr || !signed?.signedUrl) throw new Error(`signed_url_failed: ${sErr?.message || "unknown"}`);

    return { url: signed.signedUrl, mime: msg.media_mime, status: msg.media_status };
  });

// ===== ServerFn: tentar de novo um job que falhou =====
export const retryMediaJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ messageId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { data: msg } = await supabaseAdmin
      .from("ticket_messages")
      .select("id, workspace_id")
      .eq("id", data.messageId)
      .maybeSingle();
    if (!msg) throw new Error("message_not_found");

    const { data: membership } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", msg.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!membership && !isAdmin) throw new Error("forbidden");

    const { data: job } = await supabaseAdmin
      .from("whatsapp_media_jobs")
      .select("id, status, attempts, max_attempts")
      .eq("ticket_message_id", data.messageId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!job) throw new Error("job_not_found");

    await supabaseAdmin
      .from("whatsapp_media_jobs")
      .update({
        status: "pending",
        next_attempt_at: new Date().toISOString(),
        // Mantém attempts (informativo) mas estende max_attempts
        max_attempts: Math.max(job.max_attempts || 5, (job.attempts || 0) + 3),
        last_error: null,
      })
      .eq("id", job.id);

    await supabaseAdmin
      .from("ticket_messages")
      .update({ media_status: "pending" })
      .eq("id", data.messageId);

    void processMediaJobInternal(job.id).catch(() => { /* ignore */ });
    return { ok: true };
  });

// ===== ServerFn: pega N jobs pendentes e dispara (usado pelo cron) =====
export async function processPendingMediaJobsInternal(limit = 20): Promise<{ picked: number }> {
  const { data: jobs } = await supabaseAdmin
    .from("whatsapp_media_jobs")
    .select("id")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);
  if (!jobs?.length) return { picked: 0 };
  // Dispara em paralelo (cada um respeita o lock de concorrência por workspace)
  await Promise.allSettled(jobs.map((j) => processMediaJobInternal(j.id)));
  return { picked: jobs.length };
}
