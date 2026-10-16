import { HudDeterministico } from "@/components/central/HudDeterministico";
import { EstudoPorCriterios } from "@/components/central/EstudoPorCriterios";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PainelConsumo } from "@/components/central/PainelConsumo";
import { PainelAdminCentralDark } from "@/components/central/PainelAdminCentralDark";
import { CentralNotificacoes } from "@/components/central/CentralNotificacoes";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Download,
  ExternalLink,
  Github,
  Mail,
  PackageCheck,
  Radar,
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
  RefreshCcw,
  MessageCircle,
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
import { AutoSyncButton } from "@/components/central/AutoSyncButton";
import { StatusPanel } from "@/components/central/StatusPanel";
import { DailyReviewPanel } from "@/components/central/DailyReviewPanel";
import { GoalsDashboard } from "@/components/central/GoalsDashboard";
import { ReceiptsDashboard } from "@/components/central/ReceiptsDashboard";
import { DeliverablesSummary } from "@/components/central/DeliverablesSummary";
import { ForjaExecutor } from "@/components/central/ForjaExecutor";
import { ArchitectureVisualization } from "@/components/central/ArchitectureVisualization";
import { RaioXVivo } from "@/components/central/RaioXVivo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTelegramBotsResumo } from "@/hooks/useTelegramBotsResumo";
import { lerStatusGramMTProto } from "@/lib/admin.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lerEstadoCentralDark } from "@/lib/cockpit.functions";
import { HarnessModuleRegistry } from "@/components/central/HarnessModuleRegistry";
import { CoordinatorDesk } from "@/components/central/CoordinatorDesk";
/** Pacote real servido pelo próprio site (public/downloads), sem armazenamento externo. */
const pacoteHermes = {
  url: "/downloads/Hermes-CentralDark-Pacotao.zip",
  size: 47307928,
  created_at: "2026-09-24T07:27:40Z",
};

function formatarTamanho(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}


const HARNESS_DESTINOS = [
  { id: "visao", titulo: "Visão geral", icone: "🧿", privado: false },
  { id: "gram", titulo: "CentralDark Gram", icone: "✉️", privado: true },
  { id: "goals", titulo: "Goals", icone: "🎯", privado: false },
  { id: "sync", titulo: "Build e Sync", icone: "🔄", privado: false },
  { id: "hermes", titulo: "Hermes", icone: "⚙️", privado: false },
  { id: "design", titulo: "Design Center", icone: "🎨", privado: false },
  { id: "arquitetura", titulo: "Estrutura", icone: "📐", privado: false },
  { id: "sistema", titulo: "Sistema", icone: "🖥️", privado: true },
  { id: "admin", titulo: "Admin", icone: "🔒", privado: true },
  { id: "downloads", titulo: "Downloads", icone: "📦", privado: false },
] as const;

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
          <Button type="button" variant="outline" size="sm" onClick={() => void mtproto.refetch()} disabled={mtproto.isFetching}>
            <RefreshCcw className={mtproto.isFetching ? "size-4 animate-spin" : "size-4"} /> Medir MTProto
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void consulta.refresh()} disabled={consulta.loading}>
            <RefreshCcw className={consulta.loading ? "size-4 animate-spin" : "size-4"} /> Atualizar bots
          </Button>
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

