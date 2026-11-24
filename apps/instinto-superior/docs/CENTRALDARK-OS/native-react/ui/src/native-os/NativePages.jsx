import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock3,
  Columns2, ExternalLink, FileText, Filter, Image, Info, ListChecks,
  Mic, Paperclip, Search, Send, ShieldCheck, Sparkles,
  ArrowUp, AudioLines, Check, Settings2, LockKeyhole, AlertTriangle,
  Copy, X, Grid2X2, Compass, Workflow, ScanSearch, GitCompareArrows
} from "lucide-react";
import data from "./native-data.json";

const records = data.records;
const labels = data.statuses;
const byId = id => records.find(item => item.id === id);
const statusLabel = status => labels[status] || status;
const pickImage = record => record?.image ? data.images[record.image] : null;
const picturePath = src => src?.startsWith("/") ? "." + src : src;
const groups = data.sections;
const makeLabel = id => groups.flatMap(g => g.items).find(([key]) => key === id)?.[1] ||
  (id === "evidencias" ? "Evidências" : "CENTRALDARK · OS");

function Status({ status }) {
  return <span className={"cdos-status cdos-status-" + (status || "missing")}>
    <span aria-hidden="true" />{statusLabel(status)}
  </span>;
}
function Panel({ title, icon: Icon = Info, children, className = "" }) {
  return <section className={"cdos-panel " + className}>
    <header className="cdos-panel-heading"><Icon size={18} aria-hidden="true" />
      <h2>{title}</h2></header>
    <div className="cdos-panel-body">{children}</div>
  </section>;
}
function Evidence({ record }) {
  if (!record) return <p className="cdos-muted">Escolha um registro no histórico para ver os detalhes.</p>;
  const image = pickImage(record);
  return <article className="cdos-evidence">
    <span className="cdos-eyebrow">{record.basis || record.type}</span>
    <h3>{record.title}</h3>
    <Status status={record.status} />
    {image && <a href={image.url || picturePath(image.src)} target="_blank" rel="noreferrer">
      <img src={picturePath(image.src)} alt={image.alt} />
      <span className="cdos-image-caption"><Image size={14} /> {image.caption}</span>
    </a>}
    <p>{record.body}</p>
    {record.missing && <p className="cdos-muted">{record.missing}</p>}
    <small className="cdos-muted">{[record.env, record.monitor, record.file].filter(Boolean).join(" · ")}</small>
    {!!record.links?.length && <div className="cdos-source-links">
      {record.links.map(([label, url], i) => <a key={i} href={url} target="_blank" rel="noreferrer">
        {label} <ExternalLink size={12} /></a>)}
    </div>}
  </article>;
}
function Steps({ full = false, onNavigate }) {
  return <div className="cdos-steps">
    {data.nextSteps.slice(0, full ? undefined : 3).map(([title, detail], index) =>
      <div className="cdos-step" key={title}>
        <span className="cdos-step-number">{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{title}</strong><p>{detail}</p></div>
      </div>)}
    {!full && <button className="cdos-text-button" onClick={() => onNavigate("queue")}>
      Ver todos os passos <ArrowRight size={15} /></button>}
  </div>;
}

function Overview({ onNavigate }) {
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState("current");
  const fields = [["window", "Janela"], ["monitor", "Monitor"],
    ["env", "Onde"], ["status", "Situação"], ["type", "Tipo"]];
  const filtered = useMemo(() => records.filter(record =>
    fields.every(([key]) => !filters[key] || record[key] === filters[key])), [filters]);
  const active = filtered.some(r => r.id === selected) ? selected : filtered[0]?.id;
  return <>
    <div className="cdos-intro">
      <div><span className="cdos-eyebrow">Casa · Visual Studio Code / Code-OSS</span>
        <h1>Instalação e telas</h1>
        <p>Acompanhe a instalação e veja o que apareceu em cada monitor.</p></div>
      <div className="cdos-snapshot"><small>REGISTROS ATÉ</small><strong>08 NOV 2026 · BRT</strong></div>
    </div>
    <div className="cdos-overview-grid">
      <div className="cdos-stack">
        <section className="cdos-panel cdos-mission">
          <div className="cdos-mission-head"><span className="cdos-eyebrow">TAREFA ATUAL</span><Status status="missing" /></div>
          <h2>Conferir o Code-OSS na Casa</h2>
          <p>Falta confirmar quais janelas estão abertas e em que etapa está a instalação.</p>
          <div className="cdos-info-grid">
            <div><small>Instalador</small><strong>Registro anterior a conferir</strong></div>
            <div><small>Ambiente</small><strong>Casa · Windows</strong></div>
          </div>
        </section>
        <Panel title="Filtros" icon={Filter}>
          <div className="cdos-filter-grid">
            {fields.map(([key, label]) => <label key={key}>{label}
              <select value={filters[key] || ""} onChange={e => setFilters(previous => ({ ...previous, [key]: e.target.value }))}>
                <option value="">Todos</option>
                {[...new Set(records.map(r => r[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b, "pt-BR")).map(value =>
                  <option key={value} value={value}>{key === "status" ? statusLabel(value) : value}</option>)}
              </select></label>)}
          </div>
          <button className="cdos-text-button" onClick={() => setFilters({})}>Limpar filtros</button>
        </Panel>
        <Panel title={"Histórico · " + filtered.length + " registros"} icon={Clock3}>
          <div className="cdos-timeline">
            {filtered.map((record, index) => <button key={record.id} className={"cdos-event " + (active === record.id ? "cdos-selected" : "")}
              aria-pressed={active === record.id} onClick={() => setSelected(record.id)}>
              <span>{record.date}<small>{record.time}</small></span>
              <span className={"cdos-timeline-dot cdos-signal-" + (record.status || "missing")}
                style={{ "--cdos-pulse-delay": String(-(index % 6) * 0.7) + "s" }}
                aria-hidden="true" />
              <span className="cdos-event-text"><strong>{record.title}</strong><small>{record.detail}</small></span>
              <Status status={record.status} />
            </button>)}
            {!filtered.length && <p>Nenhum registro corresponde aos filtros.</p>}
          </div>
        </Panel>
      </div>
      <div className="cdos-stack">
        <Panel title="Detalhes do registro" icon={FileText}><Evidence record={byId(active)} /></Panel>
        <Panel title="Onde verificar" icon={Columns2}>
          <div className="cdos-place-grid">
            {["Casa · Windows", "VM · openKylin", "GitHub · main"].map(place =>
              <button key={place} onClick={() => setFilters(prev => ({ ...prev, env: place }))}>
                <strong>{place.split(" · ")[0]}</strong><small>{place.split(" · ")[1]}</small>
              </button>)}
          </div>
        </Panel>
        <Panel title="O que falta" icon={ListChecks}><Steps onNavigate={onNavigate} /></Panel>
      </div>
    </div>
  </>;
}

function RecordCard({ record, subtitle }) {
  return <div className="cdos-compare-card">
    <span className="cdos-eyebrow">{subtitle}</span>
    <Evidence record={record} />
  </div>;
}
function Compare() {
  const [first, setFirst] = useState("launch");
  const [second, setSecond] = useState("current");
  const before = byId(first), after = byId(second);
  const delta = first === second ? "As duas colunas exibem o mesmo registro." :
    first === "launch" && second === "current" ?
    "A imagem anterior mostra a tela inicial do Electron. Falta uma imagem recente do mesmo monitor para comparar." :
    "Os registros mostram coisas diferentes. Confira o que aparece em cada um e quando foi registrado.";
  const options = records.map(r => <option key={r.id} value={r.id}>{r.title}</option>);
  return <div className="cdos-stack">
    <Panel title="Antes e agora" icon={Columns2}>
      <div className="cdos-two-selects">
        <label>Antes<select value={first} onChange={e => setFirst(e.target.value)}>{options}</select></label>
        <label>Agora ou outro registro<select value={second} onChange={e => setSecond(e.target.value)}>{options}</select></label>
      </div>
      <div className="cdos-pair">
        <RecordCard record={before} subtitle="Primeiro registro" />
        <RecordCard record={after} subtitle="Segundo registro" />
      </div>
      <p className="cdos-note">{delta}</p>
    </Panel>
    <Panel title="Monitores da Casa" icon={Columns2}>
      <div className="cdos-pair">
        <RecordCard record={byId("monitor")} subtitle="Direita · monitor 1 · registro anterior" />
        <RecordCard record={byId("upper")} subtitle="Monitor de cima · a verificar" />
      </div>
      <p className="cdos-note">Faltam imagens recentes dos dois monitores. Ainda não sabemos em qual deles o instalador apareceu.</p>
    </Panel>
    <Panel title="Casa, openKylin e GitHub" icon={Columns2}>
      <div className="cdos-table-wrap"><table><thead><tr><th>Onde</th><th>O que sabemos</th><th>O que falta conferir</th></tr></thead>
        <tbody><tr><td>Casa · Windows</td><td>Imagens anteriores do Electron.</td><td>Janelas abertas e versão atual.</td></tr>
        <tr><td>VM · openKylin</td><td>Sem imagem recente confirmada.</td><td>Versão do projeto.</td></tr>
        <tr><td>GitHub · main</td><td>Arquivos e histórico registrados.</td><td>Comparação com a Casa.</td></tr></tbody></table></div>
    </Panel>
  </div>;
}

function Registers() {
  const types = ["Todos", "Descoberta", "Correção", "Pendência", "Hipótese"];
  const [kind, setKind] = useState("Todos");
  return <Panel title="Descobertas, correções e pendências" icon={FileText}>
    <label className="cdos-register-filter">Tipo de registro
      <select value={kind} onChange={e => setKind(e.target.value)}>
        {types.map(type => <option key={type}>{type}</option>)}</select></label>
    <div className="cdos-record-list">
      {records.filter(record => kind === "Todos" || record.type === kind).map(record =>
        <article key={record.id}>
          <span className="cdos-eyebrow">{record.type} · {record.basis}</span>
          <h3>{record.title}</h3><p>{record.body}</p><Status status={record.status} />
        </article>)}
    </div>
  </Panel>;
}
// ROV MICHELIN — native React adaptation of the in-panel gallery in CENTRALDARK-OS.html.
// All recipe names, descriptions, colors and content come from the original source data.
const ROV_GROUPS = [
  { key: "all", label: "Todos", Icon: Grid2X2 },
  { key: "navegar", label: "Navegar", Icon: Compass },
  { key: "orquestração", label: "Orquestração", Icon: Workflow },
  { key: "auditoria", label: "Auditoria", Icon: ScanSearch },
  { key: "reconciliação", label: "Reconciliação", Icon: GitCompareArrows },
  { key: "runtime", label: "Runtime e interface", Icon: Activity },
  { key: "fechamento", label: "Fechamento", Icon: ShieldCheck }
];
const ROV_NAVIGATES = item => Number(item.index) >= 12 && Number(item.index) <= 20;

function Library() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(null);
  const [toast, setToast] = useState("");
  const searchRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const toastTimer = useRef(null);

  const recipes = data.templates;
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return recipes.filter(item => {
      const inCategory = category === "all" || item.category === category ||
        (category === "navegar" && ROV_NAVIGATES(item));
      if (!inCategory) return false;
      if (!term) return true;
      return [item.title, item.kind, item.file, item.summary, item.content]
        .join(" ").toLocaleLowerCase("pt-BR").includes(term);
    });
  }, [category, search, recipes]);

  const openRecipe = (recipe, event) => {
    openerRef.current = event.currentTarget;
    setToast("");
    setOpened(recipe);
  };

  const closeRecipe = () => {
    setOpened(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    if (opened) closeRef.current?.focus();
  }, [opened]);

  useEffect(() => {
    const onKeydown = event => {
      if (event.key === "Escape" && opened) {
        event.preventDefault();
        closeRecipe();
        return;
      }
      if (event.key !== "/" || opened || event.ctrlKey || event.metaKey ||
          event.altKey || event.target.closest?.("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [opened]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const copyRecipe = async () => {
    if (!opened?.content) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(opened.content);
      copied = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = opened.content;
      area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(area);
      try { area.select(); copied = document.execCommand("copy"); }
      finally { area.remove(); }
    }
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(copied ? "Template copiado." : "Não foi possível copiar. Selecione o texto da receita.");
    toastTimer.current = window.setTimeout(() => setToast(""), 2500);
  };

  return <section className="cdos-rov" aria-label="Biblioteca de receitas operacionais verificáveis">
    <nav className="cdos-rov-categories" role="group" aria-label="Categorias de receitas">
      {ROV_GROUPS.map(({ key, label, Icon }) => {
        const count = key === "all" ? recipes.length
          : recipes.filter(item => key === "navegar" ? ROV_NAVIGATES(item) : item.category === key).length;
        return <button key={key} type="button" aria-pressed={category === key}
          className="cdos-rov-filter" onClick={() => setCategory(key)}>
          <span className="cdos-rov-filter-icon"><Icon size={15} strokeWidth={1.8} aria-hidden="true" /></span>
          <span>{label}</span><span className="cdos-rov-filter-count">{count}</span>
        </button>;
      })}
    </nav>

    <header className="cdos-rov-hero">
      <span className="cdos-rov-eyebrow"><Sparkles size={14} aria-hidden="true" /> Receitas operacionais verificáveis</span>
      <h1>Comandos claros.<br /><em>Prova real.</em></h1>
      <p>Encontre, entenda e copie o template certo. O modelo forte cria a receita.
        O executor segue o escopo. O recibo fecha o ciclo.</p>
      <div className="cdos-rov-meta">
        <span><strong>{recipes.length}</strong> templates</span>
        <span><strong>0</strong> dependências externas</span>
        <span>PASS <b>≠</b> comando iniciado</span>
      </div>
    </header>

    <section className="cdos-rov-workspace" aria-label="Biblioteca de templates">
      <div className="cdos-rov-toolbar">
        <label className="cdos-rov-search-wrap">
          <Search size={19} aria-hidden="true" />
          <input ref={searchRef} type="search" aria-label="Buscar receitas"
            placeholder="Buscar por nome, uso ou arquivo..." value={search}
            onChange={event => setSearch(event.target.value)}
            autoComplete="off" />
          <kbd>/</kbd>
        </label>
        <span className="cdos-rov-result" role="status">
          {filtered.length} {filtered.length === 1 ? "receita visível" : "receitas visíveis"}
        </span>
      </div>

      <div className="cdos-rov-grid">
        {filtered.map((item, i) =>
          <article className="cdos-rov-card" key={item.file}
            style={{ "--rov-accent": item.accent, "--rov-order": i }}>
            <div className="cdos-rov-card-top">
              <span className="cdos-rov-card-index">{item.index} / ROV</span>
              <span className="cdos-rov-kind">{item.kind}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <div className="cdos-rov-card-bottom">
              <span className="cdos-rov-filename" title={item.file}>{item.file}</span>
              <button type="button" onClick={event => openRecipe(item, event)}>
                Abrir e copiar <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </article>
        )}
      </div>
      {!filtered.length && <div className="cdos-rov-empty">
        Nenhum template corresponde à busca atual.
        <button type="button" onClick={() => { setSearch(""); setCategory("all"); searchRef.current?.focus(); }}>
          Limpar filtros
        </button>
      </div>}
    </section>

    <footer className="cdos-rov-footer">
      <BookOpen size={14} aria-hidden="true" />
      <span>Local · sem dependência externa</span>
      <span>Owner: <strong>ROV</strong> · prova obrigatória</span>
    </footer>

    {opened && <div className="cdos-rov-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget) closeRecipe();
    }}>
      <section className="cdos-rov-dialog" role="dialog" aria-modal="true"
        aria-labelledby="cdos-rov-modal-title">
        <header className="cdos-rov-dialog-header">
          <div>
            <span className="cdos-rov-dialog-label">
              {opened.index} / {opened.kind} · {opened.file}
            </span>
            <h2 id="cdos-rov-modal-title">{opened.title}</h2>
          </div>
          <div className="cdos-rov-dialog-actions">
            <button type="button" className="cdos-rov-primary" onClick={copyRecipe}>
              <Copy size={16} aria-hidden="true" /> Copiar template
            </button>
            <button type="button" ref={closeRef} onClick={closeRecipe}>
              <X size={17} aria-hidden="true" /> Fechar
            </button>
          </div>
        </header>
        <div className="cdos-rov-dialog-body">
          <pre>{opened.content || "Conteúdo não encontrado."}</pre>
        </div>
      </section>
    </div>}
    {toast && <div className="cdos-rov-toast" role="status">{toast}</div>}
  </section>;
}

// CENTRALDARK · OS — Chat compositor, faithful React port of the original HTML.
// Presentation-only controls do not change system permissions or start recording.
const CHAT_INTELLIGENCE = ["Instantânea", "Média", "Alta"];
const CHAT_APPROVALS = [
  { name: "Solicitar aprovação", description: "Sempre pedir aprovação para editar arquivos externos e usar a internet", Icon: ShieldCheck },
  { name: "Aprovar por mim", description: "Solicitar aprovação apenas para ações detectadas como potencialmente inseguras", Icon: CheckCircle2 },
  { name: "Acesso completo", description: "Acesso irrestrito à internet e a qualquer arquivo no seu computador", Icon: AlertTriangle },
  { name: "Personalizado", description: "Usa as permissões definidas em config.toml", Icon: Settings2 }
];

function Chat({ openDesktop }) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("Instantânea");
  const [approval, setApproval] = useState("Personalizado");
  const [menu, setMenu] = useState(null);
  const [hint, setHint] = useState("");
  const [launchState, setLaunchState] = useState("");
  const composerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menu) return undefined;
    const closeOutside = event => {
      if (!composerRef.current?.contains(event.target)) setMenu(null);
    };
    const closeEscape = event => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setMenu(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [menu]);

  const submitLocal = event => {
    event?.preventDefault();
    const message = value.trim();
    if (!message) {
      setHint("Voz não conectada a este painel.");
      return;
    }
    setMessages(previous => [...previous, { role: "Você", content: message }]);
    setValue("");
    setHint("Mensagem registrada nesta conversa local. Não foi enviada ao Hermes.");
    inputRef.current?.focus();
  };

  const keyComposer = event => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submitLocal();
    }
  };

  const launch = async () => {
    try {
      const result = await openDesktop();
      setLaunchState(result?.ready
        ? "CENTRALDARK · OS aberto."
        : "Abertura solicitada no aplicativo existente.");
    } catch (error) {
      setLaunchState(error?.message || "Não foi possível abrir o sistema.");
    }
  };

  return <section className="cdos-chat" aria-label="Conversa CENTRALDARK · OS">
    <div className="cdos-chat-hero">
      <span className="cdos-eyebrow">CENTRALDARK · CONVERSA</span>
      <h1>Como posso ajudar?</h1>
      <p>Converse com a CentralDark · OS.</p>
    </div>

    <div className="cdos-chat-messages" role="log" aria-live="polite" aria-label="Mensagens da conversa">
      {messages.map((message, index) =>
        <article key={index} className="cdos-chat-bubble">
          <strong>{message.role}</strong>
          <p>{message.content}</p>
        </article>
      )}
    </div>

    <div className="cdos-chat-bottom" ref={composerRef}>
      <form className="cdos-chat-compose" onSubmit={submitLocal}>
        <textarea ref={inputRef} aria-label="Sua mensagem"
          placeholder="Escreva uma mensagem..." value={value} rows={3}
          onChange={event => { setValue(event.target.value); setHint(""); }}
          onKeyDown={keyComposer} />
        <div className="cdos-chat-toolbar">
          <div className="cdos-chat-approval">
            <button type="button" className="cdos-chat-approval-trigger"
              title="Como as ações devem ser aprovadas"
              aria-haspopup="menu" aria-expanded={menu === "approval"}
              onClick={() => setMenu(previous => previous === "approval" ? null : "approval")}>
              <ShieldCheck size={17} aria-hidden="true" />
              <span className="cdos-chat-approval-label">{approval}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            {menu === "approval" && <div role="menu" className="cdos-chat-approval-menu"
                aria-label="Como as ações são aprovadas">
              <div className="cdos-chat-menu-title">Como as ações devem ser aprovadas?</div>
              {CHAT_APPROVALS.map(item => {
                const Icon = item.Icon;
                return <button key={item.name} type="button" role="menuitemradio"
                  aria-checked={approval === item.name}
                  className={item.name === "Acesso completo" ? "cdos-approval-unrestricted" : ""}
                  onClick={() => {
                    setApproval(item.name);
                    setMenu(null);
                    setHint("Modo selecionado nesta interface; nenhuma permissão real foi alterada.");
                  }}>
                  <Icon size={19} aria-hidden="true" className="cdos-approval-option-icon" />
                  <span className="cdos-approval-option-copy">
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  {approval === item.name && <Check size={17} aria-hidden="true" className="cdos-chat-check" />}
                </button>;
              })}
            </div>}
          </div>

          <div className="cdos-chat-actions">
            <div className="cdos-chat-intelligence">
              <button type="button" className="cdos-chat-intelligence-trigger"
                aria-haspopup="menu" aria-expanded={menu === "intelligence"}
                onClick={() => setMenu(previous => previous === "intelligence" ? null : "intelligence")}>
                Inteligência · <strong>{mode}</strong>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {menu === "intelligence" && <div role="menu"
                  aria-label="Escolher nível de inteligência" className="cdos-chat-intelligence-menu">
                <div className="cdos-chat-menu-title">Inteligência</div>
                {CHAT_INTELLIGENCE.map(option =>
                  <button type="button" role="menuitemradio" key={option}
                    aria-checked={mode === option}
                    onClick={() => {
                      setMode(option);
                      setMenu(null);
                      setHint("Nível de inteligência selecionado nesta interface.");
                    }}>
                    <span>{option}</span>
                    {mode === option && <Check size={16} aria-hidden="true" className="cdos-chat-check" />}
                  </button>
                )}
                <div className="cdos-chat-menu-divider" />
                <div className="cdos-chat-menu-title">Modelos internos</div>
                <div className="cdos-chat-model-managed">Gerenciados pelo Hermes</div>
              </div>}
            </div>
            <button type="button" className="cdos-chat-icon-btn"
              aria-label="Microfone" title="Microfone"
              onClick={() => setHint("Microfone não conectado. Nenhum áudio foi capturado.")}>
              <Mic size={19} aria-hidden="true" />
            </button>
            <button type={value.trim() ? "submit" : "button"}
              className={"cdos-chat-send" + (value.trim() ? " has-text" : "")}
              aria-label={value.trim() ? "Adicionar mensagem local" : "Voz"}
              title={value.trim() ? "Adicionar mensagem local" : "Voz"}
              onClick={!value.trim() ? () => setHint("Voz não conectada. Nenhuma gravação iniciada.") : undefined}>
              {value.trim() ? <ArrowUp size={19} aria-hidden="true" /> :
                <AudioLines size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {hint && <div className="cdos-chat-hint" role="status">{hint}</div>}
      </form>
      <div className="cdos-chat-caption">
        <span>Mensagens locais; nenhuma permissão, gravação ou envio real.</span>
        <button type="button" className="cdos-chat-open-agent" onClick={launch}>
          Abrir CENTRALDARK · OS <ExternalLink size={13} aria-hidden="true" />
        </button>
      </div>
      {launchState && <small className="cdos-chat-launch-state" role="status">{launchState}</small>}
    </div>
  </section>;
}
const byCapability = {
  hermes: [["Hermes", "Executor do sistema único"], ["Delegação", "Subagentes e terminais"], ["Provas", "Execução depende de readback real"]],
  evidencias: [["GOAL / RECEIPT", "Definir objetivo, executar, verificar e registrar"], ["Prova", "SHA, logs e readback quando existentes"], ["Estado", "Verificações devem possuir comprovantes"]],
  sistema: [["Casa · VPS · VM", "Ambientes conhecidos"], ["MCP / Hermes", "Estado não consultado nesta seção"], ["Sinal", "EVIDÊNCIA FALTANTE"]],
  goals: [["GOAL ROV", "Objetivo com critérios de aceite"], ["Hermes", "Executa somente quando autorizado"], ["FIXED_POINT", "Somente com contraprova"]],
  forja: [["Forja", "Owner existente da CentralDark"], ["Inventário", "Reutilizar centraldark-inventory-reconcile.sh"], ["Promoção", "Somente depois de validar gates"]]
};
function Capability({ id }) {
  const title = makeLabel(id);
  const rows = byCapability[id] || byCapability[id === "raioxvivo" ? "sistema" :
    ["recibos"].includes(id) ? "evidencias" : id === "forja-inventario" ? "forja" : "unknown"] ||
    [["Identidade", "Owner original do Cockpit preservado"], ["Capacidade", "Tela de navegação do sistema"], ["Verificação", "Nenhuma operação executada nesta seção"]];
  return <div className="cdos-stack">
    <div className="cdos-capability-head"><span className="cdos-eyebrow">CENTRALDARK · INSTINTO SUPERIOR</span>
      <h1>{title}</h1><p>Capacidade do Cockpit incorporada à navegação do sistema.</p></div>
    <Panel title={title} icon={Sparkles}><div className="cdos-capability-grid">
      {rows.map(([heading, description]) => <article key={heading}><strong>{heading}</strong><small>{description}</small></article>)}
    </div></Panel>
  </div>;
}

