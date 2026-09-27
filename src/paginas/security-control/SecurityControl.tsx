import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import seloUrl from "@/recursos-visuais/selo-centraldark.png";
import hudCanonicalUrl from "@/recursos-visuais/hud-centraldark-v1-canonical.png";
import {
  hud,
  soldados as SOLDADOS,
  incidente as INCIDENTE,
  missoes as MISSOES,
  aprovacoes as APROVACOES,
  infra as INFRA,
  rodape,
  type EstadoMissao,
} from "./dados-mock";
import "./security-control.css";

type Aba = "incidentes" | "missoes" | "soldados" | "aprovacoes" | "infra" | "evidencias";

const ABAS: { id: Aba; nome: string }[] = [
  { id: "incidentes", nome: "Incidentes" },
  { id: "missoes", nome: "Missões" },
  { id: "soldados", nome: "Soldados" },
  { id: "aprovacoes", nome: "Aprovações" },
  { id: "infra", nome: "Infraestrutura" },
  { id: "evidencias", nome: "Evidências" },
];

function traceCurto() {
  return "trc_" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 5);
}

function useHoraBRT() {
  const [hora, setHora] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHora(fmt());
    const t = setInterval(() => setHora(fmt()), 1000);
    return () => clearInterval(t);
  }, []);
  return hora;
}

interface ConfirmState {
  titulo: string;
  descricao: string;
  etapa: 1 | 2;
  onConfirm: () => void;
}

