import { supabase } from "@/integrations/supabase/client";

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

/**
 * Registra um evento no catálogo chamando a edge function.
 */
export async function registerEvent(params: RegisterEventParams) {
  try {
    const { data, error } = await supabase.functions.invoke('notify-event', {
      body: { action: 'register', params }
    });

    if (error) {
      console.error("[registerEvent] Erro ao registrar evento:", error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error("[registerEvent] Falha crítica:", err);
    return { error: err };
  }
}

/**
 * Dispara uma notificação via edge function 'notify-event'.
 */
export async function notify(params: NotifyParams) {
  try {
    const { data, error } = await supabase.functions.invoke('notify-event', {
      body: { action: 'notify', params }
    });

    if (error) {
      console.error("[notify] Erro ao processar notificação:", error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error("[notify] Falha crítica:", err);
    return { error: err };
  }
}
