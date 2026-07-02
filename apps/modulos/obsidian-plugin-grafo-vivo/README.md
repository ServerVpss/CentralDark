# 🕸️ CentralDark Grafo Vivo — Plugin Obsidian

Plugin custom pra ver o ecossistema **CentralDark** se movimentando em tempo real dentro do seu Obsidian. Consome o mesmo `graph-data.json` que roda em `status.centralldark.com`, mas renderiza numa view lateral do vault.

Nada de mexer no Juggl ou no Graph nativo — esse aqui é **nosso**, sobrevive a update do Obsidian.

---

## ⚡ Instalação rápida

1. Instalar deps e buildar:
   ```bash
   cd apps/modulos/obsidian-plugin-grafo-vivo
   npm install
   npm run build
   ```
2. Copiar a pasta pro vault:
   ```
   <seu-vault>/.obsidian/plugins/centraldark-grafo-vivo/
   ├── main.js         ← gerado pelo build
   ├── manifest.json
   └── styles.css
   ```
3. Reiniciar o Obsidian → **Configurações → Community plugins → Ativar "CentralDark Grafo Vivo"**.
4. Clicar no ícone de bifurcação (🍴) na barra lateral esquerda **ou** rodar o comando **"Abrir Grafo Vivo CentralDark"** na paleta.

---

## 🎨 O que ele mostra

- **Nós coloridos por categoria**: bots (verde), MCP (azul), edge functions (roxo), Supabase (verde neon), VPS (laranja), IAs (rosa), módulos (amarelo).
- **Arestas** ligando quem chama quem.
- **Partículas** viajando pelas arestas ativas → dá pra ver as IAs se movimentando.
- **Filtro** por categoria no topo.
- **Clique** num nó com `obsidian_path` → abre a nota correspondente no vault.

---

## ⚙️ Configuração

Vai em **Configurações → CentralDark Grafo Vivo**:

| Opção | Padrão |
|-------|--------|
| URL do grafo | `https://status.centralldark.com/graph-data.json` |
| Intervalo de atualização | 30 segundos |
| Abrir nota ao clicar | ✅ ativado |

---

## 📐 Formato esperado do JSON

```json
{
  "nodes": [
    { "id": "mcp-central", "label": "MCP Central", "category": "mcp", "obsidian_path": "MOC-MCP" },
    { "id": "bot-srver1", "label": "@srver1bot", "category": "bot" }
  ],
  "edges": [
    { "source": "bot-srver1", "target": "mcp-central", "ativa": true }
  ]
}
```

Campos:
- `nodes[].id` — obrigatório, único
- `nodes[].label` — texto exibido
- `nodes[].category` — chave da paleta (`bot|mcp|edge|supabase|vps|ia|modulo|doc`)
- `nodes[].obsidian_path` — opcional, nome da nota que abre ao clicar
- `edges[].source` / `.target` — ids dos nós
- `edges[].ativa` — se `true`, ganha partículas animadas

---

## 🛣️ Roadmap

- **v0.1** ✅ Fetch periódico, filtro, clique abre nota, partículas em arestas ativas.
- **v0.2** WebSocket direto no MCP → cada `tool call` vira partícula em tempo real (< 1s de latência).
- **v0.3** Sincronizar nós como notas vazias em `docs/CONSCIENCIA/00-MAPA/nodes/` pra aparecer no Graph nativo também.
- **v0.4** Modo 3D opcional (`3d-force-graph`).
- **v0.5** Ícones custom por categoria (SVG inline).

---

## 🔒 Área protegida

Este plugin faz parte do **cérebro visual** do Pivete. Não modificar sem autorização — ver `CLAUDE.md §9`.
