import type { ReactNode } from "react";

export type EstadoOperacional =
  "PASS" | "RUNNING" | "BLOCKED" | "AUTH_REQUIRED" | "UNKNOWN" | "FAIL";

const tons: Record<EstadoOperacional, string> = {
  PASS: "border-neon-green/45 bg-neon-green/10 text-neon-green",
  RUNNING: "border-neon-blue/45 bg-neon-blue/10 text-neon-blue",
  BLOCKED: "border-ember/45 bg-ember/10 text-ember",
  AUTH_REQUIRED: "border-gold/45 bg-gold/10 text-gold",
  UNKNOWN: "border-muted-foreground/40 bg-muted/50 text-muted-foreground",
  FAIL: "border-destructive/55 bg-destructive/10 text-destructive",
};

export function SeloEstado({ estado }: { estado: EstadoOperacional }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 font-mono text-[10px] ${tons[estado]}`}
    >
      {estado}
    </span>
  );
}

export function BlocoEstado({
  titulo,
  estado,
  detalhe,
  icone,
  codigo,
}: {
  titulo: string;
  estado: EstadoOperacional;
  detalhe: string;
  icone: ReactNode;
  codigo?: string;
}) {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-neon-blue">{icone}</div>
        <SeloEstado estado={estado} />
      </div>
      <h3 className="mt-4 font-semibold">{titulo}</h3>
      {codigo ? (
        <p className="mt-2 break-all font-mono text-[11px] text-foreground">{codigo}</p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{detalhe}</p>
    </article>
  );
}
