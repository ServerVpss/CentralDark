/* #OBSERVACOES# | CENTRALDARK.COCKPIT.HUD.PAPAGAIO_ON
 * @owner: apps/instinto-superior/src/components/central/CockpitShell.tsx
 * @doc_ref: docs/CONSCIENCIA/RECONCILIACAO-ESCOPOS-PR-20261015.md
 * @last_updated: 2026-10-16T12:19:56.233Z
 * @escopo: registrar HUD como PROJECAO; um cockpit, um runtime, uma casca.
 * @pendente: build e readback do layout no alvo vivo; 10 receipts MCP individuais.
 * @next_cursor: CI, regressao skins, readback VPS/Casa e selo.
 */
import { HudDeterministico } from "@/components/central/HudDeterministico";
import { EstudoPorCriterios } from "@/components/central/EstudoPorCriterios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PainelConsumo } from "@/components/central/PainelConsumo";
import { PainelAdminCentralDark } from "@/components/central/PainelAdminCentralDark";
import { McpConsoleCentralDark } from "@/components/central/McpConsoleCentralDark";
import { MenuContaCentralDark } from "@/components/central/MenuContaCentralDark";
import { HermesOneWebLocal } from "@/components/central/HermesOneWebLocal";
import { useModulosCockpit } from "@/lib/modulos-cockpit";
import { CentralNotificacoes } from "@/components/central/CentralNotificacoes";
import { SyncActionButton } from "@/components/central/SyncActionButton";
import { SyncLoopIcon } from "@/components/central/SyncLoopIcon";
import { PainelPR1873 } from "@/components/central/PainelPR1873";
import { CartaoDiscosForja } from "@/components/central/CartaoDiscosForja";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Bell,
  Download,
  ExternalLink,
  Github,
  Mail,
  PackageCheck,
  Radar,
  Send,
  Server,
  ShieldCheck,
  Menu,
  PanelRight,
  Search,
  MessagesSquare,
  Bot,
  Settings2,
  Layers3,
  Terminal,
  MessageCircle,
  Headphones,
  Wrench,
  Zap,
} from "lucide-react";

import { PainelHermes } from "@/components/central/HermesPet";
import { MapaMetabolicoCristal } from "@/components/central/MapaMetabolicoCristal";
import { DesignCenter, usePeleCockpit } from "@/components/central/DesignCenter";
import { Ledger } from "@/components/central/Ledger";
import { BlocoEstado, type EstadoOperacional } from "@/components/central/EstadoCentralDark";
import { SyncCenter } from "@/components/central/SyncCenter";
import { SistemaCentralDark } from "@/components/central/SistemaCentralDark";
import { MapaOwners } from "@/components/central/MapaOwners";
import { COCKPIT_ABAS } from "@/data/painel-unico";
import { AutoSyncButton } from "@/components/central/AutoSyncButton";
import { StatusPanel } from "@/components/central/StatusPanel";
import { DailyReviewPanel } from "@/components/central/DailyReviewPanel";
import { GoalsDashboard } from "@/components/central/GoalsDashboard";
import { DeliverablesSummary } from "@/components/central/DeliverablesSummary";
import { ArchitectureVisualization } from "@/components/central/ArchitectureVisualization";
import { RaioXVivo } from "@/components/central/RaioXVivo";
import { PapagaioHudMcp } from "@/components/central/PapagaioHudMcp";
import { ReceiptsDashboard } from "@/components/central/ReceiptsDashboard";
import { ForjaExecutor } from "@/components/central/ForjaExecutor";
import { DreamReviewer } from "@/components/central/DreamReviewer";
import { GramPermissions } from "@/components/central/GramPermissions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTelegramBotsResumo } from "@/hooks/useTelegramBotsResumo";
import { lerStatusGramMTProto } from "@/lib/admin.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lerEstadoCentralDark } from "@/lib/cockpit.functions";
import { PlayerLocalJarvis } from "@/components/central/PlayerLocalJarvis";
/** Pacote real servido pelo próprio site (public/downloads), sem armazenamento externo. */
const pacoteHermes = {
  url: "/downloads/Hermes-CentralDark-Pacotao.zip",
  size: 47307928,
  created_at: "2026-09-24T07:27:40Z",
};

function formatarTamanho(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

type UnigramLaunchStatus = "IDLE" | "PENDING" | "REQUESTED" | "UNAVAILABLE" | "ERROR";
type NativeObsidianBridge = {
  openObsidianDesktop?: () => Promise<{ status: "REQUESTED" | "UNAVAILABLE"; capability: "OBSIDIAN" }>;
};
function nativeObsidianBridge(): NativeObsidianBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { centraldark?: NativeObsidianBridge }).centraldark;
}
type NativeUnigramBridge = {
  openUnigramDesktop?: () => Promise<{ status: "REQUESTED" | "UNAVAILABLE"; capability: "UNIGRAM" }>;
};
function nativeUnigramBridge(): NativeUnigramBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { centraldark?: NativeUnigramBridge }).centraldark;
}

const HARNESS_DESTINOS = [
  { id: "visao", titulo: "Visão geral", icone: "🧿", privado: false },
  { id: "portal", titulo: "Portal", icone: "🌐", privado: false },
  { id: "builder-bolt", titulo: "Builder Bolt", icone: "⚡", privado: false },
  { id: "pr1873", titulo: "Mapa do PR #1873", icone: "📜", privado: false },
  { id: "gram", titulo: "CentralDark Gram", icone: "✉️", privado: true },
  { id: "goals", titulo: "Goals", icone: "🎯", privado: false },
  { id: "genesis", titulo: "Gênesis · Michelin", icone: "🧬", privado: true },
  { id: "sync", titulo: "Minha Oficina", icone: "🔄", privado: false },
  { id: "hermes", titulo: "Hermes", icone: "⚙️", privado: false },
  { id: "obsidian", titulo: "Obsidian", icone: "💎", privado: false },
  { id: "aionui", titulo: "CentralDark Estúdio", icone: "🧩", privado: false },
  { id: "design", titulo: "Design Center", icone: "🎨", privado: false },
  { id: "arquitetura", titulo: "Estrutura", icone: "📐", privado: false },
  { id: "sistema", titulo: "Sistema", icone: "🖥️", privado: true },
  { id: "admin", titulo: "Admin", icone: "🔒", privado: true },
  { id: "downloads", titulo: "Downloads", icone: "📦", privado: false },
] as const;

/** UI-first: catálogo visual selecionável, sem fingir conexões ou criar outro painel. */
/* #OBSERVACOES# | CENTRALDARK.COCKPIT.JORNADA_EVOLUTIVA_20261025
 * @owner: apps/instinto-superior/src/components/central/CockpitShell.tsx
 * @doc_ref: docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md
 * @last_updated: 2026-10-25T12:00:00Z
 * @implementado: interface didatica com etapas clicaveis, niveis e acesso a Forja/Recibos.
 * @estado: UI_SOURCE, nao e prova de deploy ou desbloqueio funcional.
 * @next_cursor: build/CI e readback autenticado no mesmo SHA.
 */
const JORNADA_PASSOS = [
  { nome: "Intenção", icone: "👑", simples: "Você explica o que quer construir.", tecnico: "O CHEFE define o Goal e preserva o mesmo Loop Mestre.", gatilho: "INTENÇÃO" },
  { nome: "Descoberta", icone: "💡", simples: "Surgiu uma possibilidade nova na conversa.", tecnico: "A hipótese é candidata: descoberta não é implementação.", gatilho: "DESCOBERTA" },
  { nome: "Multibússola", icone: "🧭", simples: "Olhar a ideia por vários lados.", tecnico: "Analisar causa, efeito, dependências e contraprovas pertinentes.", gatilho: "!MULTIBUSSOLA" },
  { nome: "Kaizen", icone: "♻️", simples: "Reaproveitar o que existe e melhorar um pedacinho.", tecnico: "Recuperar a intenção, reusar o owner e escolher o menor delta.", gatilho: "!KAIZEN" },
  { nome: "Construção", icone: "🛠️", simples: "O executor instala a habilidade no sistema.", tecnico: "Gatilho, contrato, owner e executor existentes realizam a mudança.", gatilho: "HERMES / FORJA" },
  { nome: "Prova real", icone: "🧪", simples: "Testar para ver se funciona de verdade.", tecnico: "Teste, contraprova e recibo vinculados ao mesmo SHA.", gatilho: "!MICHELIN" },
  { nome: "Conquista", icone: "🏆", simples: "A habilidade só é desbloqueada depois da prova.", tecnico: "Reality Judge exige efeito e receipt; XP não equivale a autoridade.", gatilho: "RECEIPT + SHA" },
  { nome: "Próximo nível", icone: "🚀", simples: "Guardar a lição e seguir de onde parou.", tecnico: "Continuar no mesmo Goal e NEXT_CURSOR, sem reiniciar.", gatilho: "NEXT_CURSOR" },
] as const;

