// Resumo (só leitura) dos bots do Telegram — mesmo projeto Supabase do Cockpit.
// NUNCA seleciona a coluna `token` — gestão de token continua exclusiva do TelePainel.
// A tabela só tem policy RLS para service_role; sem policy para authenticated, o Postgres
// nega mesmo pra admin logado. Fica AUTH_REQUIRED até existir uma policy/view dedicada.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function extrairMensagemErro(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: unknown }).message);
  return String(e);
}

export interface BotResumo {
  id: string;
  name: string;
  bot_username: string | null;
  is_active: boolean;
  health_status: string | null;
}

export function useTelegramBotsResumo() {
  const [bots, setBots] = useState<BotResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      // `telegram_bots` não está no Database gerado localmente (tabela existe no banco
      // real, mas o types.ts deste projeto não foi regenerado); cast pontual e documentado.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from("telegram_bots")
        .select("id, name, bot_username, is_active, health_status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBots((data ?? []) as unknown as BotResumo[]);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { bots, loading, erro, refresh: buscar };
}
