import { useMemo, useState } from "react";
import { BookOpen, Boxes, Gem, Lock } from "lucide-react";
import gavetaCatalogo from "@/data/forja-gaveta.snapshot.json";

import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BIBLIOTECA,
  CRISTAL,
  PAINEIS_HISTORICOS,
  PAINEL_CENTRALDARK_FOTOS,
  VAULT,
} from "@/data/painel-unico";

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
      {itens.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}

function Cofre() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="panel p-5">
        <h4 className="font-semibold">{VAULT.raiz}</h4>
        <p className="mt-2 text-xs text-muted-foreground">{VAULT.diferenca}</p>
        <p className="mt-4 font-mono text-[10px] uppercase">Notas</p>
        <Lista itens={VAULT.notas} />
        <p className="mt-4 font-mono text-[10px] uppercase">Plugins da comunidade</p>
        <Lista itens={VAULT.pluginsComunidade} />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Menus do HUD</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {VAULT.menus.map((m) => (
            <li key={m.nome}>
              <span className="font-mono text-neon-blue">{m.nome}</span>
              <span className="text-muted-foreground"> — {m.detalhe}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] uppercase">One Heart</p>
        <Lista
          itens={[
            VAULT.oneHeart.leitura,
            `Frescor máximo ${VAULT.oneHeart.frescorSeg}s`,
            `Ordem: ${VAULT.oneHeart.ordemEndpoints.join(" → ")}`,
            VAULT.oneHeart.nota,
          ]}
        />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Pendências do Chefe</h4>
        <Lista itens={VAULT.pendenciasChefe} />
      </article>
      <article className="panel p-5">
        <h4 className="font-semibold">Pendências do agente</h4>
        <Lista itens={VAULT.pendenciasAgente} />
      </article>
    </div>
  );
}

function Cristal() {
  const c = CRISTAL.capacidades;
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{CRISTAL.pasta}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <h4 className="font-semibold">{c.total} capacidades</h4>
          <Lista
            itens={[
              `${c.EXISTING} existentes`,
              `${c.PARTIAL} parciais`,
              `${c.NEW_DELTA} deltas novos`,
              `${c.GAP} lacunas`,
              `${c.VERIFY_LIVE} a verificar ao vivo`,
            ]}
          />
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            P0 {CRISTAL.prioridades.P0} · P1 {CRISTAL.prioridades.P1} · P2 {CRISTAL.prioridades.P2}
          </p>
        </article>
        <article className="panel p-5">
          <h4 className="font-semibold">Arsenal 50</h4>
          <Lista
            itens={[
              `Pacote: ${CRISTAL.arsenal.pacote}`,
              `Evidência de runtime: ${CRISTAL.arsenal.runtime}`,
              CRISTAL.arsenal.leitura,
              `Placar ${CRISTAL.placar.antes} → ${CRISTAL.placar.depois}`,
            ]}
          />
        </article>
        <article className="panel p-5">
          <h4 className="font-semibold">Leis do Cristal</h4>
          <Lista itens={CRISTAL.leis} />
        </article>
      </div>
      <article className="panel p-5">
        <h4 className="font-semibold">Capacidades por domínio</h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CRISTAL.dominios.map(([d, n]) => (
            <li key={d} className="rounded border border-border px-2 py-1 font-mono text-[10px]">
              {d} · {n}
            </li>
          ))}
        </ul>
      </article>
      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold">Graph Agentic Lens</h4>
          <SeloEstado estado={CRISTAL.graphLens.estado} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{CRISTAL.graphLens.ativos}</p>
        <Lista itens={CRISTAL.graphLens.regras} />
        <p className="mt-3 text-xs text-muted-foreground">
          Candidato de integração, ainda fora do bundle público. Sem fonte viva do grafo, só o
          exemplo de demonstração existe.
        </p>
      </article>
    </div>
  );
}

