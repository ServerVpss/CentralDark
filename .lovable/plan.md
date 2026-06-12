## Problema

Na splash atual (`src/components/transitions/PageSplash.tsx`), o SVG usa `viewBox="0 0 24 24"` com `preserveAspectRatio="xMidYMid slice"` cobrindo a tela inteira. Resultado: o `<path>` do raio (que ocupa quase todo o viewBox 24×24) renderiza **gigante**, preenchendo a tela toda — é o que aparece no print depois do "Login realizado com sucesso".

A intenção era: fundo verde cobrindo a tela + logo pequeno (tamanho de ícone) no centro, com buraco no formato do logo que "explode" pra revelar o app. Tá errado porque o logo está na mesma escala do fundo.

## Solução — refazer do zero

Separar as duas camadas em escalas independentes:

1. **Camada de fundo (`.splash-bg`)**: um `<div>` puro com `background: hsl(var(--primary))`, cobre 100% da tela. Sem SVG, sem viewBox — não tem como esticar errado em telas grandes/pequenas/notch.

2. **Camada do logo + buraco**: um SVG **pequeno e centralizado** (ex.: 96px × 96px com `viewBox="0 0 24 24"`), posicionado absoluto no centro. Dentro dele:
   - Logo branco visível (pulsa, encolhe levemente).
   - No final, esse SVG **cresce via `transform: scale(...)`** até cobrir a tela e o logo vira um buraco (mask) que explode revelando o app.

3. **Reveal**: em vez de escalar a máscara dentro de um SVG que já cobre tudo, escalo o **container** do logo via CSS transform. Uso `clip-path` ou um `<div>` overlay com `mask-image: url(data:svg)` do raio — mais simples, funciona em qualquer tamanho de tela porque o tamanho inicial é fixo em pixels.

4. **Implementação concreta** (substitui o arquivo inteiro):
   - `.splash-bg` div verde fullscreen.
   - `.splash-logo` div absoluto 96px centralizado, com `mask-image` SVG do raio recortando o fundo branco/transparente — assim a área do logo "vaza" pro verde de baixo, criando o efeito de logo branco em fundo verde.
   - Animação: logo pulsa (scale 0.86 → 1 → 1 → encolhe levemente) por ~1.2s.
   - Reveal final: `.splash-bg` ganha um `clip-path` que parte do logo e explode (ou um overlay com `mask` que cresce), 400ms, revelando o app.
   - Mantém `app-zoom` (escala 1.06 → 1 do `body`) e `prefers-reduced-motion`.

5. **Bibliotecas / refs preservadas**: mantém o `playSplash()`, `invalidateTipsCache()`, `SESSION_KEY`, evento `lovable:splash:play` — assim quem chama hoje (login, etc.) continua funcionando sem mudança.

## Arquivos

- `src/components/transitions/PageSplash.tsx` — reescrita completa.

## Validação

- Abrir `/auth`, logar, conferir no preview (mobile 430×777 e desktop) que o logo aparece em tamanho de ícone centralizado, anima, e o app revela por trás sem o logo ocupar tela toda.
