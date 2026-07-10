import { MatrixRain } from "./MatrixRain";
import { CockpitPane } from "./CockpitPane";
import { PilotoChat } from "./PilotoChat";
import { PANES } from "./dados";

export function CockpitHero() {
  return (
    <div className="cockpit-root">
      <MatrixRain />
      <div className="cockpit-shell">
        <nav className="cockpit-nav">
          <div className="cockpit-brand">
            <span className="cockpit-brand-dot" />
            <span className="cockpit-brand-name">
              Central<em>Dark</em> · cockpit
            </span>
          </div>
          <span className="cockpit-nav-tag">preview isolado · /preview/cockpit</span>
        </nav>

        <main className="cockpit-main">
          <section className="piloto" aria-label="Piloto CentralDark">
            <header className="piloto-header">
              <b>◉ PILOTO</b>
              <span>sessão viva</span>
            </header>
            <PilotoChat />
            <h1 className="piloto-headline">
              O cockpit do <em>CentralDark</em> nunca dorme.
            </h1>
            <p className="piloto-sub">
              Hermes coordena. Arsenal debate. Gateway roteia. HUB registra.
              TelePainel entrega. Enxame multiplica. Você comanda.
            </p>
          </section>

          <section className="panes-grid" aria-label="Agentes em execução">
            {PANES.map((p, i) => (
              <CockpitPane key={p.key} pane={p} seed={i} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
