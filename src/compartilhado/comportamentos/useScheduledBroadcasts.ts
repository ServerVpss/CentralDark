import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/hub-client";
import { toast } from "sonner";

export interface ScheduledBroadcast {
  id: string;
  user_id: string;
  bot_id: string | null;
  message_template: string;
  target_audience: string;
  target_user_ids: number[] | null;
  scheduled_at: string;
  status: string;
  sent_count: number;
  failed_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function useScheduledBroadcasts(botId?: string) {
  const queryClient = useQueryClient();

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ["scheduled-broadcasts", botId],
    queryFn: async () => {
      let query = supabase
        .from("scheduled_broadcasts")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (botId) {
        query = query.eq("bot_id", botId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ScheduledBroadcast[];
    },
  });

  const createBroadcast = useMutation({
    mutationFn: async (broadcast: Partial<ScheduledBroadcast>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scheduled_broadcasts")
        .insert({
          user_id: user.id,
          bot_id: broadcast.bot_id,
          message_template: broadcast.message_template!,
          target_audience: broadcast.target_audience || "all",
          target_user_ids: broadcast.target_user_ids,
          scheduled_at: broadcast.scheduled_at!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-broadcasts"] });
      toast.success("Broadcast agendado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao agendar broadcast: " + error.message);
    },
  });

  const cancelBroadcast = useMutation({
    mutationFn: async (broadcastId: string) => {
      const { error } = await supabase
        .from("scheduled_broadcasts")
        .update({ status: "cancelled" })
        .eq("id", broadcastId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-broadcasts"] });
      toast.success("Broadcast cancelado!");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar: " + error.message);
    },
  });

  const deleteBroadcast = useMutation({
    mutationFn: async (broadcastId: string) => {
      const { error } = await supabase
        .from("scheduled_broadcasts")
        .delete()
        .eq("id", broadcastId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-broadcasts"] });
      toast.success("Broadcast removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  return {
    broadcasts: broadcasts || [],
    isLoading,
    createBroadcast,
    cancelBroadcast,
    deleteBroadcast,
  };
}
