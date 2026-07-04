## Conselho debateu — resumo do que rola somar

Chamei o Gemini como voto de peso. Convergimos que junto do efeito das partículas dá pra empilhar 5 melhorias baratas e de alto impacto visual, tudo no mesmo mexido, sem tocar em backend. Todas rodam em cima do force-graph (mesma lib do painel de status), então é uma migração só.

## O pacote proposto (grafo.centralldark.com)

**1. 🕸️ Partículas fluindo nas arestas** *(o pedido original)*
Bolinhas verdes andando de nó pra nó, mais rápidas/densas nas conexões de maior peso — igual ao painel de status.

**2. 🎨 Cor por status/categoria**
Nó verde = OK, amarelo = alerta, vermelho = fora, azul = neutro. Bate o olho e entende a saúde na hora. (Hoje é tudo rosa/azul aleatório.)

**3. 💥 Pulso vivo em nó crítico**
Anel concêntrico pulsando em quem tá com erro. O olho vai direto pro problema.

**4. 🔦 Destaque no hover**
Passa o mouse num nó → o resto do grafo desbota, só os vizinhos diretos e as arestas conectadas ficam acesas. Corta o ruído da bola-de-fios.

**5. 🔍 Busca com zoom automático**
Caixinha de busca no topo. Digita o nome do módulo → câmera voa até ele com transição suave e destaca.

**6. 🎚️ Filtro rápido**
Botõezinhos: "só com erro", "esconder categoria X", "só edge functions", etc. Limpa o grafo dinamicamente.

**Fora do pacote (fica pra depois):** minimapa (custo médio, não crítico agora).

## Arquivos que mudam

- `apps/modulos/graph-panel/public/index.html` — trocar CDN vis-network → force-graph, adicionar barra de busca + filtros.
- `apps/modulos/graph-panel/public/graph.js` — rewrite do renderer (58 → ~250 linhas) com force-graph + as 6 features.
- `apps/modulos/graph-panel/public/style.css` — estilos da barra de busca/filtros e da legenda de cores.

**Não mexo em:** `server.js`, `data/`, `scripts/`, `vault.html`, backend, PM2. Só camada visual do browser.

## ⚠️ Precisa autorização

`apps/modulos/graph-panel/` tá 🔒 **protegido** no CLAUDE.md. Manda **"PERMITO PIVETE"** e escolhe:

- **A)** Pacote completo (as 6 melhorias) — bomba visual, ~1 mexido só.
- **B)** Só as partículas (item 1) — mínimo, cirúrgico.
- **C)** Partículas + cor por status + hover destaque (1, 2, 4) — meio-termo, dá salto grande sem inflar.

Recomendo o **C** — 80% do impacto visual com 40% do trabalho.