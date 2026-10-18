import { useEffect, useState } from "react";

const screenshotRows = [
  { pid: "6616", nome: "codex-windows-sandbox-service.exe" },
  { pid: "19828", nome: "codex-computer-use-swift.exe" },
  { pid: "9424", nome: "codex.exe" },
];

function estadoClasse(estado: string) {
  if (estado === "UNKNOWN") return "border-amber-500/40 text-amber-500";
  if (estado === "PASS") return "border-emerald-500/40 text-emerald-500";
  return "border-border text-muted-foreground";
}

export function ProcessosMcpPanel() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setAgora(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-labelledby="processos-mcp-title" className="mt-6 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-blue">🔎 PIDs · evidência separada</p>
          <h4 id="processos-mcp-title" className="mt-2 text-xl font-semibold">Processos observados pelo circuito MCP</h4>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            O painel não transforma screenshot em processo vivo. A leitura da Casa só fica verde quando o sensor retorna PID, nome, origem e timestamp no mesmo envelope.
          </p>
        </div>
        <span className="rounded border border-amber-500/40 px-2 py-1 font-mono text-xs text-amber-500">MCP_CONNECTION_PROVED: UNKNOWN</span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-border px-3 py-2 text-left text-xs text-muted-foreground">Screenshot da Casa · não é medição viva · capturado no fio anterior</caption>
            <thead className="bg-muted/20 text-xs text-muted-foreground"><tr><th className="px-3 py-2">PID</th><th className="px-3 py-2">Nome</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Origem</th></tr></thead>
            <tbody>{screenshotRows.map((row) => <tr key={row.pid} className="border-t border-border"><td className="px-3 py-2 font-mono">{row.pid}</td><td className="px-3 py-2 font-mono text-xs">{row.nome}</td><td className="px-3 py-2"><span className={`rounded border px-2 py-1 text-xs ${estadoClasse("UNKNOWN")}`}>UNKNOWN</span></td><td className="px-3 py-2 text-xs text-muted-foreground">SCREENSHOT_OBSERVED</td></tr>)}</tbody>
          </table>
        </div>
        <div className="space-y-3 rounded-lg border border-border p-4 text-sm">
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">LIVE_HOUSE_MEASURED</span><strong className="text-amber-500">UNKNOWN</strong></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">VPS process scan</span><strong className="text-muted-foreground">separado</strong></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Rota</span><strong className="font-mono text-xs">MCP_CASA_TO_VPS</strong></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Atualizado</span><strong className="font-mono text-xs">{agora.toLocaleString("pt-BR")}</strong></div>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">O PID SSR da VPS não entra nesta tabela. Sem sensor Casa ligado ao envelope de processos, a ausência de leitura permanece UNKNOWN.</p>
        </div>
      </div>
    </section>
  );
}
