import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  continuarUltimaMissaoCentralDark,
  lerUltimoCheckpointCentralDark,
} from "@/lib/checkpoint.functions";

/** A mesma aba Hermes do Instinto Superior; estado vivo vem do checkpoint da VPS. */
export function CheckpointCentralDark({ autenticado }: { autenticado: boolean }) {
  const ler = useServerFn(lerUltimoCheckpointCentralDark);
  const continuar = useServerFn(continuarUltimaMissaoCentralDark);
  const [executando, setExecutando] = useState(false);
  const [detalhes, setDetalhes] = useState(false);
  const [retorno, setRetorno] = useState<string | null>(null);

  async function authHeaders() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) throw new Error("AUTH_REQUIRED");
    return { Authorization: `Bearer ${data.session.access_token}` };
  }

  const ultimo = useQuery({
    queryKey: ["centraldark", "hermes", "latest-verified-checkpoint"],
    enabled: autenticado,
    queryFn: async () => ler({ headers: await authHeaders() }),
    refetchInterval: autenticado ? 30_000 : false,
    retry: false,
  });

  async function retomar() {
    if (executando) return;
    setExecutando(true);
    setRetorno(null);
    try {
      const resposta = await continuar({ headers: await authHeaders() });
      setRetorno(resposta.state === "DISPATCHED_AWAITING_RECEIPT"
        ? "Continuação enviada ao executor. Aguardando recibo; o checkpoint verde só muda após contraprova."
        : resposta.state);
      await ultimo.refetch();
      if (resposta.state === "DISPATCHED_AWAITING_RECEIPT") {
        window.setTimeout(() => { void ultimo.refetch(); }, 2500);
      }
    } catch {
      setRetorno("Falha de autenticação ou comunicação com o executor.");
    } finally {
      setExecutando(false);
    }
  }

  const checkpoint = ultimo.data;
  const disponivel = checkpoint?.ok === true;
  const label = ultimo.isPending ? "Consultando…" :
    ultimo.isError ? "UNKNOWN · não foi possível medir" :
    disponivel ? "CHECKPOINT VERIFICADO" : (checkpoint?.state ?? "UNKNOWN");

  return (
    <section aria-label="CentralDark checkpoint e continuidade" className="mb-6 rounded-xl border border-border bg-background/80 p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">🪬 !CENTRALDARK · Memória operacional</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Último fato comprovado → próximo cursor → execução. Independente da conversa ou do modelo.
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">{label}</span>
      </header>

      {!autenticado ? (
        <p className="mt-4 text-sm text-muted-foreground">
          O checkpoint vivo é privado. <Link className="underline" to="/auth">Entrar na Sala de Controle</Link> para acessar os botões.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 rounded-lg bg-muted/20 p-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">Missão vigente</dt><dd className="mt-1 break-words font-medium">{checkpoint?.mission ?? "Não medida"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Último êxito</dt><dd className="mt-1 break-words font-medium">{checkpoint?.last_step ?? "Não medido"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Próxima execução</dt><dd className="mt-1 break-words font-medium">{checkpoint?.next_cursor ?? "UNKNOWN"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Provas válidas</dt><dd className="mt-1 font-medium">{disponivel ? `${checkpoint?.verified_steps ?? 0} / ${checkpoint?.events ?? 0} eventos` : "UNKNOWN"}</dd></div>
          </dl>
          <p className="mt-3 break-words text-sm">{disponivel ? checkpoint?.intent : "Aguardar uma leitura comprovada do owner da VPS."}</p>
          {checkpoint?.receipt_sha256 ? (
            <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground" title="SHA-256 do recibo">
              SHA-256 · {checkpoint.receipt_sha256}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => { void ultimo.refetch(); }} disabled={ultimo.isFetching}>
              🔎 Último checkpoint
            </Button>
            <Button type="button" size="sm" onClick={() => { void retomar(); }}
              disabled={!disponivel || !(checkpoint?.plan_ready || checkpoint?.dispatch_ready) || executando}>
              🪬 !CENTRALDARK · Continuar missão
            </Button>
            <Button type="button" size="sm" variant="ghost" aria-expanded={detalhes}
              onClick={() => setDetalhes((v) => !v)}>
              🧠 Entender CentralDark
            </Button>
          </div>
          {disponivel && !checkpoint?.plan_ready && checkpoint?.dispatch_ready ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Sem plano local: continuar envia o próximo cursor ao Kanban original do Hermes, com idempotência. Enviar não significa concluir.
            </p>
          ) : null}
          {disponivel && !checkpoint?.plan_ready && !checkpoint?.dispatch_ready ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Checkpoint recuperado. A continuação aguarda uma rota executora disponível.
            </p>
          ) : null}
          {retorno ? <p role="status" className="mt-3 text-sm">{retorno}</p> : null}
          {detalhes ? (
            <div className="mt-4 space-y-2 rounded-lg border border-border p-4 text-sm">
              <p><strong>Identidade:</strong> SOUL + RULES + AGENTS existentes. O modelo pode ser substituído.</p>
              <p><strong>Memória:</strong> checkpoint em disco, journal encadeado e histórico do Hermes; não depende da janela de contexto.</p>
              <p><strong>Executor:</strong> Hermes/CLI usa a mesma missão; a aprovação por etapa exige saída correta e contraprova.</p>
              <p><strong>Continuidade:</strong> uma execução que falha não apaga o último PASS; a próxima tentativa retoma no NEXT_CURSOR.</p>
              <p><strong>Fontes:</strong> VPS → checkpoint owner → servidor autenticado → este cockpit. Código e contratos permanecem na main.</p>
              <p className="text-xs text-muted-foreground">Com plano comprovado, continua sem repetir verdes. Sem plano, delega o próximo cursor ao Kanban Hermes existente; o Reality Judge valida cada resultado.</p>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
