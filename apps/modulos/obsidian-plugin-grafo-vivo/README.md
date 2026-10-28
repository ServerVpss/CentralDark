# 🧩 CentralDark Plugin — Grafo Vivo, Hub e Hermes no Obsidian

Plugin custom pra ver o ecossistema **CentralDark** se movimentando em tempo real dentro do seu Obsidian. Consome o mesmo `/api/graph` que roda em `api.centralldark.com`, mas renderiza numa view lateral do vault.

Nada de mexer no Juggl ou no Graph nativo — esse aqui é **nosso**, sobrevive a update do Obsidian.

## CentralDark Plugin — organização unificada (2026-10-28)

**Identidade visual atual:** CentralDark Plugin. **ID técnico preservado:** `centraldark-grafo-vivo` (necessário para manter comandos, dados, autoatualização e vaults existentes). **Owner do código:** esta mesma pasta `apps/modulos/obsidian-plugin-grafo-vivo/`; não criar segundo plugin. A migração de ID/pasta para `centraldark-plugin` exige teste de compatibilidade antes de qualquer troca.

| Capacidade | Owner / arquivo de implementação atual | Estado |
| --- | --- | --- |
| Grafo 2D | `src/view.ts` | Fonte existente |
| Grafo 3D | `src/view3d.ts` | Fonte existente |
| Hub de conhecimento / Obsidian | `src/knowledgeHub.ts` + `src/main.ts` | Fonte existente; eventos candidatos, não promoção de verdade |
| Semântica local | `src/semantic.ts` | Fonte existente |
| Configurações | `src/settings.ts` | Fonte existente |
| Autoatualização / rollback | `src/autoUpdater.ts` | Fonte existente |
| Hermes Live / HUD | `K:\\docs\\.obsidian\\plugins\\centraldark-grafo-vivo\\main.js` | **Presente no bundle instalado; fonte `src/` não reconciliada** |
| Método, receitas e scripts | `.agents/skills/centraldark-operational-method/SKILL.md` | Owner Skill-Mãe, não duplicar no plugin |
| Diagramas / memória | `docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/DIAGRAMAS-CENTRALDARK.md` | Owner Obsidian |
| Executor Hermes | `apps/modulos/HERMES-CORE/` | Owner de execução separado |

**Regra de evolução:** `INTENCAO → SKILL-MAE → CAPACIDADE PERTINENTE → MESMO OWNER → EXECUCAO → PROVA → RECEITA/DIAGRAMA/INDICE`. Plugin exibe e aciona rotas autorizadas; não promove notas a verdade por conta própria. Outros plugins recebem apenas eventos pertinentes, com proteção contra loops.

**Raiz universal:** não usar `%root%` nem fixar `K:\\`/IP no código. Na Casa, procurar `CENTRALDARK_ROOT` quando configurado; senão descobrir o repositório ancestral do vault por marcadores canônicos. Em Linux/VPS, a mesma variável pode apontar a instalação correspondente. `VAULT_ROOT` (pasta do Obsidian) é diferente de `CENTRALDARK_ROOT` (repositório). O endpoint Hermes local/remoto deve ser configurado e testado separadamente; ausência = `UNKNOWN`.

**Cadeado de publicação:** os dois bundles instalados têm `Hermes Live` e são diferentes do `main.js` do código-fonte. **Não executar build+deploy sobre o plugin ativo até reconciliar essa diferença** e provar que as views existentes continuam funcionando. O nome visível pode mudar sem alterar o ID técnico. Nunca copiar `data.json` com tokens para Git. Obsidian Git e o Hub de conhecimento são canais diferentes: `HUB_CANDIDATE != GITHUB_PUSH != RESTORE_PASS`.


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
