/* #OBSERVACOES# | CENTRALDARK.SYNC_CENTER.SUPABASE_SSH_BRIDGE_20261026
 * Owner: SyncCenter + original Casa one-shot SSH.
 * Data source: public.agent_events (admin authenticated, read-only).
 * SSH_READ_PASS != AUTOMATIC_SYNC_PASS != DEPLOY_PASS.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EstadoLeituraSsh = "LEITURA_OK" | "SEM_PROVA" | "ROTA_FALHOU";
export type ProvaSsh = { status: EstadoLeituraSsh; detalhe: string };
type Direcao = "casa-vps" | "vps-casa";
type Evento = { ts: string; status: string; metadata: Record<string, unknown> | null };
type Consulta = { acesso: "OK" | "AUTH_REQUIRED"; eventos: Evento[] };

async function lerEventosSsh(): Promise<Consulta> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw Error("SESSAO_INDISPONIVEL");
  if (!data.session?.access_token) return { acesso: "AUTH_REQUIRED", eventos: [] };
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!base || !chave) throw Error("SUPABASE_CONFIG_AUSENTE");
  const params = new URLSearchParams({
    select: "ts,status,metadata",
    area: "eq.sync-center-ssh",
    acao: "eq.read_only_proof",
    order: "ts.desc",
    limit: "12",
  });
  const response = await fetch(base.replace(/\/$/, "") + "/rest/v1/agent_events?" + params.toString(), {
    cache: "no-store",
    headers: {
      apikey: chave,
      Authorization: "Bearer " + data.session.access_token,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw Error("LEITURA_SUPABASE_HTTP_" + response.status);
  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) throw Error("CONTRATO_SUPABASE_INVALIDO");
  return {
    acesso: "OK",
    eventos: raw.filter((item): item is Evento =>
      !!item && typeof item === "object" && typeof item.ts === "string" &&
      typeof item.status === "string" && (!item.metadata || typeof item.metadata === "object")),
  };
}

function resumirDirecao(direcao: Direcao, eventos: Evento[]): ProvaSsh {
  const registro = eventos.find((e) => e.metadata?.direction === direcao);
  if (!registro) return { status: "SEM_PROVA", detalhe: "Sem prova SSH registrada para esta direção." };
  const observado = typeof registro.metadata?.proof_run_ended_at === "string"
    ? registro.metadata.proof_run_ended_at : registro.ts;
  const at = Date.parse(observado);
  const ttl = Number(registro.metadata?.ttl_seconds ?? 0);
  const ativo = Number.isFinite(at) && at <= Date.now() &&
    Number.isFinite(ttl) && ttl > 0 && ttl <= 86400 &&
    Date.now() - at <= ttl * 1000;
  const quando = Number.isFinite(at) ? new Date(at).toLocaleString("pt-BR") : "horário desconhecido";
  const resumo = typeof registro.metadata?.summary === "string" ? registro.metadata.summary : "Sem detalhe do teste.";
  if (!ativo) return { status: "SEM_PROVA", detalhe: "Último teste em " + quando + " expirou; refazer leitura SSH." };
  if (registro.status.toLowerCase() !== "pass")
    return { status: "ROTA_FALHOU", detalhe: "Falha de leitura em " + quando + ": " + resumo };
  return {
    status: "LEITURA_OK",
    detalhe: "SSH autenticado e leitura comprovada em " + quando + ". " + resumo +
      " Fonte: Supabase agent_events. Não prova sincronização nem deploy.",
  };
}

export function useSshBridgeProof() {
  const consulta = useQuery({
    queryKey: ["centraldark", "sync-center", "ssh-read-only-proofs"],
    queryFn: lerEventosSsh,
    refetchInterval: 60_000,
    retry: false,
    enabled: typeof window !== "undefined",
  });
  const eventos = consulta.data?.eventos ?? [];
  const rotas: Record<Direcao, ProvaSsh> = {
    "casa-vps": resumirDirecao("casa-vps", eventos),
    "vps-casa": resumirDirecao("vps-casa", eventos),
  };
  const informacao = consulta.isError
    ? "Supabase: " + (consulta.error instanceof Error ? consulta.error.message : "UNKNOWN")
    : consulta.data?.acesso === "AUTH_REQUIRED"
      ? "Login de administrador necessário para consultar as provas."
      : consulta.isFetching
        ? "Consultando Supabase..."
        : consulta.data?.acesso === "OK"
          ? "Supabase agent_events: histórico autenticado, atualizado a cada 60 s."
          : "Ainda sem leitura autenticada.";
  return { rotas, informacao };
}