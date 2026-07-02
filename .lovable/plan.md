## O que tá rolando

Aquela screenshot **é o nosso plugin sim** — `CentralDark Grafo Vivo` (você reconhece pelo campo "todos" no topo e pelo painel lateral direito). O que aparece "Nova aba" à esquerda é o Obsidian padrão, o nosso é o painelzinho da direita que tá com erro `Cannot read properties of undefined (reading 'filter')`.

**Por que tá quebrado**: o JSON que roda no `status.centralldark.com` mudou de formato depois que a gente montou o plugin. Hoje ele manda:

- Nó: `{ id, label, type, group }`
- Aresta: `{ from, to, label, weight }`

Mas o plugin espera:

- Nó: `{ id, label, category }`
- Aresta: `{ source, target, ativa }`

Resultado: filtro retorna zero, cor cai no cinza padrão, partícula não anima e ainda estoura aquele erro quando o filtro roda sem dados.

---

## Como confirmar que é o nosso plugin (visual)

- Nome oficial: **CentralDark Grafo Vivo** (Configurações → Community plugins).
- Ícone na barra lateral: 🍴 (git-fork).
- Comando na paleta (Ctrl+P): **"Abrir Grafo Vivo CentralDark"**.
- Se aparecer com esses nomes, é o nosso. O erro do print confirma.

---

## Plano de correção

**F8 — Grafo Vivo Obsidian: adaptador de schema + repaint**

1. **`src/view.ts` — normalizar o JSON na entrada**
   Adicionar função `normalizarDados(bruto)` que roda logo depois do `fetch`:
   - `type` ou `group` → vira `category` (mapeando: `orquestrador`→`mcp`, `edge`→`edge`, `bot`→`bot`, `ia`→`ia`, `vps`→`vps`, `modulo`→`modulo`, `supabase`→`supabase`, resto→`doc`).
   - `from`/`to` → vira `source`/`target`.
   - `ativa` inferida: `weight >= 3` = true (linha grossa + partículas rápidas).
   - Defesa: se `nodes`/`edges` vier `undefined`, cair pra `[]` e mostrar Notice amigável em vez de crashar.

2. **`src/view.ts` — filtro seguro**
   Trocar `dados.nodes.filter(...)` por `(dados.nodes ?? []).filter(...)` (mata o erro do print de vez).

3. **`src/view.ts` — animação**
   Garantir `linkDirectionalParticles` mínimo 1 mesmo sem `ativa`, pra sempre ter movimento (efeito Tony Stark).

4. **Bump `manifest.json` → `0.4.3`** + entrada no `changelog.json` explicando "adaptador do novo schema + fim do erro do filter".

5. **Rebuild**: `cd apps/modulos/obsidian-plugin-grafo-vivo && npm run build` (gera `main.js` novo).

6. **Publicar via auto-update**: como o plugin já tem sistema de auto-update (v0.4.1 testou isso), basta você abrir o Obsidian e ele vai baixar sozinho a 0.4.3, ou clicar "Atualizar agora" na Notice.

7. **Fechar com `atualizar_painel`** marcando F8 concluído (já corrigido o param que falhou antes).

---

## O que muda visualmente pra você

- Nós **coloridos por categoria** (verde bot, azul MCP, roxo edge, etc.).
- Arestas com **partículas viajando** (o "movimento Tony Stark" que o status já mostra).
- Filtro "todos/bot/mcp/…" funcionando sem erro.
- Mesmo grafo do `status.centralldark.com`, só que dentro do vault.

---

## Fora do escopo (por enquanto)

- Não vou mexer no `graph-data.json` da VPS (área protegida do status).
- Não vou trocar o motor de render (fica no `force-graph` mesmo).
- Não vou renomear o plugin nem mexer no sistema de auto-update.

Se topar, aprova que eu já ataco na build.