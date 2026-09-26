// Central de Notificações do Master (Fase 5 - Bloco A)
// Despacha eventos para in-app (sino master) e Telegram (bot próprio do cliente).
// Toda tentativa é logada em notification_log; eventos críticos vão pra audit_log.

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type Severity = 'info' | 'warning' | 'critical';
const SEVERITY_RANK: Record<Severity, number> = { info: 0, warning: 1, critical: 2 };

function maskToken(token: string | null | undefined): string {
  if (!token) return '';
  if (token.length <= 8) return '****';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

function friendlyTelegramError(status: number, body: any): string {
  const desc = String(body?.description ?? '').toLowerCase();
  if (status === 401 || desc.includes('unauthorized')) return 'O token do bot está inválido ou foi revogado.';
  if (desc.includes('bot was blocked')) return 'O usuário bloqueou o bot. Peça pra ele desbloquear ou remover este destino.';
  if (desc.includes('chat not found')) return 'O chat não foi encontrado. Verifique o ID ou adicione o bot novamente.';
  if (desc.includes("bot can't initiate") || desc.includes('forbidden')) return 'O bot não tem permissão para enviar neste chat. Adicione-o como admin (em canais) ou inicie conversa primeiro.';
  if (desc.includes('not enough rights')) return 'O bot não tem permissões suficientes neste grupo/canal. Promova-o a administrador.';
  if (desc.includes('too many requests')) return 'O Telegram aplicou limite de envio. Tente novamente em alguns segundos.';
  if (status >= 500) return 'Telegram está fora do ar momentaneamente. Tente novamente.';
  return body?.description ? `Erro do Telegram: ${body.description}` : 'Falha desconhecida ao enviar.';
}

async function telegramApi(token: string, method: string, payload?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: payload ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json?.ok === true, status: res.status, body: json };
}

function chatTypeFromTelegram(t: string): 'private' | 'group' | 'supergroup' | 'channel' {
  if (t === 'private' || t === 'group' || t === 'supergroup' || t === 'channel') return t;
  return 'private';
}

async function requireSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'super_admin').maybeSingle();
  if (!data) throw new Error('Acesso negado');
}

