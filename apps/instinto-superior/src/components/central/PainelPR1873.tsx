import { useState } from "react";

/**
 * Read-only snapshot of PR #1873 from GitHub at HEAD 83580023745b.
 * Visual inventory only. This UI does not infer deployed capabilities from PR receipts.
 * The upstream PR links remain the source for full content and any newer changes.
 */
const ORIGEM = "https://github.com/ServerVpss/CentralDark";
const PR = `${ORIGEM}/pull/1873`;
const SHA = "83580023745bfe52c672b7907dac808703e35850";

const ARQUIVOS = [
  { area: "Agentes e operação", caminho: ".agents/skills/centraldark-operational-method/SKILL.md", resumo: "Contrato do método operacional e VISUAL FIRST" },
  { area: "Rastro e histórico", caminho: "DELTA-CONTINUO.md", resumo: "Continuidade incremental do projeto" },
  { area: "Agentes e operação", caminho: "apps/instinto-superior/AGENTS.md", resumo: "Regra UI-First no Cockpit" },
  { area: "Cockpit e Casa", caminho: "apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat", resumo: "Launcher existente do Cockpit 8080" },
  { area: "Cockpit e Casa", caminho: "apps/instinto-superior/src/components/central/CockpitShell.tsx", resumo: "Portal, Builder Bolt e Control Plane visuais" },
  { area: "Cockpit e Casa", caminho: "apps/instinto-superior/src/components/central/MapaOwners.tsx", resumo: "Mapa de owners existente" },
  { area: "Aprendizados", caminho: "docs/CONSCIENCIA/APRENDIZADOS/2026-10-19-cockpit-casa-8080-boot-persistente.md", resumo: "Aprendizado persistente do boot e porta" },
  { area: "Aprendizados", caminho: "docs/LEMBRANCAS/instinto-superior-dev-server-3000.md", resumo: "Histórico 3000/8081; contrato atual 8080" },
  { area: "Provas", caminho: "docs/PROVAS/2026-10-19-CASA-COCKPIT-REBOOT-CORRECAO-DE-PROVA.md", resumo: "Reboot ainda sem contraprova após configuração" },
  { area: "Cockpit e Casa", caminho: "scripts/casa/instinto-cockpit-autostart.ps1", resumo: "Tarefa idempotente para a porta 8080" },
] as const;

const RECIBOS = [
  [6272566782, "Recibo operacional — lote 01", "Leituras iniciais"],
  [6272768965, "SPIKE + MEDIUM — Casa e VPS", "Infraestrutura"],
  [6273038522, "Corpo Único — Claude, Forja, Apps, Main e VPS", "Arquitetura"],
  [6274053765, "GOAL-001 — primeiro handoff ao Hermes", "Delegação"],
  [6274281780, "DELTA-HANDOFF-001 — fixed point", "Delegação"],
  [6274375610, "Handoff — precondições e PowerShell", "Delegação"],
  [6274530919, "Registry e consoles na Casa", "Casa e VS Code"],
  [6274652396, "Screenpipe degradado — declaração histórica", "Sensores"],
  [6274674241, "Checkpoint — declaração histórica", "Delegação"],
  [6274694526, "Checkpoint final — declaração histórica", "Delegação"],
  [6274935769, "Caracol / Compasso — teste do gate", "Provas"],
  [6275316556, "GOAL Desktop Total — Cockpit, Bolt e TelePainel", "Arquitetura"],
  [6277004480, "VS Code — mapa, foco e porta", "Casa e VS Code"],
  [6277103612, "Porta 8080 versus histórico 8081", "Casa e VS Code"],
  [6277260744, "Cockpit 8080 — tarefa Windows persistente", "Provas"],
  [6277544041, "Portal, Admin, TelePainel e Builder", "Arquitetura"],
  [6277625643, "Garimpo da pasta Downloads", "Inventário"],
  [6277677421, "Reboot e Área Notícias — correção da prova", "Provas"],
  [6278053995, "Convergência Harness, Portal e Control Plane", "Arquitetura"],
] as const;

const MODULOS = [
  { titulo: "🌐 Portal", descricao: "Página inicial, catálogo, TelePainel, WhatsApp/CRM e financeiro", situacao: "Interface materializada" },
  { titulo: "⚡ Builder Bolt", descricao: "Entrada visual para fábrica de sites, editor, preview e projetos", situacao: "Interface materializada" },
  { titulo: "🔐 Admin / Control Plane", descricao: "Contas, Cloudflare, APIs e MCPs, cofre, bots, providers, auditoria e estado", situacao: "Interface materializada; autenticação necessária" },
  { titulo: "⚙️ Harness / Hermes", descricao: "Goals, delegação, ACK dos executores e receipts", situacao: "Delegação ponta a ponta não comprovada" },
  { titulo: "🖥️ Cockpit 8080", descricao: "Launcher e agendador Windows; HTTP 200 medido", situacao: "Boot posterior à tarefa ainda sem prova" },
  { titulo: "📟 TelePainel", descricao: "Produto independente no Portal; manter consultas e permissões", situacao: "Migração administrativa ainda pendente" },
  { titulo: "📂 Aprendizados", descricao: "Regras VISUAL FIRST, origem canônica e provas de Casa", situacao: "Registrados na branch do PR" },
  { titulo: "🧩 Builder Desktop Total", descricao: "Um executável com menus e funcionalidades existentes", situacao: "Compilação integrada não comprovada" },
] as const;

