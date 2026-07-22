## Objetivo

Tirar a "sopa verde" do `/admin/cockpit` mantendo esmeralda só como acento (não como base). Trazer de volta o contraste multi-cor da referência (esmeralda + âmbar + roxo + ciano + rosa) sobre fundo neutro obsidiana.

## Diagnóstico rápido (Lupa)

Hoje TUDO no cockpit é derivado de emerald:
- Fundo `#052e2b → #041f1d` (verde escuro em vez de neutro).
- Scanline verde (`#10b98108`).
- Bordas/linhas `#10b981…` em toda a grid.
- Nav ativo, dots, marca, hora, "Pivete online", terminal, feed — todos em `--sc-em-hi`.
- Matrix rain em verde por cima disso.

Resultado: mesmo com panes coloridos, tudo puxa pro verde porque o pano de fundo e as bordas são verdes.

## O que muda (só CSS + tokens, sem mexer em lógica)

### 1. Fundo neutro obsidiana
`--sc-bg` e `--sc-bg2` deixam de ser verdes. Vira grafite/obsidiana:
- `--sc-bg: #0b0f14`
- `--sc-bg2: #12181f`
- `--sc-bg3: #0a0e13` (base dos panes, hoje `#061f1d`)
- Gradient do `.sc-root` passa a ser cinza-azulado escuro em vez de verde.

### 2. Bordas neutras
`--sc-line` sai de `#10b98133` (verde) para `#ffffff10` (cinza translúcido). Idem `--sc-line-2`.
Scanline: de verde pra `#ffffff05`.

### 3. Texto base neutro
`--sc-txt` sai de `#d1fae5` (verde-claro) para `#e5e7eb` (off-white).
`--sc-mut` de `#6ee7b799` (verde) para `#94a3b8` (cinza).

### 4. Esmeralda vira só acento
- Header brand, dot online, nav ativo, "sistema estável" ficam esmeralda (é a assinatura).
- Terminal deixa de ser todo verde: timestamp cinza, texto off-white, só o prompt/tag em esmeralda.
- Feed: `.sc-ev-txt.info` vira off-white (hoje é verde-claro).
- `.sc-ev-src` continua esmeralda.

### 5. Matrix rain mais discreto
Baixar opacidade de `0.18` pra `0.08` e trocar a cor do canvas pra um verde bem sutil, quase cinza.

### 6. Panes coloridos ganham "corpo" da cor
Hoje o header tem só uma borda superior colorida — o resto do pane é verde. Muda para:
- Header do pane com `background: linear-gradient(180deg, <cor>15, transparent)` (tinta suave da cor do pane).
- Título em negrito na cor do pane, mantido.
- Badge de custo mantém.

### 7. Nova quinta cor (rosa/magenta) pra variar
Adicionar `--pane-rose: #f472b6` disponível como classe `pane-rose` / `hblk-rose` (pra futuras abas: alertas, filas). Não obriga usar agora — deixa registrado no CSS.

### 8. Dots de status ficam mais neutros no idle
Idle já é cinza; ok fica esmeralda; warn âmbar; err rosa/vermelho — mantém.

## Arquivos tocados

- `src/paginas/admin-cockpit/sala-controle.css` — apenas tokens (`:root .sc-root { --sc-bg… }`) e algumas regras de cor de texto do terminal/feed/matrix. Nada de estrutura.

Não altero:
- `SalaControle.tsx`, `PainelOps.tsx`, `JarvisOrb.tsx`, `HermesMascote`, `MatrixRain` (só reduzo opacidade via CSS).
- Nenhum arquivo fora do cockpit.
- Nenhum arquivo de VPS/backend/rota.

## Como valido

1. Abro `/admin/cockpit` no preview em 911×855 (viewport atual).
2. Screenshot antes/depois.
3. Confirmo:
   - Fundo cinza-obsidiana, não mais verde-escuro.
   - Panes com 4 cores nítidas (esmeralda, âmbar, roxo, ciano) destacando cada um.
   - Header ainda "CentralDark" em esmeralda, mas blocos VOL/PPM/CODE/UPTIME/SHA mantêm suas cores próprias visíveis.
   - Matrix rain quase imperceptível ao fundo.

## Fora do escopo desta rodada

- Plugar dados reais (Fase 3).
- Trocar layout, colunas ou componentes.
- Renomear/mover skill `lupa-bayesiana`.
- Mexer em Hermes-Core, VPS ou Supabase.

Se aprovar, aplico o CSS, tiro os prints comparativos e te mostro.