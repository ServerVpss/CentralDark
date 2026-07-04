## Modo arsenal — desamontoar o grafo do status + FPS 120

Vou mexer no `apps/modulos/status/` (🔒 protegido — precisa "PERMITO PIVETE"). O gerador do Hermes fica intocado; só o render melhora.

## Ajustes no `status/app.js` (bloco force-graph, linhas ~800–905)

**Física — espalhar os nós:**
- `charge` de `-140` → **`-420`** (repulsão 3x mais forte).
- Força `link` com `.distance(80).strength(0.35)` — distância mínima garantida entre conectados.
- `collide` novo: `d3.forceCollide(r => (r.type === 'orquestrador' ? 22 : 14))` — impede sobreposição visual.
- `center` com força suave `0.05` pra não puxar tudo pro meio.
- `d3AlphaDecay 0.03 → 0.04` e `d3VelocityDecay 0.35 → 0.45` — estabiliza mais rápido, menos "gelatina".
- `cooldownTime` de 6s (para de calcular sozinho depois disso; hoje roda até 120 ticks sem timeout).

**FPS 120 (desafogar o loop de render):**
- `enablePointerInteraction(true)` mantido, mas `warmupTicks(80)` pra pré-calcular offscreen — o primeiro frame já entra parado.
- `nodeCanvasObjectMode` só desenha label quando `globalScale > 0.6` (some quando tá bem afastado — menos texto = mais FPS).
- Cache do `Math.max` do raio no `node.__r` na primeira renderização (evita recalcular todo frame).
- Trocar `setInterval` de refresh de dados (se estiver rodando junto) por `visibilitychange` — pausa quando a aba tá em background.
- Adicionar `.autoPauseRedraw(true)` — força-graph deixa de redesenhar quando nada muda; economia gigante depois que estabiliza.

**Update incremental sem recriar (já existe, vou reforçar):**
- Quando `__fg.graphData(gdata)` é chamado com dados novos, dar `reheat` bem leve (`__fg.d3ReheatSimulation()` só se o número de nós/arestas mudou de fato — hoje reheata sempre).

## Container responsivo (`index.html` linha 232 + `styles.css`)

- Trocar altura fixa `520px` por `clamp(360px, 60vh, 720px)` — encolhe em celular, cresce em monitor grande.
- No CSS adicionar `@media (max-width: 720px) { #grafoVivoContainer { height: clamp(320px, 55vh, 480px); } }`.
- Colocar `ResizeObserver` no container em vez de só `window resize` — reage a mudança de painel sem esperar redimensionar a janela.
- `touch-action: none` no canvas pra não conflitar com scroll no mobile.

## Sobre o outro (grafo.centralldark.com)

Confirmando: o código novo do `graph-panel` **já foi salvo aqui no repo**, mas quem serve o site é a **VPS via PM2**, não o preview do Lovable. Fluxo é: Lovable → GitHub (main) → webhook da VPS → `git pull` → PM2 recarrega. Se ainda tá aparecendo o mapa velho quando abre `grafo.centralldark.com`, ou o push pro GitHub ainda não saiu, ou o webhook não disparou. Depois de aprovar esse plano eu confiro no MCP se o commit tá no main e se a VPS puxou (com `github_list_commits` + `vps_git_status` + `elite_gateway_status`) e reinicio o PM2 do graph-panel se preciso.

## Confirma com "PERMITO PIVETE"

Ao aprovar, faço tudo em sequência:
1. Aplica os 3 blocos de ajuste no status.
2. Verifica se o graph-panel novo tá no ar na VPS; se não tiver, dispara pull + `pm2 reload`.
3. Reporta placar final ✅.