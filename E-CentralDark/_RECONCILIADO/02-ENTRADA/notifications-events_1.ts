// Helpers do Bloco D — Fase 5
// Use estes helpers em qualquer server fn / cron / webhook pra:
//   1. Registrar um novo evento no catálogo (registerEvent)
//   2. Disparar uma notificação para os destinos configurados (notify)
//
// IMPORTANTE: este arquivo só pode ser importado por código server-side
// (server functions, server routes), porque usa o supabaseAdmin.

import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { dispatchNotification } from './notifications-master.functions';

export type NotificationSeverity = 'info' | 'warning' | 'critical';
export type NotificationChannel = 'in_app' | 'telegram';

/**
 * Registra (ou atualiza) um evento no catálogo de notificações.
 * Idempotente — pode ser chamado em todo boot/import sem medo.
 *
 * Exemplo:
 *   await registerEvent({
 *     event_key: 'campaign.finished',
 *     title: 'Campanha finalizada',
 *     description: 'Disparada quando uma campanha termina o envio.',
 *     category: 'campaigns',
 *     severity_default: 'info',
 *   });
 */
export async function registerEvent(input: {
  event_key: string;
  title: string;
  description: string;
  category: string;
  severity_default?: NotificationSeverity;
  channels_supported?: NotificationChannel[];
}): Promise<void> {
  const { error } = await supabaseAdmin.rpc('register_notification_event', {
    _event_key: input.event_key,
    _title: input.title,
    _description: input.description,
    _category: input.category,
    _severity_default: input.severity_default ?? 'info',
    _channels: input.channels_supported ?? ['in_app', 'telegram'],
  });
  if (error) {
    console.error('[registerEvent] falhou:', input.event_key, error.message);
    throw error;
  }
}

/**
 * Dispara uma notificação. Aplica as regras configuradas pelo master
 * (canais, severidade mínima, destinos Telegram) e grava em audit_log + notification_log.
 *
 * Exemplo:
 *   await notify('wuzapi.update.success', {
 *     title: 'WuzAPI atualizado',
 *     body: 'Nova versão v1.2.3 instalada com sucesso.',
 *     severity: 'info',
 *     payload: { version: 'v1.2.3' },
 *     link: '/admin/sistema/wuzapi',
 *   });
 */
export async function notify(
  event_key: string,
  opts: {
    title?: string;
    body?: string;
    severity?: NotificationSeverity;
    payload?: Record<string, unknown>;
    link?: string;
    workspace_id?: string;
  } = {},
): Promise<void> {
  try {
    await dispatchNotification({ event_key, ...opts });
  } catch (err) {
    // Notificações NUNCA podem quebrar a operação que as disparou.
    console.error('[notify] falhou:', event_key, err);
  }
}
