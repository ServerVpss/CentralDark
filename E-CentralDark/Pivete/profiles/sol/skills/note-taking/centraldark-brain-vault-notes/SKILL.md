---
name: centraldark-brain-vault-notes
description: >
  Trigger docs/BRAIN nota. Callouts prioridade grafo hash.
trigger:
  - criar nota em docs/BRAIN
  - editar índice, mapa ou MOC do vault BRAIN
  - adicionar ouro pocket em 07-APRENDIZADOS-MEMORIAS
  - conectar grafo semântico a nota
  - registrar hash node identificado
platforms: [windows]
vault_path: "E:\\CentralDark\\Pivete\\CentralDark\\docs\\BRAIN"
---

# CentralDark BRAIN Vault Notes

Use este skill para criar e organizar notas no vault BRAIN do CHEFE com o estilo que ele validou: callouts coloridos, prioridade explícita, grafo central conectado, hash nodes registrados e cross-linking bidirecional.

## Vault path

```
E:\CentralDark\Pivete\CentralDark\docs\BRAIN
```

Este é o vault do Obsidian do CHEFE. Use sempre o caminho absoluto resolvido antes de file tools.

## Estilo de nota — callouts coloridos

O CHEFE validou explicitamente este estilo. Use callouts nativos do Obsidian:

| Callout | Cor | Uso |
|---------|-----|-----|
| `> [!INFO]` | 🔵 azul | Visão geral, contexto |
| `> [!NOTE]` | 🟢 verde | Confirmado, provado, fato |
| `> [!TIP]` | 🟡 âmbar/limão | Dica, alternativa, observação útil |
| `> [!IMPORTANT]` | 🟣 roxo | Autoridade, regra central, deve-saber |
| `> [!WARNING]` | 🔴 vermelho | Bloqueio, risco, `UNKNOWN != PASS` |
| `> [!ATTENTION]` | 🟠 laranja | Alerta condicional, observação especial |

Exemplo:
```markdown
> [!IMPORTANT] 🔴 AUTORIDADE (SEGREDO/CHEFE)
> Faz: **INTENÇÃO + AUTORIZAÇÃO**
> Não deveria fazer:
> - Clicar `update branch` manual
> - Vigilar cada gate
```

## Prioridade explícita

Sempre marcar nível de prioridade em notas de índice/map/MOC:

| Nível | Cor | Categorias |
|-------|-----|-----------|
| `🔴 OBRIGATÓRIO` | vermelho | Entradas, hubs, boot, protocolo |
| `🟡 SECUNDÁRIO` | âmbar | Conceitos, MOCs, arquivos de suporte |
| `🟢 HUB DE REFERÊNCIA` | verde | Artefatos visuais, gráficos |

Use em:
- Frontmatter: `priority: 🔴_OBRIGATORIO`
- Tabela de seção: `| 🔴 | [[BRAIN]] | Hub central do vault |`
- Final de cada seção: resumo de prioridade

## Grafo central — padrão de hub conectado

Quando existe um grafo semântico no vault (ex: `semantic-graph-observed-YYYYMMDD.png` em `08-ARTEFATOS-VISUAIS/CARTAZES-CANÔNICOS/`), trata-se como **hub de referência** e cross-linka de todas as seções relevantes:

```markdown
**GRAFO CENTRAL:** [[semantic-graph-observed-20260824.png|../08-ARTEFATOS-VISUAIS/CARTAZES-CANÔNICOS/semantic-graph-observed-20260824.png]]
```

O grafo fica presente em:
- Toda seção de conceito que se conecta a ele
- Seção de orquestração
- Seção de ouro/calibração
- Seção de aprendizado

## Registro de hash nodes

Quando hash identificadores aparecem (de imagens, arquivos, nós do grafo), registra explicitamente:

```markdown
**Hash cross-reference:**
- 🔹 `62d326df3ccfa959` ↔ nó de orquestração no grafo
- 🔹 `b9073413230d7fcd` ↔ nó de orquestração no grafo
```

Cada hash aparece:
- Em uma seção dedicada de registro
- Cross-linked em cada seção onde o conceito associado aparece

## Cross-linking bidirecional

Linkar de volta entre seções relacionadas. No vault BRAIN:

- Banda ↔ Orquestração ↔ Ouro ↔ Grafos ↔ Conceitos
- Toda seção que menciona o grafo central cross-linka de volta para ele
- Índices linkam para MOCs, MOCs linkam para índices

## Estrutura do vault BRAIN

| Pasta | Prioridade | Função |
|-------|-----------|--------|
| `00-MAPA-SISTEMA/` | 🔴 | **Hub de entrada principal** |
| `01-CONCEITOS/` | 🔴 | Base conceitual |
| `02-ENTRADA/` | 🟡 | Material de entrada |
| `03-DOCUMENTACAO/` | 🟡 | Docs de referência |
| `04-DECISOES/` | 🟡 | Registro de decisões |
| `05-DEVEDORES-CONTATOS/` | 🟡 | Quem faz o quê |
| `06-REUNIOES-NOTAS/` | 🟡 | Notas de reunião |
| `07-APRENDIZADOS-MEMORIAS/` | 🔴 | **Ouro pocket** |
| `08-ARTEFATOS-VISUAIS/CARTAZES-CANÔNICOS/` | 🟢 | Artefatos visuais canônicos, grafo semântico |

