# 🕸️ CentralDark Grafo Vivo — Plugin Obsidian

Plugin custom pra ver o ecossistema **CentralDark** se movimentando em tempo real dentro do seu Obsidian. Consome o mesmo `/api/graph` que roda em `grafo.centralldark.com`, mas renderiza numa view lateral do vault.

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
5. Para o 3D: clicar no ícone de órbita (🌀) ou comando **"Abrir Grafo 3D · Jarvis"**.

---

## 🎨 O que ele mostra

### View 2D (Grafo Vivo)
- **Nós coloridos por categoria**: bots (verde), MCP (azul), edge functions (roxo), Supabase (verde neon), VPS (laranja), IAs (rosa), módulos (amarelo).
- **Arestas** ligando quem chama quem.
- **Partículas** viajando pelas arestas ativas → dá pra ver as IAs se movimentando.
- **Filtro** por categoria no topo.
- **Clique** num nó com `obsidian_path` → abre a nota correspondente no vault.

### View 3D (Grafo 3D · Jarvis)
- **Render 3D completo** com `3d-force-graph` bundleado (sem CDN, funciona offline).
- **Nós com glow e pulso** — online respira verde, offline pisca vermelho.
- **Labels de setor** flutuando no centroide de cada grupo.
- **Ícone 🤖** em nós de agente.
- **Controles**: rotação automática, reset de câmera, clique no nó para foco.
- **Dados vivos** do `/api/graph` com poll a cada 5s.

---

## ⚙️ Configuração

Vai em **Configurações → CentralDark Grafo Vivo**:

| Opção | Padrão |
|-------|--------|
| URL do grafo | `https://grafo.centralldark.com/api/graph?mode=vivo` |
| Intervalo de atualização | 15 segundos |
| Abrir nota ao clicar | ✅ ativado |
| Enviar notas ao Hub | ✅ ativado |
| Auto-sync de notas | ✅ ativado |
| URL de ingestão do Hub | `https://api.centralldark.com/memoria/ingest` |
| Manifesto BRAIN vivo | `https://api.centralldark.com/memoria/manifest?scope=brain&mode=vivo` |
| Auto-update do plugin | ✅ ativado |

O token do Hub fica **somente local** nas configurações do Obsidian. Não versionar, não colar em chat, não commitar.

---

## 🧠 Rota BRAIN + Hub + Obsidian

```text
Obsidian note/create/modify
→ CentralDark Grafo Vivo autosync
→ POST /memoria/ingest
→ CANDIDATE event
→ BRAIN ledger/manifest
→ CI/CD valida contrato
→ receipt
→ grafo/manifest atualiza
→ plugin reabre por obsidian_path
```

Regras:

```text
NOTE_SYNC != TRUTH_PROMOTION
DOCUMENTED != EXECUTED
ARQUIVO_GUARDADO != ARQUIVO_SEGURO
CI_PENDING_IS_NOT_PASS
MERGE_IS_NOT_DEPLOY
REALIDADE_IS_JUDGE
```

---

## 🧩 Obsidian Local REST API + MCP

O plugin pode coexistir com o plugin comunitário **Local REST API** do Obsidian. Essa ponte é útil para Kanban, automações locais e agentes MCP acessarem o vault pelo canal local autenticado.

Rota conceitual:

```text
Telegram/Bot/API/HERMES
→ VPS Hub /memoria/ingest
→ CI/CD/receipt
→ BRAIN manifest
→ Obsidian plugin lê manifest
→ Local REST API/MCP pode abrir, buscar ou patchar nota localmente
→ mudança local volta pelo autosync
→ novo CANDIDATE no Hub
```

Cadeados obrigatórios:

```text
LOCAL_REST_API_IS_LOCAL_BRIDGE=true
LOCAL_REST_API_TOKEN_LOCAL_ONLY=true
NO_TOKEN_IN_REPO=true
NO_PUBLIC_EXPOSED_OBSIDIAN_API=true
PATCH_NOTE != PROMOTE_TRUTH
KANBAN_MOVE != DEPLOY
KANBAN_CARD != CI_GREEN
```

Para Kanban: a movimentação de card pode virar evento candidato, mas promoção de estado continua passando por CI/CD + receipt. O Kanban organiza fluxo; ele não substitui Greg, Dex nem Realidade.

---

## 📐 Formato esperado do JSON do grafo

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
- **v0.2** 🔄 WebSocket direto no MCP → cada `tool call` vira partícula em tempo real (< 1s de latência).
- **v0.3** 🔄 Sincronizar nós como notas vazias em `docs/CONSCIENCIA/00-MAPA/nodes/` pra aparecer no Graph nativo também.
- **v0.4** ✅ Modo 3D real com `3d-force-graph` bundleado, controles, setores, glow/pulso, labels de agente.
- **v0.5** 🔄 Ícones custom por categoria (SVG inline).
- **v0.6** 🔄 Kanban/Local REST API/MCP como ponte local autenticada, sem expor token e sem promover estado sem CI/CD.

---

## 🔒 Área protegida

Este plugin faz parte do **cérebro visual** do Pivete. Não modificar sem autorização — ver `CLAUDE.md §9`.
