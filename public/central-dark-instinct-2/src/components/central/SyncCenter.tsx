import { Activity, GitCommit, GitCompare, Server } from "lucide-react";

import {
  BlocoEstado,
  SeloEstado,
  type EstadoOperacional,
} from "@/components/central/EstadoCentralDark";

type CommitCentralDark = { sha: string; mensagem: string; data: string };
type EstadoCentralDark = {
  mainSha: string | null;
  vpsSha: string | null;
  deltaVps: number | null;
  sincronizado: boolean;
  deploy: EstadoOperacional;
  commits: CommitCentralDark[];
  atualizadoEm: string | null;
  fonte: string;
};

export function SyncCenter({ estado }: { estado?: EstadoCentralDark }) {
  const deltaMedido = estado?.deltaVps !== null && estado?.deltaVps !== undefined;
  return (
    <section id="sync-center" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
            CURRENT &gt; HISTORY
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Sync Center</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Main, servidor e delta medidos sem depender do OAuth externo.
          </p>
        </div>
        <SeloEstado estado={estado?.deploy ?? "UNKNOWN"} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <BlocoEstado
          titulo="Main oficial"
          estado={estado?.mainSha ? "PASS" : "UNKNOWN"}
          codigo={estado?.mainSha ?? "Sem medição"}
          detalhe="Branch main do repositório oficial."
          icone={<GitCommit className="size-5" />}
        />
        <BlocoEstado
          titulo="Servidor vivo"
          estado={estado?.sincronizado ? "PASS" : estado?.vpsSha ? "FAIL" : "UNKNOWN"}
          codigo={estado?.vpsSha ?? "Sem medição"}
          detalhe={
            estado?.deltaVps === null || estado?.deltaVps === undefined
              ? "Delta não medido."
              : `${estado.deltaVps} commit(s) atrás da main.`
          }
          icone={<Server className="size-5" />}
        />
        <BlocoEstado
          titulo="Delta atual"
          estado={estado?.sincronizado ? "PASS" : deltaMedido ? "FAIL" : "UNKNOWN"}
          codigo={
            estado?.sincronizado
              ? "0 commits"
              : deltaMedido
                ? `+${estado?.deltaVps ?? 0} na main`
                : "UNKNOWN"
          }
          detalhe="MERGED não significa DEPLOYED."
          icone={<GitCompare className="size-5" />}
        />
      </div>
      <div className="mt-6 panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-neon-blue" />
            <h3 className="font-semibold">Commits recentes</h3>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {estado?.fonte ?? "Fonte não medida"}
          </span>
        </div>
        <ol className="mt-5 divide-y divide-border">
          {(estado?.commits ?? []).map((commit) => (
            <li key={commit.sha} className="grid gap-2 py-4 sm:grid-cols-[110px_1fr_auto]">
              <code className="font-mono text-xs text-neon-blue">{commit.sha.slice(0, 12)}</code>
              <span className="text-sm text-foreground">{commit.mensagem}</span>
              <time className="font-mono text-[10px] text-muted-foreground">
                {new Date(commit.data).toLocaleString("pt-BR")}
              </time>
            </li>
          ))}
          {!estado?.commits.length ? (
            <li className="py-6 text-sm text-muted-foreground">
              Commits recentes ainda não foram medidos.
            </li>
          ) : null}
        </ol>
        <p className="mt-4 font-mono text-[10px] text-muted-foreground">
          Medido em{" "}
          {estado?.atualizadoEm ? new Date(estado.atualizadoEm).toLocaleString("pt-BR") : "UNKNOWN"}
        </p>
      </div>
    </section>
  );
}