// ============================================================
// Dispatch principal — pode ser chamado por server fns internas
// ============================================================
async function dispatchEventInternal(input: {
  event_key: string;
  title?: string;
  body?: string;
  severity?: Severity;
  payload?: Record<string, unknown>;
  link?: string;
}) {
  const { event_key } = input;

  const { data: catalog } = await supabaseAdmin
    .from('notification_event_catalog')
    .select('event_key, title, description, severity_default, is_active, category')
    .eq('event_key', event_key).maybeSingle();

  if (!catalog || !catalog.is_active) {
    await supabaseAdmin.from('audit_log').insert({
      action: `notification:unknown_event:${event_key}`,
      payload: { ...input, reason: catalog ? 'inactive' : 'not_in_catalog' } as any,
    });
    return { ok: false, reason: 'event_not_active' as const };
  }

  const severity: Severity = (input.severity ?? (catalog.severity_default as Severity));
  const title = input.title ?? catalog.title;
  const body = input.body ?? catalog.description ?? '';

  // audit_log SEMPRE
  await supabaseAdmin.from('audit_log').insert({
    action: `notification:${event_key}`,
    payload: { severity, title, body, ...input.payload } as any,
  });

  const { data: rule } = await supabaseAdmin
    .from('notification_rules')
    .select('in_app_enabled, telegram_enabled, min_severity, telegram_destination_ids')
    .eq('event_key', event_key).maybeSingle();

  if (!rule) {
    await supabaseAdmin.from('notification_log').insert({
      event_key, severity, channel: 'audit_only', status: 'skipped',
      error_friendly: 'Sem regra configurada — só foi registrado em auditoria.',
      payload: input.payload as any,
    });
    return { ok: true, dispatched: 0 };
  }

  if (SEVERITY_RANK[severity] < SEVERITY_RANK[rule.min_severity as Severity]) {
    await supabaseAdmin.from('notification_log').insert({
      event_key, severity, channel: 'audit_only', status: 'skipped',
      error_friendly: `Severidade ${severity} abaixo do mínimo (${rule.min_severity}).`,
      payload: input.payload as any,
    });
    return { ok: true, dispatched: 0 };
  }

  let dispatched = 0;

  if (rule.in_app_enabled) {
    const { error: insErr } = await supabaseAdmin.from('master_notifications').insert({
      event_key, title, body, severity, payload: input.payload as any, link: input.link ?? null,
    });
    await supabaseAdmin.from('notification_log').insert({
      event_key, severity, channel: 'in_app',
      destination_label: 'Sino Master',
      status: insErr ? 'failed' : 'sent',
      error_technical: insErr?.message,
      error_friendly: insErr ? 'Não foi possível salvar a notificação no sino.' : null,
      payload: input.payload as any,
    });
    if (!insErr) dispatched++;
  }

  if (rule.telegram_enabled && (rule.telegram_destination_ids as string[])?.length) {
    const { data: dests } = await supabaseAdmin
      .from('notification_telegram_destinations')
      .select('id, chat_id, title, chat_type, bot_id, is_active, can_send')
      .in('id', rule.telegram_destination_ids as string[])
      .eq('is_active', true);

    if (dests?.length) {
      const botIds = Array.from(new Set(dests.map((d) => d.bot_id)));
      const { data: bots } = await supabaseAdmin
        .from('notification_telegram_bots')
        .select('id, bot_token, is_active, name').in('id', botIds);
      const botMap = new Map(bots?.map((b) => [b.id, b]) ?? []);

      const sevEmoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
      const text = `${sevEmoji} *${title}*\n${body}\n\n_${event_key}_`;

      for (const dest of dests) {
        const bot = botMap.get(dest.bot_id);
        if (!bot?.is_active || !bot.bot_token) {
          await supabaseAdmin.from('notification_log').insert({
            event_key, severity, channel: 'telegram',
            destination_id: dest.id, destination_label: dest.title ?? String(dest.chat_id),
            status: 'skipped',
            error_friendly: 'Bot desativado ou sem token configurado.',
            payload: input.payload as any,
          });
          continue;
        }
        const result = await telegramApi(bot.bot_token, 'sendMessage', {
          chat_id: dest.chat_id, text, parse_mode: 'Markdown',
        });
        await supabaseAdmin.from('notification_log').insert({
          event_key, severity, channel: 'telegram',
          destination_id: dest.id, destination_label: dest.title ?? String(dest.chat_id),
          status: result.ok ? 'sent' : 'failed',
          error_code: result.ok ? null : String(result.status),
          error_technical: result.ok ? null : JSON.stringify(result.body),
          error_friendly: result.ok ? null : friendlyTelegramError(result.status, result.body),
          payload: input.payload as any,
        });
        if (result.ok) dispatched++;
        if (!result.ok && String(result.body?.description ?? '').toLowerCase().includes('forbidden')) {
          await supabaseAdmin
            .from('notification_telegram_destinations')
            .update({ can_send: false, last_test_status: 'failed', last_tested_at: new Date().toISOString() })
            .eq('id', dest.id);
        }
      }
    }
  }

  return { ok: true, dispatched };
}

// Server fn exportável pra disparos via RPC (usado por outras server fns/cron)
export const dispatchNotificationEvent = createServerFn({ method: 'POST' })
  .inputValidator((input) =>
    z.object({
      event_key: z.string().min(1).max(100),
      title: z.string().min(1).max(200).optional(),
      body: z.string().max(2000).optional(),
      severity: z.enum(['info', 'warning', 'critical']).optional(),
      payload: z.record(z.unknown()).optional(),
      link: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => dispatchEventInternal(data));

// Helper interno (sem validação RPC) pra ser usado direto por outras server fns no MESMO processo
export async function dispatchNotification(input: {
  event_key: string;
  title?: string;
  body?: string;
  severity?: Severity;
  payload?: Record<string, unknown>;
  link?: string;
}) {
  try {
    return await dispatchEventInternal(input);
  } catch (err) {
    // Nunca quebra o fluxo do caller
    console.error('[notifications] dispatch falhou:', err);
    return { ok: false, error: String(err) };
  }
}

// ============================================================
// CRUD Master
// ============================================================

export const masterListEventCatalog = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data: catalog } = await supabaseAdmin
      .from('notification_event_catalog').select('*').order('category').order('event_key');
    const { data: rules } = await supabaseAdmin.from('notification_rules').select('*');
    return { catalog: catalog ?? [], rules: rules ?? [] };
  });

