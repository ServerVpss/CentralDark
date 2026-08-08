// 📄 Renderer nativo do tipo `session-report`.
//
// Primeiro renderer diferenciado do Artifacts Builder — até aqui todo
// artefato caía no mesmo template de cards genéricos independente do
// `tipo` declarado (achado registrado no contrato). Este é o primeiro que
// realmente varia por capacidade, como pedido: 2D sempre, 3D só quando
// acrescenta compreensão de verdade (aqui não acrescenta — é um relatório
// para ler, não um grafo espacial — então este tipo é 3D_NOT_APPLICABLE,
// declarado, não omitido).
//
// Paleta: reaproveita os tokens já em produção em core/orchestrator.mjs
// (bg #0a0f0d, surface #101a15, line #294235, text #eef8f1, muted #9fb8aa,
// primary #34d399) — a mesma família BLACK + GREEN, sem tema novo.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function fmtPct(part, total) {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

const STATE_COLOR = { PROVED: '#34d399', PARTIAL: '#f2c14e', BLOCKED: '#f87171', UNPROVEN: '#9fb8aa', HISTORICAL: '#6b8577' };

function statChip(n, label) {
  return `<div class="chip"><div class="chip-n">${escapeHtml(n)}</div><div class="chip-l">${escapeHtml(label)}</div></div>`;
}

function timelineRow(ev) {
  const dotColor = ev.kind === 'merge' ? 'var(--primary)' : ev.kind === 'warn' ? '#f2c14e' : '#5c7568';
  return `<div class="tl-row">
    <span class="tl-time">${escapeHtml(ev.time)}</span>
    <span class="tl-dot" style="background:${dotColor}"></span>
    <span class="tl-msg">${escapeHtml(ev.msg)} <code class="sha">${escapeHtml(ev.sha)}</code></span>
    <span class="tl-status" style="color:${dotColor}">${escapeHtml(ev.status)}</span>
  </div>`;
}

function ledgerRow(row) {
  const pillClass = row.owner_type === 'human' ? 'human' : row.owner_type === 'agent' ? 'agent' : 'none';
  return `<div class="ledger-row">
    <span class="pill ${pillClass}">${escapeHtml(row.owner_type)}</span>
    <span class="desc">${escapeHtml(row.desc)}</span>
    <span class="owner">${escapeHtml(row.owner)}</span>
  </div>`;
}

function evidenceRow(ev) {
  const href = escapeHtml(ev.url);
  return `<a class="evidence" href="${href}" target="_blank" rel="noopener noreferrer">
    <span class="ev-type">${escapeHtml(ev.type)}</span>
    <span class="ev-ref">${escapeHtml(ev.ref)}</span>
    <span class="ev-result">${escapeHtml(ev.result)}</span>
  </a>`;
}

/** Constrói o HTML humano do relatório de sessão. `record` é o resultado
 * de `buildArtifactRecord()` (schema.mjs) já com digests calculados. */
export function renderSessionReportHtml(record, data) {
  const stateColor = STATE_COLOR[record.state] ?? STATE_COLOR.UNPROVEN;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(record.title)} · CentralDark</title>
<meta name="description" content="${escapeHtml(data.summary)}"/>
<link rel="stylesheet" href="style.css"/>
</head>
<body>
<div class="rail"></div>
<main class="page">
  <header class="masthead">
    <div class="eyebrow">RELATÓRIO DE SESSÃO · ARTIFACT #${escapeHtml(record.artifact_id)} · <span style="color:${stateColor}">${escapeHtml(record.state)}</span></div>
    <h1>${escapeHtml(record.title)}</h1>
    <p>${escapeHtml(data.summary)}</p>
  </header>

  <section class="stats">
    ${data.stats.map(s => statChip(s.n, s.label)).join('\n    ')}
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Timeline</span><h2>Eventos reais, do commit ao merge</h2></div>
    <div class="timeline">
      ${data.timeline.map(timelineRow).join('\n      ')}
    </div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Local</span><h2>MOTOR-TESTE</h2></div>
    <div class="card"><p>${data.motorTeste.map(escapeHtml).join('</p><p>')}</p></div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Remoto</span><h2>ServerVpss/CentralDark</h2></div>
    <div class="card"><p>${data.centralDark.map(escapeHtml).join('</p><p>')}</p></div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Evolução</span><h2>Antes → mudança → depois</h2></div>
    <div class="evolution">
      <div class="ev-col"><div class="ev-h">Antes</div><p>${escapeHtml(data.evolution.before)}</p></div>
      <div class="ev-arrow">→</div>
      <div class="ev-col"><div class="ev-h">Mudança</div><p>${escapeHtml(data.evolution.change)}</p></div>
      <div class="ev-arrow">→</div>
      <div class="ev-col"><div class="ev-h">Depois</div><p>${escapeHtml(data.evolution.after)}</p></div>
    </div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Pendente</span><h2>O que ainda está em aberto</h2></div>
    <div class="ledger">
      ${data.pending.map(ledgerRow).join('\n      ')}
    </div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Evidências</span><h2>Refs clicáveis, mesmo HEAD</h2></div>
    <div class="evidence-grid">
      ${data.evidence.map(evidenceRow).join('\n      ')}
    </div>
  </section>

  <footer class="verdict">
    <div class="sign">
      <span>HEAD ${escapeHtml((record.source.head_sha || 'UNKNOWN').slice(0, 12))}</span>
      <span>content_digest ${escapeHtml(record.content_digest.slice(0, 16))}…</span>
      <span>receipt_digest ${escapeHtml(record.receipt_digest.slice(0, 16))}…</span>
      <span>produtor: ${escapeHtml(record.producer.agent)} (${escapeHtml(record.producer.model)})</span>
    </div>
    <p class="disclaimer">Artefato mostrado ≠ ação autorizada. Visualização não concede permissão.</p>
  </footer>
