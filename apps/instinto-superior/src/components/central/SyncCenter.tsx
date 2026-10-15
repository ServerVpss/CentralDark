import { useState } from "react";
import {
  Activity,
  GitCommit,
  GitCompare,
  Server,
  ArrowRight,
  ArrowLeftRight,
  ShieldAlert,
  Trophy,
  SlidersHorizontal,
  PanelRightOpen,
  Cpu,
  Terminal,
  Fingerprint,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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

type ProvaRota = "LEITURA_OK" | "SEM_PROVA" | "ROTA_FALHOU";
type ConexaoFluxo = {
  id: string;
  origem: "Casa" | "GitHub" | "VPS";
  destino: "Casa" | "GitHub" | "VPS";
  status: ProvaRota;
  detalhe: string;
};

const PROVAS_FLUXO: Record<string, ConexaoFluxo> = {
  "casa-github": {
    id: "casa-github",
    origem: "Casa",
    destino: "GitHub",
    status: "LEITURA_OK",
    detalhe: "git ls-remote origin/main respondeu à Casa; NÃO prova push.",
  },
  "github-vps": {
    id: "github-vps",
    origem: "GitHub",
    destino: "VPS",
    status: "SEM_PROVA",
    detalhe: "Deploy do mesmo SHA e seu recibo não verificados.",
  },
  "vps-casa": {
    id: "vps-casa",
    origem: "VPS",
    destino: "Casa",
    status: "ROTA_FALHOU",
    detalhe: "tailscale ping da VPS para a Casa: no matching peer. Outras rotas não testadas.",
  },
  "casa-vps": {
    id: "casa-vps",
    origem: "Casa",
    destino: "VPS",
    status: "LEITURA_OK",
    detalhe: "SSH Segredo-VPS respondeu; NÃO prova sync ou escrita.",
  },
  "vps-github": {
    id: "vps-github",
    origem: "VPS",
    destino: "GitHub",
    status: "LEITURA_OK",
    detalhe: "git ls-remote origin/main respondeu na VPS; NÃO prova push.",
  },
  "github-casa": {
    id: "github-casa",
    origem: "GitHub",
    destino: "Casa",
    status: "SEM_PROVA",
    detalhe: "Fetch, reconciliação e readback na Casa não comprovados.",
  },
};
const REVERSOS: Record<string, string> = {
  "casa-github": "github-casa",
  "github-casa": "casa-github",
  "github-vps": "vps-github",
  "vps-github": "github-vps",
  "vps-casa": "casa-vps",
  "casa-vps": "vps-casa",
};
const NOME_PROVA: Record<ProvaRota, string> = {
  LEITURA_OK: "Leitura OK",
  SEM_PROVA: "UNKNOWN",
  ROTA_FALHOU: "Rota falhou",
};
const COR_PROVA: Record<ProvaRota, string> = {
  LEITURA_OK: "text-emerald-500 border-emerald-500/30",
  SEM_PROVA: "text-amber-500 border-amber-500/30",
  ROTA_FALHOU: "text-red-400 border-red-500/30",
};
const SNAPSHOT_FLUXO = "15/10/2026 · 16:47 BRT";
const GOAL_ORIGEM_SNAPSHOT = "15/10/2026 · Casa SEGREDO · sessão Claude b1f3689c";
const GOAL_ETAPAS = [
  {
    nome: "👑 CHEFE → Claude Code CLI",
    estado: "PROVADO",
    detalhe: "Mensagem humana recebida na sessão Claude Code; evento user com isMeta=false.",
    evidencia: "Sessão b1f3689c · linha JSONL 3157 · Claude CLI PID 30564 → PowerShell → VS Code.",
  },
  {
    nome: "🔁 Stop hook → Claude Code",
    estado: "PROVADO",
    detalhe:
      "Continuação automática entrou como Stop hook feedback, isMeta=true; o emissor específico desse feedback ainda não foi isolado.",
    evidencia:
      "JSONL linhas 2557, 2569, 2879 · hooks globais e locais encontrados, sem recibo que atribua a origem exata.",
  },
  {
    nome: "🛠️ Claude CLI → Bash / Edit / Write / Agent",
    estado: "PROVADO",
    detalhe: "Chamadas reais de ferramentas na sessão, não necessariamente do mesmo GOAL.",
    evidencia:
      "Histórico JSONL contém 116 Bash, 48 Edit, 31 Write e 10 Agent; contagens da sessão inteira.",
  },
  {
    nome: "🎯 GoalsDashboard → registry local",
    estado: "PARCIAL",
    detalhe:
      "Interface criada e ligada ao cockpit; persistência no localStorage, não é fila de execução.",
    evidencia: "src/components/central/GoalsDashboard.tsx → src/data/goals-registry.ts.",
  },
  {
    nome: "⚙️ Registry → Hermes CLI",
    estado: "UNKNOWN",
    detalhe:
      "Hermes chat/acp existe em terminais separados, mas a entrega de GOAL com run_id/ACK não foi comprovada.",
    evidencia:
      "Não encontrado despacho no goals-registry.ts nem recibo de aceitação pelo processo Hermes.",
  },
  {
    nome: "🧿 Hermes CLI → HUD / receipt",
    estado: "UNKNOWN",
    detalhe: "Sem prova de evento de execução vinculado ao mesmo goal_id retornando ao HUD.",
    evidencia:
      "Faltam goal_id, session_id, run_id, timestamp, owner e recibo de contraprova do mesmo evento.",
  },
] as const;
const ROTAS_FLUXO = {
  github: ["casa-github", "github-vps", "vps-casa"],
  vps: ["casa-vps", "vps-github", "github-casa"],
} as const;

function DominioDoLoop() {
  const [percurso, selecionarPercurso] = useState<"github" | "vps">("github");
  const [duasVias, definirDuasVias] = useState(true);
  const [visao, selecionarVisao] = useState<"circuito" | "comparacao" | "provas" | "origem">(
    "circuito",
  );
  const [gavetaAberta, definirGavetaAberta] = useState<"fluxo" | "rota" | "modelos" | null>(null);
  const [rotaSelecionada, definirRotaSelecionada] = useState<string | null>(null);
  const rotaDetalhe = rotaSelecionada ? PROVAS_FLUXO[rotaSelecionada] : null;
  const principais: string[] = [...ROTAS_FLUXO[percurso]];
  const verificadas = duasVias
    ? [...new Set([...principais, ...principais.map((id) => REVERSOS[id] ?? id)])]
    : principais;
  const leituras = verificadas.filter((id) => PROVAS_FLUXO[id]?.status === "LEITURA_OK").length;
  const lacunas = verificadas.filter((id) => PROVAS_FLUXO[id]?.status === "SEM_PROVA").length;
  const falhas = verificadas.filter((id) => PROVAS_FLUXO[id]?.status === "ROTA_FALHOU").length;
  const cobertura = Math.round((leituras / verificadas.length) * 100);
  const caminho =
    percurso === "github" ? ["Casa", "GitHub", "VPS", "Casa"] : ["Casa", "VPS", "GitHub", "Casa"];
  const status = "NÃO FECHADO";

  return (
    <section
      className="mt-8 rounded-xl border border-border bg-muted/10 p-4 sm:p-6"
      aria-label="Domínio bidirecional de loop"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-blue">
            🧿 Reality Judge · Loop de sincronização
          </p>
          <h3 className="mt-1 text-xl font-semibold">Domínio do Loop</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Customizador visual dos owners existentes. Selecionar um fluxo NÃO executa sync, deploy
            nem altera scripts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => definirGavetaAberta("fluxo")}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 text-xs hover:bg-muted"
            aria-label="Abrir gaveta de personalização de fluxo"
          >
            <PanelRightOpen className="size-4" /> Personalizar
          </button>
          <button
            type="button"
            onClick={() => definirGavetaAberta("modelos")}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 text-xs hover:bg-muted"
            aria-label="Abrir gaveta de modelos de inteligência artificial"
          >
            <Cpu className="size-4" /> Modelos
          </button>
          <span className="rounded border border-amber-500/40 px-3 py-2 font-mono text-xs text-amber-500">
            {status}
          </span>
        </div>
      </div>
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Fluxo preferido"
      >
        <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={percurso === "github"}
          onClick={() => selecionarPercurso("github")}
          className={`rounded-md border px-3 py-2 text-xs ${percurso === "github" ? "border-neon-blue bg-neon-blue/10 font-semibold" : "border-border hover:bg-muted"}`}
        >
          Casa → GitHub → VPS
        </button>
        <button
          type="button"
          aria-pressed={percurso === "vps"}
          onClick={() => selecionarPercurso("vps")}
          className={`rounded-md border px-3 py-2 text-xs ${percurso === "vps" ? "border-neon-blue bg-neon-blue/10 font-semibold" : "border-border hover:bg-muted"}`}
        >
          Casa → VPS → GitHub
        </button>
        <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={duasVias}
            onChange={(e) => definirDuasVias(e.target.checked)}
          />
          <ArrowLeftRight className="size-4" aria-hidden="true" /> Duas vias
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Visões do loop">
        {(["circuito", "comparacao", "provas", "origem"] as const).map((aba) => (
          <button
            role="tab"
            aria-selected={visao === aba}
            key={aba}
            type="button"
            onClick={() => selecionarVisao(aba)}
            className={`rounded border px-3 py-1.5 text-xs capitalize ${visao === aba ? "border-foreground bg-muted font-semibold" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            {aba === "comparacao"
              ? "Ganhos × perdas"
              : aba === "provas"
                ? "Contraprova"
                : aba === "origem"
                  ? "🎯 Quem envia GOAL?"
                  : "Circuito"}
          </button>
        ))}
      </div>
      {visao === "circuito" ? (
        <div className="mt-4 space-y-4" role="tabpanel">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-border bg-background/40 p-4">
            {caminho.map((local, i) => (
              <span key={`${local}-${i}`} className="flex items-center gap-2">
                <span className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">
                  {local === "Casa" ? "🏠" : local === "GitHub" ? "🐙" : "🖥️"} {local}
                </span>
                {i < caminho.length - 1 ? (
                  <ArrowRight className="size-4 text-amber-500" aria-hidden="true" />
                ) : null}
              </span>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {verificadas.map((id) => {
              const elo = PROVAS_FLUXO[id];
              if (!elo) return null;
              return (
                <div key={id} className="rounded-md border border-border/70 bg-background/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold">
                      {elo.origem} → {elo.destino}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] ${COR_PROVA[elo.status]}`}
                    >
                      {NOME_PROVA[elo.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {elo.detalhe}
                  </p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-neon-blue underline-offset-4 hover:underline"
                    onClick={() => {
                      definirRotaSelecionada(id);
                      definirGavetaAberta("rota");
                    }}
                    aria-label={`Inspecionar rota ${elo.origem} para ${elo.destino}`}
                  >
                    <PanelRightOpen className="size-3.5" /> Inspecionar rota
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {visao === "comparacao" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2" role="tabpanel">
          <article
            className={`rounded-md border p-4 ${percurso === "github" ? "border-neon-blue" : "border-border"}`}
          >
            <h4 className="font-semibold text-sm">
              🐙 GitHub primeiro · 1/3 (33,3%) leituras do ciclo
            </h4>
            <p className="mt-2 text-xs text-emerald-500">
              Ganho: revisão, versionamento e checks antes do deploy, quando implementados e
              comprovados.
            </p>
            <p className="mt-2 text-xs text-amber-500">
              Perda: depende de comprovar GitHub → VPS; retorno VPS → Casa via Tailscale falhou.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Trilho recomendado de publicação. Ainda não autorizado a publicar.
            </p>
          </article>
          <article
            className={`rounded-md border p-4 ${percurso === "vps" ? "border-neon-blue" : "border-border"}`}
          >
            <h4 className="font-semibold text-sm">
              🖥️ VPS primeiro · 2/3 (66,7%) leituras do ciclo
            </h4>
            <p className="mt-2 text-xs text-emerald-500">
              Ganho: Casa → VPS (SSH) e VPS → GitHub (leitura) tiveram resposta nesta amostra.
            </p>
            <p className="mt-2 text-xs text-amber-500">
              Perda: escrever na VPS antes da main pode criar drift; retorno GitHub → Casa não
              comprovado.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Opção de análise e recuperação; NÃO é um atalho liberado para deploy.
            </p>
          </article>
        </div>
      ) : null}
      {visao === "provas" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2" role="tabpanel">
          <div className="rounded-md border border-border p-3 text-xs">
            <h4 className="font-semibold">SHAs observados</h4>
            <p className="mt-2 font-mono">Casa: 0203e95903</p>
            <p className="font-mono">GitHub/main: 8b7dc4dbc3</p>
            <p className="font-mono">VPS checkout: 81580738c</p>
            <p className="mt-2 text-muted-foreground">
              Três referências diferentes. Checkout da VPS ≠ SHA efetivamente publicado.
            </p>
          </div>
          <div className="rounded-md border border-border p-3 text-xs">
            <h4 className="font-semibold">Fronteiras e serviço</h4>
            <p className="mt-2">Git local: ahead 5 / behind 13 (tracking).</p>
            <p>VPS: 4 entradas no status --porcelain (checkout não limpo).</p>
            <p>Portas VPS amostradas: 9900 respondeu; 8099 e 8788 recusaram.</p>
            <p className="mt-2 text-amber-500">
              MERGED ≠ DEPLOYED. Sem receipt do ciclo bidirecional.
            </p>
          </div>
          <div className="rounded-md border border-border p-3 text-xs md:col-span-2">
            <h4 className="font-semibold">🎯 Agentes → Goals → Harness</h4>
            <p className="mt-2">
              GoalsDashboard.tsx já é importado e renderizado no CockpitShell: WIRED como interface.
            </p>
            <p className="mt-1 text-muted-foreground">
              O registry atual usa localStorage. Nenhuma ligação ponta a ponta com eventos reais de
              Hermes/Haiku, IDs de execução e recibos foi comprovada.
            </p>
            <p className="mt-1 text-amber-500">
              /api/auto-sync/status retornou HTTP 404 na prévia local (15/10). Não tratar a animação
              de agente nem o botão de microdeploy como PASS.
            </p>
            <p className="mt-2 font-mono text-muted-foreground">
              GOAL → RUN → EVIDÊNCIA → BUILD → SHA MAIN → SHA DEPLOY: UNKNOWN
            </p>
          </div>
        </div>
      ) : null}
      {visao === "origem" ? (
        <div
          className="mt-4 space-y-4"
          role="tabpanel"
          aria-label="Rastro de origem do GOAL no CLI"
        >
          <div className="rounded-md border border-border bg-background/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="size-5 text-neon-blue" aria-hidden="true" />
              <h4 className="font-semibold">Quem está mandando GOAL para o terminal?</h4>
              <span className="ml-auto rounded border border-amber-500/30 px-2 py-1 text-xs text-amber-500">
                Loop parcial
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {GOAL_ORIGEM_SNAPSHOT}. A sessão CLI foi iniciada pelo terminal VS Code. Eventos do
              CHEFE e feedback automático do Stop hook aparecem separadamente no histórico.
            </p>
            <p className="mt-2 rounded-md border border-border p-3 font-mono text-xs">
              CHEFE → Claude Code CLI → ferramentas → arquivos do Cockpit
              <span className="block text-amber-500">
                Goals Registry → Hermes CLI → HUD: SEM RECIBO DE TRANSPORTE
              </span>
            </p>
          </div>
          <div className="grid gap-2">
            {GOAL_ETAPAS.map((etapa, indice) => (
              <article
                key={etapa.nome}
                className="rounded-md border border-border bg-background/30 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-medium text-sm">
                    {indice + 1}. {etapa.nome}
                  </h5>
                  <span
                    className={
                      etapa.estado === "PROVADO"
                        ? "rounded border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-500"
                        : "rounded border border-amber-500/40 px-2 py-0.5 text-[10px] text-amber-500"
                    }
                  >
                    {etapa.estado}
                  </span>
                </div>
                <p className="mt-2 text-xs">{etapa.detalhe}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{etapa.evidencia}</p>
              </article>
            ))}
          </div>
          <div className="rounded-md border border-border p-4">
            <h5 className="flex items-center gap-2 font-semibold text-sm">
              <Fingerprint className="size-4" aria-hidden="true" /> Rota fixa configurada na Casa
            </h5>
            <p className="mt-2 break-all font-mono text-xs">
              .vscode/settings.json → K:\\scripts\\vscode\\centraldark-claude-wrapper.cmd
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Wrapper testado com exit 0, fail-closed sem gateway com exit 3. Modo Hermes: OFF. A
              sessão Claude existente não foi reiniciada; novo lançamento pelo wrapper ainda requer
              readback.
            </p>
            <p className="mt-2 text-xs text-amber-500">
              FIXED_POINT ainda não atingido: falta comprovante com goal_id + session_id + run_id +
              ACK + resultado.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Este é um snapshot auditado, não telemetria ao vivo. Não transformar eventos
            independentes em percentual de conclusão.
          </p>
          <button
            type="button"
            className="rounded border border-border px-3 py-2 text-xs hover:bg-muted"
            onClick={() => selecionarVisao("circuito")}
          >
            Voltar ao circuito
          </button>
        </div>
      ) : null}
      <div className="mt-4 rounded-md border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 font-medium">
            <Trophy className="size-4 text-amber-500" /> Placar de leituras do percurso{" "}
            {duasVias ? "bidirecional" : "principal"}
          </span>
          <strong className="font-mono tabular-nums">
            {leituras}/{verificadas.length} · {cobertura}%
          </strong>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={verificadas.length}
          aria-valuenow={leituras}
          aria-label="Passagens com leitura comprovada"
        >
          <div className="h-full bg-emerald-600" style={{ width: `${cobertura}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Leituras OK: {leituras}</span>
          <span>Sem prova: {lacunas}</span>
          <span>Falhas na rota testada: {falhas}</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded border border-amber-500/30 px-3 py-2 text-xs">
            <strong className="block">🏅 Nível 1 · Explorar</strong>
            <span className="text-muted-foreground">
              Conectividade: {leituras}/{verificadas.length} sentidos
            </span>
          </div>
          <div className="rounded border border-border px-3 py-2 text-xs">
            <strong className="block">🔒 Nível 2 · Reconciliar</strong>
            <span className="text-muted-foreground">Mesmo SHA e recibos: NÃO PROVADO</span>
          </div>
          <div className="rounded border border-border px-3 py-2 text-xs">
            <strong className="block">🧿 Nível 3 · Selar</strong>
            <span className="text-muted-foreground">Deploy + retorno: BLOQUEADO</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          <ShieldAlert className="mr-1 inline size-3" /> Placar gamificado de evidências, NÃO
          porcentagem de sincronização ou ganho financeiro. Snapshot: {SNAPSHOT_FLUXO}. Só uma nova
          medição autoriza atualizar os selos.
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        🔒 Somente simulação de configuração local. Sem push, merge, sincronização automática ou
        mutação da VPS.
      </p>
      <Sheet
        open={gavetaAberta !== null}
        onOpenChange={(aberta) => {
          if (!aberta) {
            definirGavetaAberta(null);
            definirRotaSelecionada(null);
          }
        }}
      >
        <SheetContent side="right" className="w-[min(94vw,36rem)] overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pr-5">
            <SheetTitle>
              {gavetaAberta === "fluxo"
                ? "⚙️ Personalizar percurso"
                : gavetaAberta === "modelos"
                  ? "🧠 Modelos do Hermes"
                  : "🧿 Inspeção de rota"}
            </SheetTitle>
            <SheetDescription>
              Gaveta do Sync Center existente · sem executar sincronização ou alterar a VPS.
            </SheetDescription>
          </SheetHeader>

          {gavetaAberta === "fluxo" ? (
            <div className="mt-6 space-y-5 text-sm">
              <p className="text-muted-foreground">
                Escolhe a ordem visual para comparar riscos e evidências. A configuração não é
                aplicada ao executor.
              </p>
              <div className="grid gap-2">
                <button
                  type="button"
                  aria-pressed={percurso === "github"}
                  onClick={() => selecionarPercurso("github")}
                  className={
                    percurso === "github"
                      ? "rounded-md border border-neon-blue bg-neon-blue/10 p-3 text-left font-medium"
                      : "rounded-md border border-border p-3 text-left hover:bg-muted"
                  }
                >
                  🏠 Casa → 🐙 GitHub → 🖥️ VPS
                </button>
                <button
                  type="button"
                  aria-pressed={percurso === "vps"}
                  onClick={() => selecionarPercurso("vps")}
                  className={
                    percurso === "vps"
                      ? "rounded-md border border-neon-blue bg-neon-blue/10 p-3 text-left font-medium"
                      : "rounded-md border border-border p-3 text-left hover:bg-muted"
                  }
                >
                  🏠 Casa → 🖥️ VPS → 🐙 GitHub
                </button>
              </div>
              <label className="flex items-center gap-3 rounded border border-border p-3">
                <input
                  type="checkbox"
                  checked={duasVias}
                  onChange={(e) => definirDuasVias(e.target.checked)}
                />
                Mostrar conexões de ida e volta
              </label>
              <div className="rounded-md border border-border bg-muted/20 p-4">
                <p className="font-semibold">Placar selecionado</p>
                <p className="mt-2 font-mono text-2xl">
                  {leituras}/{verificadas.length} leituras
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sem prova: {lacunas} · Falhas: {falhas} · Medição histórica: {SNAPSHOT_FLUXO}
                </p>
                <p className="mt-2 text-xs text-amber-500">
                  Três SHAs divergentes. Loop não selado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  selecionarVisao("comparacao");
                  definirGavetaAberta(null);
                }}
                className="w-full rounded-md border border-border bg-muted/40 p-3 font-medium hover:bg-muted"
              >
                Mostrar ganhos × perdas no painel
              </button>
            </div>
          ) : null}

          {gavetaAberta === "rota" ? (
            <div className="mt-6 space-y-4 text-sm">
              {rotaDetalhe ? (
                <>
                  <div className="rounded-md border border-border bg-muted/20 p-4">
                    <p className="font-semibold">
                      {rotaDetalhe.origem} → {rotaDetalhe.destino}
                    </p>
                    <span
                      className={
                        COR_PROVA[rotaDetalhe.status] +
                        " mt-2 inline-block rounded border px-2 py-1 text-xs"
                      }
                    >
                      {NOME_PROVA[rotaDetalhe.status]}
                    </span>
                    <p className="mt-4 text-muted-foreground">{rotaDetalhe.detalhe}</p>
                  </div>
                  <div className="rounded-md border border-border p-4">
                    <p className="font-semibold">Contraprova</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Fonte: terminal da Casa SEGREDO e SSH VPS · {SNAPSHOT_FLUXO}
                    </p>
                    <p className="mt-2 text-xs text-amber-500">
                      Uma resposta de leitura não comprova gravação, merge, deploy nem retorno.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-md border border-border p-3 hover:bg-muted"
                    onClick={() => {
                      selecionarVisao("provas");
                      definirGavetaAberta(null);
                    }}
                  >
                    Abrir contraprova no Sync Center
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Selecione um elo no circuito para inspecionar.
                </p>
              )}
            </div>
          ) : null}

          {gavetaAberta === "modelos" ? (
            <div className="mt-6 space-y-4 text-sm">
              <p className="text-muted-foreground">
                Catálogo de candidatos a motor do Hermes. A disponibilidade e a seleção ativa ainda
                não foram medidas nesta sessão.
              </p>
              {[
                { nome: "Claude Haiku", funcao: "Construção e iteração rápida" },
                { nome: "Grok", funcao: "Experimentação e alternativas" },
                { nome: "Gemini Flash", funcao: "Leitura e programação" },
                { nome: "Qwen Coder", funcao: "Código local, se disponível" },
              ].map((motor) => (
                <div
                  key={motor.nome}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{motor.nome}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{motor.funcao}</p>
                  </div>
                  <span className="shrink-0 rounded border border-amber-500/30 px-2 py-1 text-xs text-amber-500">
                    Não medido
                  </span>
                </div>
              ))}
              <p className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                O seletor é uma prévia visual. Para escolher um motor de verdade, o Harness deve
                consultar o catálogo e confirmar o binding ativo; nenhum modelo foi alterado.
              </p>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

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
            Main, servidor e delta com fontes separadas. Sem transformar consulta em prova de
            deploy.
          </p>
        </div>
        <SeloEstado estado={estado?.deploy ?? "UNKNOWN"} />
      </div>
      <DominioDoLoop />
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
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <BlocoEstado
          titulo="Casa / worktree"
          estado="UNKNOWN"
          detalhe="Checkout, alterações locais e drift da Casa sem fonte autorizada nesta superfície."
          icone={<Server className="size-5" />}
        />
        <BlocoEstado
          titulo="Lovable / GitHub sync"
          estado="UNKNOWN"
          detalhe="Editor não é autoridade. Vínculo e sincronização exigem readback do commit no repositório conectado."
          icone={<GitCompare className="size-5" />}
        />
        <BlocoEstado
          titulo="Receipts / worktrees"
          estado="UNKNOWN"
          detalhe="Provas oficiais permanecem no owner CentralDark; nenhum registro local é promovido a prova viva."
          icone={<GitCommit className="size-5" />}
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
