# OUTRO - optimization-report.html.template
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\report-templates\optimization-report.html.template
**SHA:** 2e4eadbc1513e452
**Timestamp:** 2026-08-26T18:42:41.881584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 28px;
- .grid { display: grid; gap: 14px; }

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>USD Performance Tuning Report - {{ asset_name }}</title>
  <style>
    :root {
      --bg: #0d1016;
      --panel: #171c22;
      --panel-2: #222934;
      --ink: #f4f7fb;
      --muted: #b2becd;
      --line: #34404d;
      --good: #76b900;
      --warn: #f6c85f;
      --bad: #ff7f7f;
      --unknown: #8793a1;
      --accent: #7dd3fc;
      --score-deg: {{ score_degrees }}deg;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg, #0d1016 0%, #111820 42%, #0d1016 100%);
      color: var(--ink);
      font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 28px 48px; }
    header {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 28px;
      align-items: center;
      padding: 28px;
      border: 1px solid var(--line);
      background: linear-gradient(135deg, #171c22 0%, #192536 48%, #16261f 100%);
      border-radius: 10px;
      box-shadow: 0 18px 55px rgba(0, 0, 0, .28);
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 { margin-bottom: 8px; font-size: 30px; line-height: 1.12; letter-spacing: 0; }
    h2 { margin: 34px 0 14px; font-size: 18px; letter-spacing: 0; }
    h3 { margin-bottom: 6px; font-size: 14px; letter-spacing: 0; color: var(--muted); }
    .subtle { color: var(--muted); }
    .report-kicker {
      margin-bottom: 10px;
      color: var(--good);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .reasoning {
      max-width: 940px;
      color: var(--muted);
      font-size: 15px;
    }
    .reasoning p { margin-bottom: 12px; }
    .score-ring {
      width: 184px;
      height: 184px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at center, #111820 0 58%, transparent 59%),
        conic-gradient(var(--good) 0 var(--score-deg), #303846 var(--score-deg) 360deg);
      border: 1px solid var(--line);
    }
    .score-number { font-size: 42px; font-weight: 760; line-height: 1; }
    .score-caption { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
    .badge {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #263040;
      color: var(--ink);
      font-size: 12px;
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .badge.good { color: #07140d; background: var(--good); border-color: var(--good); }
    .badge.warn { color: #211600; background: var(--warn); border-color: var(--warn); }
    .badge.bad { color: #230707; background: var(--bad); border-color: var(--bad); }
    .grid { display: grid; gap: 14px; }
    .impact-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 16px;
      min-width: 0;
      box-shadow: 0 10px 26px rgba(0, 0, 0, .18);
    }
    .metric-score { font-size: 26px; font-weight: 740; }
    .bar {
      height: 8px;
      margin-top: 10px;
      overflow: hidden;
      border-radius: 999px;
      background: #323946;
    }
    .bar > span {
      display: block;
      height: 100%;
      width: var(--bar-width);
      background: var(--bar-color);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    th { color: var(--muted); background: var(--panel-2); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    tr:last-child td { border-bottom: 0; }
    .change.improved { color: var(--good); }
    .change.neutral { color: var(--muted); }
    .change.regressed { color: var(--bad); }
    .note {
      border-left: 3px solid var(--warn);
      background: #2b2417;
      padding: 12px 14px;
      color: #f7e7ba;
      border-radius: 6px;
    }
    code { color: var(--accent); }
    @media (max-width: 860px) {
      main { padding: 20px 16px 36px; }
      header { grid-template-columns: 1fr; }
      .impact-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 560px) {
      .impact-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="score-ring" aria-
```