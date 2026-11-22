import type { ReactNode } from "react";

export type EstadoOperacional =
  "PASS" | "RUNNING" | "BLOCKED" | "AUTH_REQUIRED" | "UNKNOWN" | "FAIL";

const tons: Record<EstadoOperacional, string> = {
  PASS: "border-neon-green/45 bg-neon-green/10 text-neon-green",
  RUNNING: "border-neon-blue/45 bg-neon-blue/10 text-neon-blue",
  BLOCKED: "border-ember/45 bg-ember/10 text-ember",
  AUTH_REQUIRED: "border-gold/45 bg-gold/10 text-gold motion-safe:animate-pulse motion-reduce:animate-none",
  UNKNOWN: "border-muted-foreground/40 bg-muted/50 text-muted-foreground",
  FAIL: "border-destructive/55 bg-destructive/10 text-destructive",
};

const ROTULO_ESTADO_HUMANO: Record<EstadoOperacional, string> = {
  PASS: "Funcionando",
  RUNNING: "Em andamento",
  BLOCKED: "Precisa de ação",
  AUTH_REQUIRED: "Conecte sua conta",
  UNKNOWN: "Ainda não verificado",
  FAIL: "Precisa corrigir",
};

export function rotuloEstadoHumano(estado: EstadoOperacional) {
  return ROTULO_ESTADO_HUMANO[estado];
}

export function rotuloTecnicoHumano(valor: string | null | undefined) {
  const bruto = valor?.trim();
  if (!bruto) return "Ainda não verificado";
  const chave = bruto.toUpperCase();
  const mapa: Record<string, string> = {
    PASS: "Funcionando",
    OK: "Funcionando",
    SUCCESS: "Funcionando",
    HEALTHY: "Funcionando",
    PROVEN: "Comprovado",
    READY: "Pronto",
    LIVE: "Conectado agora",
    ACTIVE: "Ativo",
    RUNNING: "Em andamento",
    WAITING_RECEIPT: "Aguardando confirmação",
    PENDING: "Aguardando",
    BLOCKED: "Precisa de ação",
    AUTH_REQUIRED: "Conecte sua conta",
    UNKNOWN: "Ainda não verificado",
    STALE: "Sem atualização recente",
    "STALE/UNKNOWN": "Sem atualização recente",
    DEGRADED: "Precisa de atenção",
    FAIL: "Precisa corrigir",
    FAILED: "Precisa corrigir",
    ERROR: "Precisa corrigir",
    EXPIRED: "Conexão vencida",
    DISABLED: "Desativado",
    INACTIVE: "Inativo",
  };
  return mapa[chave] ?? bruto;
}

export function SeloEstado({ estado }: { estado: EstadoOperacional }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-[11px] font-medium ${tons[estado]}`}
      title={`Estado técnico: ${estado}`}
      aria-label={`${ROTULO_ESTADO_HUMANO[estado]}. Estado técnico: ${estado}`}
    >
      {ROTULO_ESTADO_HUMANO[estado]}
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
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{detalhe}</p>
      {codigo ? (
        <details className="mt-3 rounded-md border border-border/70 bg-muted/20 p-2 text-xs">
          <summary className="cursor-pointer font-medium text-muted-foreground">Ver detalhes técnicos</summary>
          <p className="mt-2 break-all font-mono text-[11px] text-foreground">{codigo}</p>
        </details>
      ) : null}
    </article>
  );
}
