// Hook das regras de roteamento de notificações (admin-only).
// Define qual bot/chat recebe cada tipo de evento.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/hub-client";
import { toast } from "sonner";

export type TipoEvento =
  | "info"
  | "sucesso"
  | "aviso"
  | "erro"
  | "critico"
  | "venda"
  | "pagamento"
  | "sistema";

export const TIPOS_EVENTO: { value: TipoEvento; label: string; emoji: string }[] = [
  { value: "critico", label: "Crítico", emoji: "🚨" },
  { value: "erro", label: "Erro", emoji: "❌" },
  { value: "aviso", label: "Aviso", emoji: "⚠️" },
  { value: "venda", label: "Venda", emoji: "💰" },
  { value: "pagamento", label: "Pagamento", emoji: "💳" },
  { value: "sucesso", label: "Sucesso", emoji: "✅" },
  { value: "sistema", label: "Sistema", emoji: "⚙️" },
  { value: "info", label: "Info", emoji: "ℹ️" },
];

export interface NotificationRoute {
  id: string;
  tipo: TipoEvento;
  bot_id: string;
  chat_id: number;
  label: string | null;
  ativo: boolean;
  prioridade: number;
  is_fallback: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationRoutes() {
  const [routes, setRoutes] = useState<NotificationRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_routes")
      .select("*")
      .order("tipo", { ascending: true })
      .order("prioridade", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar rotas: " + error.message);
    } else {
      setRoutes((data ?? []) as NotificationRoute[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const addRoute = async (
    tipo: TipoEvento,
    bot_id: string,
    chat_id: number,
    label?: string,
  ) => {
    const { error } = await supabase.from("notification_routes").insert({
      tipo,
      bot_id,
      chat_id,
      label: label ?? null,
      ativo: true,
      prioridade: 100,
    });
    if (error) {
      toast.error("Erro ao adicionar rota: " + error.message);
      return false;
    }
    toast.success("Rota adicionada!");
    await fetchRoutes();
    return true;
  };

  const toggleRoute = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from("notification_routes")
      .update({ ativo })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao alterar: " + error.message);
      return;
    }
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ativo } : r)));
  };

  const deleteRoute = async (id: string) => {
    const { error } = await supabase.from("notification_routes").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover: " + error.message);
      return;
    }
    toast.success("Rota removida");
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  return { routes, loading, addRoute, toggleRoute, deleteRoute, refetch: fetchRoutes };
}
