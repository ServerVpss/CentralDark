/* #OBSERVACOES# | CENTRALDARK.HUD.PAPAGAIO_ON.MCP
 * @owner: apps/instinto-superior/src/components/central/PapagaioHudMcp.tsx
 * @doc_ref: docs/CONSCIENCIA/RECONCILIACAO-ESCOPOS-PR-20261015.md
 * @last_updated: 2026-10-16T12:19:56.233Z
 * @scope: componente apresentacional do CockpitShell existente, sem novo runtime.
 * @implementado: 7 secoes e 10 missoes em ordem; dado vivo somente de lerEstadoCentralDark.
 * @pendente: per-mission receipts do owner MCP; CI/main/deploy nao comprovados por este componente.
 * @next_cursor: medir MCP item a item, validar render mobile/desktop e regressao das 4 peles.
 */
import { SeloEstado } from "@/components/central/EstadoCentralDark";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";

const MISSOES = [
  "Sincronizar GitHub → VPS",
  "Cron automático",
  "Hermes Core ativo",
  "MCP original saudável",
  "Inventariar divergências",
  "Reconciliar 12 arquivos",
  "Validar preservação do legado",
  "Testar integração completa",
  "Microdeploy MCP aprovado",
  "Contraprova final",
] as const;

// #OBSERVACOES#: mesmo HUD, mesma ordem; a resposta da API geral não sela missões MCP.
export function PapagaioHudMcp({ medicao }: { medicao: EstadoCentralDark | null }) {
  return (
    <section aria-label="PAPAGAIO ON — HUD fixo Missão MCP" data-hud-identity="CENTRALDARK-MISSAO-MCP-10"
      className="panel mt-6 overflow-hidden border border-border bg-surface/80 p-3 shadow-deep sm:p-6">
      <details open className="group">
        <summary className="cursor-pointer list-none rounded-lg border-b border-border p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green">
          <span className="block font-mono text-xs uppercase tracking-widest text-neon-green">🦜 PAPAGAIO ON · HUD FIXO / FIEL</span>
          <span className="mt-1 block text-lg font-semibold sm:text-2xl">CENTRALDARK / MISSÃO MCP</span>
          <span className="mt-2 block text-xs text-muted-foreground">
            {medicao ? "Sensores do Cockpit: " + new Date(medicao.atualizadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Sensores sem medição recente · UNKNOWN"}
            {" · " }Toque para recolher/expandir
          </span>
        </summary>

        <div className="mt-3 space-y-3">
          <section aria-labelledby="mcp-placar" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-placar" className="font-semibold">01 · PLACAR GERAL</h4>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <strong className="text-4xl text-neon-green">50%</strong>
              <span className="text-xs text-muted-foreground">Referência histórica · 13/10/2026 · NÃO é o progresso atual</span>
            </div>
            <div role="img" aria-label="Progresso histórico: cinco de dez missões" className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 bg-neon-green/70" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">5 concluídas · 2 em andamento · 3 pendentes (histórico). MCP atual: <b className="text-foreground">UNKNOWN</b>.</p>
          </section>

          <section aria-labelledby="mcp-missoes" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-missoes" className="font-semibold">02 · MAPA DAS MISSÕES / ORDEM ORIGINAL</h4>
            <ol className="mt-3 divide-y divide-border/60">
              {MISSOES.map((missao, indice) => (
                <li key={missao} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0 break-words"><span className="mr-3 font-mono text-muted-foreground">{String(indice + 1).padStart(2, "0")}</span>{missao}</span>
                  <span className="shrink-0 rounded border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">SEM READBACK</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-amber-400">Estados individuais não reclassificados sem receipts do owner MCP.</p>
          </section>

          <section aria-labelledby="mcp-raiox" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-raiox" className="font-semibold">03 · RAIO-X DA CENTRALDARK</h4>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <a href="https://github.com/ServerVpss/CentralDark/pull/1835" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-neon-green">PR #1835 · Esmeralda metálica ↗</a>
              <a href="https://github.com/ServerVpss/CentralDark/pull/1836" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-neon-green">PR #1836 · Rastro + selo ↗</a>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">PRs abertas na medição de 16/10. Abra os links para conferir a situação atual.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span>GitHub main <SeloEstado estado={medicao?.github ?? "UNKNOWN"} /></span>
              <span>VPS/deploy <SeloEstado estado={medicao?.deploy ?? "UNKNOWN"} /></span>
              <span>API <SeloEstado estado={medicao?.apiHealth ?? "UNKNOWN"} /></span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Sinais vivos: Cockpit existente / lerEstadoCentralDark. PRs: referências históricas, sem polling por PR.</p>
          </section>

          <section aria-labelledby="mcp-chefoes" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-chefoes" className="font-semibold">04 · CHEFÕES</h4>
            <p className="mt-2 text-xs text-muted-foreground">Snapshot GitHub de 16/10/2026 — requer nova consulta para status atual.</p>
            <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>porta-de-entrada · #1835 / #1836</span><span className="text-destructive">FAIL · histórico</span></p>
            <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>CentralDark Valida · #1835 / #1836</span><span className="text-destructive">FAIL · histórico</span></p>
          </section>

          <section aria-labelledby="mcp-provas" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-provas" className="font-semibold">05 · RADAR DE PROVAS</h4>
            <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>lupa-conformance · #1835 / #1836</span><span className="text-neon-green">PASS · histórico</span></p>
            <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span>PR Title Contract · #1835 / #1836</span><span className="text-neon-green">PASS · histórico</span></p>
            <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span>Grafo Vivo · sensor atual</span><SeloEstado estado={medicao?.grafoVivo ?? "UNKNOWN"} /></p>
            <p className="mt-2 text-xs text-muted-foreground">Luz verde de CI histórico não equivale a entrega MCP nem deploy.</p>
          </section>

          <section aria-labelledby="mcp-cursor" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-cursor" className="font-semibold">06 · PRÓXIMA JOGADA</h4>
            <p className="mt-2 text-sm">Diagnosticar CI no mesmo SHA, reconciliar 12 arquivos, validar MCP/VPS e preservar o legado.</p>
            <p className="mt-2 text-xs text-amber-400">Promover só depois de prova, contraprova, receipt e ganho demonstrado.</p>
          </section>

          <section aria-labelledby="mcp-vitoria" className="rounded-xl border border-border/70 bg-background/65 p-4">
            <h4 id="mcp-vitoria" className="font-semibold">07 · VITÓRIA</h4>
            <p className="mt-2 text-sm text-amber-400">FIXED_POINT parcial (histórico). Selo global/deploy: NÃO COMPROVADO.</p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">MESMO HUD · MESMAS 10 MISSÕES · SÓ EVOLUÇÃO COMPROVADA.</p>
          </section>
        </div>
      </details>
    </section>
  );
}