</main>
</body>
</html>`;
}

export function renderSessionReportCss() {
  return `:root {
  --bg: #0a0f0d; --surface: #101a15; --surface-2: #16251e; --line: #294235;
  --text: #eef8f1; --muted: #9fb8aa; --faint: #5c7568; --primary: #34d399;
  --warn: #f2c14e; --crit: #f87171;
  --mono: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  --serif: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
}
@media (prefers-color-scheme: light) {
  :root { --bg: #f4faf6; --surface: #ffffff; --surface-2: #eef7f1; --line: #d6ece1;
    --text: #0a1f14; --muted: #4c5f56; --faint: #7f9488; --primary: #059669; --warn: #a8710f; --crit: #b3413f; }
}
:root[data-theme="dark"] { --bg: #0a0f0d; --surface: #101a15; --surface-2: #16251e; --line: #294235;
  --text: #eef8f1; --muted: #9fb8aa; --faint: #5c7568; --primary: #34d399; --warn: #f2c14e; --crit: #f87171; }
:root[data-theme="light"] { --bg: #f4faf6; --surface: #ffffff; --surface-2: #eef7f1; --line: #d6ece1;
  --text: #0a1f14; --muted: #4c5f56; --faint: #7f9488; --primary: #059669; --warn: #a8710f; --crit: #b3413f; }

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--serif); line-height: 1.55; }
.rail { height: 4px; background: linear-gradient(90deg, var(--faint), var(--primary) 40%, var(--primary) 60%, var(--faint)); }
.page { max-width: 920px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
.masthead { border-bottom: 1px solid var(--line); padding-bottom: 1.5rem; margin-bottom: 2rem; }
.eyebrow { font-family: var(--mono); font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--primary); }
h1 { font-family: var(--mono); font-size: clamp(1.4rem, 4vw, 2rem); margin: .5rem 0; text-wrap: balance; }
.masthead p { color: var(--muted); max-width: 62ch; margin: 0; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1px; background: var(--line);
  border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 2.5rem; }
.chip { background: var(--surface); padding: 1rem; }
.chip-n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 1.4rem; font-weight: 600; color: var(--primary); }
.chip-l { font-size: .72rem; color: var(--muted); }
.block { margin-bottom: 2.5rem; }
.block-head { display: flex; gap: .7rem; align-items: baseline; border-left: 3px solid var(--primary); padding-left: .8rem; margin-bottom: 1rem; }
.block-head .tag { font-family: var(--mono); font-size: .68rem; text-transform: uppercase; letter-spacing: .1em; color: var(--faint); }
.block-head h2 { font-family: var(--mono); font-size: 1.05rem; margin: 0; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 1.2rem 1.4rem; }
.card p { color: var(--muted); margin: 0 0 .6rem; }
.card p:last-child { margin-bottom: 0; }
.timeline { border: 1px solid var(--line); border-radius: 6px; background: var(--surface); overflow-x: auto; }
.tl-row { display: grid; grid-template-columns: 80px 16px 1fr auto; align-items: center; gap: .8rem; padding: .6rem 1rem; min-width: 420px; }
.tl-row + .tl-row { border-top: 1px solid var(--line); }
.tl-time { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: .74rem; color: var(--faint); }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; justify-self: center; }
.tl-msg { font-size: .9rem; }
.sha { font-family: var(--mono); font-size: .72rem; color: var(--faint); }
.tl-status { font-family: var(--mono); font-size: .64rem; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.evolution { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: .8rem; align-items: start; }
.ev-col { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 1rem; }
.ev-h { font-family: var(--mono); font-size: .7rem; text-transform: uppercase; color: var(--primary); margin-bottom: .4rem; }
.ev-col p { margin: 0; color: var(--muted); font-size: .88rem; }
.ev-arrow { color: var(--faint); align-self: center; font-size: 1.2rem; }
.ledger { display: flex; flex-direction: column; gap: .5rem; }
.ledger-row { display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center;
  background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: .75rem 1rem; }
.pill { font-family: var(--mono); font-size: .64rem; text-transform: uppercase; padding: .2em .55em; border-radius: 20px; white-space: nowrap; }
.pill.human { color: var(--warn); background: rgba(242,193,78,.12); }
.pill.agent { color: var(--primary); background: rgba(52,211,153,.12); }
.pill.none { color: var(--faint); background: var(--surface-2); }
.ledger-row .owner { font-family: var(--mono); font-size: .72rem; color: var(--faint); text-align: right; }
.evidence-grid { display: grid; gap: .5rem; }
.evidence { display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center; text-decoration: none;
  background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: .65rem 1rem; color: var(--text); }
.evidence:hover { border-color: var(--primary); }
.ev-type { font-family: var(--mono); font-size: .66rem; text-transform: uppercase; color: var(--primary); }
.ev-ref { font-family: var(--mono); font-size: .8rem; color: var(--muted); }
.ev-result { font-size: .78rem; color: var(--faint); text-align: right; }
.verdict { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px dashed var(--line); }
.sign { font-family: var(--mono); font-size: .72rem; color: var(--faint); display: flex; flex-wrap: wrap; gap: .5rem 1rem; }
.disclaimer { font-size: .82rem; color: var(--muted); margin-top: .8rem; }
@media (max-width: 520px) { .evolution { grid-template-columns: 1fr; } .ev-arrow { display: none; } }
`;
}