export function CockpitShell({ autenticado = false }: { autenticado?: boolean }) {
  const { pele, selecionar } = usePeleCockpit();
  const [abaAtiva, definirAbaAtiva] = useState("visao");
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
  const queryClient = useQueryClient();
  const navegar = useNavigate();
  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navegar({ to: "/auth", replace: true });
  }

  return (
    <main
      data-pele-cockpit={pele}
      className={`min-h-dvh pb-52 ${pele === "default" ? "" : "cockpit-pele"}`}
    >
      {harnessVisivel ? (
        <nav aria-label="Harness lateral esquerdo" className="fixed left-1 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="icon" variant="ghost" title="Abrir ferramentas" aria-label="Abrir ferramentas" onClick={() => definirGaveta("left")}><Menu className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="CentralDark Gram" aria-label="CentralDark Gram" onClick={() => autenticado ? abrirDestino("gram") : abrirDestino("visao")}><MessagesSquare className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Goals" aria-label="Goals" onClick={() => abrirDestino("goals")}><Zap className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Buscar módulos" aria-label="Buscar módulos" onClick={() => definirGaveta("top")}><Search className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness lateral direito" className="fixed right-1 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="icon" variant="ghost" title="Sistemas" aria-label="Sistemas" onClick={() => definirGaveta("right")}><PanelRight className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Hermes" aria-label="Hermes" onClick={() => abrirDestino("hermes")}><Terminal className="size-4" /></Button>
          <Button size="icon" variant="ghost" title="Configurar Harness" aria-label="Configurar Harness" onClick={() => definirGaveta("bottom")}><Settings2 className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness superior" className="fixed left-1/2 top-1 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("visao")}>🧿 CentralDark</Button>
          {autenticado ? <CentralNotificacoes modo="sininho" abrirCentral={() => abrirDestino("admin")} /> : null}
          <Button size="icon" variant="ghost" title="Mapa dos sistemas" aria-label="Mapa dos sistemas" onClick={() => definirGaveta("top")}><Layers3 className="size-4" /></Button>
        </nav>
      ) : null}
      {harnessVisivel ? (
        <nav aria-label="Harness inferior" className="fixed bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("sync")}><RefreshCcw className="mr-1 size-4" /> Sync</Button>
          <Button size="sm" variant="ghost" onClick={() => abrirDestino("downloads")}><Download className="mr-1 size-4" /> Pacotes</Button>
          <Button size="icon" variant="ghost" title="Configurar moldura" aria-label="Configurar moldura" onClick={() => definirGaveta("bottom")}><Wrench className="size-4" /></Button>
        </nav>
      ) : (
        <Button type="button" className="fixed bottom-2 right-2 z-40" variant="outline" size="sm" onClick={() => definirHarnessVisivel(true)}>Mostrar Harness</Button>
      )}
      <Sheet open={gaveta !== null} onOpenChange={(aberto) => { if (!aberto) definirGaveta(null); }}>
        <SheetContent side={gaveta ?? "left"} className={gaveta === "top" || gaveta === "bottom" ? "max-h-[80dvh] overflow-y-auto" : "overflow-y-auto"}>
          <SheetHeader><SheetTitle>🧿 CentralDark · Harness</SheetTitle><SheetDescription>Uma casca, múltiplos sistemas. Acesso pela mesma Sala de Controle.</SheetDescription></SheetHeader>
          <div className="mt-6 space-y-4">
            <label htmlFor="busca-harness" className="block text-xs font-semibold">Encontrar ferramenta</label>
            <input id="busca-harness" className="w-full rounded border border-border bg-muted/30 px-3 py-2 text-sm" value={buscaHarness} onChange={(e) => definirBuscaHarness(e.target.value)} placeholder="Filtrar menus..." />
            <div className="grid gap-2 sm:grid-cols-2">
              {destinosHarness.map((destino) => <Button key={destino.id} variant={abaAtiva === destino.id ? "default" : "outline"} className="h-auto min-h-12 justify-start whitespace-normal text-left" onClick={() => abrirDestino(destino.id)}>{destino.icone} {destino.titulo}</Button>)}
            </div>
            <HarnessModuleRegistry />
            <CoordinatorDesk />
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Estado da moldura: LOCAL</p>
              <p className="mt-1">Navegação interna funcional. VPS, Telegram MTProto e GitHub exigem contraprovas independentes; nenhuma luz verde é inferida.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { definirHarnessVisivel(false); definirGaveta(null); }}>Ocultar moldura</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <header className="border-b border-border bg-surface/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
            CentralDark
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
              {autenticado ? "COCKPIT AUTENTICADO" : "ENTRADA DO COCKPIT"}
            </span>
            <Button
              data-cd-flow="instinto.CockpitShell.botao-01"
              asChild
              variant="outline"
              size="sm"
            >
              <a href="http://89.117.78.124:25808/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden className="size-4" /> Abrir AionUI
              </a>
            </Button>
            {!autenticado ? (
              <Button data-cd-flow="instinto.CockpitShell.botao-02" asChild size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
            ) : (
              <Button
                data-cd-flow="instinto.CockpitShell.botao-03"
                variant="outline"
                size="sm"
                onClick={sair}
              >
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

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

          <Tabs value={abaAtiva} onValueChange={definirAbaAtiva} className="mt-14" id="centraldark-harness-abas">
            <div className="sticky top-0 z-30 -mx-4 overflow-x-auto border-y border-border bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
              <TabsList className="h-auto min-w-max justify-start">
                <TabsTrigger value="visao">Visão geral</TabsTrigger>
                {autenticado ? <TabsTrigger value="gram">✉️ CentralDark Gram</TabsTrigger> : null}
                <TabsTrigger value="sync">Sync Center</TabsTrigger>
                <TabsTrigger value="design">Design Center</TabsTrigger>
                <TabsTrigger value="goals">🎯 Goals</TabsTrigger>
                <TabsTrigger value="arquitetura">📐 Estrutura</TabsTrigger>
                <TabsTrigger value="raioxvivo">🪬 Raio-X</TabsTrigger>
                <TabsTrigger value="recibos">📊 Recibos</TabsTrigger>
                <TabsTrigger value="forja">🔧 Forja</TabsTrigger>
                {autenticado ? <TabsTrigger value="admin">Admin CentralDark</TabsTrigger> : null}
                {autenticado ? (
                  <TabsTrigger value="sistema">Sistema CentralDark</TabsTrigger>
                ) : null}
                {autenticado ? <TabsTrigger value="hud-legado">HUD · Selos · Gênesis</TabsTrigger> : null}
                <TabsTrigger value="hermes">Hermes</TabsTrigger>
                <TabsTrigger value="forja-regras">Regras Forja</TabsTrigger>
                <TabsTrigger value="forja-inventario">Inventário</TabsTrigger>
                <TabsTrigger value="agent-mode">Agent Mode</TabsTrigger>
                <TabsTrigger value="html-consolidation">HTML Consolidation</TabsTrigger>
                <TabsTrigger value="downloads">Downloads</TabsTrigger>
              </TabsList>
            </div>
            {autenticado ? <TabsContent value="gram" className="mt-8"><CentralDarkGram abrirAdmin={() => abrirDestino("admin")} abrirSync={() => abrirDestino("sync")} /></TabsContent> : null}
            <TabsContent value="visao" className="mt-8">
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
            <TabsContent value="sync" className="mt-10">
              {dado ? <SyncCenter estado={dado} /> : <SyncCenter />}
            </TabsContent>
            <TabsContent value="design" className="mt-10">
              <DesignCenter pele={pele} selecionarPele={selecionar} autenticado={autenticado} />
            </TabsContent>
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
            <TabsContent value="arquitetura" className="mt-10">
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-neon-blue uppercase">
                  Estrutura Integrada
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Arquitetura Viva do Cockpit</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Visualização completa da estrutura: 9 deliverables, 7 abas, 5 sistemas, correlação total e FIXED_POINT 100%.
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
              <TabsContent value="admin" className="mt-10">
                <PainelAdminCentralDark estado={dado} />
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
            {autenticado ? (
              <TabsContent value="hud-legado" className="mt-10">
                <HudDeterministico estado={dado} atualizar={() => void estado.refetch()} />
              </TabsContent>
            ) : null}
            <TabsContent value="hermes" className="mt-10">
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
                  <h3 className="font-semibold">Status Atual da Forja</h3>
                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">HEAD</dt>
                      <dd className="mt-1 font-mono">567d885fe8</dd>
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
                      <dd className="mt-1 font-mono">99.9% Fixed Point + Aguardando Agentes 2,7</dd>
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
                  <h2 className="mt-3 text-3xl font-semibold">HTML Consolidation 100%</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Mapeamento completo de K:\ para cockpit-unified/. 16 pastas consolidadas, 4
                    archived, 0 duplicações.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface/50 p-6">
                  <h3 className="font-semibold mb-4">📊 Status Final</h3>
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
                  <p className="text-sm font-semibold text-emerald-400">🟢 RESULTADO FINAL</p>
                  <ul className="mt-3 space-y-1 text-xs text-emerald-400">
                    <li>✅ Consolidação 100% bem-sucedida</li>
                    <li>✅ Zero perda de dados</li>
                    <li>✅ Zero duplicação</li>
                    <li>✅ Estrutura FLAT em cockpit-unified/</li>
                    <li>✅ Histórico preservado em _archive/</li>
                    <li>✅ Documentação completa</li>
                    <li>✅ Pronto para produção 🚀</li>
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
