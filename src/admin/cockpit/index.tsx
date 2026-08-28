import { useCallback, useState } from "react";
import "./cockpit.css";
import "./overclock.css";
import "./hermes.css";
import { MatrixRain } from "./MatrixRain";
import { CockpitPane } from "./CockpitPane";
import { HermesMascote } from "./HermesMascote";
import { PANES } from "./dados";
import hermesIdle from "./hermes/idle.png.asset.json";


const TABS = [
  { id: "cinema", label: "CINEMA SITE", sub: "Landing cinematográfica gerada pelo enxame." },
  { id: "factory", label: "APP FACTORY", sub: "App inteiro entregue com backend + auth + DB." },
  { id: "saas", label: "CENTRAL 10K", sub: "O ecossistema inteiro do CentralDark. De cima, o cofre." },
  { id: "autopilot", label: "AUTOPILOT", sub: "Hermes rodando 24h sem você tocar." },
  { id: "arcade", label: "ARSENAL", sub: "Conselho de 20 IAs debatendo até o consenso." },
];

export default function CockpitPreview() {
  const [tab, setTab] = useState("saas");
  const [ultimoEvento, setUltimoEvento] = useState<{ id: number; texto: string; pane: string } | null>(null);
  const active = TABS.find((t) => t.id === tab)!;

  const receberLog = useCallback((ev: { id: number; texto: string; pane: string }) => {
    setUltimoEvento(ev);
  }, []);

  return (
    <div className="cockpit-root oc-page">
      <MatrixRain />


      {/* NAV */}
      <header className="oc-nav">
        <div className="oc-brand">
          <span className="oc-brand-mark">◉</span>
          <span className="oc-brand-name">CENTRAL<em>DARK</em>_</span>
        </div>
        <nav className="oc-menu">
          <a>Enxame</a>
          <a>Como funciona</a>
          <a>Arsenal</a>
          <a>Jornada</a>
          <a>Preços</a>
        </nav>
        <div className="oc-cta">
          <button className="oc-btn oc-btn-ghost">Assinar</button>
          <button className="oc-btn oc-btn-primary">Ver o enxame</button>
        </div>
      </header>

      {/* HERO */}
      <section className="oc-hero">
        <h1 className="oc-title">
          Você pede <span className="oc-title-accent">um sistema</span>
        </h1>
        <p className="oc-sub">
          Um enxame de <span className="oc-sub-hl">140+ modelos</span> constrói{" "}
          <span className="oc-sub-hl2">100x mais rápido</span> na sua frente.
        </p>
        <div className="oc-actions">
          <button className="oc-btn oc-btn-primary lg">Ver o enxame</button>
          <button className="oc-btn oc-btn-ghost lg">Assinar</button>
          <span className="oc-price">a partir de <b>R$97/mês</b></span>
        </div>

        {/* TABS */}
        <div className="oc-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`oc-tab ${t.id === tab ? "on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <b>{t.label}</b>
              {t.id === tab && <span className="oc-tab-sub">{t.sub}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* TERMINAL WINDOW */}
      <section className="oc-window">
        <div className="oc-window-bar">
          <div className="oc-traffic">
            <span className="tl tl-red" />
            <span className="tl tl-yel" />
            <span className="tl tl-grn" />
          </div>
          <div className="oc-window-title">
            <span className="oc-brand-mark small">◉</span> centraldark · cockpit v1.0.5
          </div>
          <div className="oc-window-tabs">
            <span className="wt">hermes-hub</span>
            <span className="wt on">{active.label.toLowerCase()}</span>
            <span className="wt">cinema-site</span>
          </div>
          <div className="oc-window-right">
            <span className="wr">ARQUIVOS</span>
            <span className="wr">VOL ●●●○○</span>
            <span className="wr">CHAT</span>
            <span className="wr live">● JARVIS</span>
            <span className="wr">+ PANE</span>
          </div>
        </div>

        <div className="oc-window-body">
          <aside className="oc-sidebar">
            <div className="oc-side-head">MISSÕES <b>+</b></div>
            <ul className="oc-missions">
              <li className={tab === "saas" ? "on" : ""}>● central-10k <span>4</span></li>
              <li>● cinema-site <span>3</span></li>
              <li>● app-factory <span>2</span></li>
              <li>● autopilot <span>1</span></li>
              <li>● arsenal <span>—</span></li>
            </ul>
            <div className="oc-side-head" style={{ marginTop: 16 }}>ARQUIVADOS <b>12</b></div>
            <div className="oc-side-hermes">
              <HermesMascote ultimoEvento={ultimoEvento} />
            </div>
          </aside>

          <div className="oc-panes">
            {PANES.map((p, i) => (
              <div className="oc-pane-wrap" key={p.key}>
                <CockpitPane pane={p} seed={i} onLog={receberLog} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="oc-foot">
        <span>preview isolado · /preview/cockpit</span>
        <span>fluxo de ouro · pivete comanda</span>
      </footer>
    </div>
  );
}
