# COMANDO - app.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\routes\app.tsx
**SHA:** 07328a8af4a23648
**Timestamp:** 2026-08-26T19:33:57.937469
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute, Outlet, useNavigate, Link, useLocation, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import { usePermissions } from "@/hooks/use-permissions";
import { useIntroConfig } from "@/hooks/use-intro-config";
import { useActiveTheme } from "@/hooks/use-active-theme";
import { getBranding } from "@/lib/branding.functions";
import { WorkspaceBanner } from "@/components/workspace-banner";
import { AppTopbar } from "@/components/app-topbar";
import { IntroAnimation } from "@/components/landing/IntroAnimation";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { WorkspaceOnboarding } from "@/components/onboarding/WorkspaceOnboarding";
import { GuidedTour } from "@/components/onboarding/GuidedTour";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  Home, MessageCircle, Trello, Bell, Radio, Bot, Wrench, Tag, Zap, Shuffle, Calendar, Sparkles, Mic,
  Users, ShieldCheck, Building2, UserCog, Package, Settings2, ListChecks, ShoppingCart,
  BarChart3, History, Headphones, Smile, Palette, Plug, LogOut, Shield, ChevronDown, ChevronRight,
  Inbox as InboxIcon, GitBranch, Map as MapIcon, Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

export const Route = createFileRoute("/app")({ component: AppLayout });

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean; perm?: string | string[]; adminOnly?: boolean };
type Group = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; items: Item[]; perm?: string | string[]; adminOnly?: boolean };
type NavEntry = Item | Group;

