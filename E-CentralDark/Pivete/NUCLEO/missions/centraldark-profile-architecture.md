# MISSAO - centraldark-profile-architecture.html
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\centraldark-profile-architecture.html
**SHA:** 45ab73a213c11051
**Timestamp:** 2026-08-26T19:39:15.137714
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .header-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
- gap: 1rem;
- .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }

### Ouro Bruto (primeiros 5000 chars)
```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CentralDark Profile Architecture</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', monospace;
      background: #020617;
      min-height: 100vh;
      padding: 2rem;
      color: white;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .header-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .pulse-dot { width: 12px; height: 12px; background: #fb7185; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.025em; }
    .subtitle { color: #94a3b8; font-size: 0.875rem; margin-left: 1.75rem; }
    .diagram-container {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 1rem;
      border: 1px solid #1e293b;
      padding: 1.5rem;
      overflow-x: auto;
    }
    svg { width: 100%; min-width: 950px; display: block; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .card {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 0.75rem;
      border: 1px solid #1e293b;
      padding: 1.25rem;
    }
    .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .card-dot { width: 8px; height: 8px; border-radius: 50%; }
    .card-dot.rose { background: #fb7185; }
    .card-dot.cyan { background: #22d3ee; }
    .card-dot.emerald { background: #34d399; }
    .card-dot.amber { background: #fbbf24; }
    .card-dot.violet { background: #a78bfa; }
    .card h3 { font-size: 0.875rem; font-weight: 600; }
    .card ul { list-style: none; color: #94a3b8; font-size: 0.75rem; }
    .card li { margin-bottom: 0.375rem; }
    .footer { text-align: center; margin-top: 1.5rem; color: #475569; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-row">
        <div class="pulse-dot"></div>
        <h1>CentralDark — Profile Architecture</h1>
      </div>
      <p class="subtitle">SEGREDO/CHEFE → SOL (coordenadora) → PIVETE/HERMES (executor) → Tools/Runtime | SOUL Canônica única</p>
    </div>

    <div class="diagram-container">
      <svg viewBox="0 0 1000 580">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          <marker id="arrowhead-bold" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill="#fb7185" />
          </marker>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>
          </pattern>
        </defs>

        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- ================================================================
             CANONICAL SOUL (top - source of truth)
             ================================================================= -->
        <rect x="280" y="20" width="440" height="70" rx="8" fill="rgba(76, 29, 149, 0.25)" stroke="#a78bfa" stroke-width="2"/>
        <text x="500" y="50" fill="#a78bfa" font-size="13" font-weight="700" text-anchor="middle">SOUL CANÔNICA</text>
        <text x="500" y="68" fill="#94a3b8" font-size="9" text-anchor="middle">docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md</text>
        <text x="500" y="82" fill="#64748b" font-size="7.5" text-anchor="middle">ServerVpss/CentralDark@main  •  ONE_SYSTEM_ONLY=true  •  SNAPSHOT_SHA_IS_NOT_AUTHORITY=true</text>

        <!-- ================================================================
             SEGREDO/CHEFE (human authority)
             ================================================================= -->
        <rect x="380" y="110" width="240" height="80" rx="10" fill="rgba(136, 19, 55, 0.35)" stroke="#fb7185" stroke-width="2"/>
        <text x="500" y="138" fill="#fb7185" font-size="14" font-weight="700" text-anchor="middle">SEGREDO / CHEFE</text>
        <text x="500" y="156" fill="#94a3b8" font-size="9" text-anchor="middle">humano  •  dono da Casa  •  autor da intenção</text>
        <text x="500" y="170" fill="#94a3b8" font-size="9" text-anchor="middle">autoridade final  •  piloto  •  refinador  •  juiz</text>

        <!-- Arrow: CHEFE → SOL -->
        <line x1="500" y1="190" x2="500" y2="210" stroke="#fb7185" stroke-width="2.5" marker-end="u
```