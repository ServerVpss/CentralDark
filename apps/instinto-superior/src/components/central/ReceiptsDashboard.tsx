import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, AlertTriangle, BarChart3, FileCheck } from "lucide-react";
import { lerEstadoCentralDark, type Estado } from "@/lib/cockpit.functions";

/* ───────────────────────────────────────────────
   Receipt = cada ponto de conformidade medido.
   O cockpit já mede vários sinais (GitHub, VPS, API,
   Screenpipe, Actions, Receipts, Casa, Deploy, Desktop).
   Este componente agrega TODOS em um dashboard de
   percentagens: conformidade, acertos, erros, desconhecidos.
   ─────────────────────────────────────────────── */

type Classe = "pass" | "fail" | "unknown";

interface Recibo {
  nome: string;
  estado: Estado;
  classe: Classe;
  detalhe?: string;
}

function classificar(e: Estado): Classe {
  if (e === "PASS") return "pass";
  if (e === "FAIL" || e === "BLOCKED") return "fail";
  return "unknown";
}

function pct(n: number, total: number) {
  if (total === 0) return "0";
  return (Math.round((n / total) * 1000) / 10).toFixed(1);
}

const COR_CLASSE: Record<Classe, string> = {
  pass: "text-green-400",
  fail: "text-red-400",
  unknown: "text-amber-400",
};

const BG_CLASSE: Record<Classe, string> = {
  pass: "bg-green-500",
  fail: "bg-red-500",
  unknown: "bg-amber-500",
};

const ICONE_CLASSE: Record<Classe, typeof CheckCircle2> = {
  pass: CheckCircle2,
  fail: XCircle,
  unknown: AlertTriangle,
};

export function ReceiptsDashboard() {
  const ler = useServerFn(lerEstadoCentralDark);
  const q = useQuery({
    queryKey: ["centraldark", "estado-vivo"],
    queryFn: () => ler(),
    refetchInterval: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const fresco = Boolean(q.data) && !q.isError && (Date.now() - q.dataUpdatedAt < 45_000);
  const d = fresco ? q.data : null;
  const u: Estado = "UNKNOWN";

  // Monta lista de recibos a partir dos sinais medidos
  const recibos: Recibo[] = [
    { nome: "Main GitHub", estado: d?.github ?? u },
    { nome: "Deploy VPS (SHA sync)", estado: d?.deploy ?? u },
    { nome: "API CentralDark /health", estado: d?.apiHealth ?? u },
    { nome: "Casa / Site local", estado: d?.casaSite ?? u },
    { nome: "Screenpipe", estado: d?.screenpipe ?? u },
    { nome: "GitHub Actions", estado: d?.actions ?? u },
    { nome: "Receipts endpoint", estado: d?.receipts ?? u },
    { nome: "Desktop Commander", estado: d?.desktop ?? u },
  ].map((r) => ({ ...r, classe: classificar(r.estado) }));

  const total = recibos.length;
  const pass = recibos.filter((r) => r.classe === "pass").length;
  const fail = recibos.filter((r) => r.classe === "fail").length;
  const unknown = recibos.filter((r) => r.classe === "unknown").length;

  // Barra de progresso segmentada
  const pctPass = (pass / total) * 100;
  const pctFail = (fail / total) * 100;
  const pctUnknown = (unknown / total) * 100;

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface-1/80 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="size-6 text-gold" />
        <h3 className="text-lg font-bold tracking-tight">
          Recibos de Conformidade
        </h3>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {fresco ? "Medido ao vivo" : "Sem medicao"}
        </span>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <CardResumo label="Total" valor={total} cor="text-white" />
        <CardResumo label="Conformes" valor={pass} cor="text-green-400" extra={`${pct(pass, total)}%`} />
        <CardResumo label="Falhas" valor={fail} cor="text-red-400" extra={`${pct(fail, total)}%`} />
        <CardResumo label="Nao comprovado" valor={unknown} cor="text-amber-400" extra={`${pct(unknown, total)}%`} />
      </div>

      {/* Barra de conformidade */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">Nivel de conformidade</span>
          <span className="ml-auto text-sm font-bold text-green-400">{pct(pass, total)}%</span>
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-2">
          {pctPass > 0 && (
            <div className="bg-green-500 transition-all duration-500" style={{ width: `${pctPass}%` }} title={`PASS ${pct(pass, total)}%`} />
          )}
          {pctFail > 0 && (
            <div className="bg-red-500 transition-all duration-500" style={{ width: `${pctFail}%` }} title={`FAIL ${pct(fail, total)}%`} />
          )}
          {pctUnknown > 0 && (
            <div className="bg-amber-500 transition-all duration-500" style={{ width: `${pctUnknown}%` }} title={`UNKNOWN ${pct(unknown, total)}%`} />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-green-400 font-mono">PASS {pct(pass, total)}%</span>
          <span className="text-[10px] text-red-400 font-mono">FAIL {pct(fail, total)}%</span>
          <span className="text-[10px] text-amber-400 font-mono">UNKNOWN {pct(unknown, total)}%</span>
        </div>
      </div>

      {/* Tabela de recibos individuais */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-2/60 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              <th className="px-3 py-2 font-medium">Sinal</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 text-right font-medium">Conformidade</th>
            </tr>
          </thead>
          <tbody>
            {recibos.map((r) => {
              const Icone = ICONE_CLASSE[r.classe];
              return (
                <tr key={r.nome} className="border-b border-border/40 hover:bg-surface-2/30 transition-colors">
                  <td className="px-3 py-2.5 text-sm">{r.nome}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${COR_CLASSE[r.classe]}`}>
                      <Icone className="size-3.5" />
                      {r.estado}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono text-xs font-bold ${COR_CLASSE[r.classe]}`}>
                    {r.classe === "pass" ? "100%" : r.classe === "fail" ? "0%" : "?"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CardResumo({ label, valor, cor, extra }: { label: string; valor: number; cor: string; extra?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/50 p-4 text-center">
      <div className={`text-2xl font-bold font-mono ${cor}`}>{valor}</div>
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      {extra && <div className={`text-xs font-mono mt-0.5 ${cor}`}>{extra}</div>}
    </div>
  );
}
