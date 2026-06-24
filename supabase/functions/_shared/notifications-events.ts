import { createClient } from "jsr:@supabase/supabase-js@2";

// Tipagem para o payload de notificação
export interface NotificationPayload {
  ia?: string;
  recurso?: string;
  acao?: string;
  status?: string;
  [key: string]: any;
}

// Tipagem para os parâmetros de notificação
export interface NotifyParams {
  event_key: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  body?: string;
  link?: string;
  payload?: NotificationPayload;
  group_key?: string;
  debounce_seconds?: number;
}

// Tipagem para registro de eventos
export interface RegisterEventParams {
  event_key: string;
  category: string;
  severity_default: string;
  title_template?: string;
  body_template?: string;
}

// Cache em memória para eventos (60 segundos)
const eventCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000;

/**
 * Registra ou atualiza um evento no catálogo.
 */
export async function registerEvent(params: RegisterEventParams) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase
      .from("notification_events")
      .upsert(params, { onConflict: "event_key" });

    if (error) console.error("[registerEvent] Erro ao registrar evento:", error);
  } catch (err) {
    console.error("[registerEvent] Falha crítica:", err);
  }
}

/**
 * Envia uma notificação centralizada com lógica de debounce e fallback.
 */
export async function notify(params: NotifyParams) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { event_key, severity, title, body, link, payload = {}, group_key, debounce_seconds } = params;

    // 1. Busca evento no catálogo (com cache)
    let eventData = null;
    const cached = eventCache.get(event_key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      eventData = cached.data;
    } else {
      const { data } = await supabase
        .from("notification_events")
        .select("*")
        .eq("event_key", event_key)
        .single();
      
      if (data) {
        eventCache.set(event_key, { data, timestamp: Date.now() });
        eventData = data;
      }
    }

    const finalSeverity = severity || eventData?.severity_default || 'info';
    const finalTitle = title || eventData?.title_template || `Notificação: ${event_key}`;

    // 2. Monta o body no formato fixo
    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const formattedBody = `🤖 IA: ${payload.ia ?? '-'}
📁 Recurso: ${payload.recurso ?? '-'}
⚙️ Ação: ${payload.acao ?? '-'}
✅ Status: ${payload.status ?? '-'}
🕒 Quando: ${agora}
📝 Detalhe: ${body ?? '-'}`;

    // 3. Lógica de Debounce
    if (group_key && debounce_seconds) {
      const timeLimit = new Date(Date.now() - (debounce_seconds * 1000)).toISOString();
      
      const { data: recentLog, error: logError } = await supabase
        .from("notifications_log")
        .select("id, group_count")
        .eq("group_key", group_key)
        .gt("created_at", timeLimit)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentLog && !logError) {
        // Se existe log recente, apenas incrementa contador e sai
        await supabase
          .from("notifications_log")
          .update({ group_count: (recentLog.group_count || 1) + 1 })
          .eq("id", recentLog.id);
        
        return;
      }
    }

    // 4. Insere no log de notificações
    const { data: insertedLog } = await supabase
      .from("notifications_log")
      .insert({
        origem: 'central',
        tipo: finalSeverity,
        titulo: finalTitle,
        mensagem: formattedBody,
        metadata: payload,
        link,
        event_key,
        group_key,
        group_count: 1
      })
      .select()
      .single();

    // 5. Dispara notify-telegram (fire-and-forget)
    const triggerTelegram = async () => {
      try {
        const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-telegram`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            log_id: insertedLog?.id,
            title: finalTitle,
            message: formattedBody,
            link,
            severity: finalSeverity
          })
        });

        // 6. Fallback se falhar
        if (!response.ok) {
          console.warn(`[notify] notify-telegram falhou (${response.status}). Iniciando fallback.`);
          
          // Grava em audit_logs
          await supabase.from("audit_logs").insert({
            action: 'notify_fallback',
            payload: { error: await response.text(), params }
          });

          // Tentativa direta via Gateway Telegram
          const telegramToken = Deno.env.get("TELEGRAM_API_KEY");
          const chatId = "-1003669176367";
          
          if (telegramToken) {
            const text = `*${finalTitle}*\n\n${formattedBody}${link ? `\n\n🔗 [Link](${link})` : ''}`;
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
              })
            });
          }
        }
      } catch (e) {
        console.error("[notify] Falha no disparo/fallback do Telegram:", e);
      }
    };

    triggerTelegram(); // Fire-and-forget

  } catch (err) {
    console.error("[notify] Erro geral na função notify:", err);
  }
}