export const masterUpsertRule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      event_key: z.string().min(1).max(100),
      in_app_enabled: z.boolean(),
      telegram_enabled: z.boolean(),
      min_severity: z.enum(['info', 'warning', 'critical']),
      telegram_destination_ids: z.array(z.string().uuid()).max(50),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from('notification_rules')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'event_key' });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_rule_updated',
      payload: data as any,
    });
    return { ok: true };
  });

// ---------- Bots Telegram ----------

export const masterListTelegramBots = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data } = await supabaseAdmin
      .from('notification_telegram_bots')
      .select('id, name, bot_token, bot_username, is_active, last_tested_at, last_test_status, last_test_error, created_at')
      .order('created_at', { ascending: false });
    return (data ?? []).map((b) => ({
      id: b.id, name: b.name, bot_username: b.bot_username, is_active: b.is_active,
      last_tested_at: b.last_tested_at, last_test_status: b.last_test_status, last_test_error: b.last_test_error,
      created_at: b.created_at,
      bot_token_masked: maskToken(b.bot_token),
    }));
  });

export const masterCreateTelegramBot = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      name: z.string().min(1).max(100),
      bot_token: z.string().min(20).max(200).regex(/^\d+:[A-Za-z0-9_-]+$/, 'Formato inválido (esperado: 123456789:ABC...)'),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const me = await telegramApi(data.bot_token, 'getMe');
    if (!me.ok) throw new Error(friendlyTelegramError(me.status, me.body));
    const { data: created, error } = await supabaseAdmin
      .from('notification_telegram_bots')
      .insert({
        name: data.name,
        bot_token: data.bot_token,
        bot_username: me.body?.result?.username ?? null,
        last_tested_at: new Date().toISOString(),
        last_test_status: 'ok',
      })
      .select('id').single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_bot_created',
      payload: { bot_id: created.id, name: data.name, username: me.body?.result?.username } as any,
    });
    return { ok: true, id: created.id, username: me.body?.result?.username };
  });

export const masterDeleteTelegramBot = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from('notification_telegram_bots').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_bot_deleted',
      payload: { bot_id: data.id } as any,
    });
    return { ok: true };
  });

// ---------- Destinos Telegram ----------

export const masterDetectTelegramDestinations = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ bot_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data: bot } = await supabaseAdmin
      .from('notification_telegram_bots').select('bot_token').eq('id', data.bot_id).maybeSingle();
    if (!bot?.bot_token) throw new Error('Bot não encontrado.');

    const updates = await telegramApi(bot.bot_token, 'getUpdates', { offset: -100, limit: 100 });
    if (!updates.ok) throw new Error(friendlyTelegramError(updates.status, updates.body));

    const seen = new Map<number, { id: number; type: string; title?: string; username?: string }>();
    for (const upd of (updates.body?.result ?? []) as any[]) {
      const chat = upd.message?.chat ?? upd.channel_post?.chat ?? upd.my_chat_member?.chat;
      if (chat?.id) seen.set(chat.id, { id: chat.id, type: chat.type, title: chat.title ?? chat.first_name, username: chat.username });
    }

    const found: any[] = [];
    for (const c of seen.values()) {
      const { data: up } = await supabaseAdmin
        .from('notification_telegram_destinations')
        .upsert({
          bot_id: data.bot_id,
          chat_id: c.id,
          chat_type: chatTypeFromTelegram(c.type),
          title: c.title ?? null,
          username: c.username ?? null,
        }, { onConflict: 'bot_id,chat_id' })
        .select('id, chat_id, title, chat_type').single();
      if (up) found.push(up);
    }
    return { ok: true, count: found.length, destinations: found };
  });

export const masterListTelegramDestinations = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data } = await supabaseAdmin
      .from('notification_telegram_destinations').select('*').order('created_at', { ascending: false });
    return data ?? [];
  });

export const masterTestTelegramDestination = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ destination_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data: dest } = await supabaseAdmin
      .from('notification_telegram_destinations')
      .select('id, chat_id, title, bot_id').eq('id', data.destination_id).maybeSingle();
    if (!dest) throw new Error('Destino não encontrado.');

    const { data: bot } = await supabaseAdmin
      .from('notification_telegram_bots').select('bot_token, name').eq('id', dest.bot_id).maybeSingle();
    if (!bot?.bot_token) throw new Error('Bot do destino não encontrado.');

    const result = await telegramApi(bot.bot_token, 'sendMessage', {
      chat_id: dest.chat_id,
      text: `✅ Teste do MultiZap — bot "${bot.name}". Se você está vendo isso, a integração está OK.`,
    });

    await supabaseAdmin
      .from('notification_telegram_destinations')
      .update({
        last_tested_at: new Date().toISOString(),
        last_test_status: result.ok ? 'ok' : 'failed',
        last_test_error: result.ok ? null : friendlyTelegramError(result.status, result.body),
        can_send: result.ok,
      })
      .eq('id', data.destination_id);

    return { ok: result.ok, message: result.ok ? 'Mensagem enviada!' : friendlyTelegramError(result.status, result.body) };
  });

