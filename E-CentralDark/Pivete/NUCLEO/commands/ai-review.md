# COMANDO - ai-review.html
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\ai-review.html
**SHA:** fa783cae46aa2526
**Timestamp:** 2026-08-28T02:56:40.085107
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 14px;
- gap: 10px;
- gap: 10px;
- gap: 4px;
- gap: 8px;
- gap: 6px;
- .pc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
- gap: 6px;
- gap: 18px;
- gap: 6px;

### Ouro Bruto (primeiros 5000 chars)
```
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#29A664" />
  <title>PR Review — Multi-IA · CentralDark</title>
  <link rel="stylesheet" href="./styles.css" />
  <style>
    /* ── overrides específicos desta página ── */
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
    }

    .provider-card {
      background: hsl(var(--surface-2));
      border: 1px solid hsl(var(--line));
      border-radius: var(--radius-lg);
      padding: 18px;
      box-shadow: var(--shadow-3d-soft);
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    @media (hover: hover) {
      .provider-card:hover {
        transform: translateY(-2px);
        border-color: hsl(var(--primary) / 0.45);
      }
    }

    .provider-card.is-active {
      border-color: hsl(var(--primary) / 0.6);
      box-shadow:
        var(--shadow-3d-soft),
        0 0 0 1px hsl(var(--primary) / 0.25),
        inset 0 0 0 100px hsl(var(--primary) / 0.04);
    }

    .provider-card.is-active:hover {
      transform: none;
    }

    .pc-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .pc-emoji {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: hsl(var(--primary) / 0.12);
      font-size: 22px;
      box-shadow: var(--shadow-3d-soft);
      flex-shrink: 0;
    }

    .pc-emoji.inactive {
      background: hsl(var(--line) / 0.7);
      filter: grayscale(0.4);
    }

    .pc-title { font-size: 15px; font-weight: 700; color: hsl(var(--text)); }
    .pc-model { font-family: "Geist Mono", monospace; font-size: 11px; color: hsl(var(--muted-c)); margin-top: 2px; }
    .pc-desc  { font-size: 13px; color: hsl(var(--muted-c)); line-height: 1.55; flex: 1; }

    /* pill de custo */
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .pill.free   { background: hsl(var(--green)  / 0.12); color: hsl(var(--green));  border: 1px solid hsl(var(--green)  / 0.3); }
    .pill.paid   { background: hsl(var(--yellow) / 0.12); color: hsl(var(--yellow)); border: 1px solid hsl(var(--yellow) / 0.3); }
    .pill.local  { background: hsl(var(--purple) / 0.12); color: hsl(var(--purple)); border: 1px solid hsl(var(--purple) / 0.3); }
    .pill.active { background: hsl(var(--primary) / 0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.35); }

    /* bloco de instrução dentro do card */
    .pc-instruction {
      background: hsl(var(--bg-2));
      border: 1px solid hsl(var(--line));
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 12.5px;
      color: hsl(var(--muted-c));
      line-height: 1.55;
    }

    .pc-instruction a { color: hsl(var(--primary)); font-weight: 600; }

    .secret-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 6px;
      background: hsl(var(--surface));
      border: 1px solid hsl(var(--line));
      border-radius: 8px;
      padding: 7px 10px;
    }

    .secret-row code {
      font-family: "Geist Mono", monospace;
      font-size: 12px;
      color: hsl(var(--primary));
      font-weight: 600;
    }

    .copy-pill {
      background: hsl(var(--primary) / 0.10);
      border: 1px solid hsl(var(--primary) / 0.25);
      color: hsl(var(--primary));
      border-radius: 6px;
      padding: 3px 9px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .copy-pill:hover { background: hsl(var(--primary) / 0.18); }

    .pc-status-ok {
      background: hsl(var(--primary) / 0.08);
      border: 1px solid hsl(var(--primary) / 0.25);
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 12.5px;
      color: hsl(var(--primary));
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* botões de ação */
    .pc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }

    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
      line-height: 1;
    }
    .btn-cta:hover { opacity: 0.88; transform: translateY(-1px); text-decoration: none; }

    .btn-cta.primary {
      backgrou
```