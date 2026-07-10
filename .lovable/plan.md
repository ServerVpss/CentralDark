# Hero Cockpit Animado — Preview Isolado (sem plugar no app)

Só o front-end, numa pasta separada e numa rota escondida pra você olhar. **Não mexe** no `/`, no login, no HUB nem em nada existente.

## Onde vai ficar

Pasta nova, isolada:
```
src/preview/cockpit-hero/
├─ index.tsx              ← página completa do preview
├─ CockpitHero.tsx        ← orquestrador (piloto + grid)
├─ CockpitPane.tsx        ← pane reutilizável
├─ PilotoChat.tsx         ← chat com typewriter
├─ MatrixRain.tsx         ← canvas de fundo
├─ cockpit.css            ← estilos e keyframes locais (escopo próprio)
└─ dados.ts               ← linhas de log + falas do piloto
```

Rota escondida (só pra você ver): `/preview/cockpit`
- Adicionada como rota nova no `App.tsx`, **sem tocar** em `/`, `/auth`, `/hub`, `/telepainel`.
- Não aparece em menu nenhum. É só digitar a URL.
- Se depois você gostar, a gente promove pra landing oficial. Se não gostar, deleta a pasta e some.

## Visual — Híbrido Esmeralda + neon (padrão oficial)
- Base esmeralda `#052e2b` → `#0a3d38`, texto off-white, moldura `#10b981`/`#34d399`
- 6 panes com acento neon próprio (Hermes esmeralda · Arsenal âmbar · Gateway ciano · HUB violeta · TelePainel rosa · Enxame vermelho)
- Cores dentro do `cockpit.css` local com CSS variables próprias (não polui os tokens globais do app)

## Layout
```
┌────────────────────────────────────────────────────────────┐
│  logo CentralDark  ·  (preview isolado)                     │
├──────────────────┬─────────────────────────────────────────┤
│  PILOTO          │  ┌─────────┬─────────┬─────────┐        │
│  chat rolando    │  │ Hermes  │ Arsenal │ Gateway │        │
│  headline        │  ├─────────┼─────────┼─────────┤        │
│  subheadline     │  │  HUB    │TelePainl│ Enxame  │        │
│  (sem CTA real)  │  └─────────┴─────────┴─────────┘        │
└──────────────────┴─────────────────────────────────────────┘
   fundo: matrix rain em canvas, opacidade baixa
```
Mobile: piloto empilha em cima, grade vira 2x3 embaixo.

## Animações (CSS + canvas, sem libs novas)
1. Matrix rain de caracteres verdes caindo no fundo
2. 6 panes com logs temáticos rolando (jitter 400-900ms), fade nas bordas
3. Status pill por pane (bolinha pulsando + texto ok/processando/aguardando)
4. Piloto: mensagens caem uma a uma com typewriter e auto-scroll
5. Glow pulse sutil na palavra "CentralDark" da headline
6. Respeita `prefers-reduced-motion`

## Conteúdo (temático CentralDark)
Panes:
- **Hermes**: `[hermes] loop 4287 · 0 divergências` · `enxame paralelo (10 agentes)`
- **Arsenal**: `/debate rodada 2 · consenso 87%` · `veredito consolidado`
- **Gateway**: `POST /v1/messages 200 · 342ms` · `catálogo · 161 modelos`
- **HUB**: `health 200 · 140 modelos online` · `correlation_id abc123`
- **TelePainel**: `webhook 200 · @SEGREDOPUXADASBOT` · `RLS ok`
- **Enxame**: `[ômega] fase 2/4 · 20 sub-agentes` · `veredito → opus`

Piloto chat:
```
Piloto: bora auditar o gateway
Hermes: subindo enxame de 10 agentes ✓
Arsenal: consenso 92% em 2 rodadas
Gateway: 140 modelos respondendo
Piloto: veredito?
Hermes: 🟢 tudo estável, pivete
```

## O que muda no app existente
Só uma linha: adicionar uma `<Route path="/preview/cockpit" element={<CockpitPreview />} />` no `App.tsx`. Nada mais é tocado.

## Fora de escopo
- Não mexe em `/`, `/auth`, `/hub`, `/telepainel`
- Não muda tokens globais do `index.css` nem do `tailwind.config.ts`
- Sem backend, sem edge, sem migration
- Sem libs novas

## Como você vai ver
Depois de pronto: abrir a URL `/preview/cockpit` no preview do Lovable. Se rolar, tá lindo. Se não, você fala e a gente ajusta ou apaga a pasta inteira.