function Biblioteca() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {BIBLIOTECA.map((g) => (
        <article key={g.grupo} className="panel p-5">
          <h4 className="font-semibold">{g.grupo}</h4>
          <Lista itens={g.itens} />
        </article>
      ))}
      <article className="panel p-5">
        <h4 className="font-semibold">Painéis CentralDark históricos</h4>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {PAINEIS_HISTORICOS.map((p) => (
            <li key={p.nome}>
              • {p.nome} — {p.tipo} <span className="font-mono text-[10px]">→ {p.destino}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function PainelHistorico() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PAINEL_CENTRALDARK_FOTOS.map((f) => (
        <article key={f.id} className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold">{f.titulo}</h4>
            <span className="font-mono text-[10px] text-muted-foreground">{f.data}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{f.nota}</p>
          <dl className="mt-3 space-y-2 text-sm">
            {f.itens.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[10px] text-gold">HISTÓRICO · não é estado atual</p>
        </article>
      ))}
    </div>
  );
}


const ITENS_POR_PAGINA = 36;
const CATEGORIAS_GAVETA = ["Todas", "Skills canônicas", "Skills MCP/Utilitários", "Arquivo histórico"] as const;
const TOTAL_SKILLS_GAVETA = gavetaCatalogo.skills.length;

/**
 * Gaveta da Forja no componente de Infraestrutura que já pertence ao Instinto.
 * Fonte: GitHub tree @SHA exato, apenas nomes e owners. Sem nova API, plugin,
 * executor, armazenamento de sessões ou coleta de credenciais.
 */
export function GavetaForja() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS_GAVETA)[number]>("Todas");
  const [pagina, setPagina] = useState(1);
  const [gavetaAberta, setGavetaAberta] = useState<string | null>(null);
  const [automacaoAberta, setAutomacaoAberta] = useState<string | null>(null);
  const [automacaoCopia, setAutomacaoCopia] = useState<"IDLE" | "COPIED" | "FAILED">("IDLE");
  const automacaoAtual = gavetaCatalogo.automation_owners.find(x => x.id === automacaoAberta);
  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const filtradas = useMemo(() => gavetaCatalogo.skills.filter(item => {
    if (categoria !== "Todas" && item.gaveta !== categoria) return false;
    return !buscaNormalizada ||
      [item.nome, item.id, item.categoria].some(parte =>
        parte.toLocaleLowerCase("pt-BR").includes(buscaNormalizada));
  }), [buscaNormalizada, categoria]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginaItens = filtradas.slice((paginaSegura - 1) * ITENS_POR_PAGINA,
    paginaSegura * ITENS_POR_PAGINA);
  const linkFonte = (caminho: string) =>
    "https://github.com/ServerVpss/CentralDark/blob/" + gavetaCatalogo.source.sha + "/" +
    caminho.split("/").map(encodeURIComponent).join("/");

  return (
    <section aria-labelledby="gaveta-forja-titulo" className="space-y-5">
      <header className="panel p-5">
        <p className="font-mono text-[10px] text-neon-blue">🎰🪡🫀🎲🫆🧠🛠️ · FORJA VIVA / ARSENAL</p>
        <h4 id="gaveta-forja-titulo" className="mt-2 text-xl font-semibold">
          Gaveta histórica · Skills · Plugins · Automações
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Inventário completo dos documentos SKILL.md rastreados na main medida.
          Catálogo é fonte documental: não significa skill instalada, carregada ou executada.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md border border-border p-3">
            <strong className="text-lg">{TOTAL_SKILLS_GAVETA}</strong>
            <p className="text-xs text-muted-foreground">SKILL.md na fonte</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <strong className="text-lg">{gavetaCatalogo.counts.skill_md_agents_active}</strong>
            <p className="text-xs text-muted-foreground">Fora do arquivo histórico em .agents</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <strong className="text-lg">{gavetaCatalogo.plugins.length}</strong>
            <p className="text-xs text-muted-foreground">Plugins registrados no Git</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <strong className="text-lg">{gavetaCatalogo.gavetas.length}</strong>
            <p className="text-xs text-muted-foreground">Gavetas de aprendizado</p>
          </div>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
          MEDIÇÃO DE FONTE: main@{gavetaCatalogo.source.sha.slice(0, 12)} ·
          {gavetaCatalogo.source.measurement} · SOURCE_ONLY
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Quando a main avançar, o snapshot anterior continua histórico até a
          atualização pelo owner da Forja. MAIN_SYNCED ≠ RUNTIME_LOADED.
        </p>
      </header>

      <section className="panel p-5" aria-labelledby="gaveta-inventario-fisico">
        <h5 id="gaveta-inventario-fisico" className="font-semibold">
          👁️ Inventário físico · Casa / VPS / MCP
        </h5>
        <p className="mt-2 text-xs text-muted-foreground">
          Leituras feitas nas rotas autorizadas. Pasta presente não prova extensão habilitada,
          skill carregada, canal conectado ou automação em execução.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-border p-3 text-sm">
            <strong>🏠 Casa SEGREDO</strong>
            <p className="mt-2 text-xs text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.casa.vscode_extension_folders} pastas de extensões VS Code;
              {" "}{gavetaCatalogo.runtime_snapshots.casa.obsidian_k_docs_plugin_folders} plugins do Obsidian em K:.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Plugins Obsidian: {gavetaCatalogo.runtime_snapshots.casa.obsidian_k_docs_plugin_names.join(" · ")}.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Restore VS Code com versões em disco: {gavetaCatalogo.runtime_snapshots.casa.vscode_restore_version_folders.join(" / ")}.
              Não somar versões da mesma extensão como capacidades novas.
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.casa.observed_at} · PRESENT_ON_DISK
            </p>
          </article>
          <article className="rounded-lg border border-border p-3 text-sm">
            <strong>🖥️ VPS · Hermes</strong>
            <p className="mt-2 text-xs text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.vps.hermes_skill_files} SKILL.md no espelho Hermes;
              {" "}{gavetaCatalogo.runtime_snapshots.vps.hermes_plugin_directories} diretórios de plugins.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Plugins: {gavetaCatalogo.runtime_snapshots.vps.hermes_plugin_names.join(" · ")}.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Sincronizado não implica carregado. Quantidade distinta de skills versionadas na main.
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.vps.observed_at} · RUNTIME_LOAD_UNKNOWN
            </p>
          </article>
          <article className="rounded-lg border border-border p-3 text-sm">
            <strong>🔌 MCP CentralDark</strong>
            <p className="mt-2 text-xs text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.mcp.catalog_tools} ferramentas no catálogo;
              {" "}{gavetaCatalogo.runtime_snapshots.mcp.catalog_routes} rotas;
              {" "}{gavetaCatalogo.runtime_snapshots.mcp.skill_listar_entries} skills utilitárias no skill_listar.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Expostas por skill_listar: {gavetaCatalogo.runtime_snapshots.mcp.skill_listar_names.join(" · ")}.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Catálogo MCP, documentos de skills e plugins físicos têm denominadores diferentes.
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {gavetaCatalogo.runtime_snapshots.mcp.observed_at} · MCP_READBACK
            </p>
          </article>
        </div>
      </section>

      <section className="panel p-5" aria-label="Pesquisar o catálogo de skills">
        <h5 className="font-semibold">🛠️ Catálogo pesquisável das skills</h5>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground" htmlFor="gaveta-forja-busca">
            Nome, categoria ou caminho
            <input id="gaveta-forja-busca" type="search" value={busca}
              onChange={event => { setBusca(event.target.value); setPagina(1); }}
              placeholder="Ex.: Hermes, MCP, memória, worktree..."
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </label>
          <label className="text-xs text-muted-foreground" htmlFor="gaveta-forja-categoria">
            Filtrar coleção
            <select id="gaveta-forja-categoria" value={categoria}
              onChange={event => {
                setCategoria(event.target.value as (typeof CATEGORIAS_GAVETA)[number]);
                setPagina(1);
              }}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
              {CATEGORIAS_GAVETA.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
            </select>
          </label>
        </div>
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          {filtradas.length} resultados · página {paginaSegura} / {totalPaginas}.
          Nenhum resultado implica falha de conexão.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {paginaItens.map(skill => (
            <article key={skill.id} className="rounded-md border border-border p-3">
              <a className="break-all text-sm font-semibold text-neon-blue underline"
                href={linkFonte(skill.id)} target="_blank" rel="noopener noreferrer">
                {skill.historico ? "🗄️" : "🛠️"} {skill.nome}
              </a>
              <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">{skill.id}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {skill.gaveta} · {skill.estado}
              </p>
            </article>
          ))}
        </div>
        {filtradas.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma skill com esse filtro no SHA inventariado.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="rounded-md border border-border px-4 py-2 text-sm"
            disabled={paginaSegura <= 1} onClick={() => setPagina(p => Math.max(1, p - 1))}>
            ← Anterior
          </button>
          <button type="button" className="rounded-md border border-border px-4 py-2 text-sm"
            disabled={paginaSegura >= totalPaginas}
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}>
            Próxima →
          </button>
        </div>
      </section>


      <section className="panel p-5" aria-labelledby="forja-automation-owners">
        <h5 id="forja-automation-owners" className="font-semibold">
          🎰🫀🧠 Automações · owners e receitas do harness
        </h5>
        <p className="mt-2 text-xs text-muted-foreground">
          {gavetaCatalogo.automation_owners.length} pontes para capacidades existentes, sem outro scheduler.
          Selecionar uma ponte exibe a receita e seu estado; copiar não significa enviar à sessão
          de Hermes ou Claude Code. Ações de escrita/build exigem executor autorizado e readback.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {gavetaCatalogo.automation_owners.map(capacidade => (
            <button key={capacidade.id} type="button"
              aria-pressed={automacaoAberta === capacidade.id}
              onClick={() => { setAutomacaoAberta(capacidade.id); setAutomacaoCopia("IDLE"); }}
              className="rounded-md border border-border p-3 text-left text-sm hover:bg-muted/30">
              <span>{capacidade.icone} {capacidade.nome}</span>
              <p className="mt-1 text-xs text-muted-foreground">{capacidade.modo} · {capacidade.estado}</p>
            </button>
          ))}
        </div>
        {automacaoAtual && (
          <div className="mt-4 space-y-2 rounded-lg border border-border p-4"
            role="region" aria-label={"Receita da automação " + automacaoAtual.nome}>
            <p className="font-semibold">{automacaoAtual.icone} {automacaoAtual.nome}</p>
            <p className="break-all font-mono text-xs">OWNER: {automacaoAtual.owner}</p>
            <p className="break-all font-mono text-xs">{automacaoAtual.receita}</p>
            <p className="text-xs text-muted-foreground">
              {automacaoAtual.estado} · {automacaoAtual.modo} · sem despacho automático
            </p>
            <a href={linkFonte(automacaoAtual.owner)}
              className="text-xs text-neon-blue underline" target="_blank"
              rel="noopener noreferrer">Consultar implementação original</a>
            <div>
              <button type="button" className="rounded-md border border-border px-3 py-2 text-xs"
                onClick={() => {
                  if (typeof navigator === "undefined" || !navigator.clipboard) {
                    setAutomacaoCopia("FAILED");
                    return;
                  }
                  void navigator.clipboard.writeText(automacaoAtual.receita)
                    .then(() => setAutomacaoCopia("COPIED"))
                    .catch(() => setAutomacaoCopia("FAILED"));
                }}>📋 Copiar receita · não executar</button>
            </div>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {automacaoCopia === "COPIED" ? "Copiada; terminal não recebeu a mensagem."
                : automacaoCopia === "FAILED" ? "Cópia indisponível; receita continua visível."
                : "Apenas seleção; requer despacho na rota real e receipt."}
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Catálogos e plugins da Forja">
        <article className="panel p-5">
          <h5 className="font-semibold">🔌 Plugins existentes · origem comprovada</h5>
          <p className="mt-2 text-xs text-muted-foreground">
            {gavetaCatalogo.plugins.length} fontes versionadas. Plugin no Git não significa instalado no Hermes,
            Obsidian ou VS Code. Extensões da Casa dependem de outra medição.
          </p>
          <ul className="mt-3 space-y-3">
            {gavetaCatalogo.plugins.map(plugin => (
              <li key={plugin.id} className="rounded-md border border-border p-3 text-sm">
                <a className="text-neon-blue underline" target="_blank" rel="noopener noreferrer"
                  href={linkFonte(plugin.id)}>{plugin.nome}</a>
                <p className="text-xs text-muted-foreground">{plugin.classe} · {plugin.estado}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            📡 Catálogo MCP medido separadamente: 141 tools / 13 rotas;
            skill_listar do MCP: 3 utilitários. Contagens não são somáveis.
          </p>
          <a target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-neon-blue underline"
            href="https://github.com/ServerVpss/CentralDark/blob/main/apps/modulos/mcp/src/tools/core/mcp-admin.js">
            Owner do catálogo MCP
          </a>
        </article>
        <article className="panel p-5">
          <h5 className="font-semibold">🗄️ Gavetas derivadas do Memory Linker</h5>
          <p className="mt-2 text-xs text-muted-foreground">
            Seis gavetas históricas de aprendizado. A quantidade de padrões vivos requer
            a leitura do owner em runtime: não é inferida da quantidade de skills.
          </p>
          <div className="mt-3 space-y-2">
            {gavetaCatalogo.gavetas.map(gaveta => (
              <div key={gaveta.nome} className="rounded-md border border-border p-3 text-sm">
                <button type="button" className="w-full text-left font-semibold"
                  aria-expanded={gavetaAberta === gaveta.nome}
                  onClick={() => setGavetaAberta(nome => nome === gaveta.nome ? null : gaveta.nome)}>
                  {gavetaAberta === gaveta.nome ? "▾" : "▸"} {gaveta.nome}
                </button>
                {gavetaAberta === gaveta.nome && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>OWNER: {gaveta.owner}</p>
                    <p>STATUS: {gaveta.status} · padrões CURRENT não consultados nesta tela.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <a target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-neon-blue underline"
            href={linkFonte("scripts/memory-linker/pattern-library.mjs")}>
            Abrir o owner das gavetas
          </a>
        </article>
      </section>

      <article className="panel p-5">
        <h5 className="font-semibold">📜 Arsenal histórico · 10 cards recuperados</h5>
        <p className="mt-2 text-xs text-muted-foreground">
          Referência de 29/06/2026 do TelePainel antigo, preservada como legado.
          Não somar estes cards aos documentos SKILL.md nem chamá-los de execução ativa.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {gavetaCatalogo.legacy.names.map(nome => (
            <span key={nome} className="rounded-md border border-border px-2 py-1 font-mono text-xs">{nome}</span>
          ))}
        </div>
        <a className="mt-3 inline-block text-xs text-neon-blue underline" target="_blank"
          rel="noopener noreferrer" href={linkFonte(gavetaCatalogo.legacy.source)}>
          Ver origem dos 10 cards históricos
        </a>
      </article>
    </section>
  );
}

export function InfraestruturaSistema() {
  return (
    <section aria-labelledby="infra-titulo">
      <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
        Inventário
      </p>
      <h3 id="infra-titulo" className="mt-3 text-3xl font-semibold">
        Infraestrutura
      </h3>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Tudo que foi reunido num só lugar: vault Obsidian, Cristal e biblioteca de documentos.
        Inventário não é prova de execução.
      </p>
      <Tabs defaultValue="gavetas" className="mt-7">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="gavetas">
            <Boxes /> Gaveta · Skills · Plugins
          </TabsTrigger>
          <TabsTrigger value="obsidian">
            <Lock /> Cofre Obsidian
          </TabsTrigger>
          <TabsTrigger value="cristal">
            <Gem /> Cristal
          </TabsTrigger>
          <TabsTrigger value="biblioteca">
            <BookOpen /> Biblioteca
          </TabsTrigger>
          <TabsTrigger value="painel">
            <Boxes /> Painel CentralDark
          </TabsTrigger>
          <TabsTrigger value="repos">
            <Boxes /> Repositórios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="gavetas" className="mt-6">
          <GavetaForja />
        </TabsContent>
        <TabsContent value="obsidian" className="mt-6">
          <Cofre />
        </TabsContent>
        <TabsContent value="cristal" className="mt-6">
          <Cristal />
        </TabsContent>
        <TabsContent value="biblioteca" className="mt-6">
          <Biblioteca />
        </TabsContent>
        <TabsContent value="painel" className="mt-6">
          <PainelHistorico />
        </TabsContent>
        <TabsContent value="repos" className="mt-6">
          <article className="panel p-5 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">ServerVpss/centraldark-instinto-superior</span> —
              corpo visual (este cockpit).
            </p>
            <p className="mt-2">
              <span className="text-foreground">ServerVpss/CentralDark</span> — autoridade de
              contratos, runtime, governança e receipts.
            </p>
          </article>
        </TabsContent>
      </Tabs>
    </section>
  );
}
