// Cliente browser do sistema de notificações.
// Chama a edge function `notify-event`, que internamente usa notify-telegram
// e grava em notifications_log. Não bate em Telegram direto do navegador.

import { supabase } from "@/integrations/supabase/hub-client";

export type Severity = "info" | "sucesso" | "aviso" | "erro" | "critico";

export interface EventDefinition {
  event_key: string;
  category: string;
  severity_default: Severity;
  title_template?: string;
  body_template?: string;
}

export interface CentralContext {
  ia?: string;
  recurso?: string;
  acao?: string;
  status?: string;
  source_surface?: string;
  session_id?: string;
  profile_id?: string;
  profile_display?: string;
  intent_goal?: string;
  owner?: string;
  head_sha?: string;
  knowledge_event_id?: string;
  next_cursor?: string;
  runtime?: string;
}

export interface NotifyInput {
  event_key: string;
  severity?: Severity;
  title?: string;
  body?: string;
  link?: string;
  payload?: Record<string, unknown> & CentralContext;
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
