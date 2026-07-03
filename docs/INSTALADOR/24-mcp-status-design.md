# Design da página `/status` do MCP CentralDark

> Arquivo: `CentralDark/apps/mcp/src/status.ts` (bloco `<style>` ~linhas 611–685)
> URL pública: https://mcp.centralldark.com/status
> Última revisão: 2026-06-07

## Regras visuais (INQUEBRÁVEIS)

1. **Cards e linhas NÃO piscam.** Fundo, borda e texto ficam estáticos.
2. **Só os pontinhos (`dots`) piscam.** Eles vivem em `::before` dos elementos
   que carregam nível (`tr.row-{ok,warn,bad}`, `ul.recs li.{ok,warn,bad}`,
   `.pill.{ok,warn,bad}`, `.kv.{ok,warn,bad}`).
3. **Ritmo de pulse por severidade:**
   - 🔴 `dotBad` — 0.9s, escala 1→1.25, halo vermelho de 16px. Forte.
   - 🟡 `dotWarn` — 1.6s, só varia opacidade + glow leve.
   - 🟢 `dotOk` — 2.4s, opacidade + glow leve.
4. **Respeita `prefers-reduced-motion`**: animação dos dots desliga.
5. **Tipografia grande e legível**: body 17px, h1 34px, KPI 30px, tabela 16px.
   Cards com `padding 28px 30px`, `border-radius 18px`, largura máx 1180px.

## Por que `::before` e não `<span class="dot">`?

Evita mexer no HTML renderizado (`renderHTML`, `ICON`, `connectorsRows`, etc.).
O ponto aparece automaticamente em qualquer linha que receber a classe de nível,
sem precisar editar geração de string em vários lugares.

## Como adicionar um novo elemento com pulse

Basta dar ao elemento uma das classes `ok` / `warn` / `bad` e garantir que ele
case com algum dos seletores listados acima. Se for um elemento novo, estender o
seletor do bloco `/* DOT — único elemento que pisca */` no CSS.

## Como NÃO fazer (anti-padrão já corrigido)

- ❌ Aplicar `animation: pulseBad …` no `<tr>`, `<li>` ou `<div class="card">`.
  Isso faz o card inteiro piscar e cansa a vista. Foi removido em 2026-06-07.
- ❌ Usar `filter: brightness()` ou `box-shadow` animado no container.
  Só no dot (`::before`).

## Build + restart na VPS

```bash
cd /root/CentralDark/apps/mcp && npm run build && pm2 restart MCP-CentralDark --update-env
```

## Validação (cadeia completa — obrigatória)

```bash
curl -s https://mcp.centralldark.com/status | grep -E 'dotBad|dotWarn|dotOk' | head -3
```

Tem que voltar as 3 animações. Se não voltar, Caddy ou PM2 estão servindo build
antigo (ver `mem://validacao-cadeia-completa`).