export const masterUpdateTelegramDestination = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const patch: { title?: string } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabaseAdmin
      .from('notification_telegram_destinations').update(patch).eq('id', data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_destination_updated',
      payload: { destination_id: data.id, patch } as any,
    });
    return { ok: true };
  });

export const masterDeleteTelegramDestination = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from('notification_telegram_destinations').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_destination_deleted',
      payload: { destination_id: data.id } as any,
    });
    return { ok: true };
  });

export const masterBulkUpsertRules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      event_keys: z.array(z.string().min(1).max(100)).min(1).max(500),
      in_app_enabled: z.boolean().optional(),
      telegram_enabled: z.boolean().optional(),
      min_severity: z.enum(['info', 'warning', 'critical']).optional(),
      telegram_destination_ids: z.array(z.string().uuid()).max(50).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);

    // Lê regras existentes pra preservar campos não enviados
    const { data: existing } = await supabaseAdmin
      .from('notification_rules')
      .select('event_key, in_app_enabled, telegram_enabled, min_severity, telegram_destination_ids')
      .in('event_key', data.event_keys);
    const byKey = new Map<string, any>();
    (existing ?? []).forEach((r) => byKey.set(r.event_key, r));

    const rows = data.event_keys.map((event_key) => {
      const cur = byKey.get(event_key) ?? {};
      return {
        event_key,
        in_app_enabled: data.in_app_enabled ?? cur.in_app_enabled ?? true,
        telegram_enabled: data.telegram_enabled ?? cur.telegram_enabled ?? false,
        min_severity: data.min_severity ?? cur.min_severity ?? 'info',
        telegram_destination_ids: data.telegram_destination_ids ?? cur.telegram_destination_ids ?? [],
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabaseAdmin
      .from('notification_rules').upsert(rows, { onConflict: 'event_key' });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: context.userId,
      action: 'admin:notification_rules_bulk_updated',
      payload: {
        count: rows.length,
        applied: {
          in_app_enabled: data.in_app_enabled,
          telegram_enabled: data.telegram_enabled,
          min_severity: data.min_severity,
          telegram_destination_ids: data.telegram_destination_ids,
        },
      } as any,
    });
    return { ok: true, count: rows.length };
  });


// ---------- Logs e sino ----------

export const masterListNotificationLogs = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      limit: z.number().min(1).max(200).default(100),
      event_key: z.string().optional(),
      status: z.enum(['sent', 'failed', 'skipped']).optional(),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    let q = supabaseAdmin.from('notification_log').select('*').order('created_at', { ascending: false }).limit(data.limit);
    if (data.event_key) q = q.eq('event_key', data.event_key);
    if (data.status) q = q.eq('status', data.status);
    const { data: logs } = await q;
    return logs ?? [];
  });

export const masterListBellNotifications = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data } = await supabaseAdmin
      .from('master_notifications').select('*').order('created_at', { ascending: false }).limit(50);
    const userId = context.userId;
    return (data ?? []).map((n: any) => ({ ...n, is_read: Array.isArray(n.read_by) && n.read_by.includes(userId) }));
  });

export const masterMarkBellRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    const { data: row } = await supabaseAdmin.from('master_notifications').select('read_by').eq('id', data.id).maybeSingle();
    const current = (row?.read_by as string[] | undefined) ?? [];
    if (!current.includes(context.userId)) {
      await supabaseAdmin.from('master_notifications').update({ read_by: [...current, context.userId] }).eq('id', data.id);
    }
    return { ok: true };
  });

// ---------- Botão "Testar evento" no painel ----------

export const masterTestEvent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ event_key: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireSuperAdmin(context.supabase, context.userId);
    return dispatchEventInternal({
      event_key: data.event_key,
      title: '[TESTE] ' + data.event_key,
      body: 'Disparo de teste a partir do painel master.',
      payload: { test: true, actor: context.userId },
    });
  });