function JornadaEvolutiva({ abrirDestino }: { abrirDestino: (destino: string) => void }) {
  const [passoAtivo, definirPassoAtivo] = useState(0);
  const [simples, definirSimples] = useState(true);
  const passo = JORNADA_PASSOS[passoAtivo] ?? JORNADA_PASSOS[0];
  return (
    <section aria-labelledby="jornada-evolutiva-titulo" data-cd-flow="instinto.CockpitShell.jornada-evolutiva" className="overflow-hidden rounded-2xl border border-border bg-background/80">
      <div className="border-b border-border bg-gradient-to-br from-neon-blue/10 via-background to-amber-500/10 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neon-blue">🪬 CentralDark · Evolução deliberada</p>
          <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs">🎮 Nível 06 · marco narrativo</span>
        </div>
        <h2 id="jornada-evolutiva-titulo" className="mt-3 text-2xl font-bold sm:text-3xl">Aprenda o sistema jogando</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Descubra como uma ideia se transforma em habilidade real. Clique nas etapas e escolha explicações simples ou técnicas.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={simples ? "default" : "outline"} aria-pressed={simples} onClick={() => definirSimples(true)}>🌱 Sou iniciante</Button>
          <Button type="button" size="sm" variant={!simples ? "default" : "outline"} aria-pressed={!simples} onClick={() => definirSimples(false)}>⚙️ Ver engenharia</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => abrirDestino("recibos")}>📜 Ver provas reais</Button>
        </div>
      </div>
      <div className="p-5 sm:p-8">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Etapas do Motor Evolutivo">
          {JORNADA_PASSOS.map((etapa, indice) => (
            <button key={etapa.nome} type="button" aria-pressed={passoAtivo === indice} onClick={() => definirPassoAtivo(indice)}
              className={passoAtivo === indice ? "min-h-24 rounded-xl border border-neon-blue bg-neon-blue/10 p-3 text-left focus-visible:outline focus-visible:outline-2" : "min-h-24 rounded-xl border border-border bg-muted/20 p-3 text-left transition-colors hover:border-neon-blue/60 focus-visible:outline focus-visible:outline-2"}>
              <span className="flex items-center justify-between gap-2"><span className="text-lg" aria-hidden="true">{etapa.icone}</span><span className="font-mono text-[10px] text-muted-foreground">{indice + 1} / 8</span></span>
              <span className="mt-2 block text-sm font-semibold">{etapa.nome}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">{etapa.gatilho}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-5" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Etapa {passoAtivo + 1} · {passo.gatilho}</p>
          <h3 className="mt-2 text-xl font-semibold">{passo.icone} {passo.nome}</h3>
          <p className="mt-2 text-sm leading-relaxed">{simples ? passo.simples : passo.tecnico}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={passoAtivo === 0} onClick={() => definirPassoAtivo((atual) => Math.max(0, atual - 1))}>← Anterior</Button>
            <Button type="button" size="sm" disabled={passoAtivo === JORNADA_PASSOS.length - 1} onClick={() => definirPassoAtivo((atual) => Math.min(JORNADA_PASSOS.length - 1, atual + 1))}>Próxima etapa →</Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🏆 Evolução registrada</p>
            <h3 className="mt-2 font-semibold">Nível 04 → 05 → 06</h3>
            <p className="mt-2 text-sm text-muted-foreground">Memória entre chats → Loop Evolutivo → Kaizen + Multibússola. Esses níveis contam descobertas, não certificam runtime.</p>
            <a href="https://github.com/ServerVpss/CentralDark/blob/0326698ce4b557ea4c8fda116edf2de26a0a42a1/docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-semibold text-neon-blue underline underline-offset-4">Ler contrato canônico na main</a>
          </article>
          <article className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">👑 Chefão · prova da habilidade</p>
            <h3 className="mt-2 font-semibold">Da hipótese ao funcionamento</h3>
            <p className="mt-2 text-sm text-muted-foreground">Desafio final: executar, testar, registrar recibo e verificar o efeito. A tela não concede XP operacional.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => abrirDestino("forja")}>Abrir Forja</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => abrirDestino("recibos")}>Ver recibos</Button>
            </div>
          </article>
        </div>
        <p className="mt-4 text-xs text-muted-foreground" role="status">Esta tela ensina o método. Habilidades só são comprovadas pelo Reality Judge, efeito real e recibo verificável. Documento não é deploy.</p>
      </div>
    </section>
  );
}
function MenuVisualCentralDark({ titulo, descricao, itens }: { titulo: string; descricao: string; itens: string[] }) {
  const [selecionado, definirSelecionado] = useState(itens[0] ?? "");
  return (
    <section className="rounded-xl border border-neon-blue/30 bg-background/80 p-5" aria-label={titulo}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{titulo}</h2>
        <span className="rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-500">ESTRUTURA VISUAL</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {itens.map((item) => (
          <button key={item} type="button" aria-pressed={selecionado === item} onClick={() => definirSelecionado(item)}
            className={`min-h-20 rounded-lg border p-4 text-left transition-colors hover:border-neon-blue ${selecionado === item ? "border-neon-blue bg-neon-blue/10" : "border-border bg-muted/20"}`}>
            <span className="block text-sm font-semibold">{item}</span>
            <span className="mt-2 block text-[11px] text-amber-500">Integração pendente</span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3 text-sm" role="status">
        <strong>Selecionado:</strong> {selecionado} · Visualização da posição no Cockpit; nenhum serviço foi acionado.
      </div>
    </section>
  );
}

// Interface do Gram incorporada ao CockpitShell; lê o mesmo owner dos bots
// do Cofre Administrativo. Não copia Unigram nem simula mensagens entregues.
function CentralDarkGram({ abrirAdmin, abrirSync }: { abrirAdmin: () => void; abrirSync: () => void }) {
  const consulta = useTelegramBotsResumo();
  const lerMTProto = useServerFn(lerStatusGramMTProto);
  const mtproto = useQuery({
    queryKey: ["centraldark", "gram", "mtproto-status"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) throw new Error("Sessão administrativa não disponível.");
      return lerMTProto({ headers: { Authorization: `Bearer ${token}` } });
    },
    retry: false,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const [filtro, definirFiltro] = useState("");
  const [selecionadoId, definirSelecionadoId] = useState<string | null>(null);
  const encontrados = consulta.bots.filter((bot) =>
    (bot.name + " " + (bot.bot_username ?? "")).toLowerCase().includes(filtro.toLowerCase()),
  );
  const selecionado = consulta.bots.find((bot) => bot.id === selecionadoId) ?? encontrados[0] ?? null;

  return (
    <section aria-label="CentralDark Gram" className="overflow-hidden rounded-xl border border-border bg-background/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-blue">✉️ CentralDark Gram · Interface integrada</p>
          <h2 className="mt-1 text-2xl font-semibold">Mensagens, bots e canais</h2>
          <p className="mt-1 text-xs text-muted-foreground">Interface própria ligada ao cadastro existente e ao serviço MTProto da VPS. Leitura do status protegida pelo servidor; envio de mensagens ainda não integrado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SyncActionButton label="Medir MTProto" onClick={() => void mtproto.refetch()} isFetching={mtproto.isFetching} />
          <SyncActionButton label="Atualizar bots" onClick={() => void consulta.refresh()} isFetching={consulta.loading} />
          <Button type="button" variant="outline" size="sm" onClick={abrirAdmin}>Admin dos bots</Button>
        </div>
      </div>
      <div className="grid gap-2 border-b border-border bg-muted/10 px-5 py-3 text-xs sm:grid-cols-4" aria-label="Estado MTProto autenticado no servidor">
        <div><span className="text-muted-foreground">Gateway VPS</span><p className="mt-1 font-mono font-semibold">{mtproto.data?.gateway ?? "UNKNOWN"}</p></div>
        <div><span className="text-muted-foreground">Configurado</span><p className="mt-1 font-mono font-semibold">{mtproto.data?.configurado === true ? "SIM" : mtproto.data?.configurado === false ? "NÃO" : "UNKNOWN"}</p></div>
        <div><span className="text-muted-foreground">Sessão MTProto</span><p className="mt-1 font-mono font-semibold">{mtproto.data?.sessaoPresente === true ? "PRESENTE" : mtproto.data?.sessaoPresente === false ? "AUSENTE" : "UNKNOWN"}</p></div>
        <div><span className="text-muted-foreground">Telegram autorizado</span><p className={mtproto.data?.autorizado === true ? "mt-1 font-mono font-semibold text-emerald-500" : "mt-1 font-mono font-semibold text-amber-500"}>{mtproto.data?.autorizado === true ? "CONFIRMADO" : mtproto.data?.autorizado === false ? "NÃO AUTORIZADO" : "UNKNOWN"}</p></div>
        <p className="text-muted-foreground sm:col-span-4">Fonte: centraldark-telegram-mtproto.service · VPS 127.0.0.1:8790 · {mtproto.data?.consultaEm ? "Consultado em " + new Date(mtproto.data.consultaEm).toLocaleString("pt-BR") : "Sem consulta autenticada"}{mtproto.isError ? " · AUTH_REQUIRED ou conexão indisponível" : ""}{mtproto.data?.motivo ? " · " + mtproto.data.motivo : ""}. Consulta não comprova entrega de mensagens.</p>
      </div>
      <div className="grid min-h-[28rem] md:grid-cols-[minmax(13rem,0.38fr)_minmax(0,1fr)]">
        <aside className="border-b border-border md:border-b-0 md:border-r" aria-label="Lista de conversas e bots">
          <div className="border-b border-border p-3">
            <label htmlFor="centraldark-gram-buscar" className="text-xs font-medium">Buscar bot cadastrado</label>
            <div className="mt-2 flex items-center gap-2 rounded border border-border bg-muted/20 px-3">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <input id="centraldark-gram-buscar" className="min-h-10 w-full bg-transparent text-sm outline-none" placeholder="Nome ou @usuário" value={filtro} onChange={(e) => definirFiltro(e.target.value)} />
            </div>
          </div>
          <div className="max-h-[29rem] overflow-y-auto p-2">
            {consulta.loading ? <p className="p-3 text-sm text-muted-foreground">Consultando owner Telegram…</p> : null}
            {consulta.erro ? (
              <p className="rounded border border-amber-500/40 p-3 text-xs text-amber-500">
                AUTH_REQUIRED / consulta bloqueada: {consulta.erro}
              </p>
            ) : null}
            {!consulta.loading && !consulta.erro && encontrados.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                {filtro ? "Nenhum bot corresponde à busca." : "Nenhum bot retornado nesta consulta. Isso não comprova inexistência no Telegram."}
              </p>
            ) : null}
            {encontrados.map((bot) => (
              <button key={bot.id} type="button" aria-pressed={selecionado?.id === bot.id}
                onClick={() => definirSelecionadoId(bot.id)}
                className={selecionado?.id === bot.id ? "mb-1 flex w-full items-center gap-3 rounded-lg border border-neon-blue bg-neon-blue/10 p-3 text-left" : "mb-1 flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left hover:bg-muted"}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"><Bot className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{bot.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">@{bot.bot_username ?? "sem username"}</span>
                </span>
                <span className={bot.is_active ? "size-2 rounded-full bg-emerald-500" : "size-2 rounded-full bg-muted-foreground"} aria-label={bot.is_active ? "Cadastro ativo" : "Cadastro inativo"} />
              </button>
            ))}
          </div>
        </aside>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted"><MessageCircle className="size-5" /></span>
            <div className="min-w-0">
              <h3 className="font-semibold">{selecionado?.name ?? "CentralDark Gram"}</h3>
              <p className="text-xs text-muted-foreground">
                {selecionado ? "Cadastro: " + (selecionado.is_active ? "ativo" : "inativo") + " · Saúde: " + (selecionado.health_status ?? "UNKNOWN") : "Selecione um bot. O estado MTProto da VPS aparece acima; conversas ainda não integradas."}
              </p>
            </div>
            <span className="ml-auto rounded border border-amber-500/40 px-2 py-1 text-xs text-amber-500">Mensageria: UNKNOWN</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <MessagesSquare className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="max-w-md font-semibold">Tua interface Gram está dentro do mesmo cockpit.</p>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Busca, seleção e atualização de bots usam o owner de cadastro. O status da sessão MTProto vem diretamente do servidor autenticado na VPS.
              Este serviço existente oferece /health, /status, /start, /confirm e /logout; ainda não oferece endpoints de conversas, mídia ou envio. Essas ações ficam desativadas.
            </p>
            <Button type="button" variant="outline" onClick={abrirSync}>Abrir contraprova no Sync Center</Button>
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-muted/20 p-3">
            <input aria-label="Campo de mensagem indisponível" placeholder="Envio desativado · API Telegram/MTProto não comprovada" disabled
              className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-background/40 px-3 text-sm opacity-70" />
            <Button type="button" disabled title="Envio indisponível sem API autorizada e sessão comprovada">Enviar</Button>
          </div>
        </div>
      </div>
      <p className="border-t border-border p-3 text-[11px] text-muted-foreground">
        Fontes: useTelegramBotsResumo → Supabase telegram_bots; lerStatusGramMTProto (admin autenticado) → VPS loopback 8790. Nenhum token, sessão, telefone ou conversa privada é exposto.
      </p>
    </section>
  );
}

// Casca Electron AionUi: o host abre o cockpit com ?shell=aionui. O marcador fica na sessão da aba para
// sobreviver à navegação interna. Fora da casca (navegador comum) nada muda.
const CASCA_AIONUI_CHAVE = "centraldark.shell";
function dentroDaCascaAionUI(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("shell") === "aionui") {
      window.sessionStorage.setItem(CASCA_AIONUI_CHAVE, "aionui");
      return true;
    }
    return window.sessionStorage.getItem(CASCA_AIONUI_CHAVE) === "aionui";
  } catch {
    return false;
  }
}

export function CockpitShell({ autenticado = false }: { autenticado?: boolean }) {
  const { pele, selecionar } = usePeleCockpit();
  const modulos = useModulosCockpit();
  const [abaAtiva, definirAbaAtiva] = useState("visao");
  const [hermesOneAberto, definirHermesOneAberto] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  // A barra fixa pode rolar horizontalmente com a rodinha, sem prender a pagina
  // quando nao existe conteudo para deslocar. Nao intercepta zoom nem Shift.
  useEffect(() => {
    const barra = tabsScrollRef.current;
    if (!barra) return;
    const rolarAbas = (evento: WheelEvent) => {
      if (evento.ctrlKey || evento.shiftKey || Math.abs(evento.deltaY) <= Math.abs(evento.deltaX)) return;
      if (barra.scrollWidth <= barra.clientWidth) return;
      evento.preventDefault();
      barra.scrollLeft += evento.deltaY;
    };
    barra.addEventListener("wheel", rolarAbas, { passive: false });
    return () => barra.removeEventListener("wheel", rolarAbas);
  }, []);
  const [abaAdminInicial, definirAbaAdminInicial] = useState<"visao" | "notificacoes">("visao");
  const [versaoAdmin, definirVersaoAdmin] = useState(0);
  const [estudioAberto, definirEstudioAberto] = useState(false);
  const [playerAberto, definirPlayerAberto] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("player") !== "jarvis") return;
    definirEstudioAberto(false);
    definirHermesOneAberto(false);
    definirPlayerAberto(true);
    const destino = new URL(window.location.href);
    destino.searchParams.delete("player");
    window.history.replaceState({}, "", destino);
  }, []);
  const [estadoEstudio, definirEstadoEstudio] = useState("NÃO MEDIDO NESTE NAVEGADOR");
  async function conferirEstudio() {
    definirEstadoEstudio("CONSULTANDO");
    try {
      const resposta = await fetch("https://ui.centralldark.com/api/settings/client", {
        credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(7000),
      });
      definirEstadoEstudio(resposta.ok ? "API HTTP_ACK" : "API HTTP_" + resposta.status);
    } catch {
      // Bloqueio CORS e falta de rede são inconclusivos, não equivalem a OFFLINE.
      definirEstadoEstudio("UNKNOWN · rede ou CORS");
    }
  }
  function abrirEstudio() {
    if (modulos.aionui === "desativado") return;
    definirHermesOneAberto(false);
    if (dentroDaCascaAionUI()) {
      // Dentro da casca, o Estúdio é a própria casca: pede ao host as funções originais (/guid) em vez de
      // abrir outro AionUI (iframe) dentro do cockpit, que fecharia o espelho. O host lê este parâmetro.
      const alvo = new URL(window.location.href);
      alvo.searchParams.set("aionui-host", "guid");
      window.location.assign(alvo.toString());
      return;
    }
    definirEstudioAberto(true);
    void conferirEstudio();
    window.requestAnimationFrame(() => document.getElementById("centraldark-estudio")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function abrirHermesOne() {
    // Somente a UI web local do Hermes, nunca a UI do AionUI ou novo gateway.
    if (modulos.hermes === "desativado") return;
    definirEstudioAberto(false);
    definirHermesOneAberto(true);
    abrirDestino("hermes");
  }
  function abrirPlayerLocal() {
    definirEstudioAberto(false);
    definirHermesOneAberto(false);
    definirPlayerAberto(true);
  }
  const tituloAbaAtiva = COCKPIT_ABAS.find(item => item.id === abaAtiva)?.titulo ?? "Área sem cadastro";
  const [gaveta, definirGaveta] = useState<"left" | "right" | "top" | "bottom" | null>(null);
  const [buscaHarness, definirBuscaHarness] = useState("");
  const [harnessVisivel, definirHarnessVisivel] = useState(true);
  const destinosHarness = HARNESS_DESTINOS.filter((d) => (!d.privado || autenticado) && d.titulo.toLowerCase().includes(buscaHarness.toLowerCase()));
  function abrirDestino(id: string) { definirAbaAtiva(id); definirGaveta(null); window.requestAnimationFrame(() => document.getElementById("centraldark-harness-abas")?.scrollIntoView({ behavior: "smooth", block: "start" })); }
  const lerEstado = useServerFn(lerEstadoCentralDark);
  const estado = useQuery({
    queryKey: ["centraldark", "estado-vivo"],
    queryFn: () => lerEstado(),
    refetchInterval: 60_000,
  });
  const dado = estado.data;
  // Uma consulta geral não comprova missões: sensores stale/erro ficam UNKNOWN.
  const hudMedido = dado && !estado.isError && !estado.isPending && Date.now() - estado.dataUpdatedAt < 90_000
    ? dado : null;
  const queryClient = useQueryClient();
  const navegar = useNavigate();
  const [unigramLaunch, setUnigramLaunch] = useState<UnigramLaunchStatus>("IDLE");
  const [obsidianLaunch, setObsidianLaunch] = useState<UnigramLaunchStatus>("IDLE");
  async function abrirObsidian() {
    const bridge = nativeObsidianBridge();
    if (!bridge?.openObsidianDesktop) { setObsidianLaunch("UNAVAILABLE"); return; }
    setObsidianLaunch("PENDING");
    try {
      const result = await bridge.openObsidianDesktop();
      setObsidianLaunch(result.status === "REQUESTED" ? "REQUESTED" : "UNAVAILABLE");
    } catch { setObsidianLaunch("ERROR"); }
  }
  async function abrirUnigram() {
    const bridge = nativeUnigramBridge();
    if (!bridge?.openUnigramDesktop) {
      setUnigramLaunch("UNAVAILABLE");
      return;
    }
    setUnigramLaunch("PENDING");
    try {
      const result = await bridge.openUnigramDesktop();
      setUnigramLaunch(result.status === "REQUESTED" ? "REQUESTED" : "UNAVAILABLE");
    } catch {
      setUnigramLaunch("ERROR");
    }
  }
  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navegar({ to: "/auth", replace: true });
  }

  return (
    <main
      data-pele-cockpit={pele}
      className={`min-h-dvh w-full min-w-0 overflow-x-clip pb-28 ${pele === "default" ? "" : "cockpit-pele"}`}
    >
      {harnessVisivel && gaveta === null ? (
        <nav
          aria-label="Harness flutuante superior"
          data-cd-harness="top-floating"
          className="fixed left-1/2 top-1 z-[60] hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur sm:flex"
        >
          <Button size="sm" variant="ghost" title="CentralDark" aria-label="CentralDark · visão geral" onClick={() => abrirDestino("visao")}>🧿 CentralDark</Button>
          <Button size="icon" variant="ghost" title="Lupa · buscar ferramentas" aria-label="Lupa · buscar ferramentas" onClick={() => definirGaveta("top")}><Search className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Mapa dos sistemas" aria-label="Mapa dos sistemas" onClick={() => definirGaveta("right")}><Layers3 className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Notificações" aria-label="Notificações" onClick={() => { definirAbaAdminInicial("notificacoes"); abrirDestino("admin"); }}><Bell className="size-4" /></Button>
        </nav>
      ) : null}
      {/* Cabecalho unico: identidade a esquerda e catraca no topo direito. */}
      <header className="relative z-50 border-b border-border bg-background/95 px-4 py-3 sm:px-6">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-8 items-center justify-center rounded-md border border-primary/40 bg-surface">
              <span className="animate-soft-pulse size-2.5 rounded-full bg-primary" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-gold-gradient text-sm font-semibold tracking-wide">CentralDark</span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Instinto Superior</span>
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <Button
              data-cd-flow="instinto.CockpitShell.botao-01"
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={estudioAberto}
              aria-controls="centraldark-estudio"
              onClick={abrirEstudio}
              disabled={modulos.aionui === "desativado"}
            >
              <Layers3 aria-hidden className="size-4" /> CentralDark Estúdio
            </Button>
            <Button
              data-cd-flow="instinto.CockpitShell.player-local"
              type="button"
              variant="outline"
              size="sm"
              title="Aproximar ao ChatGPT · abrir player local"
              aria-label="Aproximar ao ChatGPT e abrir player local"
              onClick={abrirPlayerLocal}
            >
              <Headphones aria-hidden className="size-4" /> Aproximar ao ChatGPT
            </Button>
            <Button
              data-cd-flow="instinto.CockpitShell.hermes-one-topo"
              type="button"
              variant="outline"
              size="sm"
              title="Hermes ONE · abrir módulo no Cockpit"
              aria-label="Hermes ONE · abrir módulo no Cockpit"
              onClick={abrirHermesOne}
              disabled={modulos.hermes === "desativado"}
              className="gap-1.5"
            >
              <img
                src="/brands/hermes-one.svg"
                alt="Hermes ONE"
                className="h-4 w-[88px] max-w-full object-contain"
              />
            </Button>
            {!autenticado ? (
              <Button data-cd-flow="instinto.CockpitShell.botao-02" asChild size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
            ) : (
              <MenuContaCentralDark
                onPersonalizar={() => abrirDestino("design")}
                onConfiguracoes={() => definirGaveta("bottom")}
                onAdministracao={() => abrirDestino("admin")}
                onBuscar={() => definirGaveta("top")}
                onDownloads={() => abrirDestino("downloads")}
                onSair={sair}
              />
            )}
          </div>
        </div>
      </header>
      {harnessVisivel ? (
        <nav aria-label="Harness lateral esquerdo" className="fixed left-1 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 sm:flex rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="icon" variant="ghost" title="Abrir ferramentas" aria-label="Abrir ferramentas" onClick={() => definirGaveta("left")}><Menu className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="CentralDark Gram" aria-label="CentralDark Gram" onClick={() => autenticado ? abrirDestino("gram") : abrirDestino("visao")}><MessagesSquare className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Goals" aria-label="Goals" onClick={() => abrirDestino("goals")}><Zap className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Buscar módulos" aria-label="Buscar módulos" onClick={() => definirGaveta("top")}><Search className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness lateral direito" className="fixed right-1 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 sm:flex rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="icon" variant="ghost" title="Sistemas" aria-label="Sistemas" onClick={() => definirGaveta("right")}><PanelRight className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Hermes" aria-label="Hermes" onClick={() => abrirDestino("hermes")}><Terminal className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Configurar Harness" aria-label="Configurar Harness" onClick={() => definirGaveta("bottom")}><Settings2 className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness superior" className="fixed left-1/2 top-1 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("visao")}>🧿 CentralDark</Button>
          {autenticado ? <CentralNotificacoes modo="sininho" abrirCentral={() => {
            definirAbaAdminInicial("notificacoes");
            definirVersaoAdmin((n) => n + 1);
            abrirDestino("admin");
          }} /> : null}
          <Button size="icon" variant="ghost" title="Mapa dos sistemas" aria-label="Mapa dos sistemas" onClick={() => definirGaveta("top")}><Layers3 className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness inferior" className="fixed bottom-2 left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("sync")}><SyncLoopIcon autoSyncEnabled={false} isFetching={false} size={16} className="mr-1" /> Sync</Button>
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("downloads")}><Download className="mr-1 size-4" /> Pacotes</Button>
          <Button size="icon" variant="ghost" title="Configurar moldura" aria-label="Configurar moldura" onClick={() => definirGaveta("bottom")}><Wrench className="size-4" /></Button>
        </nav>
      ) : (
        <Button type="button" className="fixed bottom-2 right-2 z-40" variant="outline" size="sm" onClick={() => definirHarnessVisivel(true)}>Mostrar Harness</Button>
      )}
      <Sheet open={gaveta !== null} onOpenChange={(aberto) => { if (!aberto) definirGaveta(null); }}>
        <SheetContent
          side={gaveta ?? "left"}
          className={gaveta === "top" || gaveta === "bottom" ? "max-h-[80dvh] overflow-y-auto" : "overflow-y-auto"}
          onOpenAutoFocus={(event) => {
            if (gaveta === "top") {
              event.preventDefault();
              document.getElementById("busca-harness")?.focus();
            }
          }}
        >
          <SheetHeader><SheetTitle>🧿 CentralDark · Harness</SheetTitle><SheetDescription>Uma casca, múltiplos sistemas. Acesso pela mesma Sala de Controle.</SheetDescription></SheetHeader>
          <div className="mt-6 space-y-4">
            <label htmlFor="busca-harness" className="block text-xs font-semibold">Encontrar ferramenta</label>
            <input id="busca-harness" className="w-full rounded border border-border bg-muted/30 px-3 py-2 text-sm" value={buscaHarness} onChange={(e) => definirBuscaHarness(e.target.value)} placeholder="Filtrar menus..." />
            <div className="grid gap-2 sm:grid-cols-2">
              {destinosHarness.map((destino) => <Button key={destino.id} variant={abaAtiva === destino.id ? "default" : "outline"} className="h-auto min-h-12 justify-start whitespace-normal text-left" onClick={() => abrirDestino(destino.id)}>{destino.icone} {destino.titulo}</Button>)}
            </div>
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Estado da moldura: LOCAL</p>
              <p className="mt-1">Navegação interna funcional. VPS, Telegram MTProto e GitHub exigem contraprovas independentes; nenhuma luz verde é inferida.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { definirHarnessVisivel(false); definirGaveta(null); }}>Ocultar moldura</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={playerAberto} onOpenChange={definirPlayerAberto}>
        <DialogContent className="max-h-[94dvh] max-w-5xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border bg-background/95 px-5 py-4 pr-12">
            <DialogTitle>🎧 Player local · Jarvis</DialogTitle>
            <DialogDescription>
              Player do Instinto Superior servido pelo mesmo Cockpit na porta 8080. A fonte de áudio continua privada na tailnet.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto bg-[#0a0906] p-2 sm:p-4"><PlayerLocalJarvis /></div>
        </DialogContent>
      </Dialog>

      {estudioAberto ? (
        <section id="centraldark-estudio" aria-label="CentralDark Estúdio" className="scroll-mt-20 border-b border-border bg-surface/60 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neon-blue">Instinto Superior · aplicação existente</p>
                <h2 className="mt-1 text-2xl font-semibold">🧩 CentralDark Estúdio</h2>
                <p className="mt-2 text-sm text-muted-foreground">Uma entrada no cockpit para o AionUI já instalado na VPS. Não inicia outra instância nem transfere sessões da Casa.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" data-cd-flow="instinto.CockpitShell.estudio-verificar" onClick={() => void conferirEstudio()}>
                  <SyncLoopIcon autoSyncEnabled={false} isFetching={false} size={16} /> Verificar API
                </Button>
                <Button asChild type="button" size="sm" variant="outline" data-cd-flow="instinto.CockpitShell.estudio-externo">
                  <a href="https://ui.centralldark.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" /> Abrir em janela
                  </a>
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => definirEstudioAberto(false)}>Fechar</Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/70 p-3">
              <span role="status" className="mr-2 font-mono text-xs text-muted-foreground">Estúdio: {estadoEstudio}</span>
              <span className="text-xs text-muted-foreground">Pele da moldura:</span>
              {([["default", "Padrão"], ["ouro", "Breu & Ouro"], ["ops", "Ops · Ciano"], ["esmeralda", "Esmeralda"]] as const).map(([id, nome]) => (
                <Button type="button" key={id} size="sm" variant={pele === id ? "default" : "outline"} aria-pressed={pele === id}
                  onClick={() => selecionar(id)} data-cd-flow={"instinto.CockpitShell.estudio-pele-" + id}>{nome}</Button>
              ))}
              <span className="text-xs text-muted-foreground">O interior do AionUI mantém o tema nativo nesta etapa.</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <iframe title="CentralDark Estúdio — AionUI original" src="https://ui.centralldark.com/"
                className="h-[72vh] min-h-[360px] w-full border-0" loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin" allow="clipboard-read; clipboard-write" />
            </div>
            <details className="rounded-lg border border-border p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Conexões e portas existentes · última medição 22/10/2026</summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {([
                  ["Estúdio · AionUI", "https://ui.centralldark.com/", "VPS 25808 · HTTP 200"],
                  ["Cockpit · Instinto Superior", "https://admin.centralldark.com/sala-controle", "VPS 25812 · HTTP 200"],
                  ["MCP · CentralDark", "https://mcp.centralldark.com/health", "VPS 9100 · HTTP 200"],
                  ["API · Hermes Core", "https://api.centralldark.com/health", "VPS 8899 · HTTP 200"],
                ] as const).map(([nome, url, prova]) => (
                  <a key={url} data-cd-flow={"instinto.CockpitShell.estudio-rota-" + nome} href={url}
                    target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border p-3 hover:border-neon-blue">
                    <span className="flex items-center gap-2 text-sm font-semibold">{nome}<ExternalLink className="size-3" /></span>
                    <span className="mt-1 block break-all font-mono text-[11px] text-muted-foreground">{url}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Última medição: {prova}. Revalidar antes de concluir.</span>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Rotas locais adicionais na VPS (não são links do navegador): AionCore 46573, OAuth Broker 8098, Telegram MTProto 8790 e Hermes 8644/9900. Porta aberta não comprova autenticação ou ação.</p>
            </details>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden border-b border-border px-4 py-20 sm:px-6">
        <div aria-hidden className="grid-mesh absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-[10px] tracking-[0.22em] text-neon-blue uppercase">
            {autenticado ? "SALA DE CONTROLE" : "ACESSO OPERACIONAL"}
          </p>
          <h1 className="text-gold-gradient mt-4 max-w-4xl text-5xl font-semibold sm:text-7xl">
            Cockpit vivo
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Estado atual, conexões e Hermes reunidos numa única superfície, sem transformar
            histórico em prova.
          </p>
          {!autenticado ? (
            <Button
              data-cd-flow="instinto.CockpitShell.botao-04"
              asChild
              size="lg"
              className="mt-8"
            >
              <Link to="/auth">Abrir cockpit</Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Auto Sync + Micro-Deploy + Status Lights + Daily Review */}
          <AutoSyncButton />
          <div className="mt-4 space-y-4">
            <StatusPanel />
            <DailyReviewPanel />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Radar className="size-5 text-neon-blue" />
            <h2 className="text-2xl font-semibold">HUD de estado</h2>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              ATUALIZAÇÃO 60S
            </span>
          </div>
          <PapagaioHudMcp medicao={hudMedido} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BlocoEstado
              titulo="Main oficial"
              estado={
                estado.isPending ? "RUNNING" : ((dado?.github ?? "UNKNOWN") as EstadoOperacional)
              }
              codigo={dado?.sha?.slice(0, 12) ?? "Aguardando medição"}
              detalhe="Medição via CentralDark; OAuth externo não bloqueia."
              icone={<Github className="size-5" />}
            />
            <BlocoEstado
              titulo="Build local"
              estado={(dado?.build ?? "UNKNOWN") as EstadoOperacional}
              codigo="Sem medição viva"
              detalhe="Sem fonte real de build com horário medido."
              icone={<Activity className="size-5" />}
            />
            <BlocoEstado
              titulo="Servidor publicado"
              estado={(dado?.deploy ?? "UNKNOWN") as EstadoOperacional}
              codigo={dado?.vpsSha?.slice(0, 12) ?? "UNKNOWN"}
              detalhe={
                dado?.deltaVps != null
                  ? `${dado.deltaVps} commit(s) atrás.`
                  : "Sem fonte viva do servidor."
              }
              icone={<Server className="size-5" />}
            />
            <BlocoEstado
              titulo="Gmail"
              estado={(dado?.gmail ?? "AUTH_REQUIRED") as EstadoOperacional}
              detalhe="Autorização humana pendente; o restante continua operando."
              icone={<Mail className="size-5" />}
            />
          </div>
          {autenticado ? (
            <div className="mt-10">
              <PainelConsumo />
            </div>
          ) : null}

          <Tabs value={abaAtiva} onValueChange={definirAbaAtiva} className="mt-8 min-w-0" id="centraldark-harness-abas">
            <div className="sticky top-0 z-30 -mx-4 min-w-0 border-y border-border bg-background/95 px-3 py-2 backdrop-blur sm:mx-0 sm:rounded-md sm:border" aria-label="Navegação do cockpit">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="max-w-36 truncate font-mono text-xs text-muted-foreground sm:max-w-60" title={tituloAbaAtiva}>{tituloAbaAtiva}</span>
                  <Button type="button" size="sm" variant={abaAtiva === "visao" ? "default" : "ghost"} onClick={() => abrirDestino("visao")}>Visão</Button>
                  <Button type="button" size="sm" variant={abaAtiva === "jornada" ? "default" : "ghost"} onClick={() => abrirDestino("jornada")}>🎮 Jornada</Button>
                  <Button type="button" size="sm" variant={abaAtiva === "sync" ? "default" : "ghost"} onClick={() => abrirDestino("sync")}>Oficina</Button>
                  <Button type="button" size="sm" variant={abaAtiva === "hermes" ? "default" : "ghost"} onClick={() => abrirDestino("hermes")}>Hermes</Button>
                </div>
                <details className="w-full min-w-0 rounded-md border border-border/70 bg-muted/20 p-1 sm:w-auto sm:flex-1" id="centraldark-todas-as-abas">
                  <summary className="cursor-pointer select-none rounded px-3 py-2 text-center text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Todas as áreas ▾</summary>
                  <div className="mt-2 max-h-[min(60dvh,34rem)] overflow-y-auto p-1">
                    <TabsList className="grid h-auto w-full min-w-0 grid-cols-2 items-stretch justify-start gap-1.5 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-5 [&_[role=tab]]:h-auto [&_[role=tab]]:min-h-10 [&_[role=tab]]:min-w-0 [&_[role=tab]]:whitespace-normal [&_[role=tab]]:break-words [&_[role=tab]]:justify-start [&_[role=tab]]:text-left">
                <TabsTrigger value="visao" data-cd-flow="instinto.CockpitShell.aba.visao">Visão geral</TabsTrigger>
                <TabsTrigger value="jornada" data-cd-flow="instinto.CockpitShell.aba.jornada">🎮 Jornada</TabsTrigger>
                <TabsTrigger value="portal" data-cd-flow="instinto.CockpitShell.aba.portal">🌐 Portal</TabsTrigger>
                <TabsTrigger value="builder-bolt" data-cd-flow="instinto.CockpitShell.aba.builder-bolt">⚡ Builder Bolt</TabsTrigger>
                <TabsTrigger value="pr1873" data-cd-flow="instinto.CockpitShell.aba.pr1873">📜 Mapa PR #1873</TabsTrigger>
                {autenticado ? <TabsTrigger value="gram" data-cd-flow="instinto.CockpitShell.aba.gram">✉️ CentralDark Gram</TabsTrigger> : null}
                <TabsTrigger value="sync" data-cd-flow="instinto.CockpitShell.aba.sync">🛠️ Minha Oficina</TabsTrigger>
                <TabsTrigger value="design" data-cd-flow="instinto.CockpitShell.aba.design">Design Center</TabsTrigger>
                <TabsTrigger value="goals" data-cd-flow="instinto.CockpitShell.aba.goals">🎯 Goals</TabsTrigger>
                {autenticado ? <TabsTrigger value="genesis" data-cd-flow="instinto.CockpitShell.aba.genesis">🧬 Gênesis · Michelin</TabsTrigger> : null}
                <TabsTrigger value="dream-reviewer" data-cd-flow="instinto.CockpitShell.aba.dream-reviewer">😴 Dream</TabsTrigger>
                <TabsTrigger value="arquitetura" data-cd-flow="instinto.CockpitShell.aba.arquitetura">📐 Estrutura</TabsTrigger>
                <TabsTrigger value="raioxvivo" data-cd-flow="instinto.CockpitShell.aba.raioxvivo">🪬 Raio-X</TabsTrigger>
                <TabsTrigger value="recibos" data-cd-flow="instinto.CockpitShell.aba.recibos">📊 Recibos</TabsTrigger>
                <TabsTrigger value="forja" data-cd-flow="instinto.CockpitShell.aba.forja">🔧 Forja</TabsTrigger>
                {autenticado ? <TabsTrigger value="gram-permissions" data-cd-flow="instinto.CockpitShell.aba.gram-permissions">📋 Permissões Forja</TabsTrigger> : null}
                {autenticado ? <TabsTrigger value="admin" data-cd-flow="instinto.CockpitShell.aba.admin">Admin CentralDark</TabsTrigger> : null}
                {autenticado ? (
                  <TabsTrigger value="sistema" data-cd-flow="instinto.CockpitShell.aba.sistema">Sistema CentralDark</TabsTrigger>
                ) : null}
                <TabsTrigger value="hermes">Hermes</TabsTrigger>
                <TabsTrigger value="obsidian">💎 Obsidian</TabsTrigger>
                <TabsTrigger value="aionui">🧩 Estúdio</TabsTrigger>
                <TabsTrigger value="unigram">Unigram</TabsTrigger>
                <TabsTrigger value="forja-regras">Regras Forja</TabsTrigger>
                <TabsTrigger value="forja-inventario">Inventário</TabsTrigger>
                <TabsTrigger value="agent-mode">Agent Mode</TabsTrigger>
                <TabsTrigger value="html-consolidation">HTML Consolidation</TabsTrigger>
                <TabsTrigger value="downloads">Downloads</TabsTrigger>
                <TabsTrigger value="hermes" data-cd-flow="instinto.CockpitShell.aba.hermes">Hermes</TabsTrigger>
                <TabsTrigger value="unigram" data-cd-flow="instinto.CockpitShell.aba.unigram">Unigram</TabsTrigger>
                <TabsTrigger value="forja-regras" data-cd-flow="instinto.CockpitShell.aba.forja-regras">Regras Forja</TabsTrigger>
                <TabsTrigger value="forja-inventario" data-cd-flow="instinto.CockpitShell.aba.forja-inventario">Inventário</TabsTrigger>
                <TabsTrigger value="agent-mode" data-cd-flow="instinto.CockpitShell.aba.agent-mode">Agent Mode</TabsTrigger>
                <TabsTrigger value="html-consolidation" data-cd-flow="instinto.CockpitShell.aba.html-consolidation">HTML Consolidation</TabsTrigger>
                <TabsTrigger value="downloads" data-cd-flow="instinto.CockpitShell.aba.downloads">Downloads</TabsTrigger>
              </TabsList>
                  </div>
                </details>
              </div>
            </div>
            <TabsContent value="pr1873" className="mt-8">
              <PainelPR1873 />
            </TabsContent>
            <TabsContent value="portal" className="mt-8">
              <MenuVisualCentralDark titulo="🌐 Portal" descricao="Produtos e experiência pública; o TelePainel permanece produto independente." itens={["🏠 Página inicial", "📦 Catálogo", "📟 TelePainel", "💬 WhatsApp / CRM", "💰 Financeiro"]} />
            </TabsContent>
            <TabsContent value="builder-bolt" className="mt-8">
              <MenuVisualCentralDark titulo="⚡ Builder Bolt" descricao="Fábrica de sites existente. Esta vitrine não inicia outro editor ou processo." itens={["🏗️ Construção de sites", "🖥️ Editor", "👁️ Preview", "🗂️ Projetos existentes", "🧩 Modelos e componentes", "🔄 Git e versões"]} />
            </TabsContent>
            {autenticado ? <TabsContent value="gram" className="mt-8"><CentralDarkGram abrirAdmin={() => abrirDestino("admin")} abrirSync={() => abrirDestino("sync")} /></TabsContent> : null}
            <TabsContent value="visao" className="mt-8">
              <div className="mb-6"><CartaoDiscosForja /></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <BlocoEstado
                  titulo="Writer material único"
                  estado="UNKNOWN"
                  codigo="agent/centraldark-cockpit-vivo"
                  detalhe="Declarado; sem lease medido ao vivo."
                  icone={<ShieldCheck className="size-5" />}
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <BlocoEstado
                  titulo="One Heart · heartbeat"
                  estado="UNKNOWN"
                  codigo={
                    dado?.atualizadoEm
                      ? `Consulta: ${new Date(dado.atualizadoEm).toLocaleString("pt-BR")}`
                      : "Sem consulta"
                  }
                  detalhe="Horário da consulta não comprova heartbeat. Sem measured_at do owner One Heart, a pulsação permanece UNKNOWN."
                  icone={<Activity className="size-5" />}
                />
                <BlocoEstado
                  titulo="Grafo vivo"
                  estado={dado?.grafoVivo ?? "UNKNOWN"}
                  codigo={dado?.grafoHttp ? `HTTP ${dado.grafoHttp}` : "Sem resposta medida"}
                  detalhe="Projeção da capacidade Live Fabric existente; nenhum segundo motor de grafo."
                  icone={<Radar className="size-5" />}
                />
              </div>
              {autenticado ? (
                <MapaOwners onNavigate={definirAbaAtiva} autenticado={autenticado} />
              ) : null}
              <div className="mt-8">
                <DeliverablesSummary />
              </div>
              <div className="mt-8">
                <MapaMetabolicoCristal compacto />
              </div>
              <Ledger compacto />
              <EstudoPorCriterios contexto="visao" />
            </TabsContent>
            <TabsContent value="jornada" className="mt-8">
              <JornadaEvolutiva abrirDestino={abrirDestino} />
            </TabsContent>
            <TabsContent value="sync" className="mt-10">
              {dado ? <SyncCenter estado={dado} /> : <SyncCenter />}
            </TabsContent>
            <TabsContent value="design" className="mt-10">
              <DesignCenter pele={pele} selecionarPele={selecionar} autenticado={autenticado} />
            </TabsContent>
            {autenticado ? (
              <TabsContent value="genesis" className="mt-10" id="centraldark-genesis-michelin">
                {dado ? <HudDeterministico estado={dado} atualizar={() => void estado.refetch()} /> : <HudDeterministico atualizar={() => void estado.refetch()} />}
              </TabsContent>
            ) : null}
            <TabsContent value="goals" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Acompanhamento de objetivos
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Goals Vigentes</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Painel de goals da CentralDark com status, critérios e progresso.
                </p>
              </div>
              <GoalsDashboard />
            </TabsContent>
            <TabsContent value="dream-reviewer" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Aprendizado Offline
                </p>
                <h2 className="mt-3 text-3xl font-semibold">😴 Dream Reviewer</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Hermes aprendendo enquanto você dorme • Padrões detectados • Recomendações • Somente leitura
                </p>
              </div>
              <DreamReviewer />
            </TabsContent>
            <TabsContent value="arquitetura" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Estrutura Integrada
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Arquitetura Viva do Cockpit</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Inventário histórico de 9 entregas e 5 sistemas. As 25 áreas estão no Mapa de Owners; runtime exige medição.
                </p>
              </div>
              <ArchitectureVisualization />
            </TabsContent>
            <TabsContent value="raioxvivo" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Ponta a Ponta — SEM Verde Pintado
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Raio-X Vivo</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Rastreamento de conexões reais: VS Code → Hermes → PowerShell → Casa → GitHub → VPS → Cockpit.
                  Apenas verde o que foi medido AGORA. Lacunas bloqueadores em vermelho.
                </p>
              </div>
              <RaioXVivo />
            </TabsContent>
            <TabsContent value="recibos" className="mt-10">
              <ReceiptsDashboard />
            </TabsContent>
            <TabsContent value="forja" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Executor Paralelo
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Forja em PowerShell 7</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Orquestração não-bloqueante: Casa ↔ Forja ↔ GitHub ↔ VPS sincronizados em tempo real.
                </p>
              </div>
              <ForjaExecutor />
              <EstudoPorCriterios contexto="forja" />
            </TabsContent>
            {autenticado ? (
              <TabsContent value="gram-permissions" className="mt-10">
                <GramPermissions />
              </TabsContent>
            ) : null}
            {autenticado ? (
              <TabsContent value="admin" className="mt-10">
                <MenuVisualCentralDark titulo="🔐 Admin → Control Plane" descricao="Estrutura visual do HUB Credential Control Plane. Sem exposição de credenciais e sem ligação simulada." itens={["👥 Contas e permissões", "☁️ Cloudflare", "🔌 APIs e MCPs", "🔑 Cofre", "🤖 Bots", "🔗 Providers / OAuth", "📋 Auditoria", "🟡 Estado das conexões"]} />
                <div className="mt-6"><PainelAdminCentralDark key={versaoAdmin} estado={dado} abaInicial={abaAdminInicial} /></div>
                <McpConsoleCentralDark />
              </TabsContent>
            ) : null}
            {autenticado ? (
              <TabsContent value="sistema" className="mt-10">
                <SistemaCentralDark
                  estado={dado}
                  atualizando={estado.isFetching}
                  atualizar={() => void estado.refetch()}
                />
              </TabsContent>
            ) : null}
            <TabsContent value="hermes" className="mt-10">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={hermesOneAberto ? "outline" : "default"}
                  onClick={() => definirHermesOneAberto(false)}>Hermes Core · painel atual</Button>
                <Button type="button" size="sm" variant={hermesOneAberto ? "default" : "outline"}
                  disabled={modulos.hermes === "desativado"}
                  onClick={() => { definirEstudioAberto(false); definirHermesOneAberto(true); }}>Hermes ONE · interface web</Button>
                <Button type="button" size="sm" variant="outline" onClick={abrirPlayerLocal}>
                  <Headphones aria-hidden className="mr-1 size-4" /> Player local · áudio
                </Button>
              </div>
              {hermesOneAberto ? <HermesOneWebLocal autenticado={autenticado} /> : (
                <>
              <div className="mb-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Controle compartilhado
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Hermes · executor</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Pele, ação, quadro, direção e velocidade atuam no mesmo Hermes flutuante.
                </p>
              </div>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <BlocoEstado
                  titulo="Hermes Desktop"
                  estado={(dado?.desktop ?? "UNKNOWN") as EstadoOperacional}
                  detalhe="Ponte encontrada; execução física ainda exige prova própria."
                  icone={<Activity className="size-5" />}
                />
                <BlocoEstado
                  titulo="Pacote Hermes"
                  estado="UNKNOWN"
                  codigo={formatarTamanho(pacoteHermes.size)}
                  detalhe="Manifesto local encontrado; publicação e integridade do ZIP não foram remedidas."
                  icone={<PackageCheck className="size-5" />}
                />
              </div>
              <PainelHermes compacto />
              <div className="mt-6 border-y border-border py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Hermes · juiz ao vivo (terminal)</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    CENTRALDARK-HERMES-HUD.bat
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Atalho da Casa: abre o PowerShell e entra na VPS (Segredo-VPS) rodando
                  /root/hermes-hud.sh. É a mesma vista do Hermes, só que no terminal. Não é prova de
                  execução por si só: o estado vem do que o script medir na hora.
                </p>
              </div>
              <div className="mt-6 border-y border-border py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Hermes · execução física</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {dado?.desktop ?? "UNKNOWN"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Fluxo de logs não conectado. Animação local não comprova execução no Desktop.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                  A seleção ao vivo usa o mesmo catálogo incluído no pacote para Windows, com
                  instalação protegida por backup e rollback.
                </p>
                <Button
                  data-cd-flow="instinto.CockpitShell.botao-05"
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a href={pacoteHermes.url} download>
                    <Download />
                    Baixar para Windows
                  </a>
                </Button>
              </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="aionui" className="mt-10">
              <section className="panel space-y-4 p-6" aria-labelledby="centraldark-estudio-title">
                <p className="font-mono text-[10px] tracking-[0.18em] text-neon-blue uppercase">
                  Aplicativo original · protótipo CentralDark já existente
                </p>
                <h2 id="centraldark-estudio-title" className="text-3xl font-semibold">🧩 CentralDark Estúdio</h2>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  O AionUI completo já tem receita de build com identidade CentralDark, menus nativos,
                  tarefas, AionCore e Hermes. Esta entrada reutiliza a superfície atual enquanto
                  a versão Windows com o código completo e os dados no K: é validada.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" asChild>
                    <a href="http://89.117.78.124:25808/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" /> Abrir AionUI atual
                    </a>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href="https://github.com/ServerVpss/CentralDark/tree/main/experiments/aionui-centraldark-instinto-superior"
                      target="_blank" rel="noopener noreferrer">
                      Ver protótipo e receita original
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  A versão web atual abre separadamente. O build Windows, o rebranding completo,
                  a instalação no K: e a janela interna do Shell exigem testes próprios.
                  Botão visível não comprova aplicativo instalado ou incorporado.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="obsidian" className="mt-10">
              <section className="panel space-y-5 p-6" aria-labelledby="obsidian-harness-heading">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-neon-blue uppercase">Aplicativo do Harness · memória da Forja</p>
                  <h2 id="obsidian-harness-heading" className="mt-2 text-3xl font-semibold">💎 Obsidian</h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                    Teu aplicativo original, com notas, pesquisa, plugins, Mermaid e Grafo Vivo.
                    A CentralDark utiliza o vault existente em K: — não cria cópia da memória.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {nativeObsidianBridge()?.openObsidianDesktop ? (
                    <Button type="button" onClick={() => void abrirObsidian()} disabled={obsidianLaunch === "PENDING"}>
                      💎 {obsidianLaunch === "PENDING" ? "Abrindo Obsidian..." : "Abrir Obsidian original"}
                    </Button>
                  ) : (
                    <a className="inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
                       href="obsidian://open?vault=BRAIN">💎 Abrir Obsidian no computador</a>
                  )}
                  <Button type="button" variant="outline" onClick={() => abrirDestino("sistema")} disabled={!autenticado}>
                    📚 Cofre e biblioteca
                  </Button>
                </div>
                <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
                  {obsidianLaunch === "REQUESTED" ? "Abertura solicitada ao Windows. A janela original continua independente." :
                   obsidianLaunch === "ERROR" ? "Não foi possível solicitar a abertura. Verifique o aplicativo instalado." :
                   obsidianLaunch === "UNAVAILABLE" ? "A abertura nativa requer o aplicativo CentralDark Desktop." :
                   "No navegador, o botão usa o protocolo nativo do Obsidian. No Desktop, a ponte existente despacha a abertura autorizada."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Acesso ao aplicativo inteiro ≠ incorporação da janela Win32 no navegador.
                  Gerenciamento nativo da janela dentro do Shell e localização física do executável no K:
                  exigem validação independente; nenhuma instalação ou movimentação foi feita por este módulo.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="unigram" className="mt-10">
              <section className="panel p-6" aria-label="Unigram original como capacidade da CentralDark">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Capacidade externa · mesma Casa
                </p>
                <h2 className="mt-3 flex items-center gap-3 text-3xl font-semibold">
                  <Send className="size-6" aria-hidden /> Unigram
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Abre a interface original do Unigram instalado no Windows, lado a lado com
                  o Instinto Superior. Preserva mensagens, sessão, atualizações e recursos
                  do próprio aplicativo. Não copia código nem usa uma conta Telegram
                  por API sem autorização específica.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    onClick={() => void abrirUnigram()}
                    disabled={unigramLaunch === "PENDING"}
                    data-cd-flow="instinto.CockpitShell.unigram-abrir"
                  >
                    <Send className="size-4" aria-hidden /> Abrir Unigram original
                  </Button>
                  <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
                    {unigramLaunch === "IDLE" ? "Disponibilidade do aplicativo: UNKNOWN"
                      : unigramLaunch === "PENDING" ? "Solicitando abertura…"
                      : unigramLaunch === "REQUESTED" ? "Solicitação enviada ao Windows · janela não comprovada"
                      : unigramLaunch === "UNAVAILABLE" ? "Esta ação requer o CentralDark.exe no Windows; navegador não abre apps locais"
                      : "Falha ao solicitar abertura · consultar log nativo"}
                  </span>
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  Este botão usa a ponte existente do CentralDark Desktop. A edição web
                  não tenta executar aplicativos na máquina do visitante. Unigram e Hermes
                  continuam processos independentes, governados pelos contratos existentes.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="forja-regras" className="mt-6">
              <section className="rounded-xl border border-border bg-surface/50 p-4 sm:p-6">
                <h2 className="text-xl font-semibold">📜 Regras da Forja</h2>
                <p className="mt-2 text-sm text-muted-foreground">RULES.md e AGENTS.md são os owners. Abrir documentos não executa comandos.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm"><a href="https://github.com/ServerVpss/CentralDark/blob/main/RULES.md" target="_blank" rel="noopener noreferrer">RULES.md ↗</a></Button>
                  <Button asChild variant="outline" size="sm"><a href="https://github.com/ServerVpss/CentralDark/blob/main/AGENTS.md" target="_blank" rel="noopener noreferrer">AGENTS.md ↗</a></Button>
                  <Button type="button" onClick={() => abrirDestino("forja")}>Abrir Forja</Button>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="forja-inventario" className="mt-6">
              <section className="rounded-xl border border-border bg-surface/50 p-4 sm:p-6">
                <h2 className="text-xl font-semibold">🗂️ Inventário da Forja</h2>
                <p className="mt-2 text-sm text-muted-foreground">Reutiliza o Sistema e o Mapa de Owners já existentes; nenhuma ligação remota é presumida.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => abrirDestino(autenticado ? "sistema" : "visao")}>Abrir owner do inventário</Button>
                  <Button type="button" variant="outline" onClick={() => abrirDestino("raioxvivo")}>Conferir Raio-X</Button>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="agent-mode" className="mt-10">
              <div className="mb-8 space-y-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-neon-green uppercase">
                    Sistema operacional
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">Incremental Evidence-Driven</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Arquitetura de execução persistente com convergência a ponto fixo. Não para por
                    iteração ou conta — para quando evidência estabiliza ou bloqueio crítico é
                    encontrado.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <BlocoEstado
                    titulo="Mode"
                    estado="UNKNOWN"
                    codigo="incremental_evidence_driven"
                    detalhe="Planejamento → Ação → Medição → Crítica → Refinamento → Decisão (loop)"
                    icone={<Activity className="size-5" />}
                  />
                  <BlocoEstado
                    titulo="Terminal Condition"
                    estado="UNKNOWN"
                    codigo="μ(k) == μ(k+1)"
                    detalhe="Para quando estado converge (evidência estabiliza) ou bloqueio crítico"
                    icone={<ShieldCheck className="size-5" />}
                  />
                  <BlocoEstado
                    titulo="Persistence"
                    estado="UNKNOWN"
                    codigo="State Journal"
                    detalhe="Cada ciclo registrado: BEGIN → ACT → OBSERVE → CRITIQUE → DECIDE → FINAL"
                    icone={<Radar className="size-5" />}
                  />
                  <BlocoEstado
                    titulo="Gates"
                    estado="UNKNOWN"
                    codigo="meta_lupa + cot_react"
                    detalhe="Falsificação automática + observação contínua antes de cada veredito"
                    icone={<ShieldCheck className="size-5" />}
                  />
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold">6 Componentes Chave</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">Meta-Lupa</dt>
                      <dd className="text-muted-foreground">
                        Falsifica, busca contradição, bloqueia falso verde antes do veredito
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">COT-React</dt>
                      <dd className="text-muted-foreground">
                        Observar → Agir → Medir → Corrigir (durante cada ciclo)
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">Fable-Loop</dt>
                      <dd className="text-muted-foreground">
                        Estabiliza prova até fixed point (μ(k) = μ(k+1) por N ciclos)
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">
                        State Ledger
                      </dt>
                      <dd className="text-muted-foreground">
                        Persiste cada ciclo imutável (BEGIN/ACT/OBSERVE/CRITIQUE/DECIDE/FINAL)
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">
                        Evidence Store
                      </dt>
                      <dd className="text-muted-foreground">
                        Armazena provas observáveis, não narrativa histórica
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="font-mono text-xs text-neon-blue min-w-[140px]">
                        Reuse First
                      </dt>
                      <dd className="text-muted-foreground">
                        Estende existente antes de criar novo (sem v1/v2/v3)
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold">Configuração Ativa</h3>
                  <pre className="mt-3 overflow-x-auto rounded bg-black/30 p-3 text-xs text-mono">
                    {`AGENT_MODE: incremental_evidence_driven
PERSISTENCE: ledger (./ledger.jsonl)
GATES: meta_lupa + cot_react_loop
TERMINAL: fixed_point_or_blocked
LOOP_CONFIG:
  min_cycles: 3
  max_cycles: ∞ (até convergência)
  backcheck_window: 5
  forward_window: 20
  adaptive: true
REUSE: before_create (sem duplicação)`}
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold">Ciclo Operacional (Loop)</h3>
                  <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>1. PLAN</strong> — Mapeia intenção, gates críticos, sucesso esperado
                    </li>
                    <li>
                      <strong>2. ACT</strong> — Uma ação observável por ciclo (sem multiplas
                      paralelas)
                    </li>
                    <li>
                      <strong>3. OBSERVE</strong> — Captura resultado real com prova (não esperado)
                    </li>
                    <li>
                      <strong>4. CRITIQUE</strong> — Classifica PASS/FAIL/GAP/BLOCKED (não
                      storytelling)
                    </li>
                    <li>
                      <strong>5. REFINE</strong> — Só muda se evidência contradiz hipótese anterior
                    </li>
                    <li>
                      <strong>6. DECIDE</strong> — Continuar ou parar (ponto fixo = μ(k) = μ(k+1))
                    </li>
                    <li>
                      <strong>7. LOOP</strong> — Volta a PLAN; sem contagem artificial de iterações
                    </li>
                  </ol>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold">Modelo da Forja — runtime não verificado</h3>
                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">HEAD</dt>
                      <dd className="mt-1 break-all font-mono">{dado?.mainSha ?? "UNKNOWN"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Mode Ativo</dt>
                      <dd className="mt-1 font-mono">✅ incremental_evidence_driven</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ciclo Atual</dt>
                      <dd className="mt-1 font-mono">
                        Fixed Point Convergence (Agente 1-6 completados)
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Terminal Condition</dt>
                      <dd className="mt-1 font-mono">UNKNOWN · exige contraprova</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="html-consolidation" className="mt-10">
              <div className="mb-8 space-y-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
                    Consolidação de artefatos
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">HTML Consolidation · histórico</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Mapeamento completo de K:\ para cockpit-unified/. 16 pastas consolidadas, 4
                    archived, 0 duplicações.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">📊 Snapshot histórico — sem readback atual</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">DISCOVERY</dt>
                      <dd className="mt-1 font-mono text-lg text-green-600">✅ 100%</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">CLASSIFICAÇÃO</dt>
                      <dd className="mt-1 font-mono text-lg text-green-600">✅ 100%</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">CONVERGÊNCIA</dt>
                      <dd className="mt-1 font-mono text-lg text-green-600">✅ 100%</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">VALIDAÇÃO</dt>
                      <dd className="mt-1 font-mono text-lg text-green-600">✅ 100% (SHA256 OK)</dd>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">📁 Estrutura Final</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-neon-purple">
                        K:\apps\modulos\cockpit-unified/
                      </dt>
                      <dd className="mt-2 text-xs text-muted-foreground ml-2">
                        <pre className="overflow-x-auto bg-black/30 p-2 rounded text-[10px]">
                          arsenal-council---painel-de-modelos/ ✅ batalha-de-ias---arena/ ✅
                          conselho-de-tutores---visualiza-o/ ✅ dashboard-de-agentes-centraldark/ ✅
                          debate-hist-rico---timeline/ ✅ gerenciador-de-processos-pm2/ ✅
                          grafo-3d-interativo---explorer/ ✅ graph-panel/ ⭐ (1 ref ativa)
                          healthcheck-vps---painel-de-recursos/ ✅ mapa-de-depend-ncias-do-sistema/
                          ✅ monitor-de-logs-centraldark/ ✅ motor-teste-centraldark-relatorio/ ✅
                          quadro-de-miss-es-do-hermes/ ✅ relat-rio-de-evolu-o---di-rio/ ✅
                          site-centraldark---sistema-completo/ ✅ status/ ⭐ (26 refs ativas) Total:
                          2.4 MB | Integridade: 100% OK ✅
                        </pre>
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">🗂️ Histórico Preservado</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    K:\_archive\html-backup-20261015/
                  </p>
                  <pre className="overflow-x-auto bg-black/30 p-3 text-[10px] rounded">
                    cf-oauth-hub-20261009/ ✅ 0.5 MB cf-openapi-mcp-20261009/ ✅ 0.3 MB
                    hud-main-sync-20261009/ ✅ 0.2 MB hud-missions-mvp-20261009/ ✅ 0.4 MB Total:
                    1.4 MB (4 pastas backed up)
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">🎯 Referências de Código</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <dt className="font-semibold text-neon-blue">graph-panel</dt>
                      <dd className="text-xs text-muted-foreground mt-1">
                        1 arquivo em uso (src/)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neon-blue">status</dt>
                      <dd className="text-xs text-muted-foreground mt-1">
                        26 arquivos em uso (src/)
                      </dd>
                    </div>
                    <div className="mt-3 p-2 rounded bg-amber-900/20 border border-amber-700/50">
                      <p className="text-xs text-amber-600">
                        ⚠️ <strong>TRASH Identificado:</strong> K:\PROGAMAS\PROJETOS ANTIGOS/ (500
                        MB)
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Status: PENDING_DELETION (aguardando confirmação)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">📄 Documentação Gerada</h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>
                      ✅ <code className="bg-black/30 px-2 py-1 rounded">MANIFEST.json</code> —
                      Mapeamento original
                    </li>
                    <li>
                      ✅{" "}
                      <code className="bg-black/30 px-2 py-1 rounded">
                        CONSOLIDATED_MANIFEST.json
                      </code>{" "}
                      — Origem→Destino com SHA256
                    </li>
                    <li>
                      ✅ <code className="bg-black/30 px-2 py-1 rounded">FINAL_REPORT.txt</code> —
                      Relatório detalhado
                    </li>
                    <li>
                      ✅{" "}
                      <code className="bg-black/30 px-2 py-1 rounded">
                        CONSOLIDATION_STATUS_FINAL.txt
                      </code>{" "}
                      — Status resumido
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Todos em:{" "}
                    <code className="bg-black/30 px-2 py-1 rounded">
                      K:\apps\modulos\cockpit-unified\
                    </code>
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/20 p-6">
                  <p className="text-sm font-semibold text-emerald-400">🟡 RESULTADO HISTÓRICO · RUNTIME UNKNOWN</p>
                  <ul className="mt-3 space-y-1 text-xs text-emerald-400">
                    <li>✅ Consolidação 100% bem-sucedida</li>
                    <li>✅ Zero perda de dados</li>
                    <li>✅ Zero duplicação</li>
                    <li>✅ Estrutura FLAT em cockpit-unified/</li>
                    <li>✅ Histórico preservado em _archive/</li>
                    <li>✅ Documentação completa</li>
                    <li>⚠️ Produção depende de build e prova do SHA atual</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="downloads" className="mt-10">
              <section id="download-center" className="scroll-mt-24">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-purple uppercase">
                  Pacote único auditável
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Download Center</h2>
                <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <article className="panel p-6">
                    <Download className="size-6 text-neon-purple" />
                    <h3 className="mt-4 text-xl font-semibold">Hermes CentralDark para Windows</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      O manifesto referencia um ZIP com instalador, backup e rollback. A existência
                      e a integridade do arquivo precisam de medição própria.
                    </p>
                    <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Tamanho declarado</dt>
                        <dd className="mt-1 font-mono">{formatarTamanho(pacoteHermes.size)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Registrado em</dt>
                        <dd className="mt-1 font-mono">
                          {new Date(pacoteHermes.created_at).toLocaleString("pt-BR")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Formato declarado</dt>
                        <dd className="mt-1 font-mono">ZIP · PowerShell/BAT</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Conteúdo declarado</dt>
                        <dd className="mt-1 font-mono">16 ações · 256 quadros</dd>
                      </div>
                    </dl>
                    <p className="mt-5 break-all font-mono text-[10px] text-muted-foreground">
                      SHA-256 UNKNOWN · sem hash derivado do arquivo nesta medição
                    </p>
                    <Button data-cd-flow="instinto.CockpitShell.botao-06" asChild className="mt-6">
                      <a href={pacoteHermes.url} download>
                        <Download />
                        Tentar baixar ZIP
                      </a>
                    </Button>
                  </article>
                  <article className="panel p-6">
                    <ShieldCheck className="size-6 text-gold" />
                    <h3 className="mt-4 text-xl font-semibold">Proteção da instalação</h3>
                    <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <li>
                        <span className="text-foreground">1.</span> Detecta os dois destinos atuais.
                      </li>
                      <li>
                        <span className="text-foreground">2.</span> Move cada estado anterior para
                        backup.
                      </li>
                      <li>
                        <span className="text-foreground">3.</span> Instala o pacote canônico.
                      </li>
                      <li>
                        <span className="text-foreground">4.</span> <code>REVERTER-HERMES.bat</code>{" "}
                        restaura os backups.
                      </li>
                    </ol>
                    <div className="mt-6 border-t border-border pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">Integridade e execução física</span>
                        <span className="rounded-md border border-muted-foreground/40 bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                          UNKNOWN
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        Scripts e metadados existem; download, hash, backup, rollback e instalação
                        ainda não foram contraposados nesta superfície.
                      </p>
                    </div>
                  </article>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
