import { Activity, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useNotificationsLog, type NotificationLog } from "@/hooks/useNotificationsLog";

function provaDe(evento: NotificationLog): string {
  const prova = evento.metadata?.["proof_state"];
  return typeof prova === "string" ? prova : "UNKNOWN";
}

function ownerDe(evento: NotificationLog): string {
  const owner = evento.metadata?.["owner"];
  return typeof owner === "string" ? owner : evento.origem;
}

function estadoDe(evento: NotificationLog): "ok" | "falha" | "andamento" {
  if (evento.tipo === "erro" || evento.tipo === "critico") return "falha";
  if (evento.tipo === "sucesso") return "ok";
  return "andamento";
}

export function AtividadeAgora() {
  const { items, loading, erro, realtimeStatus } = useNotificationsLog("24h");
  const recentes = items.slice(0, 8);

  return (
    <section aria-label="Atividade agora" className="rounded-xl border border-neon-blue/30 bg-background/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Activity className="size-5 text-neon-blue" aria-hidden /> Atividade agora
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          Ledger notifications_log · ao vivo: {realtimeStatus}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        O que cada agente gravou por último, com prova. Sem registro aqui, não aconteceu para o Cockpit.
      </p>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Consultando o ledger…
        </p>
      ) : null}
      {erro ? (
        <p role="alert" className="mt-4 text-sm text-red-400">Ledger indisponível: {erro}</p>
      ) : null}
      {!loading && !erro && recentes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum evento nas últimas 24 h.</p>
      ) : null}

      <ul className="mt-4 divide-y divide-border">
        {recentes.map((evento) => {
          const estado = estadoDe(evento);
          return (
            <li key={evento.id} className="flex items-start gap-3 py-3">
              {estado === "ok" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-label="concluído" />
              ) : estado === "falha" ? (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-400" aria-label="falhou" />
              ) : (
                <Loader2 className="mt-0.5 size-4 shrink-0 text-amber-300" aria-label="em andamento" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{evento.titulo}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ownerDe(evento)} · prova: <span className="font-mono">{provaDe(evento)}</span>
                </p>
              </div>
              <time className="shrink-0 font-mono text-[11px] text-muted-foreground" dateTime={evento.created_at}>
                {new Date(evento.created_at).toLocaleTimeString("pt-BR")}
              </time>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
