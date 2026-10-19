import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { lerEstadoOficina } from "@/lib/sync.functions";

type Sinal = "verde" | "amarelo" | "vermelho" | "neutro";
const CORES: Record<Sinal, string> = {
  verde: "border-green-500/40 text-green-400",
  amarelo: "border-amber-500/40 text-amber-400",
  vermelho: "border-red-500/40 text-red-400",
  neutro: "border-border text-muted-foreground",
};

export function MinhaOficina() {
  const ler = useServerFn(lerEstadoOficina);
  const consulta = useQuery({ queryKey: ["centraldark", "minha-oficina", "1873"], queryFn: () => ler(), staleTime: 30_000, refetchInterval: 60_000, retry: false });
  const d = consulta.data;
  const alteracoes = d?.casaAlteracoes;
  const prLida = d?.draft !== null && d?.draft !== undefined;
  const etapas: Array<{ nome: string; detalhe: string; sinal: Sinal; estado: string }> = [
    {
      nome: "Minha Bancada", sinal: d?.casaSha ? "verde" : "amarelo",
      estado: d?.casaSha ? "Casa medida" : "Não comprovado",
      detalhe: d?.casaSha ? `Checkout local ${d.casaSha.slice(0, 12)} · ${alteracoes ?? "?"} arquivo(s) alterado(s)` : "Checkout local ainda não medido",
    },
    {
      nome: "Guardar Progresso", sinal: d?.casaSha && alteracoes === 0 ? "verde" : "amarelo",
      estado: d?.casaSha && alteracoes === 0 ? "Sem alterações rastreadas pendentes" : "Verificar alterações",
      detalhe: d?.casaSha ? `Último commit da Casa: ${d.casaSha.slice(0, 12)} · envio à branch não comprovado` : "Commit local e envio à branch exigem provas separadas",
    },
    {
      nome: "Pronto para Conferir", sinal: prLida ? d?.draft === false ? "verde" : "amarelo" : "amarelo",
      estado: prLida ? d?.draft ? "Em construção · Draft" : "Pronta para revisão" : "Não comprovado",
      detalhe: d?.prSha ? `PR #1873 · ${d.prSha.slice(0, 12)}` : "Estado remoto disponível somente após leitura autenticada",
    },
    {
      nome: "Teste de Qualidade", sinal: d?.ci === "PASS" ? "verde" : d?.ci === "FAIL" ? "vermelho" : "amarelo",
      estado: d?.ci === "PASS" ? "Checks aprovados" : d?.ci === "FAIL" ? "Checks falharam" : d?.ci === "RUNNING" ? "Em execução" : "Não comprovado",
      detalhe: d?.checks === null || d?.checks === undefined ? "Sem checks medidos do SHA atual" : `${d.checks} check(s) retornado(s) do SHA da PR; não prova todos os gates`,
    },
    {
      nome: "Juntar ao Projeto", sinal: d?.merged === true ? "verde" : "amarelo",
      estado: d?.merged === true ? "Merge confirmado" : prLida ? "Ainda não mesclado" : "Não comprovado",
      detalhe: "Merge requer aprovação e proteções do GitHub; este painel não executa merge",
    },
    {
      nome: "Colocar no Ar", sinal: "amarelo", estado: "Deploy não comprovado",
      detalhe: "Merge ou HTTP 200 não prova publicação do mesmo SHA e experiência final",
    },
  ];
  return (
    <section className="mt-6 rounded-xl border border-neon-blue/30 bg-background/80 p-4 sm:p-5" aria-label="Minha Oficina — fluxo de entrega real">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-neon-blue uppercase">👑 CHEFE · Fluxo legível</p>
          <h3 className="mt-1 text-xl font-semibold">🛠️ Minha Oficina</h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">Nomes simples para o mesmo Git, CI e deploy. Esta visão consulta os owners reais; nenhum botão simula push, revisão, merge ou publicação.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void consulta.refetch()} disabled={consulta.isFetching} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted/30" aria-label="Atualizar medições da Minha Oficina">
            <RefreshCw className={`size-4 ${consulta.isFetching ? "animate-spin" : ""}`} /> Atualizar
          </button>
          <a href="https://github.com/ServerVpss/CentralDark/pull/1873" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted/30">Abrir PR real <ArrowUpRight className="size-3" /></a>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {etapas.map((etapa, i) => (
          <div key={etapa.nome} className={`rounded-lg border bg-muted/10 p-3 ${CORES[etapa.sinal]}`}>
            <span className="font-mono text-[10px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{etapa.nome}</p>
            <p className="mt-2 text-xs font-medium">{etapa.estado}</p>
            <p className="mt-1 text-xs text-muted-foreground">{etapa.detalhe}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground" role="status">
        {consulta.isError ? "Erro de transporte — estado atual não comprovado" : d ? `Fonte: ${d.fonteGitHub}. Medição: ${new Date(d.medidoEm).toLocaleString("pt-BR")}.` : "Aguardando leitura atual da Casa e do GitHub."}
      </p>
    </section>
  );
}