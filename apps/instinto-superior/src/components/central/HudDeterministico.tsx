import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { consultarRegressaoGenesis, dispararRegressaoGenesis } from "@/lib/admin.functions";
import lineageJson from "../../../../../docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
import { GavetaForja } from "@/components/central/InfraestruturaSistema";
import hudMigrationSnapshot from "@/data/hud-migration.snapshot.json";

type Node = {
  uid: string;
  title: string;
  prev_uid: string | null;
  next_uid: string | null;
  legacy_learning_number: number;
};
type Lineage = {
  genesis: Node;
  nodes: Node[];
  source_blob_sha: string;
  audit: { learning_sections: number; missing_legacy_numbers: number[] };
};
const lineage = lineageJson as Lineage;
const nodes = [lineage.genesis, ...lineage.nodes];
const required = ["owner", "scope", "proof-key", "source-sha", "receipt", "readback", "observed-at", "next-cursor"] as const;
const historicalSeals = [
  "VPS Auto-Sync", "gh CLI VPS", "SSH Casa → VPS", "GitHub Fonte Canônica",
  "Tailscale Mesh", "SHARED.zip Vault", "AionUI VPS", "CAS Cloud VPS",
  "Hermes Desktop → Cockpit", "Screenpipe Casa", "HUD Corpo Único",
  "One Heart VPS", "Runtime / Modelo VPS", "Hermes WebUI", "MCP CentralDark",
] as const;


type ForgeAlias = Readonly<{
  id: string;
  symbols: string;
  name: string;
  owner: string;
  invocation: string;
  effect: string;
  improvement: string;
  proof: string;
  readonly: boolean;
}>;
const forgeAliases: readonly ForgeAlias[] = [
  {
    id: "DIAGNOSTICAR", symbols: "🔧 🪛", name: "Diagnóstico sem mutação",
    owner: "skills/vs-code-restore/SKILL.md",
    invocation: "CentralDark: Mostrar Trace (Saída)",
    effect: "Focar a trilha sanitizada já existente e identificar sinal, origem e bloqueio.",
    improvement: "Reutiliza a extensão/saída original, sem novo log bruto ou coletor.",
    proof: "Evento nativo e ACK no funil; comando da paleta instalado não implica ativação.",
    readonly: true,
  },
  {
    id: "MANUTENCAO", symbols: "🛠️ 👨🏻‍🔧", name: "Manutenção com owner único",
    owner: ".agents/skills/centraldark-operational-method/SKILL.md",
    invocation: "!CENTRALDARK",
    effect: "Recuperar missão, owner, testes, bloqueios e próximo cursor antes de intervir.",
    improvement: "Evita consertar duas vezes e não altera checkout com trabalho em andamento.",
    proof: "Receipt com causa, teste, readback e NEXT_CURSOR.",
    readonly: true,
  },
  {
    id: "OLHO", symbols: "👀 👁️", name: "Olho e contraprova",
    owner: "apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx",
    invocation: "!calibrar",
    effect: "Comparar fontes Casa/VPS/CI e separar SOURCE, BUILD, INSTALLED e UI.",
    improvement: "O mesmo painel de observabilidade sustenta os selos, sem sinais inventados.",
    proof: "Resposta autorizada com horário, origem e contraprova real.",
    readonly: true,
  },
  {
    id: "LINHAGEM", symbols: "🪡 🎄", name: "Aprendizado e costura de UID",
    owner: "docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json",
    invocation: "#acordar",
    effect: "Retomar Gênesis, aprendizagem, selos e recibos pelo UID original.",
    improvement: "Preserva IDs históricos e evita duplicar cadeados e receitas já seladas.",
    proof: "Prev/next íntegros e receita canônica; replay documental não é execução.",
    readonly: true,
  },
  {
    id: "ANTECIPACAO", symbols: "🌞 🌟 ✨", name: "Outra melhoria antecipada",
    owner: ".agents/skills/centraldark-operational-method/SKILL.md",
    invocation: "#acordar → !calibrar → !CENTRALDARK",
    effect: "Recuperar contexto, identificar delta útil e continuar o owner autorizado.",
    improvement: "Reduz redescoberta após boot/chat sem criar executor independente.",
    proof: "Comparar a última prova ao CURRENT e registrar só a novidade verificável.",
    readonly: true,
  },
  {
    id: "FORJA_PACOTE", symbols: "☄️ 🔥 ⚒️", name: "Forja e plug-and-play",
    owner: "apps/instinto-superior/package.json",
    invocation: "npm run build:plugplay",
    effect: "Rodar teste de paridade, build existente e empacotar saída filtrada com manifesto e SHA256.",
    improvement: "Uma identidade de pacote e receita compilável, sem publicar nem limpar checkout vivo.",
    proof: "Exit 0 de teste/build, ZIP validado e SHA; instalação/deploy exigem prova separada.",
    readonly: false,
  },
  {
    id: "WORKTREE_CLEANUP", symbols: "🧹", name: "Faxina segura da Forja",
    owner: ".agents/skills/main-pinned-runtime-fast-path/SKILL.md",
    invocation: "Consulte o owner main-pinned-runtime-fast-path → Worktree Teardown; não execute reset/clean diretamente",
    effect: "Inventariar o scratch reutilizável, comprovar preservação do trabalho e só então liberar a bancada temporária.",
    improvement: "Mantém a Forja organizada, sem apagar worktrees ativas, commits locais ou arquivos que ainda não chegaram à main.",
    proof: "Classificação do path, lock, source SHA, testes, receipt, main readback quando aplicável e efeito visual Casa quando solicitado.",
    readonly: true,
  },
] as const;

