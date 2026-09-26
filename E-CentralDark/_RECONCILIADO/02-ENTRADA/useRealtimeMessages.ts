import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "@/services/messageService";
import { toast } from "sonner";

interface UseRealtimeMessagesProps {
  workspaceId?: string;
  contactId?: string;
  enabled: boolean;
  onMessageReceived: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
}

export function useRealtimeMessages({
  workspaceId,
  contactId,
  enabled,
  onMessageReceived,
  onMessageUpdated
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    // Só inicializa se todos os requisitos e flags estiverem ativos
    if (!enabled || !workspaceId || !contactId) return;

    // Constrói o channel usando tenant e contato como namespace seguro
    const channelName = `realtime:messages:${workspaceId}:${contactId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "api",
          table: "messages",
          // Filtro client-side ajuda a evitar ruído/bug de UX (mas não substitui RLS real)
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Re-validação rigorosa de payload (para evitar broadcast vazado)
          if (newMsg.workspace_id !== workspaceId) return;
          if (newMsg.contact_id !== contactId) return;

          onMessageReceived(newMsg);
        }
      );

    if (onMessageUpdated) {
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "api",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          
          if (updatedMsg.workspace_id !== workspaceId) return;
          if (updatedMsg.contact_id !== contactId) return;

          onMessageUpdated(updatedMsg);
        }
      );
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
         // Omitindo logs verbosos. Silencioso para não poluir console de dev.
      }
      if (status === 'CHANNEL_ERROR') {
         console.warn('[Realtime] Erro de subscription no canal de mensagens.');
      }
    });

    // Cleanup: Remove a subscription anterior (Evita duplicação de escuta)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, contactId, enabled, onMessageReceived, onMessageUpdated]);
}
