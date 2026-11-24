// @ts-nocheck
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Activity, BookOpen, BookText, Bot, Boxes, Cable, ChevronDown, ChevronRight,
  ClipboardList, Clock3, Code2, Columns2, Compass, ExternalLink, FileText,
  FolderKanban, Grid2X2, Layers3, LayoutGrid, ListChecks, MessageCircle,
  Monitor, PanelLeftClose, PanelLeftOpen, PenSquare, Radar, ScrollText, Settings,
  ShieldCheck, Sparkles, Target, Wrench
} from "lucide-react";
import data from "./native-data.json";
import { NativePage } from "./NativePages";
import { AgentBridgeView } from "./AgentBridgeView";
import "./native-shell.css";

const WIDTH_KEY = "centraldark-casa-sidebar-width";
const COLLAPSE_KEY = "centraldark-casa-sidebar-collapsed";
const ICONS = {
  overview: LayoutGrid, compare: Columns2, register: ScrollText, queue: ListChecks,
  rov: BookOpen, geral: Grid2X2, visao: LayoutGrid, jornada: Compass,
  portal: Monitor, sistema: Activity, admin: Settings, sync: Layers3,
  recibos: ClipboardList, raioxvivo: Radar, "builder-bolt": Boxes,
  centraldarkbot: Bot, design: Sparkles, arquitetura: FolderKanban,
  "agent-mode": Bot, "html-consolidation": FileText, forja: Wrench,
  "forja-regras": ShieldCheck, "forja-inventario": ClipboardList,
  "gram-permissions": ShieldCheck, hermes: Bot, goals: Target,
  "dream-reviewer": Clock3, genesis: Sparkles, obsidian: BookText,
  pr1873: Code2, gram: MessageCircle, unigram: MessageCircle,
  downloads: FileText, evidencias: ClipboardList
};
const GROUP_ICONS = {
  "Começar aqui": Compass, "Acompanhar": Target,
  "Criar e montar": Grid2X2, "Forja (ferramentas)": Wrench,
  "Assistentes e ideias": Bot, "Mensagens e arquivos": MessageCircle
};
const EXCLUDED = new Set(["geral", "visao", "biblioteca", "pendencias"]);
const clamp = value => Math.min(420, Math.max(160, Math.round(value)));
const readWidth = () => {
  try {
    const stored = Number(localStorage.getItem(WIDTH_KEY));
    return stored >= 160 && stored <= 420 ? stored : 218;
  } catch { return 218; }
};
const readCollapsed = () => {
  try { return localStorage.getItem(COLLAPSE_KEY) === "true"; }
  catch { return false; }
};

function BrandMark() {
  return <svg className="cdos-brand-mark" viewBox="0 0 32 32" fill="none"
    stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <circle cx="16" cy="16" r="12" />
    <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
    <circle cx="16" cy="16" r="3.7" />
    <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
  </svg>;
}

function NavEntry({ id, label, active, collapsed, onNavigate, Icon = Grid2X2, prominent = false }) {
  return <button type="button" translate="no" className={[
    "cdos-nav-entry", prominent && "cdos-prominent", active && "cdos-active"
  ].filter(Boolean).join(" ")}
    title={collapsed ? label : undefined}
    aria-current={active ? "page" : undefined}
    aria-label={label} onClick={() => onNavigate(id)}>
    <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
    <span className="cdos-nav-label">{label}</span>
  </button>;
}

