# 🕸️ CentralDark Grafo Vivo — Plugin Obsidian

Plugin custom pra ver o ecossistema **CentralDark** se movimentando em tempo real dentro do seu Obsidian. Consome o mesmo `/api/graph` que roda em `grafo.centralldark.com`, mas renderiza numa view lateral do vault.

Nada de mexer no Juggl ou no Graph nativo — esse aqui é **nosso**, sobrevive a update do Obsidian.

---

## ⚡ Instalação rápida pelo release v0.5.0

Release oficial:

```text
https://github.com/ServerVpss/CentralDark/releases/tag/obsidian-plugin-v0.5.0
```

Baixe os três assets e coloque na pasta do plugin dentro do vault:

```text
main.js
manifest.json
styles.css
```

Destino local:

```text
<seu-vault>/.obsidian/plugins/centraldark-grafo-vivo/
├── main.js
├── manifest.json
└── styles.css
```

Depois:

```text
Obsidian
→ Configurações
→ Community plugins
→ Reload plugins
→ ativar "CentralDark Grafo Vivo"
→ abrir comando "Abrir Grafo Vivo CentralDark"
```

Se já estiver instalado, use **Checar atualização agora** na aba do plugin ou substitua os três arquivos manualmente.

---

## 🌐 Endereços para conectar agora

Rota viva recomendada no plugin:

```text
https://grafo.centralldark.com/api/graph?mode=vivo
```

Fallback simples do release v0.5.0:

```text
https://status.centralldark.com/graph-data.json
```

Endpoint de auto-update usado pela configuração atual:

```text
https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release
```

Contraprova:

```text
URL_CONFIGURADA != SITE_VISIVEL_PROVADO
PLUGIN_INSTALADO != FEED_ATUALIZANDO
GITHUB_RELEASE != LOCAL_OBSIDIAN_ATIVO
UNKNOWN != PASS
```

---

## ⚡ Build local a partir do source

1. Instalar deps e buildar:
   ```bash
   cd apps/modulos/obsidian-plugin-grafo-vivo
   npm install
   npm run build
   ```
2. Copiar a pasta pro vault:
   ```text
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
- **Origem visível** do feed na toolbar, para o operador saber que rota/IP/domínio o plugin está tentando usar.
- **Labels maiores e mais cedo no zoom**, com fundo legível para não sumirem no Obsidian escuro.
- **Clique** num nó com `obsidian_path` → abre a nota correspondente no vault.

### View 3D (Grafo 3D · Jarvis)
- **Render 3D completo** com `3d-force-graph` bundleado (sem CDN, funciona offline).
- **Nós com glow e pulso** — online respira verde, offline pisca vermelho.
- **Labels de setor** flutuando no centroide de cada grupo.
- **Ícone 🤖** em nós de agente.
- **Controles**: rotação automática, reset de câmera, clique no nó para foco.
- **Dados vivos** do `/api/graph` com poll a cada 5s.

---

## 🔠 Snippet opcional para notas maiores

Este PR inclui um snippet de leitura para as notas do BRAIN:

```text
apps/modulos/obsidian-plugin-grafo-vivo/snippets/centraldark-brain-readable.css
```

Instalação:

```text
copiar para <seu-vault>/.obsidian/snippets/centraldark-brain-readable.css
Obsidian → Configurações → Aparência → CSS snippets → ativar
```

Esse snippet aumenta fonte, headings, tags e blocos de código. Ele não altera dados da vault.

---

## ⚙️ Configuração

Vai em **Configurações → CentralDark Grafo Vivo**:

| Opção | Padrão |
|-------|--------|
| URL do grafo | `https://grafo.centralldark.com/api/graph?mode=vivo` |
| Intervalo de atualização | 15 segundos |
| Abrir nota ao clicar | ✅ ativado |
| Hub único de conhecimento | `https://api.centralldark.com/memoria/ingest` |
| Auto-update | ✅ ativado |

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
- **v0.2** 🔄 WebSocket direto no MCP → cada `tool call` vira partícula em tempo real (< 1s de latência).
- **v0.3** 🔄 Sincronizar nós como notas vazias em `docs/CONSCIENCIA/00-MAPA/nodes/` pra aparecer no Graph nativo também.
- **v0.4** ✅ Modo 3D real com `3d-force-graph` bundleado, controles, setores, glow/pulso, labels de agente.
- **v0.5** ✅ feed vivo, A+/A−, labels visíveis, assets versionados.
- **v0.6 candidate** 🔄 origem visível na toolbar, labels maiores, snippet BRAIN legível, receipt #1444.

---

## 🔒 Área protegida

Este plugin faz parte do **cérebro visual** do Pivete. Não modificar sem autorização — ver `CLAUDE.md §9`.

> Ôxente, grafo bom mostra de onde vem a água. Se a URL aparece, o operador não fica procurando nascente no escuro. 🧼🧽🧠🕸️📜⚖️