export function PainelPR1873() {
  const [aba, setAba] = useState<"produto" | "arquivos" | "recibos">("produto");
  const [busca, setBusca] = useState("");
  const filtro = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis = ARQUIVOS.filter((x) => `${x.area} ${x.caminho} ${x.resumo}`.toLocaleLowerCase("pt-BR").includes(filtro));
  const historico = RECIBOS.filter((x) => x.join(" ").toLocaleLowerCase("pt-BR").includes(filtro));

  return (
    <section aria-label="Mapa completo do PR 1873" className="rounded-xl border border-neon-blue/40 bg-background/90 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-neon-blue">🪬 PR #1873 · retrato do GitHub</p>
          <h2 className="mt-2 text-2xl font-bold">CentralDark — mapa integral da evolução</h2>
          <p className="mt-2 text-sm text-muted-foreground">Snapshot de 19/10/2026 · aberto em draft · HEAD <code>{SHA.slice(0, 12)}</code>.</p>
        </div>
        <a href={PR} target="_blank" rel="noreferrer" className="rounded-md border border-neon-blue px-4 py-2 text-sm text-neon-blue hover:bg-neon-blue/10">Abrir PR completo ↗</a>
      </div>
      <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-500">
        Documento, comentário e botão visível não comprovam integração. O PR pode mudar depois desta captura; o link do GitHub mostra o estado mais recente.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-muted/20 p-4"><strong className="text-2xl">8</strong><p className="text-xs text-muted-foreground">setores de produto e operação</p></div>
        <div className="rounded-lg border border-border bg-muted/20 p-4"><strong className="text-2xl">{ARQUIVOS.length}</strong><p className="text-xs text-muted-foreground">arquivos do diff medido</p></div>
        <div className="rounded-lg border border-border bg-muted/20 p-4"><strong className="text-2xl">{RECIBOS.length}</strong><p className="text-xs text-muted-foreground">recibos da discussão</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Conteúdo do PR">
        {([
          ["produto", "🧭 Todos os setores"],
          ["arquivos", "📁 Todos os arquivos"],
          ["recibos", "📜 Todos os recibos"],
        ] as const).map(([id, titulo]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={`rounded-md border px-3 py-2 text-sm ${aba === id ? "border-neon-blue bg-neon-blue/10" : "border-border bg-muted/20"}`}>
            {titulo}
          </button>
        ))}
      </div>
      {aba !== "produto" ? (
        <label className="mt-4 block text-xs font-semibold">
          Buscar no inventário
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, caminho ou setor"
            className="mt-2 block w-full rounded-md border border-border bg-background p-3 text-sm" />
        </label>
      ) : null}
      {aba === "produto" ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {MODULOS.map((x) => (
            <article key={x.titulo} className="rounded-lg border border-border bg-muted/10 p-4">
              <h3 className="font-semibold">{x.titulo}</h3>
              <p className="mt-2 text-sm">{x.descricao}</p>
              <p className="mt-3 text-xs text-amber-500">{x.situacao}</p>
            </article>
          ))}
        </div>
      ) : null}
      {aba === "arquivos" ? (
        <div className="mt-4 space-y-2">
          {visiveis.map((x) => (
            <article key={x.caminho} className="rounded-md border border-border p-3">
              <span className="text-xs text-neon-blue">{x.area}</span>
              <a href={`${ORIGEM}/blob/${SHA}/${x.caminho}`} target="_blank" rel="noreferrer" className="mt-1 block break-all font-mono text-xs font-semibold underline">{x.caminho} ↗</a>
              <p className="mt-1 text-sm text-muted-foreground">{x.resumo}</p>
            </article>
          ))}
          {visiveis.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum arquivo corresponde à busca.</p> : null}
        </div>
      ) : null}
      {aba === "recibos" ? (
        <div className="mt-4 space-y-2">
          {historico.map(([id, titulo, area]) => (
            <article key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
              <div><p className="text-xs text-neon-blue">{area} · #{id}</p><p className="mt-1 text-sm font-medium">{titulo}</p></div>
              <a href={`${PR}#issuecomment-${id}`} target="_blank" rel="noreferrer" className="text-xs text-neon-blue underline">Ler recibo integral ↗</a>
            </article>
          ))}
          {historico.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum recibo corresponde à busca.</p> : null}
        </div>
      ) : null}
      <p className="mt-6 text-xs text-muted-foreground">Snapshot read-only: nenhum botão executa merge, deploy, Hermes ou mudanças no PR. Fonte atual: GitHub #1873.</p>
    </section>
  );
}