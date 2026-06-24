// Helper compartilhado entre edge functions para notificações com catálogo,
// agrupamento (debounce) e fallback. Runtime: Deno.
//
// Uso:
//   import { notify, registerEvent } from "../_shared/notifications-events.ts";
//
//   await registerEvent({ event_key: "vps.deploy.ok", category: "deploy", severity_default: "sucesso" });
//   await notify({ event_key: "vps.deploy.ok", title: "Deploy concluído", body: "main -> VPS" });

import { createClient } from "jsr:@supabase/supabase-js@2";

type Severity = "info" | "sucesso" | "aviso" | "erro" | "critico";

export interface EventDefinition {
  event_key: string;
  category: string;
  severity_default: Severity;
  title_template?: string;
  body_template?: string;
}

export interface NotifyInput {
  event_key: string;
  severity?: Severity;
  title?: string;
  body?: string;
  link?: string;
  payload?: Record<string, unknown> & {
    ia?: string;
    recurso?: string;
    acao?: string;
    status?: string;
  };
  group_key?: string;
  debounce_seconds?: number;
}

// Canal CentralDark — Status (também replica para Monitoramento via Telegram nativo)
const STATUS_CHAT_ID = -1003669176367;

// Cache em memória do catálogo (60s)
const eventCache = new Map<string, { row: EventDefinition; expires: number }>();
const CACHE_TTL_MS = 60_000;

function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} não configurado`);
  return v;
}

function getServiceClient() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

function nowSP(): string {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function buildBody(input: NotifyInput): string {
  const p = input.payload ?? {};
  return [
    `🤖 IA: ${p.ia ?? "-"}`,
    `📁 Recurso: ${p.recurso ?? "-"}`,
    `⚙️ Ação: ${p.acao ?? "-"}`,
    `✅ Status: ${p.status ?? "-"}`,
    `🕒 Quando: ${nowSP()}`,
    `📝 Detalhe: ${input.body ?? "-"}`,
  ].join("\n");
}

export async function registerEvent(def: EventDefinition): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from("notification_events")
    .upsert(
      {
        event_key: def.event_key,
        category: def.category,
        severity_default: def.severity_default,
        title_template: def.title_template ?? null,
        body_template: def.body_template ?? null,
      },
      { onConflict: "event_key" },
    );
  if (error) console.error("[notifications-events] registerEvent erro:", error.message);
  eventCache.delete(def.event_key);
}

async function loadEvent(event_key: string): Promise<EventDefinition | null> {
  const cached = eventCache.get(event_key);
  if (cached && cached.expires > Date.now()) return cached.row;

  const sb = getServiceClient();
  const { data, error } = await sb
    .from("notification_events")
    .select("event_key, category, severity_default, title_template, body_template, enabled")
    .eq("event_key", event_key)
    .maybeSingle();

  if (error || !data || data.enabled === false) return null;
  const row = data as EventDefinition;
  eventCache.set(event_key, { row, expires: Date.now() + CACHE_TTL_MS });
  return row;
}

async function telegramFallback(titulo: string, mensagem: string): Promise<void> {
  try {
    const LOVABLE = Deno.env.get("LOVABLE_API_KEY");
    const TG = Deno.env.get("TELEGRAM_API_KEY");
    if (!LOVABLE || !TG) return;
    await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE}`,
        "X-Connection-Api-Key": TG,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: STATUS_CHAT_ID,
        text: `<b>${titulo}</b>\n${mensagem}`,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[notifications-events] telegramFallback erro:", e);
  }
}

export async function notify(input: NotifyInput): Promise<void> {
  try {
    const evt = await loadEvent(input.event_key);
    const severity: Severity = input.severity ?? evt?.severity_default ?? "info";
    const titulo = (input.title ?? evt?.title_template ?? input.event_key).slice(0, 200);
    const mensagem = buildBody(input);
    const sb = getServiceClient();

    // Agrupamento por debounce: se já houve evento com mesmo group_key
    // dentro da janela, só incrementa o contador e sai.
    if (input.group_key && input.debounce_seconds && input.debounce_seconds > 0) {
      const since = new Date(Date.now() - input.debounce_seconds * 1000).toISOString();
      const { data: recent } = await sb
        .from("notifications_log")
        .select("id, group_count")
        .eq("group_key", input.group_key)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recent?.id) {
        await sb
          .from("notifications_log")
          .update({ group_count: (recent.group_count ?? 1) + 1 })
          .eq("id", recent.id);
        return;
      }
    }

    // Insere log centralizado
    await sb.from("notifications_log").insert({
      origem: "central",
      tipo: severity,
      titulo,
      mensagem,
      metadata: input.payload ?? {},
      event_key: input.event_key,
      link: input.link ?? null,
      group_key: input.group_key ?? null,
    });

    // Dispara notify-telegram fire-and-forget
    const url = `${getEnv("SUPABASE_URL")}/functions/v1/notify-telegram`;
    const notifyKey = Deno.env.get("NOTIFY_API_KEY") ?? "";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Notify-Key": notifyKey,
        Authorization: `Bearer ${getEnv("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        origem: "central",
        tipo: severity,
        titulo,
        mensagem,
        metadata: { ...(input.payload ?? {}), link: input.link, event_key: input.event_key },
      }),
    });

    if (!resp.ok) {
      // Fallback: registra em audit_logs e tenta gateway direto
      await sb.from("audit_logs").insert({
        action: "notify_fallback",
        entity_type: "notification",
        entity_id: input.event_key,
        metadata: { status: resp.status, titulo, severity },
      });
      await telegramFallback(titulo, mensagem);
    }
  } catch (e) {
    console.error("[notifications-events] notify erro:", e);
  }
}