/** Reaproveita o zone do Instinto Superior; não cria outro HUD ou executor. */
export function HudDeterministico({ estado, atualizar }: { estado?: EstadoCentralDark; atualizar?: () => void }) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [genesisCopy, setGenesisCopy] = useState<"IDLE" | "COPIED" | "FAILED">("IDLE");

  const lerRegressao = useServerFn(consultarRegressaoGenesis);
  const dispararRegressao = useServerFn(dispararRegressaoGenesis);
  const [regressaoBusy, setRegressaoBusy] = useState(false);
  const [regressaoErro, setRegressaoErro] = useState<string | null>(null);
  const [regressao, setRegressao] = useState<{
    state: string; reason: string; mainSha: string | null;
    workflowSha: string | null; runUrl: string | null;
    build: string; install: string; connect: string; prove: string;
    observedAt: string;
  } | null>(null);

  async function executarRegressaoGenesis(acao: "consultar" | "disparar") {
    setRegressaoBusy(true);
    setRegressaoErro(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) {
        setRegressaoErro("AUTH_REQUIRED · entre como administrador.");
        return;
      }
      const request = { headers: { Authorization: "Bearer " + token } };
      const receipt = acao === "disparar"
        ? await dispararRegressao(request)
        : await lerRegressao(request);
      setRegressao(receipt);
    } catch {
      setRegressaoErro("UNKNOWN · execução ou consulta não comprovada. Verifique o GitHub Actions.");
    } finally {
      setRegressaoBusy(false);
    }
  }

  const [forgeSelected, setForgeSelected] = useState<string | null>(null);
  const [legadoBusca, setLegadoBusca] = useState("");
  const [legadoAba, setLegadoAba] = useState("todos");
  const [legadoTipo, setLegadoTipo] = useState("controles");
  const [legadoPagina, setLegadoPagina] = useState(1);
  const [legadoSelecionado, setLegadoSelecionado] = useState<string | null>(null);
  const legadoRegistros = useMemo(() => (legadoTipo === "controles"
    ? hudMigrationSnapshot.controls : hudMigrationSnapshot.sections)
    .filter(registro =>
      (legadoAba === "todos" || registro.aba === legadoAba) &&
      (!legadoBusca.trim() || [registro.titulo, registro.id, registro.owner]
        .some(campo => campo.toLocaleLowerCase("pt-BR")
          .includes(legadoBusca.trim().toLocaleLowerCase("pt-BR"))))), [
    legadoAba, legadoBusca, legadoTipo,
  ]);
  const legadoTotalPaginas = Math.max(1, Math.ceil(legadoRegistros.length / 20));
  const legadoPaginaAtual = Math.min(legadoPagina, legadoTotalPaginas);
  const legadoVisiveis = legadoRegistros.slice((legadoPaginaAtual - 1) * 20, legadoPaginaAtual * 20);
  const legadoAtual = legadoRegistros.find(registro => registro.id === legadoSelecionado);

  const [forgeCopy, setForgeCopy] = useState<"IDLE" | "COPIED_NOT_EXECUTED" | "COPY_FAILED">("IDLE");
  const chosenForge = forgeAliases.find(action => action.id === forgeSelected);
  const integrity = useMemo(() => nodes.every((n, i) =>
    i === 0 ? n.uid === "L000" && n.prev_uid == null :
    n.prev_uid === nodes[i - 1].uid && nodes[i - 1].next_uid === n.uid
  ) && nodes.at(-1)?.next_uid === "PENDING_NEXT_CURSOR", []);
  useEffect(() => {
    if (!playing || !integrity) return;
    const id = window.setInterval(() => {
      setCursor(previous => {
        if (previous >= nodes.length - 1) { setPlaying(false); return previous; }
        return previous + 1;
      });
    }, 180);
    return () => window.clearInterval(id);
  }, [playing, integrity]);
  const item = nodes[cursor];
  const done = integrity && cursor === nodes.length - 1;
  const selectedNode = nodes.find(node => node.uid === selected);
  const recipe = selectedNode ? [
    "INTENCAO=NEUROLINK_OPERACIONAL",
    "UID=" + selectedNode.uid,
    "PREV=" + (selectedNode.prev_uid ?? "GENESIS"),
    "NEXT=" + (selectedNode.next_uid ?? "PENDING_NEXT_CURSOR"),
    "OWNER=HERMES_EXISTENTE",
    "ESTADO=SOLICITACAO_NAO_ENVIADA",
    "CRITERIO=READBACK_RECEIPT_CONTRAPROVA"
  ].join("; ") : "";
  return (
    <section className="space-y-6" aria-label="HUD histórico integrado, selos e Gênesis">
      <header className="panel p-6">
        <p className="text-xs text-neon-blue">HUD CANÔNICO → ZONE EXISTENTE</p>
        <h2 className="mt-2 text-2xl font-semibold">Selos · Cadeados · Gênesis</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Capacidades documentais transferidas ao Instinto Superior. O arquivo docs/HUD/HUD.html
          permanece como referência. Replay documental não é execução, deploy ou selo operacional.
        </p>
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          PARIDADE PARCIAL · Fonte NeuroLink: {lineage.audit.learning_sections} aprendizados
          e Gênese L000. Migração de todos os sensores do HUD: em andamento.
        </p>
      </header>
      {/* Incremento 2026-10-16: ingress observável, sem atribuir sessão por adivinhação.
          Contrato: UNIVERSAL-ENGINE-METHOD.yml#sol_chat_entrypoint_handoff_2026_10_16
          O chat é entrada nesta missão; a interface só exibe fatos do snapshot real. */}
      <section className="panel p-6" aria-labelledby="cd-ingress-live">
        <h3 id="cd-ingress-live" className="text-lg font-semibold">🪬 Porta de entrada · coordenação e execução</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          SOL/JARVIS coordena esta missão por meio do chat. A sessão ativa,
          o writer e o executor somente podem ser declarados pelo owner em runtime.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["Entrada desta missão", "SOL/JARVIS · contrato", "Não é sessão autenticada do cockpit"],
            ["Intenção atual", "UNKNOWN", "Nenhum campo de intenção fornecido pelo snapshot"],
            ["Owner de observação", "cockpit.functions.ts", "Snapshot do mesmo cockpit"],
            ["Writer ativo", "UNKNOWN", "A leitura não informa lease de escrita"],
            ["Executor ativo", "UNKNOWN", "Não presumir Hermes/Claude sem recibo"],
            ["Receita em uso", "UNKNOWN", "Contrato não prova execução"],
            ["Última evidência", estado?.atualizadoEm ?? "UNKNOWN", "Timestamp do snapshot, não do executor"],
            ["NEXT_CURSOR", estado?.nextCursor ?? "UNKNOWN", "Continuação conforme owner medido"],
          ] as const).map(([rotulo, valor, ressalva]) => (
            <div key={rotulo} className="rounded-md border border-border p-3">
              <dt className="text-xs font-semibold">{rotulo}</dt>
              <dd className="mt-1 break-words font-mono text-xs">{valor}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">{ressalva}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="panel p-6" aria-labelledby="cd-genesis-title">
        <div className="flex flex-wrap justify-between gap-3">
          <h3 id="cd-genesis-title" className="text-lg font-semibold">🪬 Gênesis → Fixed Point</h3>
          <span className="text-xs text-muted-foreground" role="status">
            {integrity ? (done ? "REPLAY DOCUMENTAL PASS" : "CONTINUIDADE DOCUMENTAL") : "BLOCKED_UID_INTEGRITY"}
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl text-gold" aria-live="polite">{item.uid}</p>
        <p className="mt-2 text-sm">{item.title}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {item.prev_uid ?? "GÊNESE"} → {item.uid} → {item.next_uid}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"
          aria-label="Continuidade documental NeuroLink" aria-valuemin={0}
          aria-valuemax={nodes.length - 1} aria-valuenow={cursor}>
          <div className="h-full bg-neon-green" style={{ width: ((cursor / Math.max(1, nodes.length - 1)) * 100) + "%" }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {cursor} / {nodes.length - 1} elos · UIDs preservados, inclusive duplicatas e lacunas históricas.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button disabled={!integrity || done} onClick={() => setPlaying(true)}>▶ Reproduzir</Button>
          <Button variant="outline" disabled={!integrity || done} onClick={() => { setPlaying(false); setCursor(i => Math.min(i + 1, nodes.length - 1)); }}>Uma batida</Button>
          <Button variant="outline" onClick={() => setPlaying(false)}>Pausar</Button>
          <Button variant="outline" onClick={() => { setPlaying(false); setCursor(0); setSelected(null); }}>Voltar à Gênese</Button>
          <Button variant="outline" onClick={() => { setSelected(item.uid); setGenesisCopy("IDLE"); }}>Receita do UID</Button>
        </div>
        {selectedNode && (
          <div className="mt-5 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Hermes tipado · missão preparada</p>
            <code className="mt-2 block break-all text-xs">{recipe}</code>
            <p className="mt-2 text-xs text-muted-foreground">
              Somente prévia determinística, disponível sem IA. Nenhuma tarefa foi enviada
              ou executada. O despacho real deve utilizar o Hermes Gateway autorizado.
            </p>
            <Button className="mt-3" variant="outline" onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                void navigator.clipboard.writeText(recipe)
                  .then(() => setGenesisCopy("COPIED"))
                  .catch(() => setGenesisCopy("FAILED"));
              }
            }}>Copiar missão tipada</Button>
            <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
              {genesisCopy === "COPIED" ? "Missão copiada; nada foi enviado ao Hermes."
                : genesisCopy === "FAILED" ? "Falha ao copiar; receita continua visível, sem despacho."
                : "Cópia pendente de clique; sessão Hermes não vinculada nesta interface."}
            </p>
          </div>
        )}
      </section>
      <section className="panel p-6" aria-labelledby="cd-seals-title">
        <h3 id="cd-seals-title" className="text-lg font-semibold">🔒 Cadeados históricos · sem duplicação</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {historicalSeals.length} nomes recuperados do HUD legado. São registros históricos,
          não selos de runtime promovidos automaticamente.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {historicalSeals.map(name => (
            <div key={name} className="rounded-md border border-border px-3 py-2 text-sm">
              <strong>{name}</strong>
              <p className="text-xs text-muted-foreground">HISTÓRICO · CURRENT exige readback</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Novo selo só é permitido com: {required.join(" · ")}.
          Selar não dispara nova execução e não renumera Gênesis.
        </p>
      </section>
      <section className="panel p-6" aria-labelledby="cd-integridade-estado">
        <p className="font-mono text-[10px] text-neon-blue">👁️🪡 CURRENT REALITY · PROJEÇÃO DO OWNER</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h3 id="cd-integridade-estado" className="text-lg font-semibold">🫀 Central de Integridade · Compasso Único</h3>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground" role="status">
            {estado?.atualizadoEm ? "Medido: " + estado.atualizadoEm : "MEDIÇÃO NÃO DISPONÍVEL"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          O CHEFE decide · Hermes executa · a Lupa faz a contraprova. Tudo deriva da consulta já usada
          pelo cockpit: sem segundo sensor, sem nova arquitetura e sem verde por aparência.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["🐙 GitHub / main", estado?.github, estado?.mainSha?.slice(0, 12), "Referência do HEAD medido; CI do mesmo HEAD ainda exige prova."],
            ["🖥️ VPS / deploy", estado?.deploy, estado?.vpsSha?.slice(0, 12), "Deploy e alinhamento com main exigem readback próprio."],
            ["🔌 API CentralDark", estado?.apiHealth, estado?.apiHealthHttp, "Saúde da rota não equivale à saúde de todo o sistema."],
            ["🏠 Site local", estado?.casaSite, estado?.casaSiteHttp, "Disponibilidade HTTP não comprova o deploy visual."],
            ["👁️ Screenpipe Casa", estado?.screenpipe, estado?.screenpipeHttp, "Sensor de observação; não tem autoridade de escrita."],
            ["🧾 Receipts", estado?.receipts, estado?.receiptsHttp, "Endpoint acessível não comprova receipt por artefato."],
          ] as const).map(([nome, situacao, detalhe, limite]) => (
            <div key={nome} className="min-w-0 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">{nome}</h4>
                <span className={"rounded-full border px-2 py-1 font-mono text-xs " +
                  (situacao === "PASS" ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" :
                    situacao === "FAIL" || situacao === "BLOCKED" ? "border-red-500/50 text-red-600 dark:text-red-400" :
                    "border-amber-500/50 text-amber-700 dark:text-amber-400")}
                  aria-label={"Estado de " + nome + ": " + (situacao ?? "UNKNOWN")}>
                  {situacao ?? "UNKNOWN"}
                </span>
              </div>
              <p className="mt-2 break-all font-mono text-xs text-foreground">
                {detalhe ?? "SEM READBACK NESTA CONSULTA"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{limite}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold">🧭 Gatilhos · mesma intenção, mesmo owner</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              !CENTRALDARK → retomar missão · #ACORDAR → recuperar contexto ·
              !CALIBRAR → confrontar evidências · #CRISTALIZAR → registrar delta útil.
              São receitas de governança; este painel não envia comandos.
            </p>
            <p className="mt-3 break-all font-mono text-xs">
              OWNER: apps/instinto-superior/src/lib/cockpit.functions.ts
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              FONTE: {estado?.fonte ?? "UNKNOWN"} · valor observado no mesmo snapshot do cockpit.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold">🔒 Cadeado de conclusão · não presumido</h4>
            <p className="mt-2 font-mono text-xs text-amber-700 dark:text-amber-400" role="status">
              LOCK_ENFORCEMENT = UNKNOWN · CI_EXACT_HEAD = UNKNOWN
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Um arquivo aprovado só fica protegido de edição quando houver gate de escrita
              comprovado, SHA do objeto, testes, contraprova e receipt. Selos documentais,
              botão verde ou main medida não concedem proteção real.
            </p>
            <p className="mt-3 text-xs">
              <strong>NEXT_CURSOR:</strong>{" "}
              <span className="break-words text-muted-foreground">
                {estado?.nextCursor ?? "UNKNOWN · nenhuma continuação publicada por esta consulta"}
              </span>
            </p>
          </div>
        </div>
      </section>
      <section className="panel p-6" aria-labelledby="cd-daily-title">
        <h3 id="cd-daily-title" className="text-lg font-semibold">
          📋 Check-list diário · projeção do owner existente
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sinais do mesmo estado do cockpit, sem outro coletor. O histórico canônico está em
          docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md; nenhum item é selado ao abrir a tela.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ["GitHub main", estado?.github, estado?.mainSha?.slice(0, 12)],
            ["API CentralDark", estado?.apiHealth, estado?.apiHealthHttp],
            ["VPS / deploy", estado?.deploy, estado?.vpsSha?.slice(0, 12)],
            ["Screenpipe Casa", estado?.screenpipe, estado?.screenpipeHttp],
            ["Desktop Commander Casa", estado?.desktop, "Conector remoto · não é o Hermes Desktop"],
            ["Hermes Desktop", "UNKNOWN", "Sem sensor Hermes nesta consulta; fechado por escolha = NOT_REQUIRED"],
            ["Receipts", estado?.receipts, estado?.receiptsHttp],
          ] as const).map(([nome, resultado, detalhe]) => (
            <div key={nome} className="rounded-md border border-border px-3 py-3">
              <dt className="text-sm font-semibold">{nome}</dt>
              <dd className="mt-1 font-mono text-xs text-muted-foreground">
                {resultado ?? "UNKNOWN"} · {detalhe ?? "Sem contraprova nesta consulta"}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          API HTTP 200, presença de processo ou tarefa fechada por escolha não comprovam
          o funcionamento de todo o sistema. Integridade e selagem exigem recibo individual.
        </p>
        <a className="mt-3 inline-block text-sm text-neon-blue underline" target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/ServerVpss/CentralDark/blob/main/docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md">
          Abrir checklist diário canônico · histórico e receitas
        </a>
      </section>

      <section className="panel p-6" aria-labelledby="cd-forge-aliases-title">
        <p className="font-mono text-[10px] text-neon-blue">FIXED_POINT preservado · atalhos por capacidade</p>
        <h3 id="cd-forge-aliases-title" className="mt-2 text-lg font-semibold">
          🔧🛠️👨🏻‍🔧 👀👁️🪡🎄🌞🌟✨☄️🔥🪛⚒️🧹 Forja Viva
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha um símbolo para consultar a receita do owner. Selecionar ou copiar
          não dispara shell, tarefas, merges, instalações ou deploys. Zoom usa os controles
          nativos existentes do VS Code e do navegador.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {forgeAliases.map(action => (
            <Button
              key={action.id}
              type="button"
              variant={forgeSelected === action.id ? "default" : "outline"}
              onClick={() => { setForgeSelected(action.id); setForgeCopy("IDLE"); }}
              aria-pressed={forgeSelected === action.id}
              className="h-auto justify-start whitespace-normal text-left"
              title={action.name}
            >
              <span aria-hidden>{action.symbols}</span>
              <span>{action.name}</span>
            </Button>
          ))}
        </div>
        {chosenForge?.id === "WORKTREE_CLEANUP" && (
          <div className="mt-4 rounded-lg border border-border p-4" role="region"
            aria-label="Checklist seguro da faxina de worktree">
            <h4 className="text-sm font-semibold">🧹 CHECKLIST · receita do owner existente</h4>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
              <li>Classificar OWNER, escopo, worktree, lock e realpath. Worktree ativa permanece.</li>
              <li>Inventariar staged, unstaged, arquivos untracked e commits só locais.</li>
              <li>Concluir teste, contraprová-lo e registrar receipt com SHA e arquivos.</li>
              <li>Confirmar publicação na main e readback do efeito quando aplicável.</li>
              <li>Quando o CHEFE quiser ver: build e prova visual na Casa existente.</li>
              <li>Atualizar o checklist diário CURRENT do HUD com provas, sem duplicar histórico.</li>
              <li>Somente com tudo preservado: limpar o scratch descartável sob lock e verificar novamente.</li>
            </ol>
            <p className="mt-3 text-xs" role="status">
              Estado de limpeza desta interface: UNKNOWN · nenhuma faxina foi executada por este botão.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Um scratch por escopo quando adequado; escritores independentes mantêm isolamento.
              Ausência de receipt, arquivo único ou dúvida = KEEP_ACTIVE.
            </p>
          </div>
        )}
        {chosenForge && (
          <div className="mt-5 space-y-3 rounded-lg border border-border p-4" role="region"
            aria-label={"Receita selecionada: " + chosenForge.name}>
            <h4 className="text-base font-semibold">{chosenForge.symbols} {chosenForge.name}</h4>
            <p className="text-sm"><strong>O que faz:</strong> {chosenForge.effect}</p>
            <p className="text-sm"><strong>Por que melhora:</strong> {chosenForge.improvement}</p>
            <p className="break-all font-mono text-xs">OWNER: {chosenForge.owner}</p>
            <p className="break-all font-mono text-xs">RECEITA: {chosenForge.invocation}</p>
            <p className="text-xs text-muted-foreground"><strong>Prova exigida:</strong> {chosenForge.proof}</p>
            <p className="text-xs text-muted-foreground" role="status">
              {chosenForge.readonly ? "RECEITA SOMENTE LEITURA" : "EXECUÇÃO PENDENTE DE OPERADOR"}
              {" · "}SOURCE_DEFINED · RUNTIME_NOT_PROVEN
            </p>
            <Button type="button" variant="outline" onClick={() => {
              if (!navigator.clipboard) { setForgeCopy("COPY_FAILED"); return; }
              void navigator.clipboard.writeText(chosenForge.invocation)
                .then(() => setForgeCopy("COPIED_NOT_EXECUTED"))
                .catch(() => setForgeCopy("COPY_FAILED"));
            }}>Copiar receita · não executar</Button>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {forgeCopy === "COPIED_NOT_EXECUTED" ? "Copiado; nada foi executado."
                : forgeCopy === "COPY_FAILED" ? "Cópia não disponível; texto acima continua visível."
                : "Copiar é opcional. Execução requer autorização, owner e contraprova."}
            </p>
          </div>
        )}
      </section>

      <section className="panel p-6" aria-labelledby="cd-hud-legacy-owner-inventory">
        <p className="font-mono text-[10px] text-neon-blue">🪡🫀 MAPA DE ABSORÇÃO · SEM OUTRO HUD</p>
        <h3 id="cd-hud-legacy-owner-inventory" className="mt-2 text-lg font-semibold">
          Inventário integral do HUD original por owner
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          O arquivo legado foi varrido por estrutura: {hudMigrationSnapshot.counts.sections} títulos,
          {" "}{hudMigrationSnapshot.counts.controls} controles identificados com seletores e
          {" "}{hudMigrationSnapshot.counts.tabs} abas. O inventário não afirma que tudo já foi migrado.
          Cada registro mostra sua origem e o owner que precisa fornecer a ação real.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" type="button" disabled={!atualizar} onClick={atualizar}>
            👀 Atualizar estado do cockpit
          </Button>
          <a className="self-center text-xs text-neon-blue underline" target="_blank"
            rel="noopener noreferrer"
            href={"https://github.com/ServerVpss/CentralDark/blob/" +
              hudMigrationSnapshot.source.main_sha + "/docs/HUD/HUD.html"}>
            Fonte original · {hudMigrationSnapshot.source.blob_sha.slice(0, 12)}
          </a>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground" htmlFor="hud-legado-busca">
            Buscar capacidade ou owner
            <input id="hud-legado-busca" type="search" value={legadoBusca}
              onChange={e => { setLegadoBusca(e.target.value); setLegadoPagina(1); setLegadoSelecionado(null); }}
              placeholder="MCP, Tailscale, Afterburner..."
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground" />
          </label>
          <label className="text-xs text-muted-foreground" htmlFor="hud-legado-tipo">
            Tipo de inventário
            <select id="hud-legado-tipo" value={legadoTipo}
              onChange={e => { setLegadoTipo(e.target.value); setLegadoPagina(1); setLegadoSelecionado(null); }}
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground">
              <option value="controles">Botões / controles</option>
              <option value="secoes">Seções e funcionalidades</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground" htmlFor="hud-legado-aba">
            Aba de origem
            <select id="hud-legado-aba" value={legadoAba}
              onChange={e => { setLegadoAba(e.target.value); setLegadoPagina(1); setLegadoSelecionado(null); }}
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground">
              {["todos", "global", "hud", "mapa", "forja", "operacao"].map(x =>
                <option key={x} value={x}>{x.toUpperCase()}</option>)}
            </select>
          </label>
        </div>
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          {legadoRegistros.length} itens neste filtro · página {legadoPaginaAtual}/{legadoTotalPaginas}
          {" · "}PARIDADE TOTAL NÃO COMPROVADA.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {legadoVisiveis.map(entry => (
            <Button key={entry.tipo + entry.id} type="button" variant="outline"
              className="h-auto justify-start whitespace-normal text-left"
              aria-pressed={legadoSelecionado === entry.id}
              onClick={() => setLegadoSelecionado(entry.id)}>
              <span className="min-w-0 break-words text-xs">
                {entry.titulo} <span className="text-muted-foreground">
                  ({entry.aba} · {entry.estado})
                </span>
              </span>
            </Button>
          ))}
        </div>
        {legadoRegistros.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum registro nesse filtro.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={legadoPaginaAtual <= 1}
            onClick={() => { setLegadoPagina(p => Math.max(1, p - 1)); setLegadoSelecionado(null); }}>
            ← Anterior
          </Button>
          <Button type="button" variant="outline" disabled={legadoPaginaAtual >= legadoTotalPaginas}
            onClick={() => { setLegadoPagina(p => Math.min(legadoTotalPaginas, p + 1)); setLegadoSelecionado(null); }}>
            Próxima →
          </Button>
        </div>
        {legadoAtual && (
          <div className="mt-4 space-y-2 rounded-lg border border-border p-4" role="region"
            aria-label={"Owner do controle: " + legadoAtual.titulo}>
            <h4 className="font-semibold">{legadoAtual.titulo}</h4>
            <p className="break-all font-mono text-xs">OWNER: {legadoAtual.owner}</p>
            <p className="text-xs text-muted-foreground">
              SOURCE: docs/HUD/HUD.html · linha {legadoAtual.line}
              {" · "}STATUS: {legadoAtual.estado}.
            </p>
            <p className="text-xs text-muted-foreground">
              Verificar a função e o readback do owner antes de ativar.
              Botão listado não equivale a execução ou paridade demonstrada.
            </p>
            <a href={"https://github.com/ServerVpss/CentralDark/blob/" +
              hudMigrationSnapshot.source.main_sha + "/docs/HUD/HUD.html#L" + legadoAtual.line}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-neon-blue underline">Inspecionar controle original</a>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Próximos deltas causais: sensores Afterburner, skill-sync E01–E10,
          Fixed Point e autorização dos formulários privados. Manter uma função por owner.
        </p>
      </section>
      <section className="panel p-6" aria-labelledby="cd-genesis-regressoes" data-cd-owner="genesis-regressao">
        <h3 id="cd-genesis-regressoes" className="text-lg font-semibold">🧪 Gênesis · regressões antes da produção</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Uma suíte canônica no GitHub: verifica owner, notas, nós, build e vizinhos.
          Puppeteer e Playwright são motores locais distintos; cache instalado não prova browser E2E.
          Cada falha corrigida exige teste discriminante antes da promoção.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={regressaoBusy} onClick={() => void executarRegressaoGenesis("disparar")}>
            {regressaoBusy ? "Consultando…" : "▶ Rodar regressões"}
          </Button>
          <Button type="button" variant="outline" disabled={regressaoBusy}
            onClick={() => void executarRegressaoGenesis("consultar")}>Atualizar recibo</Button>
          <a className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-foreground"
            href="https://github.com/ServerVpss/CentralDark/actions/workflows/test.yml"
            target="_blank" rel="noopener noreferrer">Workflow canônico ↗</a>
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-xs text-muted-foreground">
          {regressao ? regressao.state + " · " + regressao.reason : "UNKNOWN · nenhum teste desta sessão consultado"}
          {regressao ? " · main " + (regressao.mainSha?.slice(0, 12) ?? "?") : ""}
          {regressao ? " · medido " + regressao.observedAt : ""}
        </p>
        {regressaoErro ? <p role="alert" className="mt-2 text-xs text-destructive">{regressaoErro}</p> : null}
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["CONSTRUIR", regressao?.build ?? "UNKNOWN"],
            ["INSTALAR", regressao?.install ?? "UNPROVEN"],
            ["CONECTAR", regressao?.connect ?? "UNPROVEN"],
            ["PROVAR", regressao?.prove ?? "UNPROVEN"],
          ] as const).map(([titulo, situacao]) => (
            <div key={titulo} className="rounded-md border border-border bg-card p-3">
              <dt className="font-mono text-xs text-muted-foreground">{titulo}</dt>
              <dd className={situacao === "PASS" ? "mt-2 font-mono text-neon-green" :
                "mt-2 font-mono text-gold"}>{situacao}</dd>
            </div>
          ))}
        </dl>
        {regressao?.runUrl ? <a href={regressao.runUrl} target="_blank"
          rel="noopener noreferrer" className="mt-3 inline-block text-xs text-neon-blue underline">
          Abrir recibo do run
        </a> : null}
        <p className="mt-3 text-xs text-muted-foreground">
          SOURCE_PASS ≠ BUILD_PASS ≠ INSTALLED ≠ CONNECTED ≠ EFFECT_PROVED.
          Workflow em fila não é PASS. Só Casa e VPS no mesmo SHA com readback
          autorizam o selo operacional final.
        </p>
      </section>
      <GavetaForja mainShaAtual={estado?.mainSha} />
      <p className="text-xs text-muted-foreground">
        Fonte: docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json ·
        source SHA {lineage.source_blob_sha.slice(0, 12)}.
        Restante do HUD: sensores, API, telemetria e temas exigem correspondência e readback individual.
      </p>
    </section>
  );
}
