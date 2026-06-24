// Cliente browser do sistema de notificações.
// Chama a edge function `notify-event`, que internamente usa notify-telegram
// e grava em notifications_log. Não bate em Telegram direto do navegador.

import { supabase } from "@/integrations/supabase/client";

export type Severity = "info" | "sucesso" | "aviso" | "erro" | "critico";

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

export async function registerEvent(def: EventDefinition): Promise<void> {
  const { error } = await supabase.functions.invoke("notify-event", {
    body: { register: def },
  });
  if (error) console.error("[notifications-events] registerEvent:", error.message);
}

export async function notify(input: NotifyInput): Promise<void> {
  const { error } = await supabase.functions.invoke("notify-event", {
    body: input,
  });
  if (error) console.error("[notifications-events] notify:", error.message);
}