export default function SecurityControl() {
  const [aba, setAba] = useState<Aba>("incidentes");
  const [visao, setVisao] = useState<"geral" | "telegram">("geral");
  const [filtroMissao, setFiltroMissao] = useState<EstadoMissao | "todas">("todas");
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const hora = useHoraBRT();

  const missoesFiltradas = useMemo(
    () => (filtroMissao === "todas" ? MISSOES : MISSOES.filter((m) => m.estado === filtroMissao)),
    [filtroMissao]
  );

  function pedirConfirmacao(titulo: string, descricao: string, onOk: () => void) {
    setConfirm({ titulo, descricao, etapa: 1, onConfirm: onOk });
  }

  function acaoRecibo(nome: string) {
    const trace = traceCurto();
    toast.success(`${nome} · recibo emitido`, { description: `trace_id ${trace}` });
  }

  return (
    <div className="sc-root">
      <Helmet>
        <title>Security Control · CentralDark</title>
        <meta name="description" content="Sala de controle CentralDark — HUD operacional, incidentes, missões e soldados." />
      </Helmet>

      {/* Topbar */}
      <header className="sc-topbar" role="banner">
        <div className="sc-selo" aria-label="Selo CentralDark" style={{ backgroundImage: `url(${seloUrl})` }} />
        <div>
          <div className="sc-titulo">CENTRALDARK</div>
          <div className="sc-subtitulo">SECURITY CONTROL</div>
        </div>
        <div className="sc-topbar-right">
          <span className="sc-badge"><span className="sc-dot" /> PROTEGIDO</span>
          <span className="sc-mono">{hora} BRT</span>
        </div>
      </header>

      <div className="sc-shell">
        {/* Rail desktop */}
        <nav className="sc-rail" aria-label="Navegação principal">
          {ABAS.map((a) => (
            <button
              key={a.id}
              className="sc-rail-item"
              aria-current={aba === a.id}
              onClick={() => setAba(a.id)}
            >
              {a.nome}
            </button>
          ))}
        </nav>

        <main className="sc-main">
          {/* HUD */}
          <section className="sc-card gold" aria-label="HUD operacional">
            <div className="sc-card-h">
              <span className="sc-card-t">HUD · Painel Global</span>
              <div className="sc-toggle" role="tablist" aria-label="Modo de visualização">
                <button role="tab" aria-current={visao === "geral"} onClick={() => setVisao("geral")}>Visão Geral</button>
                <button role="tab" aria-current={visao === "telegram"} onClick={() => setVisao("telegram")}>Telegram</button>
              </div>
            </div>

            {visao === "geral" ? (
              <div className="sc-hud">
                <div className="sc-hud-selo" role="img" aria-label="Selo digital CentralDark" style={{ backgroundImage: `url(${seloUrl})` }} />
                <div className="sc-hud-body">
                  <div className="sc-hud-state">{hud.estado}</div>
                  <div className="sc-hud-grid">
                    <div className="sc-hud-row"><span className="sc-hud-k">🤖 Soldados</span><span className="sc-hud-v">{hud.soldados}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🎯 Missões</span><span className="sc-hud-v">{hud.missoes}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🟡 Aprovações</span><span className="sc-hud-v">{hud.aprovacoes}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🔴 Incidentes</span><span className="sc-hud-v">{hud.incidentes}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🖥️ Infra</span><span className="sc-hud-v">{hud.infra}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🔍 Varredura</span><span className="sc-hud-v">{hud.ultimaVarredura}</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">🛡️ Postura</span><span className="sc-hud-v">{hud.postura}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="sc-tg" aria-label="Simulação do HUD no Telegram">
{`🛡️ CENTRALDARK CONTROL 🛡️
🟢 PROTEGIDO · 1 AMEAÇA CONTIDA
🤖 Soldados: 7/7 ativos
🎯 Missões: 3 executando
🟡 Aprovações: 2 aguardando
🔴 Incidentes: 1 bloqueado
🖥️ Infraestrutura: saudável
🔍 Última varredura: agora
🛡️ Postura: ZERO TRUST
🧠 Memória viva ✔ · ${hora} BRT`}
              </pre>
            )}
          </section>

          {/* Aba: incidentes → card crítico */}
          {aba === "incidentes" && (
            <section className="sc-card red" aria-label="Incidente crítico">
              <div className="sc-card-h">
                <span className="sc-card-t" style={{ color: "#fecaca" }}>Incidente · FATO</span>
                <span className="sc-mono" style={{ color: "#94a3b8", fontSize: 11 }}>{INCIDENTE.id}</span>
              </div>
              <div className="sc-inc-title">🔴 {INCIDENTE.titulo}</div>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "6px 0 0" }}>{INCIDENTE.resumo}</p>

              <div className="sc-inc-grid">
                <div><div className="sc-inc-k">IP</div><div className="sc-inc-v">{INCIDENTE.ipMascarado}</div></div>
                <div><div className="sc-inc-k">Origem</div><div className="sc-inc-v">{INCIDENTE.origem}</div></div>
                <div><div className="sc-inc-k">Regra</div><div className="sc-inc-v">{INCIDENTE.regra}</div></div>
                <div><div className="sc-inc-k">Horário</div><div className="sc-inc-v">{INCIDENTE.horario}</div></div>
                <div><div className="sc-inc-k">Severidade</div><div className="sc-inc-v" style={{ color: "#fecaca" }}>{INCIDENTE.severidade}</div></div>
                <div><div className="sc-inc-k">Trace</div><div className="sc-inc-v">{INCIDENTE.traceId}</div></div>
              </div>

              <div className="sc-sec-title" style={{ marginTop: 14 }}>Ação pendente</div>
              <div className="sc-inc-actions">
                <button className="sc-btn ghost" onClick={() => acaoRecibo("Investigar")}>INVESTIGAR</button>
                <button className="sc-btn gold" onClick={() => acaoRecibo("Evidência")}>EVIDÊNCIA</button>
                <button
                  className="sc-btn danger"
                  onClick={() => pedirConfirmacao(
                    "Confirmar BLOQUEAR",
                    `Bloqueio permanente do IP ${INCIDENTE.ipMascarado} via Fail2Ban. Confirme em duas etapas.`,
                    () => acaoRecibo("Bloquear IP")
                  )}
                >BLOQUEAR</button>
                <button
                  className="sc-btn danger"
                  onClick={() => pedirConfirmacao(
                    "Confirmar RESOLVER",
                    `Fechar incidente ${INCIDENTE.id} e arquivar evidência. Confirme em duas etapas.`,
                    () => acaoRecibo("Resolver incidente")
                  )}
                >RESOLVER</button>
              </div>
            </section>
          )}

          {/* Aba: soldados */}
          {(aba === "soldados" || aba === "incidentes") && (
            <section className="sc-card" aria-label="Soldados">
              <div className="sc-card-h">
                <span className="sc-card-t">Soldados · 7/7</span>
                <span className="sc-mono" style={{ color: "var(--sc-muted)", fontSize: 11 }}>zero-trust</span>
              </div>
              <div className="sc-sold-grid">
                {SOLDADOS.map((s) => (
                  <article key={s.id} className="sc-sold">
                    <div className="sc-sold-head">
                      <div className={`sc-sold-av ${s.cor}`}>{s.nome[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sc-sold-name">{s.nome}</div>
                        <div className="sc-sold-fn">{s.funcao}</div>
                      </div>
                      <span className={`sc-chip ${s.estado === "ativo" ? "on" : s.estado === "isolado" ? "iso" : "idle"}`}>
                        {s.estado}
                      </span>
                    </div>
                    <div className="sc-sold-meta">
                      <span>🔑 {s.permissao}</span>
                      <span>⏱ {s.ultimaAtividade}</span>
                    </div>
                    <button
                      className="sc-btn danger"
                      style={{ minHeight: 36, padding: "6px 10px", fontSize: 12 }}
                      onClick={() => pedirConfirmacao(
                        `Isolar ${s.nome}`,
                        `Remover ${s.nome} da rede de execução até liberação manual. Confirme em duas etapas.`,
                        () => acaoRecibo(`Isolar ${s.nome}`)
                      )}
                    >ISOLAR</button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Aba: missões */}
          {aba === "missoes" && (
            <section className="sc-card" aria-label="Painel de missões">
              <div className="sc-card-h">
                <span className="sc-card-t">Missões</span>
                <div className="sc-filters" role="group" aria-label="Filtrar missões">
                  {(["todas","executando","aguardando","concluida","falhou"] as const).map((f) => (
                    <button
                      key={f}
                      className="sc-filter"
                      aria-pressed={filtroMissao === f}
                      onClick={() => setFiltroMissao(f)}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {missoesFiltradas.map((m) => (
                  <details key={m.id} className="sc-mission">
                    <summary>
                      <span className="sc-chip on">{m.estado}</span>
                      <span>
                        <b style={{ color: "var(--sc-text)" }}>{m.sender}</b>
                        <span style={{ color: "var(--sc-muted)" }}> → </span>
                        <b style={{ color: "var(--sc-purple)" }}>{m.recipient}</b>
                        <span style={{ color: "var(--sc-muted)" }}> · {m.action}</span>
                      </span>
                      <span className="sc-mono" style={{ color: "var(--sc-muted)", fontSize: 11 }}>{m.traceId}</span>
                    </summary>
                    <div className="sc-mission-body">
                      <div className="sc-kv"><b>resource</b><span>{m.resource}</span></div>
                      <div className="sc-kv"><b>expires_at</b><span>{m.expiresAt}</span></div>
                      <div className="sc-kv"><b>permissions</b><span>{m.permissions.join(", ")}</span></div>
                      <div className="sc-kv"><b>forbidden</b><span style={{ color: "#fecaca" }}>{m.forbidden.join(", ")}</span></div>
                    </div>
                  </details>
                ))}
                {missoesFiltradas.length === 0 && (
                  <div style={{ color: "var(--sc-muted)", fontSize: 13, padding: 12 }}>Nenhuma missão neste filtro.</div>
                )}
              </div>
            </section>
          )}

          {/* Aba: aprovações */}
          {aba === "aprovacoes" && (
            <section className="sc-card" aria-label="Aprovações pendentes">
              <div className="sc-card-h"><span className="sc-card-t">Aprovações · pendentes</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {APROVACOES.map((a) => (
                  <div key={a.id} className="sc-sold" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <span className="sc-chip" style={{ color: "#fde68a", borderColor: "rgba(234,179,8,0.4)", background: "rgba(234,179,8,0.06)" }}>
                      {a.criticidade}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sc-sold-name">{a.titulo}</div>
                      <div className="sc-sold-fn">solicitante: {a.solicitante} · {a.traceId}</div>
                    </div>
                    <button className="sc-btn gold" onClick={() => pedirConfirmacao("Aprovar", `Aprovar ${a.titulo}?`, () => acaoRecibo("Aprovação"))}>APROVAR</button>
                    <button className="sc-btn danger" onClick={() => pedirConfirmacao("Negar", `Negar ${a.titulo}?`, () => acaoRecibo("Negação"))}>NEGAR</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aba: infra */}
          {aba === "infra" && (
            <section className="sc-card" aria-label="Infraestrutura">
              <div className="sc-card-h"><span className="sc-card-t">Infraestrutura · saúde</span></div>
              <div className="sc-sold-grid">
                {INFRA.map((i) => (
                  <div key={i.servico} className="sc-sold">
                    <div className="sc-sold-head">
                      <span className="sc-dot" />
                      <div style={{ flex: 1 }}>
                        <div className="sc-sold-name" style={{ fontSize: 13 }}>{i.servico}</div>
                        <div className="sc-sold-fn">latência {i.latenciaMs}ms</div>
                      </div>
                      <span className="sc-chip on">{i.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aba: evidências */}
          {aba === "evidencias" && (
            <>
              <section className="sc-card gold" aria-label="Artefato canônico HUD v1">
                <div className="sc-card-h">
                  <span className="sc-card-t">Artefato Canônico · HUD CentralDark</span>
                  <span className="sc-chip on" style={{ borderColor: "rgba(212,162,74,0.5)", color: "#fde68a", background: "rgba(212,162,74,0.08)" }}>
                    V1 · SELADO
                  </span>
                </div>
                <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={hudCanonicalUrl} target="_blank" rel="noreferrer" style={{ display: "block", border: "1px solid rgba(212,162,74,0.28)", borderRadius: 10, overflow: "hidden", background: "#050607" }}>
                    <img
                      src={hudCanonicalUrl}
                      alt="HUD CentralDark v1 — artefato canônico selado"
                      loading="lazy"
                      style={{ display: "block", width: "100%", height: "auto" }}
                    />
                  </a>
                  <figcaption className="sc-hud-grid" style={{ fontSize: 12 }}>
                    <div className="sc-hud-row"><span className="sc-hud-k">trace_id</span><span className="sc-hud-v sc-mono">hud-canonical-001</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">Integridade</span><span className="sc-hud-v" style={{ color: "#34d399" }}>VERIFICADA</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">Selo</span><span className="sc-hud-v" style={{ color: "#fde68a" }}>V1 · SELADO</span></div>
                    <div className="sc-hud-row"><span className="sc-hud-k">Escopo</span><span className="sc-hud-v">referência visual congelada</span></div>
                  </figcaption>
                </figure>

                <div className="sc-sec-title" style={{ marginTop: 14 }}>Regras travadas do contrato</div>
                <ol style={{ margin: "6px 0 0", paddingLeft: 18, color: "var(--sc-text)", fontSize: 13, lineHeight: 1.7 }}>
                  <li>Nenhuma coluna alinhada manualmente por espaços.</li>
                  <li>Horário sempre dinâmico, com fuso BRT.</li>
                  <li>GROK · TERMINAL não pertence ao HUD fixado.</li>
                  <li>Caminhos íntegros; quebra apenas visual.</li>
                  <li>Botões em <span className="sc-mono">inline_keyboard</span>, fora do corpo.</li>
                  <li>Telegram HTML + <span className="sc-mono">editMessageText</span>.</li>
                  <li>“message is not modified” = sucesso idempotente.</li>
                </ol>
                <p style={{ color: "var(--sc-muted)", fontSize: 12, marginTop: 10 }}>
                  A imagem não substitui o componente responsivo; é a referência visual congelada e a evidência do contrato.
                </p>
              </section>

              <section className="sc-card" aria-label="Trilha de evidências">
                <div className="sc-card-h"><span className="sc-card-t">Evidências · trilha</span></div>
                <ol style={{ margin: 0, paddingLeft: 18, color: "var(--sc-text)", fontSize: 13, lineHeight: 1.7 }}>
                  <li>🟡 artefato canônico HUD v1 · <span className="sc-mono">hud-canonical-001</span> · V1 · SELADO</li>
                  <li>🔴 <b>SSH-block</b> · IP {INCIDENTE.ipMascarado} · {INCIDENTE.horario} · {INCIDENTE.traceId}</li>
                  <li>🟡 aprovação pendente · rotação de chave gateway · trc_ap2…002</li>
                  <li>🟢 varredura completa · postura ZERO TRUST mantida · agora</li>
                  <li>🟣 missão MIS-014 · GPT→Grok · mapear.infra · executando</li>
                </ol>
              </section>
            </>
          )}

          {/* Rodapé operacional */}
          <footer className="sc-foot" aria-label="Rodapé operacional">
            <span>🧠 memória viva ✔</span>
            <span className="sc-mono">{hora} BRT</span>
            <span>policy <span className="sc-mono">{rodape.policyVersion}</span></span>
            <span>gateway <span className="sc-mono">{rodape.integridadeGateway}</span></span>
          </footer>
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="sc-bottom" aria-label="Navegação inferior">
        {ABAS.map((a) => (
          <button key={a.id} aria-current={aba === a.id} onClick={() => setAba(a.id)}>
            {a.nome.slice(0, 4).toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Modal confirmação em 2 etapas */}
      {confirm && (
        <div className="sc-modal-bg" role="dialog" aria-modal="true" aria-labelledby="sc-modal-t" onClick={() => setConfirm(null)}>
          <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="sc-modal-t">{confirm.titulo} · etapa {confirm.etapa}/2</h3>
            <p>{confirm.descricao}</p>
            {confirm.etapa === 2 && (
              <p style={{ color: "#fde68a" }}>
                Confirmação final. Esta é uma simulação — nenhum estado real será alterado.
              </p>
            )}
            <div className="sc-modal-actions">
              <button className="sc-btn ghost" onClick={() => setConfirm(null)}>Cancelar</button>
              {confirm.etapa === 1 ? (
                <button className="sc-btn gold" onClick={() => setConfirm({ ...confirm, etapa: 2 })}>Prosseguir</button>
              ) : (
                <button
                  className="sc-btn danger"
                  onClick={() => {
                    confirm.onConfirm();
                    setConfirm(null);
                  }}
                >Confirmar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
