# DECISAO - capsula.html
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\capsula.html
**SHA:** fd59024befdf8a86
**Timestamp:** 2026-08-28T02:56:40.319158
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = capsule.current_run || {};

### Gaps
- .capsule-nav { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
- .capsule-state { display:flex; flex-wrap:wrap; gap:9px; margin-top:16px; }
- .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:12px; margin-top:16px; }
- .capsule-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:14px; margin-top:14px; }
- .kv { display:grid; grid-template-columns:minmax(150px,.55fr) 1fr; gap:8px 14px; font-size:13px; }
- .guard-list, .score-list { display:grid; gap:9px; padding:0; margin:0; list-style:none; }
- .guard-list li, .score-list li { border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 12px; display:flex; gap:8px; align-items:flex-start; }
- .score-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }

### Ouro Bruto (primeiros 5000 chars)
```
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d1117" />
  <title>CentralDark · Cápsula Observável</title>
  <link rel="stylesheet" href="./styles.css?v=20260806-capsula" />
  <style>
    :root { color-scheme: dark; }
    body { min-height: 100vh; }
    .capsule-shell { width: min(1280px, calc(100% - 28px)); margin: 0 auto; padding: 26px 0 48px; }
    .capsule-nav { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
    .capsule-nav a { color:inherit; text-decoration:none; border:1px solid rgba(255,255,255,.14); padding:9px 12px; border-radius:10px; }
    .capsule-hero { border:1px solid rgba(255,255,255,.14); border-radius:18px; padding:22px; background:rgba(9,13,18,.88); }
    .capsule-hero h1 { margin:6px 0 8px; font-size:clamp(28px,5vw,54px); }
    .capsule-hero p { max-width:920px; color:#aab2bf; line-height:1.55; }
    .capsule-state { display:flex; flex-wrap:wrap; gap:9px; margin-top:16px; }
    .pill { border:1px solid rgba(255,255,255,.15); border-radius:999px; padding:7px 10px; font-size:12px; font-weight:800; }
    .pill.ok { border-color:rgba(46,160,67,.55); color:#79d68c; }
    .pill.bad { border-color:rgba(248,81,73,.55); color:#ff8b84; }
    .pill.warn { border-color:rgba(210,153,34,.55); color:#e9c46a; }
    .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:12px; margin-top:16px; }
    .metric { border:1px solid rgba(255,255,255,.12); background:rgba(22,27,34,.82); border-radius:14px; padding:16px; }
    .metric small { color:#8b949e; text-transform:uppercase; letter-spacing:.06em; }
    .metric strong { display:block; font-size:28px; margin:8px 0 4px; }
    .metric span { color:#9da7b3; font-size:13px; }
    .capsule-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:14px; margin-top:14px; }
    .capsule-card { border:1px solid rgba(255,255,255,.12); background:rgba(13,17,23,.9); border-radius:16px; padding:18px; }
    .capsule-card h2 { margin:0 0 14px; font-size:18px; }
    .kv { display:grid; grid-template-columns:minmax(150px,.55fr) 1fr; gap:8px 14px; font-size:13px; }
    .kv dt { color:#8b949e; }
    .kv dd { margin:0; overflow-wrap:anywhere; }
    .guard-list, .score-list { display:grid; gap:9px; padding:0; margin:0; list-style:none; }
    .guard-list li, .score-list li { border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 12px; display:flex; gap:8px; align-items:flex-start; }
    .score-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
    .score-rejected { margin-top:10px; color:#ff8b84; font-size:12px; overflow-wrap:anywhere; }
    .problem { color:#ff8b84; white-space:pre-wrap; overflow-wrap:anywhere; }
    .empty { color:#8b949e; }
    .evidence-rule { margin-top:14px; border-left:3px solid #d29922; padding:10px 12px; background:rgba(210,153,34,.08); color:#e5c07b; }
    .footer-line { margin-top:16px; color:#6e7681; font-size:12px; text-align:center; }
    @media (max-width: 820px) { .capsule-grid { grid-template-columns:1fr; } .kv { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main class="capsule-shell">
    <nav class="capsule-nav">
      <a href="./index.html">← Mega Painel</a>
      <span id="refreshState" class="pill warn">sincronizando</span>
    </nav>

    <section class="capsule-hero">
      <p class="eyebrow">CentralDark · Hermes · MetaLupa</p>
      <h1>🧪 Cápsula Observável</h1>
      <p>
        A mutação é livre dentro do candidato. A balança fica fora do alcance dele.
        Cada ganho aparece com numerador, denominador, candidato e evidência. Sem prova,
        a tela mostra <b>SEM DENOMINADOR</b> ou <b>BLOCKED</b> — nunca um verde inventado.
      </p>
      <div class="capsule-state">
        <span id="capsuleStatus" class="pill warn">carregando</span>
        <span id="validationStatus" class="pill warn">validação</span>
        <span id="productionStatus" class="pill warn">produção intocada</span>
        <span id="eventCount" class="pill">0 eventos</span>
      </div>
      <div class="evidence-rule">SEM DADOS ≠ ZERO · SKIPPED ≠ PASS · HTTP 200 ≠ FUNCIONAMENTO · PAINEL VERDE ≠ PROVA</div>
    </section>

    <section class="metrics">
      <article class="metric"><small>Correção real</small><strong id="correctionRate">—</strong><span id="correctionDetail">sem dados</span></article>
      <article class="metric"><small>Reincidência</small><strong id="recurrenceRate">—</strong><span id="recurrenceDetail">sem dados</span></article>
      <article class="metric"><small>Generalização</small><strong id="generalizationRate">—</strong><span id="generalizationDetail">sem dados</span></article>
      <article class="metric"><small>Retenção</small><strong id="retentionRate">—</strong><span id="retentionDetail">sem dados</span></article>
      <article class="metric"><small>XP válido</small><st
```