export function NativePage({ page, onNavigate, openDesktop }) {
  let title = { chat: "NOVO CHAT", overview: "VISÃO GERAL", compare: "COMPARAR",
    register: "REGISTROS", queue: "O QUE FALTA", rov: "ROV LIVRARIA" }[page];
  const id = page.startsWith("cd:") ? page.slice(3) : null;
  if (id) title = makeLabel(id).toLocaleUpperCase("pt-BR");
  return <main className="cdos-page">
    <header className="cdos-breadcrumb"><span>CENTRALDARK</span><b>/</b><strong>{title || "CENTRALDARK · OS"}</strong>
      <span className="cdos-breadcrumb-tag"><ShieldCheck size={13} /> SOMENTE LEITURA</span></header>
    <div className="cdos-page-body">
      {page === "chat" ? <Chat openDesktop={openDesktop} /> :
       page === "overview" ? <Overview onNavigate={onNavigate} /> :
       page === "compare" ? <Compare /> :
       page === "register" ? <Registers /> :
       page === "queue" ? <div className="cdos-stack">
         <Panel title="Próximos passos" icon={ListChecks}><Steps full /></Panel>
         <Panel title="O que significa cada situação?" icon={Info}>
           <p>Cada situação vale para o que o registro descreve naquela data.</p>
           <div className="cdos-status-row"><Status status="proven" /><Status status="broken" /><Status status="missing" /></div>
         </Panel></div> :
       page === "rov" ? <Library /> :
       id ? <Capability id={id} /> : <Overview onNavigate={onNavigate} />}
    </div>
  </main>;
}