// `perm` = chave do catálogo de permissões; `adminOnly` = só role=admin do workspace.
// Admin sempre passa (bypass no usePermissions.can).
// 6 itens principais sempre à vista. Tudo o resto fica dentro de "Configurações".
const NAV: NavEntry[] = [
  { to: "/app", label: "Início", icon: Home, exact: true },
  { to: "/app/chat", label: "Chat", icon: MessageCircle, perm: "chat.access" },
  { to: "/app/kanban", label: "Kanban", icon: Trello, perm: "chat.kanban" },
  { to: "/app/contatos", label: "Contatos", icon: Users, perm: "contato.view" },
  { to: "/app/chatbot", label: "ChatBot", icon: Bot, perm: "chatbot.access" },
  { to: "/app/notificacoes", label: "Notificações", icon: Bell },
  {
    id: "configuracoes", label: "Configurações", icon: Settings2,
    items: [
      { to: "/app/dashboard", label: "Dashboard Executivo", icon: BarChart3, perm: "home.view" },
      { to: "/app/mapa", label: "Mapa", icon: MapIcon, adminOnly: true },
      { to: "/app/notificacoes-config", label: "Config. Notificações", icon: Settings2, adminOnly: true },
      { to: "/app/canais", label: "Canais", icon: Radio, adminOnly: true },
      { to: "/app/utilidades/etiquetas", label: "Etiquetas", icon: Tag, perm: "tpl_etiqueta.view" },
      { to: "/app/utilidades/mensagens-rapidas", label: "Mensagens Rápidas", icon: Zap, perm: "tpl_msg.view" },
      { to: "/app/utilidades/mensagens-aleatorias", label: "Mensagens Aleatórias", icon: Shuffle, perm: "msg_aleatoria.view" },
      { to: "/app/utilidades/agendamentos", label: "Agendamentos", icon: Calendar, perm: "agendamento.view" },
      { to: "/app/utilidades/templates", label: "Templates Meta", icon: Sparkles, perm: "tpl_msg.view" },
      { to: "/app/utilidades/agente-ia", label: "Agente de IA", icon: Sparkles, perm: "ia.view" },
      { to: "/app/utilidades/voice-ia", label: "Voice IA", icon: Mic, perm: "ia.view" },
      { to: "/app/grupos-acesso", label: "Grupos de Acesso", icon: ShieldCheck, perm: "grupo_acesso.view" },
      { to: "/app/setores", label: "Setor", icon: Building2, perm: "setor.view" },
      { to: "/app/usuarios", label: "Usuários", icon: UserCog, perm: "usuario.view" },
      { to: "/app/planos/gerenciar", label: "Planos — Gerenciar", icon: Package, perm: "plano.billing" },
      { to: "/app/planos/lista", label: "Planos — Lista", icon: ListChecks, perm: "plano.billing" },
      { to: "/app/planos/adicional", label: "Comprar adicional", icon: ShoppingCart, perm: "plano.billing" },
      { to: "/app/relatorios/historico", label: "Histórico de Conversas", icon: History, perm: "relatorio.conversas" },
      { to: "/app/relatorios/atendimentos", label: "Atendimentos", icon: Headphones, perm: "relatorio.atendimentos" },
      { to: "/app/relatorios/satisfacao", label: "Satisfação", icon: Smile, perm: "relatorio.satisfacao" },
      { to: "/app/personalizar", label: "Personalizar", icon: Palette, perm: "c
```

---

# COMANDO - app.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\app.rs
**SHA:** 50606eba378383ef
**Timestamp:** 2026-08-28T02:35:53.953741
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- /// - `use_https_scheme`: If `true` when using [`Pattern::Isolation`](crate::Pattern::Isolation),

### Gaps
- // TODO: Maybe handle `FrontendDist::Files` as well
- // TODO: Enable this check.

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use crate::{
  image::Image,
  ipc::{
    channel::ChannelDataIpcQueue, CallbackFn, CommandArg, CommandItem, Invoke, InvokeError,
    InvokeHandler, InvokeResponseBody,
  },
  manager::{webview::UriSchemeProtocol, AppManager, Asset},
  plugin::{Plugin, PluginStore},
  resources::ResourceTable,
  runtime::{
    window::{WebviewEvent as RuntimeWebviewEvent, WindowEvent as RuntimeWindowEvent},
    ExitRequestedEventAction, RunEvent as RuntimeRunEvent,
  },
  sealed::{ManagerBase, RuntimeOrDispatch},
  utils::{config::Config, Env},
  webview::PageLoadPayload,
  Context, DeviceEventFilter, Emitter, EventLoopMessage, EventName, Listener, Manager, Monitor,
  Runtime, Scopes, StateManager, Theme, Webview, WebviewWindowBuilder, Window,
};

#[cfg(desktop)]
use crate::menu::{Menu, MenuEvent};
#[cfg(all(desktop, feature = "tray-icon"))]
use crate::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent, TrayIconId};
use raw_window_handle::HasDisplayHandle;
use serialize_to_javascript::{default_template, DefaultTemplate, Template};
use tauri_macros::default_runtime;
#[cfg(desktop)]
use tauri_runtime::EventLoopProxy;
use tauri_runtime::{
  dpi::{PhysicalPosition, PhysicalSize},
  window::DragDropEvent,
  RuntimeInitArgs,
};
use tauri_utils::{assets::AssetsIter, PackageInfo};

use std::{
  borrow::Cow,
  collections::HashMap,
  fmt,
  sync::{atomic, mpsc::Sender, Arc, Mutex, MutexGuard},
  thread::ThreadId,
  time::Duration,
};

use crate::{event::EventId, runtime::RuntimeHandle, Event, EventTarget};

#[cfg(target_os = "macos")]
use crate::ActivationPolicy;

pub(crate) mod plugin;

#[cfg(desktop)]
pub(crate) type GlobalMenuEventListener<T> = Box<dyn Fn(&T, crate::menu::MenuEvent) + Send + Sync>;
#[cfg(all(desktop, feature = "tray-icon"))]
pub(crate) type GlobalTrayIconEventListener<T> =
  Box<dyn Fn(&T, crate::tray::TrayIconEvent) + Send + Sync>;
pub(crate) type GlobalWindowEventListener<R> = Box<dyn Fn(&Window<R>, &WindowEvent) + Send + Sync>;
pub(crate) type GlobalWebviewEventListener<R> =
  Box<dyn Fn(&Webview<R>, &WebviewEvent) + Send + Sync>;
/// A closure that is run when the Tauri application is setting up.
pub type SetupHook<R> =
  Box<dyn FnOnce(&mut App<R>) -> std::result::Result<(), Box<dyn std::error::Error>> + Send>;
/// A closure that is run every time a page starts or finishes loading.
pub type OnPageLoad<R> = dyn Fn(&Webview<R>, &PageLoadPayload<'_>) + Send + Sync + 'static;
/// A closure that is run when the web content process terminates.
#[cfg(any(target_os = "macos", target_os = "ios"))]
pub type OnWebContentProcessTerminate<R> = dyn Fn(&Webview<R>) + Send + Sync + 'static;
pub type ChannelInterceptor<R> =
  Box<dyn Fn(&Webview<R>, CallbackFn, usize, &InvokeResponseBody) -> bool + Send + Sync + 'static>;

/// The exit code on [`RunEvent::ExitRequested`] when [`AppHandle#method.restart`] is called.
pub const RESTART_EXIT_CODE: i32 = i32::MAX;

/// Api exposed on the `ExitRequested` event.
#[derive(Debug, Clone)]
pub struct ExitRequestApi {
  tx: Sender<ExitRequestedEventAction>,
  code: Option<i32>,
}

impl ExitRequestApi {
  /// Prevents the app from exiting.
  ///
  /// **Note:** This is ignored when using [`AppHandle#method.restart`].
  pub fn prevent_exit(&self) {
    if self.code != Some(RESTART_EXIT_CODE) {
      self.tx.send(ExitRequestedEventAction::Prevent).unwrap();
    }
  }
}

/// Api exposed on the `CloseRequested` event.
#[derive(Debug, Clone)]
pub struct CloseRequestApi(Sender<bool>);

impl CloseRequestApi {
  /// Prevents the window from being closed.
  pub fn prevent_close(&self) {
    self.0.send(true).unwrap();
  }
}

/// An event from a window.
#[derive(Debug, Clone)]
#[non_exhaustive]
pub enum WindowEvent {
  /// The size of the window has changed. Contains the client area's new dimensions.
  Resized(PhysicalSize<u32>),
  /// The position of the window has changed. Contains the window's new position.
  Moved(PhysicalPosition<i32>),
  /// The window has been requested to close.
  #[non_exhaustive]
  CloseRequested {
    /// An API modify the behavior of the close requested event.
    api: CloseRequestApi,
  },
  /// The window has been destroyed.
  Destroyed,
  /// The window gained or lost focus.
  ///
  /// The parameter is true if the window has gained focus, and false if it has lost focus.
  Focused(bool),
  /// The window's scale factor has changed.
  ///
  /// The following user actions can cause DPI changes:
  ///
  /// - Changing the display's resolution.
  /// - Changing the display's scale factor (e.g. in Control Panel on Windows).
  /// - Moving the window to a display with a different scale factor.
  #[non_exhaustive]
  ScaleFactorChanged {
    /// The new scale factor.
    scale_factor: f64,
    /// The window inner size.
    new_inner_size: PhysicalSize<u32>,
  },
  /// An event associated with the drag and drop action.
  DragDrop(DragDro
```

---

# COMANDO - app.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\app.mjs
**SHA:** 775e5da215772e45
**Timestamp:** 2026-08-28T02:37:57.123356
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- firstRun: !(currentConfig?.connections || []).length,

### Ouro Bruto (primeiros 5000 chars)
```
import { renderPullRequest } from "./pull-request-view.mjs";
import { renderWorkItem } from "./work-item-view.mjs";
import { renderHome } from "./home-view.mjs";
import { renderConnectionPanel } from "./connection-view.mjs";
import { AGENCY_AUTH_ENABLED } from "./feature-flags.mjs";

const warning = document.getElementById("setupWarning");
const startupSplash = document.getElementById("startupSplash");
const startupTitle = document.getElementById("startupTitle");
const startupDetail = document.getElementById("startupDetail");
const signInSplash = document.getElementById("signInSplash");
const canvasContent = document.getElementById("canvasContent");
const homePanel = document.getElementById("homePanel");
const homeContent = document.getElementById("homeContent");
const tabPanels = document.getElementById("tabPanels");
const viewTabs = document.getElementById("viewTabs");
const viewBar = document.querySelector(".view-bar");
const authOutput = document.getElementById("authOutput");
const logsPanel = document.getElementById("logsPanel");
const connectionPanel = document.getElementById("connectionPanel");
const connectionsButton = document.getElementById("connectionsButton");
const refreshButton = document.getElementById("refreshButton");
const signInMicrosoftButton = document.getElementById("signInMicrosoftButton");
const signInAgencyButton = document.getElementById("signInAgencyButton");
const signOutButton = document.getElementById("signOutButton");
const showLogsButton = document.getElementById("showLogsButton");
const copyLogsButton = document.getElementById("copyLogsButton");
const logsList = document.getElementById("logsList");
const copyLogsStatus = document.getElementById("copyLogsStatus");
const versionLabel = document.getElementById("versionLabel");

let apiNonce = "";
let currentConfig;
let branchPullRequestInfo = null;
let branchPullRequestId = 0;
let homeLoaded = false;
let logs = [];

// Tabs behave like browser tabs: every item opens in its own tab and is closed
// independently. A tab is { id, entry, panel, content, data, rendered, token,
// timelineFilter, scrollTop, closable, editMode, dirty }, where entry is the
// { view, id } it shows, editMode is whether the whole detail view is being
// edited, and dirty tracks whether anything in it has unsaved changes.
let tabs = [];
let activeTabId = "";
let tabSequence = 0;


function addLog(level, message, details = "") {
    logs.unshift({ time: new Date().toLocaleTimeString(), level, message, details });
    logs = logs.slice(0, 100);
    renderLogs();
}

function renderLogs() {
    logsList.replaceChildren();
    if (!logs.length) {
        logsList.append(element("div", "status", "No logs yet."));
        return;
    }
    for (const entry of logs) {
        const item = element("div", "log-entry");
        item.append(element("span", "status", `[${entry.time}] `), document.createTextNode(`${entry.level.toUpperCase()} ${entry.message}`));
        if (entry.details) item.append(document.createElement("br"), element("span", "status", entry.details));
        logsList.append(item);
    }
}

function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}

function loadingSpinner(compact = false) {
    const host = element("span", `loading-spinner ${compact ? "loading-spinner-compact" : "loading-spinner-large"}`);
    host.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("loading-spinner-svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    for (const className of ["loading-spinner-track", "loading-spinner-arc"]) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.classList.add(className);
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "9");
        svg.append(circle);
    }
    host.append(svg);
    return host;
}

function createLoadingState(title, detail = "", { compact = false, className = "" } = {}) {
    const state = element(
        "div",
        ["loading-state", compact ? "loading-state-compact" : "", className].filter(Boolean).join(" "),
    );
    state.setAttribute("role", "status");
    state.setAttribute("aria-live", "polite");
    state.setAttribute("aria-busy", "true");
    const copy = element("span", "loading-copy");
    copy.append(element("strong", "loading-title", title));
    if (detail) {
        copy.append(element("span", "loading-detail", detail));
    }
    state.append(loadingSpinner(compact), copy);
    return state;
}

function showLoading(container, title, detail = "", options = {}) {
    container.replaceChildren(createLoadingState(title, detail, options));
}

function showStartupLoading(title, detail = "") {
    startupTitle.textContent = title;
    s
```

---

# COMANDO - app.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.git.desativado-20260630-013358\recarg17asbrasil-main\app.js
**SHA:** a72f3056a58bc514
**Timestamp:** 2026-08-28T02:39:04.767648
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = new Date(now);
- if (inpInicio?.value) start = new Date(inpInicio.value + 'T00:00:00');
- const start = new Date(end);

### Padroes
- // Regra: preço de venda deve ser MAIOR que o custo (API)
- // REGRA: Valor creditado = valor pago (1:1). R$100 no PIX = R$100 no saldo. Nenhuma multiplicação.

### Gaps
- <div style="display:flex;justify-content:space-between;align-items:center;margin: 24px 0 12px; flex-wrap: wrap; gap: 8px;">
- <div class="pix-code-wrapper" style="display: flex; gap: 10px;">
- <div class="pix-status-check" style="display: flex; flex-direction: column; gap: 10px;">
- <div class="form-actions" style="display: flex; gap: 10px;">

### Ouro Bruto (primeiros 5000 chars)
```
// Garante que db.getTransactions exista (compatibilidade com cache antigo de database.js)
if (typeof db !== 'undefined' && typeof db.getTransactions !== 'function') {
    db.getTransactions = function() { return Array.isArray(this._cache && this._cache.transactions) ? this._cache.transactions.slice() : []; };
}

// Não persistir dados no navegador: usar sessionStorage no lugar de localStorage.
// Assim nada fica gravado após fechar o navegador (sem "lembrar sessão").
const localStorage = window.sessionStorage;

// Main Application Logic
class RecargaApp {
    constructor() {
        this.api = api;
        this.db = db;
        this.currentUser = null;
        this.catalog = [];
        this.currentPage = 1;
        this.appTitle = 'Recarga Express';
        this.vendasStatusPollInterval = null;
        this.catalogRefreshInterval = null;
        this.listenersAttached = false;  // Flag para evitar múltiplos listeners
        this.currentReceiptData = null;  // Dados do comprovante atual para download
        
        // Aguardar DOM estar pronto antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            this.init();
        }
    }

    async init() {
        try {
        await db.init();
            
            // Verificar se há usuários no banco
            if (db._cache.users.length === 0) {
                console.warn('Nenhum usuário encontrado no banco. Verificando se há usuário admin padrão...');
                try {
                    // Tentar buscar usuário admin do servidor
                    const adminUser = await db._req('user_get', { username: 'admin' }, 'GET');
                    if (adminUser) {
                        db._cache.users.push(adminUser);
                    } else {
                        console.warn('Usuário admin não encontrado. O banco pode estar vazio.');
                    }
                } catch (e) {
                    console.error('Erro ao verificar usuário admin:', e);
                }
            }
            
        // Carregar configurações primeiro para garantir que API key está configurada
        await this.loadAdminConfig();
        this.setupEventListeners();
        this.checkAuth();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showNotification(`Erro ao inicializar: ${error.message}`, 'error');
        }
    }

    async loadAdminConfig() {
        // Garantir que sempre tenta carregar API key do localStorage se não estiver configurada
        const currentApiKey = this.api.apiKey;
        const currentBaseURL = this.api.baseURL;
        
        // Se não há API key configurada, tentar carregar do localStorage
        if (!currentApiKey || currentApiKey.trim() === '') {
            const storedKey = localStorage.getItem('adminApiKey') || '';
            if (storedKey && !storedKey.includes('*') && storedKey.trim() !== '') {
                this.api.setApiKey(storedKey);
            }
        }
        
        // Se não há Base URL configurada, tentar carregar do localStorage
        if (!currentBaseURL || currentBaseURL.trim() === '') {
            const storedURL = localStorage.getItem('adminApiBaseURL') || '';
            if (storedURL && storedURL.trim() !== '') {
                this.api.setBaseURL(storedURL);
            }
        }
        // SEMPRE carregar do servidor primeiro (fonte da verdade)
        // Isso garante que funciona em modo anônimo, outras sessões e navegadores
        let apiKey = '';
        let baseURL = '';
        let modo = 'prod';
        let keyTest = '';
        let keyProd = '';

        try {
            const r = await fetch('api/data.php?action=config_get');
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                // API Key e Base URL (sempre usar do servidor se disponível)
                // Se o valor do servidor está mascarado (contém *), usar do localStorage
                if (c.adminApiKey !== undefined && c.adminApiKey !== null && c.adminApiKey !== '') {
                    if (c.adminApiKey.includes('*')) {
                        // Valor mascarado do servidor, usar do localStorage se existir
                        const storedKey = localStorage.getItem('adminApiKey') || '';
                        apiKey = storedKey && !storedKey.includes('*') ? storedKey : '';
                    } else {
                        // Valor não mascarado do servidor, usar ele
                        apiKey = c.adminApiKey;
                        if (apiKey && apiKey.trim() !== '') {
                            localStorage.setItem('adminApiKey', apiKey);
                        }
                    }
                } else {
                    // Fallback para localStorage apenas se servidor não ti
```

---

# COMANDO - app.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\app.js
**SHA:** d9a563b87a541dd3
**Timestamp:** 2026-08-28T02:56:40.122472
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Regra: emoji sempre embrulhado em .emoji-glyph pra usar a font-stack

### Gaps
- pendente: '⚠️ pendente',
- return '<article style="display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid '+borda+';border-radius:10px;background:#0b0f14">' +
- '<strong style="color:#e6edf3;font-size:14px;display:flex;justify-content:space-between;gap:8px">' +
- <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">
- el.innerHTML = `<div style="display:grid;gap:6px">

### Ouro Bruto (primeiros 5000 chars)
```
const DATA_URL = './painel-data.json';
const REFRESH_MS = 5000;

const $ = (id) => document.getElementById(id);

function pct(value) {
  const n = Number(value || 0);
  return Math.max(0, Math.min(100, n));
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function statusLabel(status) {
  const map = {
    done: '✅ concluído',
    doing: '🟡 em andamento',
    next: '🔜 próximo',
    later: '⏳ depois',
    forte: '✅ forte',
    ativo: '🟢 ativo',
    andando: '🟡 andando',
    começando: '🔵 começando',
    rodando: '🟢 rodando',
    parcial: '🟡 parcial',
    pendente: '⚠️ pendente',
    'meio caminho': '🟡 meio caminho',
    'em montagem': '🔧 em montagem',
    feito: '✅ feito',
    ok: '🟢 ok'
  };
  return map[status] || status || 'status';
}

// Tudo no painel é renderizado em horário do Brasil (America/Sao_Paulo, BRT)
// independente do fuso do navegador ou do servidor que gerou o JSON.
const BR_TZ = 'America/Sao_Paulo';
function formatDate(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(d.getTime())) return '--';
  const txt = d.toLocaleString('pt-BR', {
    timeZone: BR_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return txt + ' BRT';
}

async function fetchJson(url) {
  const join = url.includes('?') ? '&' : '?';
  const res = await fetch(url + join + 't=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
  return res.json();
}

function calcOverallProgress(data) {
  // Calcula automaticamente das fases — se não houver, usa project.overallProgress
  const phases = Array.isArray(data.phases) ? data.phases : [];
  if (phases.length) {
    const sum = phases.reduce((s, p) => s + pct(p.percent), 0);
    return Math.round(sum / phases.length);
  }
  return pct((data.project || {}).overallProgress);
}

function renderData(data) {
  const project = data.project || {};
  $('projectSummary').textContent = project.summary || 'Painel do projeto CentralDark.';
  const overall = calcOverallProgress(data);
  $('overallProgress').textContent = overall + '%';
  $('overallBar').style.width = overall + '%';

  const parts = formatDate(data.updatedAt).split(', ');
  $('lastUpdated').textContent = parts[1] || '--:--';
  $('lastUpdatedDate').textContent = parts[0] || '--';

  $('maturityList').innerHTML = (data.maturity || []).map((item) =>
    '<article class="maturity-card">' +
      '<strong><span>' + safe(item.name) + '</span><span>' + pct(item.value) + '%</span></strong>' +
      '<div class="bar"><i style="width:' + pct(item.value) + '%"></i></div>' +
      '<p><b>' + safe(statusLabel(item.status)) + '</b> · ' + safe(item.detail) + '</p>' +
    '</article>'
  ).join('');

  $('agentsList').innerHTML = (data.agents || []).map((agent) => {
    // Regra: emoji sempre embrulhado em .emoji-glyph pra usar a font-stack
    // de emoji colorido. Se vier vazio, cai pra inicial do nome (nunca amarelo vazio).
    const glyph = (agent.emoji && String(agent.emoji).trim())
      ? safe(agent.emoji)
      : safe((agent.name || '?').trim().charAt(0).toUpperCase());
    return '<article class="agent-card">' +
      '<div class="agent-emoji emoji-glyph">' + glyph + '</div>' +
      '<div>' +
        '<h3>' + safe(agent.name) + '</h3>' +
        '<small>' + safe(agent.role) + ' · ' + pct(agent.power) + '%</small>' +
        '<p>' + safe(agent.description) + '</p>' +
        '<div class="bar"><i style="width:' + pct(agent.power) + '%"></i></div>' +
      '</div>' +
    '</article>';
  }).join('');

  $('milestones').innerHTML = (data.milestones || []).map((m) =>
    '<article class="timeline-item ' + safe(m.status || '') + '">' +
      '<h3>' + safe(m.title) + '</h3>' +
      '<div class="bar"><i style="width:' + pct(m.percent) + '%"></i></div>' +
      '<p>' + safe(statusLabel(m.status)) + ' · ' + pct(m.percent) + '%</p>' +
    '</article>'
  ).join('');

  $('nextSteps').innerHTML = (data.nextSteps || []).map((step) => '<li>' + safe(step) + '</li>').join('');
  $('safeRules').innerHTML = (data.safeRules || []).map((rule) => '<li>' + safe(rule) + '</li>').join('');
}

function renderEvents(data) {
  const box = $('eventsList');
  if (!box) return;

  const eventsAll = Array.isArray(data.events) ? data.events : [];
  const events = eventsAll.slice(0, 5);
  if (!events.length) {
    box.innerHTML = '<article class="event-card"><div><strong>Nenhum evento ainda</strong><p>Quando avançarmos no chat, os acontecimentos aparecem aqui.</p></div><span>aguardando</span></article>';
    return;
  }

  box.innerHTML = events.map((event) => {
    const title  = event.title  || event.titulo  || 'Evento do projeto';
    const detail = event.detail || event.detalhe || '';
    const sha    = event.sha    ? ' · <code>' + safe(String(
```