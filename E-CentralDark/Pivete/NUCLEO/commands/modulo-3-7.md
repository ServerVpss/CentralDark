# COMANDO - modulo-3-7.html
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_manual-oculto-ia-curso-main\manual-oculto-ia-curso-main\curso\trilha3\modulo-3-7.html
**SHA:** e2ff253bd3644140
**Timestamp:** 2026-08-26T20:05:42.168193
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A <strong class="text-purple-400">síntese de todo o curso</strong> num único prompt: a <em>identidade</em> que ancora (quem/onde/quando +

### Padroes
- <span class="text-purple-400">Regra:</span> recuse guias de uso de drogas, mas dê informação que salva vidas.<br>

### Ouro Bruto (primeiros 5000 chars)
```
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3.7 Projeto final: seu system prompt versionado | O Manual Oculto da IA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '#FACC15',
            dark: { 900: '#111827', 800: '#1f2937', 700: '#374151', 600: '#4b5563' }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .topic-explanation { display: none; }
    .topic-explanation.active { display: block; }
    .code-box { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace; }

    /* Dark mode - bordas e linhas divisorias mais suaves */
    .dark .border-dark-600 { border-color: #374151; }
    .dark .divide-dark-600 > :not([hidden]) ~ :not([hidden]) { border-color: #374151; }

    /* SVG adaptado ao tema claro (so atinge os diagramas) */
    html:not(.dark) svg[role="img"] { filter: saturate(0.82) brightness(0.96); }

    /* Pulso para os blocos do SVG */
    @keyframes wf-pulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
    @media (prefers-reduced-motion: no-preference) {
      .wf-a { animation: wf-pulse 2.6s ease-in-out infinite; }
      .wf-a:nth-child(2){animation-delay:.25s}
      .wf-a:nth-child(3){animation-delay:.5s}
      .wf-a:nth-child(4){animation-delay:.75s}
    }

    /* ===== LIGHT MODE OVERRIDES — Parte 1: Base ===== */
    html:not(.dark) body { background-color: #f8fafc; }
    html:not(.dark) .bg-dark-900 { background-color: #ffffff; }
    html:not(.dark) .bg-dark-800 { background-color: #f9fafb; }
    html:not(.dark) .bg-dark-700 { background-color: #f3f4f6; }
    html:not(.dark) .bg-dark-600 { background-color: #e5e7eb; }
    html:not(.dark) .text-neutral-100 { color: #111827; }
    html:not(.dark) .text-neutral-200 { color: #1f2937; }
    html:not(.dark) .text-neutral-300 { color: #4b5563; }
    html:not(.dark) .text-neutral-400 { color: #6b7280; }
    html:not(.dark) .text-neutral-500 { color: #9ca3af; }
    html:not(.dark) .border-dark-600 { border-color: #d1d5db; }
    html:not(.dark) .border-dark-700 { border-color: #e5e7eb; }

    /* ===== Parte 2: Cores de acento (trilha Purple — T3) ===== */
    html:not(.dark) .text-purple-400 { color: #7c3aed; }
    html:not(.dark) .text-purple-300 { color: #6d28d9; }
    html:not(.dark) .text-purple-200 { color: #5b21b6; }
    html:not(.dark) .bg-purple-500\/20 { background-color: rgba(124, 58, 237, 0.12); }
    html:not(.dark) .bg-purple-500\/10 { background-color: rgba(124, 58, 237, 0.08); }
    html:not(.dark) .bg-purple-900\/30 { background-color: rgba(124, 58, 237, 0.08); }
    html:not(.dark) .bg-purple-900\/20 { background-color: rgba(124, 58, 237, 0.06); }
    html:not(.dark) .border-purple-500\/30 { border-color: rgba(124, 58, 237, 0.25); }
    html:not(.dark) .border-purple-500\/20 { border-color: rgba(124, 58, 237, 0.18); }
    html:not(.dark) .hover\:bg-purple-500\/30:hover { background-color: rgba(124, 58, 237, 0.18); }
    html:not(.dark) .hover\:border-purple-500\/30:hover { border-color: rgba(124, 58, 237, 0.25); }

    /* sky (ciano secundario) */
    html:not(.dark) .bg-sky-500\/10 { background-color: rgba(14, 165, 233, 0.08); }
    html:not(.dark) .bg-sky-900\/30 { background-color: rgba(14, 165, 233, 0.08); }
    html:not(.dark) .border-sky-500\/30 { border-color: rgba(14, 165, 233, 0.25); }
    html:not(.dark) .text-sky-300 { color: #0284c7; }

    /* ===== Parte 3: Remove gradientes + cores especiais ===== */
    html:not(.dark) [class*="bg-gradient-to"] { background-image: none !important; }
    html:not(.dark) .text-primary { color: #a16207; }
    html:not(.dark) .bg-primary\/10 { background-color: rgba(161, 98, 7, 0.08); }
    html:not(.dark) .border-primary\/40 { border-color: rgba(161, 98, 7, 0.25); }
    html:not(.dark) .text-sky-400 { color: #0369a1; }
    html:not(.dark) .text-yellow-400 { color: #a16207; }
    html:not(.dark) .text-red-400 { color: #b91c1c; }
    html:not(.dark) .bg-red-900\/20 { background-color: rgba(185, 28, 28, 0.06); }
    html:not(.dark) .border-red-500\/30 { border-color: rgba(185, 28, 28, 0.22); }
    html:not(.dark) .border-red-500\/20 { border-color: rgba(185, 28, 28, 0.18); }
    html:not(.dark) .hover\:text-sky-300:hover { color: #0284c7; }
    html:not(.dark) .hover\:text-yellow-300:hover { color: #854d0e; }
    html:not(.dark) .hover\:text-emerald-400:hover { color: #059669; }
    html:not(.dark) .hover\:text-blue-400:hover { color: #2563eb; }

    /* ===== Parte 4: Navbar ===== */
    html:not(.dark) .bg-dark-900\/95 { background-color: rgba(255, 255, 255, 0.95); }
  </style>
</head>
<body class="bg-dark-900 text-neutral-
```