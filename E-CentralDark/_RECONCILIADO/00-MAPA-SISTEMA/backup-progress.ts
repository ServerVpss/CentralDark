import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MAX_LOG_ITEMS = 40;

const ProgressBody = z.object({
  id: z.string().uuid(),
  step: z.string().min(1).max(60),
  percent: z.number().int().min(0).max(100),
  message: z.string().min(1).max(500),
  status: z.enum(["running", "success", "error"]).optional(),
  destination: z.enum(["github", "b2", "s3", "local"]).optional(),
  file_path: z.string().max(500).optional().nullable(),
  size_bytes: z.number().int().nonnegative().optional(),
  db_size_bytes: z.number().int().nonnegative().optional(),
  media_size_bytes: z.number().int().nonnegative().optional(),
  code_size_bytes: z.number().int().nonnegative().optional(),
  sessions_size_bytes: z.number().int().nonnegative().optional(),
  cloud_uploaded: z.boolean().optional(),
  cloud_location: z.string().max(500).optional().nullable(),
  error_message: z.string().max(500).optional().nullable(),
});

function cleanText(value: unknown, max = 500) {
  return String(value ?? "")
    .replace(/(ghp_|github_pat_|Bearer\s+|Token\s+)[A-Za-z0-9_\-.]+/gi, "$1••••")
    .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://••••")
    .slice(0, max);
}

async function readBackupAuth(cronSecret: string) {
  if (!cronSecret || cronSecret.length < 16) return null;
  const { data, error } = await supabaseAdmin
    .from("master_settings")
    .select("cron_secret, backup_destination")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data?.cron_secret || data.cron_secret !== cronSecret) return null;
  return { destination: (data.backup_destination ?? "github") as "github" | "b2" | "s3" | "local" };
}

async function appendProgressLog(id: string, event: { step: string; percent: number; message: string }) {
  const { data } = await supabaseAdmin
    .from("backup_runs")
    .select("progress_log, started_at")
    .eq("id", id)
    .maybeSingle();

  const current = Array.isArray((data as any)?.progress_log) ? ((data as any).progress_log as any[]) : [];
  const next = [
    ...current,
    {
      at: new Date().toISOString(),
      step: cleanText(event.step, 60),
      percent: event.percent,
      message: cleanText(event.message, 500),
    },
  ].slice(-MAX_LOG_ITEMS);

  return { progress_log: next, started_at: (data as any)?.started_at as string | undefined };
}

export const Route = createFileRoute("/api/public/backup-progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await readBackupAuth(request.headers.get("x-cron-secret") ?? "");
        if (!auth) return new Response("Unauthorized", { status: 401 });

        const url = new URL(request.url);
        const source = url.searchParams.get("source") === "manual" ? "manual" : "cron";
        const claimOnly = url.searchParams.get("mode") === "claim";
        const workerId = cleanText(url.searchParams.get("worker_id") || "vps", 80);
        const now = new Date().toISOString();

        const { data: pending, error: pendingError } = await supabaseAdmin
          .from("backup_runs")
          .select("id, progress_log, attempts")
          .eq("status", "requested")
          .order("started_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (pendingError) return Response.json({ ok: false, error: pendingError.message }, { status: 500 });

        if (pending?.id) {
          const event = {
            step: "vps_conectada",
            percent: 8,
            message: "A VPS respondeu ao painel e começou a preparar a cópia.",
          };
          const log = await appendProgressLog(pending.id, event);
          const { error } = await supabaseAdmin
            .from("backup_runs")
            .update({
              status: "running",
              destination: auth.destination,
              current_step: event.step,
              progress_percent: event.percent,
              status_message: event.message,
              vps_worker_id: workerId,
              vps_started_at: now,
              vps_last_seen_at: now,
              attempts: Number((pending as any).attempts ?? 0) + 1,
              progress_log: log.progress_log,
            } as any)
            .eq("id", pending.id);
          if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
          return Response.json({ ok: true, id: pending.id, destination: auth.destination, claimed: true });
        }

        if (claimOnly) {
          return Response.json({ ok: true, idle: true, destination: auth.destination });
        }

        const initialLog = [{ at: now, step: "vps_conectada", percent: 8, message: "A VPS iniciou uma cópia agendada." }];
        const { data: created, error: createError } = await supabaseAdmin
          .from("backup_runs")
          .insert({
            status: "running",
            trigger_source: source,
            destination: auth.destination,
            started_at: now,
            current_step: "vps_conectada",
            progress_percent: 8,
            status_message: "A VPS iniciou uma cópia agendada.",
            vps_worker_id: workerId,
            vps_started_at: now,
            vps_last_seen_at: now,
            attempts: 1,
            progress_log: initialLog,
          } as any)
          .select("id")
          .single();
        if (createError) return Response.json({ ok: false, error: createError.message }, { status: 500 });
        return Response.json({ ok: true, id: created.id, destination: auth.destination, claimed: false });
      },
      POST: async ({ request }) => {
        const auth = await readBackupAuth(request.headers.get("x-cron-secret") ?? "");
        if (!auth) return new Response("Unauthorized", { status: 401 });

        const parsed = ProgressBody.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ ok: false, error: "Dados inválidos" }, { status: 400 });
        const data = parsed.data;
        const now = new Date().toISOString();
        const log = await appendProgressLog(data.id, {
          step: data.step,
          percent: data.percent,
          message: data.message,
        });

        const updates: Record<string, unknown> = {
          current_step: cleanText(data.step, 60),
          progress_percent: data.status === "success" ? 100 : data.percent,
          status_message: cleanText(data.message, 500),
          vps_last_seen_at: now,
          progress_log: log.progress_log,
        };

        if (data.destination) updates.destination = data.destination;
        if (data.status) updates.status = data.status;
        if (data.status === "success" || data.status === "error") {
          updates.finished_at = now;
          if (log.started_at) updates.duration_ms = Math.max(0, new Date(now).getTime() - new Date(log.started_at).getTime());
        }
        for (const key of ["file_path", "size_bytes", "db_size_bytes", "media_size_bytes", "code_size_bytes", "sessions_size_bytes", "cloud_uploaded", "cloud_location", "error_message"] as const) {
          if (data[key] !== undefined) updates[key] = typeof data[key] === "string" ? cleanText(data[key], 500) : data[key];
        }

        const { error } = await supabaseAdmin.from("backup_runs").update(updates as any).eq("id", data.id);
        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});