### Arquivos-chave em `00-MAPA-SISTEMA/`

| Arquivo | Função |
|---------|--------|
| `BRAIN.md` | **Hub central do vault** |
| `INDEX.md` | Índice do mapa |
| `INDEX-MAPA.md` | Meta-índice |
| `00-MAPA.md` | Mapa geral |
| `README.md` | Leitura inicial |
| `PLANO.md` | Plano atual |
| `PROTOCOLO-INICIALIZACAO.md` | Protocolo de boot |
| `00-POSTURA-PIVETE.md` | Postura do executor (HERMES) |
| `DIRECAO-ATUAL-HERMES.md` | Direção atual |
| `02-ARQUITETURA.md` | Arquitetura |
| `GRAFO-VIVO.md` | Grafo em tempo real |
| `MAPA-DOS-BOTS.md` | Mapeamento de bots |
| `MAPA-OBSIDIAN-BRAIN.md` | Mapa do vault |
| `MOC-*.md` | MOCs por domínio |

## Ouro pocket — `07-APRENDIZADOS-MEMORIAS/`

Pasta onde o ouro cristalizado deve ir. Cada arquivo deve:
- Ter frontmatter com `date`, `status`, tags
- Usar callouts coloridos
- Ser cross-linked com o grafo central quando relevante
- Registrar hash nodes identificados

## Exemplo de nota completa

```markdown
---
tags: [canônico, !CENTRALDARK]
date: 2026-08-27
status: ATIVO
priority: 🔴_OBRIGATORIO
graph-hub: true
---

# 🟣 Título da Nota

> [!INFO] 📋 Visão geral
> Conteúdo informativo aqui.

> [!IMPORTANT] 🔴 Autoridade / regra central
> Conteúdo crítico aqui.

> [!NOTE] 🟢 Confirmado / provado
> - Item 1
> - Item 2

> [!WARNING] 🔴 Bloqueio / risco
> `UNKNOWN != PASS`

**GRAFO CENTRAL:** [[semantic-graph-observed-20260824.png|../08-ARTEFATOS-VISUAIS/CARTAZES-CANÔNICOS/semantic-graph-observed-20260824.png]]

**Hash cross-reference:**
- 🔹 `62d326df3ccfa959` ↔ conceito A
- 🔹 `b9073413230d7fcd` ↔ conceito B
```

## Endereço 10×10 (CHEFE 2026-09-03)

Número + nome. Número = coordenada local, **não** identidade do conceito. Teto **10 irmãos por nível**. Camada nova **só** se o item for de outro tipo e **não couber** numa categoria já existente. Sem pasta vazia pra completar 10. Sem renumerar a raiz 00–08 deste vault pra 01–10 (quebra `[[00-MAPA-SISTEMA]]`).

```text
NOME_CANONICO = NUMERO + NOME
NUMERO = ORDEM LOCAL
NUMERO != IDENTIDADE DO CONCEITO
10 = TETO, NAO COTA
MAPA_MERMAID != DISCO
```

Agente e CHEFE navegam o **mesmo** BRAIN: ele no Obsidian GUI, o agente no path. Endereço `04/02/02` > rglob. Detalhe: `references/numeracao-10x10-e-orfaos.md`.

## Órfãs / lacuna de amarração

Antes de declarar grafo fechado, varrer `*.md`: inbound `[[wikilink]]` e outbound. 0 in + 0 out = órfã → ponte no hub (`BRAIN.md` / `MAPA-OBSIDIAN-BRAIN.md`). **0 bytes = sem propósito, APAGAR** (não amarrar, não inventar texto). Amarelo no Graph View ≠ prova de qual arquivo — medir disco. JSON swarm antigo = HISTORICAL (path da raiz pode ter mudado). Detalhe: `references/arvore-10x10-e-orfaos.md`.

## O que NÃO fazer

- Não criar sem prioridade explícita em índices/MOCs
- Não escrever sem conectar ao grafo central quando existir
- Não deixar hash nodes flutuando sem registro
- Não usar markdown puro sem callouts quando o vault pede estilo colorido
- Não ser verboso — o CHEFE quer conciso, denso, direto
- Não procurar ouro ChatGPT/HTML em Downloads (stub 40 B). Fonte: `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\`
- Não deixar fala material do CHEFE só no chat. Vault BRAIN é dele **e** do agente
- Não criar 10 pastas vazias nem segunda Biblioteca (`03-DOCUMENTACAO/BIBLIOTECA/` já é o catálogo)

## Cross-references

- `note-taking/obsidian` — skill base de vault Obsidian (read/search/create/edit)
- `references/numeracao-10x10-e-orfaos.md` — regra 10×10, scan órfãs, GARIMPO HTML
