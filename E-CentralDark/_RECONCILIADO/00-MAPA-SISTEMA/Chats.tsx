// Tela /chats — somente leitura, consome https://api.centralldark.com.
// Nenhum envio, nenhum token no client, sem Supabase. Aviso amigável quando
// a WuzAPI recusa contatos/grupos (warning + upstreamStatus 401).

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users, User, Search, RefreshCw, Radio,
  WifiOff, CheckCircle2, AlertTriangle, Inbox,
  Filter, Plus, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveMessages } from "@/hooks/useLiveMessages";
import { API_BASE } from "@/lib/apiBase";
import {
  MOCK_CONTACTS, MOCK_GROUPS, MOCK_TOTAL_CONTACTS, MOCK_TOTAL_GROUPS,
} from "@/lib/mockWhatsapp";

// --- Tipos sanitizados (o que o painel realmente usa) ---
type ChatType = "contact" | "group";

type Chat = {
  key: string;          // identificador estável (messageKey quando houver, senão jid)
  jid: string;          // jid mascarado vindo da API
  messageKey?: string;  // chave opaca preferida pra abrir histórico
  name: string;
  type: ChatType;
  demo?: boolean;       // true = item de demonstração (modo mock)
};

type Filtro = "todas" | "minhas" | "aguardando" | "encerradas";

const FILTROS_CONFIG: Record<Filtro, { label: string; icon: any }> = {
  todas:      { label: "Todas",      icon: MessageSquare },
  minhas:     { label: "Minhas",     icon: User },
  aguardando: { label: "Aguardando", icon: Clock },
  encerradas: { label: "Encerradas", icon: CheckCircle2 },
};

type SessaoResumo = {
  conectada: boolean;
  nome: string;
};

type ListaResposta = {
  ok: boolean;
  warning?: string;
  upstreamStatus?: number;
  items?: any[];
  chats?: any[];
  contacts?: any[];
  groups?: any[];
  error?: string;
};

// ---------- helpers ----------

function normalizarChat(raw: any): Chat | null {
  if (!raw) return null;
  const jid = raw.jid || raw.chatId || raw.id || "";
  const messageKey = raw.messageKey || raw.key || undefined;
  const key = messageKey || jid;
  if (!key) return null;
  const type: ChatType = raw.type === "group" || raw.kind === "group" ? "group" : "contact";
  return {
    key,
    jid,
    messageKey,
    name: raw.name || raw.title || raw.pushName || jid || "Conversa",
    type,
  };
}

// Wrapper resiliente: nunca propaga "Failed to fetch" pro componente.
// Devolve sempre um ListaResposta-like com ok=false quando algo dá errado.
async function getJson<T extends ListaResposta>(path: string): Promise<T> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!r.ok) {
      // resposta HTTP de erro — tenta extrair JSON, senão devolve shape padrão
      try {
        const data = (await r.json()) as T;
        return { ok: false, error: `HTTP ${r.status}`, ...data } as T;
      } catch {
        return { ok: false, error: `HTTP ${r.status}` } as T;
      }
    }
    const data = (await r.json()) as T;
    return data;
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message === "Failed to fetch"
        ? "Sem conexão com a API agora."
        : (e?.message || "Erro de rede."),
    } as T;
  }
}

// Mensagem amigável conforme o status que a WuzAPI devolveu pra nossa API.
function textoUpstream(recurso: "contatos" | "grupos", status?: number): string {
  if (status === 401 || status === 403) {
    return `Rota disponível, mas a WuzAPI recusou ${recurso} agora (sessão sem permissão).`;
  }
  if (status === 404) {
    return `A WuzAPI não tem ${recurso} disponíveis nesta sessão.`;
  }
  if (status && status >= 500) {
    return `A WuzAPI devolveu erro ${status} ao buscar ${recurso}. Tentaremos de novo.`;
  }
  if (status) {
    return `A WuzAPI respondeu ${status} ao buscar ${recurso}.`;
  }
  return `Não foi possível confirmar ${recurso} agora.`;
}

// ---------- componente ----------

