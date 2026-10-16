import type { LucideIcon } from "lucide-react";
import type { Estado } from "@/lib/cockpit.functions";

/**
 * Contrato visual canônico: humano primeiro, responsabilidade explícita,
 * estado com escopo e prova, detalhes técnicos abaixo.
 * O estado sempre vem do owner medido; este cartão não coleta dados.
 */
export type EstadoCartao = Estado | "STALE/UNKNOWN";

export type ContratoCartaoResponsabilidade = {
  id?: string;
  nomeHumano: string;
  nomeTecnico: string;
  paraQueServe: string;
  responsabilidade: string;
  estado: EstadoCartao;
  escopoEstado: string;
  ownerTecnico: string;
  fonteDaProva: string;
  consultaEm: string | null;
  detalheTecnico: string;
  limiteDaProva: string;
  icone: LucideIcon;
  tecnicoAberto?: boolean;
};

function tom(estado: EstadoCartao) {
  if (estado === "PASS") return "border-neon-green/30 bg-neon-green/5 text-neon-green";
  if (estado === "RUNNING") return "border-neon-blue/30 bg-neon-blue/5 text-neon-blue";
  if (estado === "FAIL" || estado === "BLOCKED")
    return "border-destructive/40 bg-destructive/10 text-destructive";
  if (estado === "AUTH_REQUIRED") return "border-gold/30 bg-gold/5 text-gold";
  return "border-border bg-muted/40 text-muted-foreground";
}

export function CartaoResponsabilidade({
  id,
  nomeHumano,
  nomeTecnico,
  paraQueServe,
  responsabilidade,
  estado,
  escopoEstado,
  ownerTecnico,
  fonteDaProva,
  consultaEm,
  detalheTecnico,
  limiteDaProva,
  icone: Icone,
  tecnicoAberto = false,
}: ContratoCartaoResponsabilidade) {
  const dataConsulta = consultaEm ? new Date(consultaEm) : null;
  const consultaValida = dataConsulta && Number.isFinite(dataConsulta.getTime());
  return (
    <article className="panel rounded-xl p-4 sm:p-5" data-card-contract="centraldark.cockpit.responsabilidade.v1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{nomeHumano}</p>
          <h4 id={id} className="mt-1 text-base font-semibold">{nomeTecnico}</h4>
        </div>
        <Icone className="mt-1 size-5 shrink-0 text-neon-blue" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm leading-relaxed">{paraQueServe}</p>
      <p className="mt-3 text-sm">
        <strong>Responsabilidade:</strong> {responsabilidade}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full border px-2 py-1 font-mono text-[10px] ${tom(estado)}`}>
          Estado {escopoEstado}: {estado}
        </span>
      </div>
      <p className="mt-2 break-words text-xs text-muted-foreground">
        <strong>Fonte da prova:</strong> {fonteDaProva}
        {" · "}
        <strong>Consulta:</strong>{" "}
        {consultaValida ? dataConsulta.toLocaleString("pt-BR") : "SEM MEDIÇÃO CONFIRMADA"}
      </p>
      <details open={tecnicoAberto} className="mt-3 rounded-lg border border-border/70 bg-muted/20 p-3">
        <summary className="cursor-pointer text-xs font-medium">⚙️ Por baixo do capô · detalhes técnicos</summary>
        <div className="mt-3 space-y-2 break-words text-xs text-muted-foreground">
          <p><strong>Dono técnico:</strong> <code>{ownerTecnico}</code></p>
          <p><strong>Como funciona:</strong> {detalheTecnico}</p>
          <p><strong>Limite da prova:</strong> {limiteDaProva}</p>
        </div>
      </details>
    </article>
  );
}
