import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lerTelemetriaFocoCentralDark } from "@/lib/centraldark-focus-telemetry.functions";
import { SkillUsageRealtimePanel } from "@/components/central/SkillUsageRealtimePanel";

function Ms({ value }: { value: number | null }) {
  return <>{value === null ? "NÃO MEDIDO" : value.toLocaleString("pt-BR") + " ms"}</>;
}
function Num({ value }: { value: number | null }) {
  return <>{value === null ? "NÃO MEDIDO" : value.toLocaleString("pt-BR")}</>;
}
export function FocusTelemetryPanel() {
  const read = useServerFn(lerTelemetriaFocoCentralDark);
  const telemetry = useQuery({
    queryKey: ["centraldark", "focus-telemetry"],
    queryFn: () => read(),
    retry: false,
    refetchInterval: 10_000,
  });
  const data = telemetry.data;
  const observed = !telemetry.isError && data?.status === "OBSERVED";
  const hasSample = !telemetry.isError && (data?.status === "OBSERVED" || data?.status === "STALE");
  return (
    <section className="panel p-5" aria-labelledby="focus-telemetry-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-neon-blue">SKILL MÃE / CENTRALDARK-REMOTE / AÇÕES UIA</p>
          <h5 id="focus-telemetry-title" className="mt-1 font-semibold">
            Telemetria de foco, delegação e retorno
          </h5>
          <p className="mt-1 text-xs text-muted-foreground">
            Instrumentação de ações autorizadas na Casa, janela móvel de 24 h. Não é um contador
            global de mouse nem prova de conexões TCP/MCP.
          </p>
        </div>
        <button type="button" className="rounded border border-border px-3 py-2 text-xs"
          disabled={telemetry.isFetching} onClick={() => void telemetry.refetch()}>
          {telemetry.isFetching ? "Lendo…" : "Remedir"}
        </button>
      </div>
      <p role="status" className="mt-3 text-xs font-mono text-muted-foreground">
        {telemetry.isError ? "LEITURA NÃO AUTORIZADA OU INDISPONÍVEL"
          : data?.status ?? "AGUARDANDO SENSOR"} — {observed ? "amostra recente" : "sem amostra atual"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Num value={data?.actions ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">Ações UIA com readback</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Num value={hasSample ? data?.tabSwitches.count ?? null : null} /></strong>
          <p className="mt-1 text-muted-foreground">Trocas de aba medidas</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Num value={data?.typeClearCycles ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">Ciclos oi / apagar sem envio</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Num value={hasSample ? data?.roundTrips.count ?? null : null} /></strong>
          <p className="mt-1 text-muted-foreground">Idas e voltas verificadas</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Ms value={data?.tabSwitches.medianMs ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">Troca mediana de aba</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Ms value={data?.tabSwitches.p95Ms ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">Troca p95 (cauda lenta)</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Ms value={data?.roundTrips.medianMs ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">Ida e volta mediana</p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <strong className="text-base"><Num value={data?.ackEvents ?? null} /></strong>
          <p className="mt-1 text-muted-foreground">ACKs registrados nesta fonte</p>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded border border-border p-3 text-xs">
          <h6 className="font-semibold">Skill com uso instrumentado</h6>
          {data?.skillUsage.length ? (
            <ul className="mt-2 space-y-1">
              {data.skillUsage.map((s) => <li key={s.skill}>
                <span className="font-mono">{s.skill}</span>: {s.benchmarkRuns} execução(ões) medida(s)
              </li>)}
            </ul>
          ) : <p className="mt-2 text-muted-foreground">Sem ranking comprovado nesta fonte.</p>}
          <p className="mt-2 text-muted-foreground">
            Só mede execuções do benchmark instrumentado; não compara todas as skills do catálogo.
          </p>
        </div>
        <div className="rounded border border-border p-3 text-xs">
          <h6 className="font-semibold">Conexões indiretas / cliques físicos</h6>
          <p className="mt-2 text-muted-foreground">
            NÃO MEDIDOS. Trocar de aba, focar um editor ou receber um ACK não comprova
            quantidade de conexões de rede. Contagem de cliques físicos exige sensor próprio e consentimento.
          </p>
          <p className="mt-2 font-mono text-muted-foreground">
            Último evento: {data?.lastEventAt ? new Date(data.lastEventAt).toLocaleString("pt-BR") : "—"}
          </p>
        </div>
      </div>
      <SkillUsageRealtimePanel />
      <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">
        {data?.source ?? "Casa / Desktop Commander / sem conexão de sensor"}
        {" • "}{data?.note ?? "Aguardando leitura autenticada"}
        {" • "}MCP CentralDark centralizado: ingestão E2E ainda não comprovada.
      </p>
    </section>
  );
}