export default function Chats() {
  // Estado da sessão / saúde
  const [sessao, setSessao] = useState<SessaoResumo | null>(null);

  // Listas
  const [chats, setChats] = useState<Chat[]>([]);
  const [totalContatos, setTotalContatos] = useState<number>(0);
  const [totalGrupos, setTotalGrupos] = useState<number>(0);

  // Avisos amigáveis quando upstream WuzAPI recusa
  const [avisoContatos, setAvisoContatos] = useState<string | null>(null);
  const [avisoGrupos, setAvisoGrupos] = useState<string | null>(null);

  // Modo demonstração: ligado quando contatos OU grupos vêm como upstream 401/403
  // (ou ok=false vazio). Mantém o painel utilizável com dados de exemplo.
  const [modoMock, setModoMock] = useState(false);

  // Erros de rede reais (não do upstream)
  const [erroChats, setErroChats] = useState<string | null>(null);

  // UX
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [recarregando, setRecarregando] = useState(false);

  // ----- carregamento -----
  const carregar = useCallback(async () => {
    setRecarregando(true);
    setErroChats(null);

    // sessões + chats + contatos + grupos em paralelo
    const [sessoesRes, chatsRes, contatosRes, gruposRes] = await Promise.allSettled([
      getJson<any>("/v1/whatsapp/sessions"),
      getJson<ListaResposta>("/v1/whatsapp/chats"),
      getJson<ListaResposta>("/v1/whatsapp/contacts"),
      getJson<ListaResposta>("/v1/whatsapp/groups"),
    ]);

    // sessão
    if (sessoesRes.status === "fulfilled") {
      const payload = sessoesRes.value;
      const lista = Array.isArray(payload?.sessions) ? payload.sessions : [];
      const ativa = lista.find((s: any) => s?.connected && s?.loggedIn) || lista[0];
      setSessao(ativa
        ? { conectada: !!(ativa.connected && ativa.loggedIn), nome: ativa.name || "Sessão" }
        : { conectada: false, nome: "—" });
    } else {
      setSessao({ conectada: false, nome: "—" });
    }

    // chats reais
    let chatsReais: Chat[] = [];
    if (chatsRes.status === "fulfilled") {
      const payload = chatsRes.value;
      const bruto = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.chats) ? payload.chats : [];
      chatsReais = bruto.map(normalizarChat).filter(Boolean) as Chat[];
      if (!payload.ok) {
        setErroChats(payload.error || "Não foi possível carregar conversas agora.");
      }
    } else {
      setErroChats("Não foi possível carregar conversas agora.");
    }

    // contatos
    let contatosBloqueados = false;
    let contatosReais = 0;
    if (contatosRes.status === "fulfilled") {
      const payload = contatosRes.value;
      const bruto = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.contacts) ? payload.contacts : [];
      contatosReais = bruto.length;
      const recusado = payload.upstreamStatus === 401 || payload.upstreamStatus === 403;
      if (payload.warning || payload.ok === false) {
        setAvisoContatos(textoUpstream("contatos", payload.upstreamStatus));
        if (recusado && contatosReais === 0) contatosBloqueados = true;
      } else {
        setAvisoContatos(null);
      }
    } else {
      setAvisoContatos(textoUpstream("contatos"));
      contatosBloqueados = true;
    }

    // grupos
    let gruposBloqueados = false;
    let gruposReais = 0;
    if (gruposRes.status === "fulfilled") {
      const payload = gruposRes.value;
      const bruto = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.groups) ? payload.groups : [];
      gruposReais = bruto.length;
      const recusado = payload.upstreamStatus === 401 || payload.upstreamStatus === 403;
      if (payload.warning || payload.ok === false) {
        setAvisoGrupos(textoUpstream("grupos", payload.upstreamStatus));
        if (recusado && gruposReais === 0) gruposBloqueados = true;
      } else {
        setAvisoGrupos(null);
      }
    } else {
      setAvisoGrupos(textoUpstream("grupos"));
      gruposBloqueados = true;
    }

    // Modo mock: liga quando upstream recusou contatos OU grupos e a lista veio vazia.
    const usarMock = contatosBloqueados || gruposBloqueados;
    setModoMock(usarMock);

    const chatsFinal: Chat[] = [...chatsReais];
    if (usarMock) {
      if (contatosBloqueados) chatsFinal.push(...MOCK_CONTACTS);
      if (gruposBloqueados)   chatsFinal.push(...MOCK_GROUPS);
    }
    setChats(chatsFinal);
    if (chatsFinal[0] && !selecionado) setSelecionado(chatsFinal[0].key);

    setTotalContatos(contatosBloqueados ? MOCK_TOTAL_CONTACTS : contatosReais);
    setTotalGrupos(gruposBloqueados ? MOCK_TOTAL_GROUPS : gruposReais);

    setRecarregando(false);
  }, [selecionado]);

  useEffect(() => {
    carregar();
    // refresh suave a cada 20s
    const id = window.setInterval(carregar, 20000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- derivados -----
  const chatsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return chats.filter((c) => {
      // Por enquanto, só "todas" devolve algo. "Minhas/Aguardando/Encerradas"
      // dependem do CRM/atendimento que ainda não está plugado.
      if (filtro !== "todas") return false;
      if (!termo) return true;
      return c.name.toLowerCase().includes(termo) || c.jid.toLowerCase().includes(termo);
    });
  }, [chats, filtro, busca]);

  const chatAtivo = useMemo(
    () => chats.find((c) => c.key === selecionado) || null,
    [chats, selecionado]
  );

  // mensagens da conversa selecionada — usa messageKey quando houver
  const jidParaMensagens = chatAtivo?.messageKey || chatAtivo?.jid || undefined;
  const { messages, loading: carregandoMensagens, transport } = useLiveMessages({
    jid: jidParaMensagens,
    enabled: !!jidParaMensagens,
    pollMs: 4000,
    preferSse: true,
  });

  // ---------- render ----------
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Cabeçalho */}
      <header className="border-b border-border bg-card/40 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-primary/10 border-primary/30 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-wide uppercase">
                Conversas
              </h1>
              <p className="text-[11px] text-muted-foreground font-mono">
                {API_BASE.replace("https://", "")} • leitura apenas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* badge sessão */}
            <span
              className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border ${
                sessao?.conectada
                  ? "text-green-500 border-green-500/30 bg-green-500/10"
                  : "text-muted-foreground border-border bg-background/40"
              }`}
              title={sessao?.nome || ""}
            >
              {sessao?.conectada ? <CheckCircle2 className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {sessao?.conectada ? "Sessão conectada" : "Sessão não conectada"}
            </span>

            {/* badge modo DEMO */}
            {modoMock && (
              <span
                className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400"
                title="Contatos/grupos vieram bloqueados pela WuzAPI — mostrando dados de exemplo."
              >
                <AlertTriangle className="w-3 h-3" />
                MODO DEMO
              </span>
            )}

            {/* contadores */}
            <Contador icone={MessageSquare} label="Chats" valor={chats.length} />
            <Contador icone={User} label="Contatos" valor={totalContatos} alerta={!!avisoContatos} />
            <Contador icone={Users} label="Grupos" valor={totalGrupos} alerta={!!avisoGrupos} />


            {/* transporte */}
            <span
              className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border ${
                transport === "sse"
                  ? "text-green-500 border-green-500/30 bg-green-500/10"
                  : transport === "polling"
                  ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                  : "text-muted-foreground border-border bg-background/40"
              }`}
            >
              {transport === "sse" ? <Radio className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
              {transport === "idle" ? "PARADO" : transport.toUpperCase()}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={carregar}
              className="h-8 gap-2 border-primary/20 hover:bg-primary/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recarregando ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Corpo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Coluna esquerda: cabeçalho + filtros (toggle) + busca + lista */}
        <aside className="w-full md:w-[340px] lg:w-[380px] shrink-0 border-r border-border flex flex-col bg-card/20">
          {/* Cabeçalho fixo: ícone + título + funil + "+" */}
          <div className="h-[60px] px-4 flex items-center justify-between border-b border-border bg-card/40">
            <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2 text-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              Conversas
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMostrarFiltros((v) => !v)}
                className={`w-9 h-9 ${
                  mostrarFiltros
                    ? "text-primary bg-primary/10 hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
                title={mostrarFiltros ? "Esconder filtros" : "Mostrar filtros"}
              >
                <Filter className="w-[18px] h-[18px]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-muted-foreground hover:bg-muted/40"
                title="Em breve"
              >
                <Plus className="w-[18px] h-[18px]" />
              </Button>
            </div>
          </div>

          {/* Barra de filtros (toggle pelo funil) */}
          <AnimatePresence initial={false}>
            {mostrarFiltros && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-border/60"
              >
                <div className="flex flex-wrap gap-1 px-3 py-2">
                  {(Object.keys(FILTROS_CONFIG) as Filtro[]).map((f) => {
                    const cfg = FILTROS_CONFIG[f];
                    const ativo = filtro === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          ativo
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                        }`}
                      >
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Busca + avisos */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar ou começar uma nova conversa"
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* avisos amigáveis quando a API recusa contatos/grupos */}
            {modoMock && filtro === "todas" && (
              <AvisoUpstream
                titulo="Modo demonstração"
                texto="Mostrando contatos e grupos de exemplo enquanto a WuzAPI não libera essas listas. Nenhum dado real foi inventado."
              />
            )}
            {avisoContatos && filtro === "todas" && (
              <AvisoUpstream titulo="Contatos" texto={avisoContatos} />
            )}
            {avisoGrupos && filtro === "todas" && (
              <AvisoUpstream titulo="Grupos" texto={avisoGrupos} />
            )}
          </div>

          {/* lista */}
          <div className="flex-1 overflow-y-auto">
            {erroChats ? (
              <EstadoVazio
                icone={WifiOff}
                titulo="Não conseguimos ler as conversas"
                texto={erroChats}
              />
            ) : chatsFiltrados.length === 0 ? (
              <EstadoVazio
                icone={Inbox}
                titulo="Nada por aqui"
                texto={
                  chats.length === 0
                    ? "Nenhuma conversa retornada pela API no momento."
                    : "Nenhum item bate com esse filtro/busca."
                }
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {chatsFiltrados.map((c) => {
                  const ativo = c.key === selecionado;
                  return (
                    <li key={c.key}>
                      <button
                        onClick={() => setSelecionado(c.key)}
                        className={`w-full text-left p-3 flex items-center gap-3 hover:bg-primary/5 transition ${
                          ativo ? "bg-primary/10" : ""
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                            c.type === "group"
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                              : "bg-primary/10 border-primary/30 text-primary"
                          }`}
                        >
                          {c.type === "group" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate flex-1">{c.name}</p>
                            {c.demo && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 shrink-0">
                                DEMO
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {c.jid || "—"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Coluna direita: painel da conversa */}
        <section className="flex-1 flex flex-col bg-background">
          <AnimatePresence mode="wait">
            {chatAtivo ? (
              <motion.div
                key={chatAtivo.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* cabeçalho do chat */}
                <div className="border-b border-border bg-card/30 px-4 py-3 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                      chatAtivo.type === "group"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-primary/10 border-primary/30 text-primary"
                    }`}
                  >
                    {chatAtivo.type === "group" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{chatAtivo.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {chatAtivo.type === "group" ? "Grupo" : "Contato"} • somente leitura
                    </p>
                  </div>
                </div>

                {/* mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {!chatAtivo.messageKey && !chatAtivo.jid ? (
                    <EstadoVazio
                      icone={AlertTriangle}
                      titulo="Sem identificador seguro"
                      texto="Selecione uma conversa com messageKey pra ver o histórico."
                    />
                  ) : messages.length === 0 ? (
                    <EstadoVazio
                      icone={MessageSquare}
                      titulo={carregandoMensagens ? "Carregando…" : "Sem mensagens recentes"}
                      texto={
                        carregandoMensagens
                          ? "Buscando o histórico dessa conversa."
                          : "Nenhuma mensagem retornada agora. Vamos continuar acompanhando."
                      }
                    />
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[75%] p-2.5 rounded-lg border text-sm ${
                          m.fromMe
                            ? "ml-auto bg-primary/10 border-primary/30"
                            : "bg-card/40 border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-mono text-[10px] text-muted-foreground truncate">
                            {m.fromMe ? "eu" : m.from} • {m.type}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {m.timestamp
                              ? new Date(m.timestamp).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </span>
                        </div>
                        <p className="break-words whitespace-pre-wrap text-foreground/90">
                          {m.text || <span className="italic text-muted-foreground">(sem texto)</span>}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* rodapé read-only */}
                <div className="border-t border-border bg-card/20 px-4 py-2 text-[10px] font-mono text-muted-foreground text-center">
                  Modo leitura — envio de mensagens desabilitado neste painel.
                </div>
              </motion.div>
            ) : (
              <EstadoVazio
                icone={MessageSquare}
                titulo="Escolha uma conversa"
                texto="Selecione um chat na lista pra ver o histórico recente."
              />
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

// ---------- subcomponentes ----------

function Contador({
  icone: Icone, label, valor, alerta,
}: { icone: any; label: string; valor: number; alerta?: boolean }) {
  return (
    <span
      title={alerta ? "Upstream WuzAPI sinalizou aviso pra este recurso" : undefined}
      className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border ${
        alerta
          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
          : "border-border bg-background/40 text-muted-foreground"
      }`}
    >
      <Icone className="w-3 h-3" />
      {label} <span className={alerta ? "font-semibold" : "text-foreground font-semibold"}>{valor}</span>
      {alerta && <AlertTriangle className="w-3 h-3" />}
    </span>
  );
}

function AvisoUpstream({ titulo, texto }: { titulo?: string; texto: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] font-mono p-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>
        {titulo && <strong className="font-semibold mr-1">{titulo}:</strong>}
        {texto}
      </span>
    </div>
  );
}

function EstadoVazio({
  icone: Icone, titulo, texto,
}: { icone: any; titulo: string; texto: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
      <div className="p-3 rounded-full border border-border bg-card/40">
        <Icone className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-foreground">{titulo}</p>
      <p className="text-xs max-w-xs">{texto}</p>
    </div>
  );
}