export function NativeShell({ children }) {
  const routerNavigate = useNavigate();
  // Direct links to existing Hermes sessions keep their original route.
  const [page, setPage] = useState(() => {
    const pathname = window.location.hash.split("?")[0].replace(/^#/, "");
    return pathname && pathname !== "/" && pathname !== "/cdos" ? "hermes" : "agent";
  });
  const [width, setWidth] = useState(readWidth);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [flyout, setFlyout] = useState(null);
  const [flyoutPosition, setFlyoutPosition] = useState(null);
  const sidebarRef = useRef(null);
  const triggerRefs = useRef(new Map());
  const flyoutRef = useRef(null);
  const closeTimer = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const contentRef = useRef(null);
  const actualWidth = collapsed ? 56 : width;

  // The original Hermes titlebar is viewport-fixed; reserve the CentralDark rail
  // so its session toggle and unread badge stay above the Hermes sessions pane.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--cdos-native-sidebar-width", `${actualWidth}px`);
    return () => document.documentElement.style.removeProperty("--cdos-native-sidebar-width");
  }, [actualWidth]);

  useEffect(() => {
    try { localStorage.setItem(WIDTH_KEY, String(width)); } catch {}
  }, [width]);
  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  const navigate = useCallback((id, { keepFlyout = false } = {}) => {
    const showHermes = id === "hermes" || id === "os";
    setPage(showHermes ? "hermes" : id);
    // Navigate in the existing Hermes renderer; never start another Electron.
    if (showHermes) routerNavigate("/");
    if (!keepFlyout) setFlyout(null);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [routerNavigate]);

  const updateWidth = useCallback(next => {
    if (next < 120) {
      setCollapsed(true);
    } else {
      setWidth(clamp(next));
      setCollapsed(false);
    }
  }, []);

  const startDrag = useCallback(event => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: event.pointerId, x: event.clientX, width: actualWidth };
    setDragging(true);
  }, [actualWidth]);

  const moveDrag = useCallback(event => {
    if (dragRef.current?.id !== event.pointerId) return;
    updateWidth(dragRef.current.width + event.clientX - dragRef.current.x);
  }, [updateWidth]);

  const stopDrag = useCallback(event => {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const resizeKey = useCallback(event => {
    const sizes = {
      ArrowLeft: actualWidth <= 160 ? 56 : actualWidth - 20,
      ArrowRight: Math.max(160, actualWidth + 20),
      Home: 56, End: 420
    };
    if (!(event.key in sizes)) return;
    event.preventDefault();
    updateWidth(sizes[event.key]);
  }, [actualWidth, updateWidth]);

  const cancelFlyoutClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const dismissFlyout = () => {
    cancelFlyoutClose();
    setFlyout(null);
  };

  const hoverGroup = (key, event) => {
    if (event.pointerType !== "mouse") return;
    cancelFlyoutClose();
    setFlyout(previous => previous?.key === key ? previous : { key, pinned: false });
  };

  const leaveGroup = event => {
    if (event.pointerType !== "mouse" || flyout?.pinned) return;
    cancelFlyoutClose();
    closeTimer.current = window.setTimeout(() => {
      setFlyout(previous => previous?.pinned ? previous : null);
      closeTimer.current = null;
    }, 240);
  };

  const clickGroup = (key, firstId) => {
    cancelFlyoutClose();
    if (flyout?.key === key && flyout.pinned) {
      setFlyout(null);
      return;
    }
    setFlyout({ key, pinned: true });
    if (firstId && key !== "library") {
      navigate("cd:" + firstId, { keepFlyout: true });
    }
  };

  const flyoutItems = flyout
    ? (() => {
        const group = data.sections.find(item => item.label === flyout.key);
        const links = group?.items.filter(([id]) => !EXCLUDED.has(id)) || [];
        return flyout.key === "Acompanhar"
          ? [...links, ["evidencias", "Evidências"]]
          : links;
      })()
    : [];

  useLayoutEffect(() => {
    if (!flyout) return undefined;
    const panel = flyoutRef.current;
    const sidebar = sidebarRef.current;
    if (!panel || !sidebar) return undefined;
    const reposition = () => {
      const trigger = triggerRefs.current.get(flyout.key);
      if (!trigger) return;
      const triggerRect = trigger.getBoundingClientRect();
      const rightEdge = sidebar.getBoundingClientRect().right + 6;
      const fitsRight = rightEdge + panel.offsetWidth <= window.innerWidth - 8;
      const left = Math.max(8, fitsRight
        ? rightEdge
        : Math.min(triggerRect.left, window.innerWidth - panel.offsetWidth - 8));
      const top = Math.max(8, Math.min(
        fitsRight ? triggerRect.top : triggerRect.bottom + 6,
        window.innerHeight - panel.offsetHeight - 8
      ));
      setFlyoutPosition(previous =>
        previous?.key === flyout.key && previous.left === left && previous.top === top
          ? previous : { key: flyout.key, left, top }
      );
    };
    const raf = window.requestAnimationFrame(reposition);
    const observer = new ResizeObserver(reposition);
    observer.observe(sidebar);
    observer.observe(panel);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [flyout?.key, width, collapsed]);

  useEffect(() => {
    if (!flyout) return undefined;
    const closeOutside = event => {
      if (flyoutRef.current?.contains(event.target)) return;
      if (event.target.closest?.("[data-cdos-flyout-trigger]")) return;
      dismissFlyout();
    };
    const handleEscape = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      dismissFlyout();
      triggerRefs.current.get(flyout.key)?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [flyout]);

  useEffect(() => {
    const handleShortcut = event => {
      const isSidebarShortcut = event.code === "KeyS" ||
        String(event.key || "").toLowerCase() === "s";
      if (event.repeat || !isSidebarShortcut || !event.ctrlKey ||
          !event.shiftKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(previous => !previous);
      setFlyout(null);
    };
    window.addEventListener("keydown", handleShortcut, true);
    return () => window.removeEventListener("keydown", handleShortcut, true);
  }, []);

  useEffect(() => {
    if (typeof window.centralDark?.onSidebarToggle !== "function") return undefined;
    return window.centralDark.onSidebarToggle(() => {
      setCollapsed(previous => !previous);
      setFlyout(null);
    });
  }, []);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  return <div className={["cdos-shell", collapsed && "cdos-collapsed", dragging && "cdos-resizing"]
    .filter(Boolean).join(" ")} data-cdos-view={page === "hermes" ? "hermes" : "native"}
    style={{ "--cdos-menu-width": actualWidth + "px" }}>
    <aside ref={sidebarRef} id="cdos-sidebar" className="cdos-sidebar" aria-label="Navegação CENTRALDARK · OS">
      <div className="cdos-sidebar-header">
        <div className="cdos-brand">
          <span className="cdos-brand-box"><BrandMark /></span>
          <span className="cdos-brand-text"><strong>CentralDark</strong>
            <small>CENTRALDARK · OS</small></span>
        </div>
        <button className="cdos-toggle" type="button"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-keyshortcuts="Control+Shift+S" aria-expanded={!collapsed}
          title={collapsed ? "Expandir menu (Ctrl+Shift+S)" : "Recolher menu (Ctrl+Shift+S)"}
          onClick={() => { setCollapsed(previous => !previous); dismissFlyout(); }}>
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
      </div>
      <div className="cdos-sidebar-scroll">
        <NavEntry id="chat" label="Novo chat" Icon={PenSquare}
          active={page === "chat"} collapsed={collapsed} onNavigate={navigate} prominent />
        <NavEntry id="agent" label="CENTRALDARK AGENTE" Icon={ShieldCheck}
          active={page === "agent"} collapsed={collapsed} onNavigate={navigate} prominent />
        <div className="cdos-heading">ACOMPANHAMENTO</div>
        <nav className="cdos-navigation" aria-label="Páginas do sistema">
          {
            [
              ["overview", "Visão geral"], ["compare", "Comparar"],
              ["register", "Registros"], ["queue", "O que falta"]
            ].map(([id, label]) => <NavEntry key={id} id={id} label={label}
              Icon={ICONS[id]} active={page === id} collapsed={collapsed} onNavigate={navigate} />)
          }
        </nav>
        <div className="cdos-section">
          <button type="button"
            className={"cdos-section-trigger" + (page === "rov" ? " cdos-group-active" : "")}
            aria-current={page === "rov" ? "page" : undefined}
            title={collapsed ? "Biblioteca" : undefined}
            onClick={() => navigate("rov")}>
            <BookOpen size={19} /><span className="cdos-nav-label">Biblioteca</span>
            <span className="cdos-library-pulse" aria-hidden="true" />
            <ChevronRight className="cdos-chevron" size={17} />
          </button>
        </div>
        <div className="cdos-sidebar-divider" />
        {data.sections.map(group => {
          const links = group.items.filter(([id]) => !EXCLUDED.has(id));
          if (group.label === "Acompanhar") links.push(["evidencias", "Evidências"]);
          if (!links.length) return null;
          const GroupIcon = GROUP_ICONS[group.label] || Layers3;
          const open = flyout?.key === group.label;
          const selected = links.some(([id]) => page === "cd:" + id);
          return <div key={group.label} className="cdos-section cdos-flyout-anchor"
            onPointerEnter={event => hoverGroup(group.label, event)}
            onPointerLeave={leaveGroup}>
            <button type="button"
              ref={node => {
                if (node) triggerRefs.current.set(group.label, node);
                else triggerRefs.current.delete(group.label);
              }}
              data-cdos-flyout-trigger={group.label}
              className={"cdos-section-trigger" + (selected ? " cdos-group-active" : "")}
              aria-label={group.label} aria-haspopup="menu"
              aria-controls="cdos-flyout-menu" aria-expanded={open}
              title={collapsed ? group.label : undefined}
              onClick={() => clickGroup(group.label, links[0]?.[0])}>
              <GroupIcon size={19} /><span className="cdos-nav-label">{group.label}</span>
              <ChevronRight className="cdos-chevron" size={17} />
            </button>
          </div>;
        })}
      </div>
      <a className="cdos-sidebar-footer" href="https://github.com/ServerVpss/CentralDark/tree/main"
        target="_blank" rel="noreferrer" title="Ver projeto no GitHub">
        <ExternalLink size={15} /><span className="cdos-nav-label">Ver projeto no GitHub</span>
      </a>
    </aside>
    <div role="separator" tabIndex={0} className="cdos-resize" aria-label="Largura do menu lateral"
      title="Arraste para ajustar a largura" aria-controls="cdos-sidebar"
      aria-orientation="vertical" aria-valuemin={56} aria-valuemax={420}
      aria-valuenow={actualWidth} onPointerDown={startDrag} onPointerMove={moveDrag}
      onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={stopDrag}
      onKeyDown={resizeKey}><span aria-hidden="true" /></div>
    <div className="cdos-content" ref={contentRef}>
      {page === "hermes"
        ? <div className="cdos-hermes-page">{children}</div>
        : page === "agent"
          ? <AgentBridgeView onOpenOs={() => navigate("os")} />
          : <NativePage page={page} onNavigate={navigate}
              openDesktop={() => { navigate("os"); return { ready: true }; }} />}
    </div>
    {flyout && createPortal(
      <div ref={flyoutRef} id="cdos-flyout-menu" className="cdos-flyout"
        role="menu" aria-label={flyout.key === "library" ? "Biblioteca" : flyout.key}
        style={{
          left: flyoutPosition?.key === flyout.key ? flyoutPosition.left : -9999,
          top: flyoutPosition?.key === flyout.key ? flyoutPosition.top : 0,
          visibility: flyoutPosition?.key === flyout.key ? "visible" : "hidden"
        }}
        onPointerEnter={event => {
          if (event.pointerType === "mouse") cancelFlyoutClose();
        }}
        onPointerLeave={leaveGroup}>
        {flyoutItems.map(([id, label]) => {
          const Icon = ICONS[id] || Grid2X2;
          const target = "cd:" + id;
          return <button type="button" role="menuitem" key={id}
            aria-current={page === target ? "page" : undefined}
            onClick={() => { dismissFlyout(); navigate(target); }}>
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>{label}</span>
          </button>;
        })}
      </div>, document.body
    )}
  </div>;
}
