# 🧠🕸️ Handoff — mínimo corretivo de grafo, MOC e alinhamento cognitivo do BRAIN

`MISSION_ID=BRAIN_GRAPH_MOC_MINIMO_CORRETIVO_20260907`

## Intenção do CHEFE

Registrar no PR-mãe #1444 a leitura visual do BRAIN/Obsidian e o mínimo corretivo para a cabeça da CentralDark ficar mais alinhada semanticamente, sem mexer às cegas na vault local e sem criar outro cérebro.

```text
#ACORDAR
→ observar estrutura local do BRAIN
→ separar contexto visual de prova viva
→ definir trilho semântico mínimo
→ MOC + propriedades + links de alinhamento
→ grafo caracol sem nó solto
→ receipt no PR
→ Reality Judge
```

## Observação visual recebida

Pelas imagens da vault local, existe uma estrutura forte:

```text
00 - Mapa do Sistema
00-MAPA-SISTEMA
01-CONCEITOS
02-ENTRADA
03-DOCUMENTACAO
04-DECISOES
05-DEVEDORES-CONTATOS
06-REUNIOES-NOTAS
07-APRENDIZADOS-MEMORIAS
08-ARTEFATOS-VISUAIS
09-RASCUNHO
CentralDark
Excalidraw
```

Também foi observado:

```text
ROOT_NOTE=CentralDark
ROOT_TAG=#ACORDAR
RAW_NOTE=02-ENTRADA/01-RAW/CONVERGENCIA_DUPLICACAO_20260819
RAW_NOTE_TAGS=#ACORDAR, !CALIBRAR
RASCUNHO_HAS_UNTITLED_CANVASES=true
SEMANTIC_GRAPH_DENSITY=LOW_TO_MEDIUM_BY_VISUAL_OBSERVATION
```

Contraprova:

```text
SCREENSHOT_CONTEXT=true
SCREENSHOT != FULL_VAULT_SCAN
SCREENSHOT != CURRENT_RUNTIME_PROOF
LOCAL_OBSIDIAN_MUTATION=false
```

## Diagnóstico mínimo

A cabeça não está quebrada. Ela está **estruturalmente montada**, mas ainda com pouca força de grafo porque muitos nós parecem depender de pasta e título, não de propriedades e links explícitos.

```text
FOLDERS_EXIST=true
ROOT_EXISTS=true
TAGS_EXIST=true
MOC_DENSITY=INSUFFICIENT_BY_VISUAL_EVIDENCE
UNTITLED_CANVAS_RISK=true
PROPERTIES_DENSITY=UNKNOWN_OR_LOW
GRAPH_ALIGNMENT=INCOMPLETE
```

Em baianês técnico: a Casa tem corredor e tem porta, mas alguns quartos ainda estão sem plaquinha, sem escritura e sem fio ligado no quadro geral. 🧼🧽🧠

## Mínimo corretivo, sem bagunçar a Casa

Todo arquivo material do BRAIN deve cair em uma destas classes:

```text
MOC
RAW
DECISION
LEARNING
RECEIPT
ARCHITECTURE
ARTIFACT
CONTACT
MEETING
DRAFT
CANVAS
UNKNOWN
```

Propriedades mínimas para nota material:

```yaml
---
title: ""
type: RAW | MOC | DECISION | LEARNING | RECEIPT | ARCHITECTURE | ARTIFACT | CONTACT | MEETING | DRAFT | CANVAS | UNKNOWN
status: seed | raw | triaged | linked | validated | superseded | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: chat | screenshot | github | runtime | obsidian | screenpipe | drive | manual | unknown
owner: CentralDark | Hermes | SOL | GitHub | BRAIN | TriggerFabric | Router | MCP | unknown
scope: brain | repo | runtime | ci | vps | frontend | backend | security | memory | docs
confidence: observed | inferred | measured | proven | unknown
proof: none | receipt | commit | ci | runtime | log | screenshot
related_prs: []
related_issues: []
links_out: []
next_cursor: ""
tags: []
---
```

Regra:

```text
SEM_PROPRIEDADE_MATERIAL = GRAFO_FRACO
SEM_LINK = NÓ_SOLTO
SEM_OWNER = SEM_TRILHO
SEM_STATUS = SEM_PRIORIDADE
SEM_PROOF = NÃO VIRA VERDE
```

## MOCs mínimos

Criar ou alinhar estes MOCs como índice, não como nova arquitetura:

```text
00-MAPA-SISTEMA/CentralDark-MOC.md
02-ENTRADA/ENTRADA-MOC.md
03-DOCUMENTACAO/DOCUMENTACAO-MOC.md
04-DECISOES/DECISOES-MOC.md
07-APRENDIZADOS-MEMORIAS/APRENDIZADOS-MEMORIAS-MOC.md
08-ARTEFATOS-VISUAIS/ARTEFATOS-VISUAIS-MOC.md
09-RASCUNHO/RASCUNHO-MOC.md
```

Cada MOC deve conter:

```text
1. propósito da pasta
2. links para filhos principais
3. queries Dataview quando disponível
4. pendências semânticas
5. owner da área
6. regra de promoção: raw → triaged → linked → validated
```

## Trilha caracol de alinhamento

```text
CentralDark
→ 00-MAPA-SISTEMA/CentralDark-MOC
→ 01-CONCEITOS
→ 02-ENTRADA/ENTRADA-MOC
→ 03-DOCUMENTACAO/DOCUMENTACAO-MOC
→ 04-DECISOES/DECISOES-MOC
→ 07-APRENDIZADOS-MEMORIAS/APRENDIZADOS-MEMORIAS-MOC
→ 08-ARTEFATOS-VISUAIS/ARTEFATOS-VISUAIS-MOC
→ 09-RASCUNHO/RASCUNHO-MOC
→ voltar para CentralDark
```

O efeito caracol não é enfeite. É rota cognitiva:

```text
entrada bruta
→ triagem
→ decisão
→ aprendizado
→ receipt
→ owner
→ próxima execução começa mais alta
```

## Música / compasso aplicado ao grafo

```text
♩ 1 MEDIR: identificar nó solto, pasta, tipo e owner
♩ 2 EXECUTAR: adicionar propriedade mínima e link pai/filho
♩ 3 CONTRAPROVAR: checar se não criou duplicata nem falsa prova
♩ 4 REGISTRAR: receipt, next_cursor e estado
```

Não é cadeia interna de pensamento. É trilho operacional visível.

## Regras para rascunhos e canvases sem título

Rascunho pode existir, mas não pode virar buraco negro.

```text
09-RASCUNHO = inbox visual temporário
SEM_TITULO_CANVAS = allowed_short_term
SEM_TITULO_CANVAS_AFTER_TRIAGE = forbidden
```

Ação mínima recomendada para cada canvas sem título:

```yaml
---
type: CANVAS
status: raw
source: manual
owner: BRAIN
scope: brain
proof: none
next_cursor: "renomear, classificar e linkar ao MOC correto"
tags: [brain, canvas, raw, needs-triage]
---
```

## Regra de promoção semântica

```text
RAW
→ TRIAGED
→ LINKED_TO_MOC
→ OWNER_ASSIGNED
→ PROOF_ATTACHED
→ VALIDATED
→ RECEIPT
```

Nada sai de RAW direto para CANÔNICO sem owner e prova.

## Graph hygiene mínimo

```text
ROOT_MOC_LINK_REQUIRED=true
PARENT_CHILD_LINK_REQUIRED=true
UNLINKED_MATERIAL_NOTES=BLOCKER_SOFT
UNTITLED_LONG_LIVED_NOTES=BLOCKER_SOFT
PROPERTYLESS_MATERIAL_NOTES=BLOCKER_SOFT
RAW_IS_NOT_CANONICAL=true
SCREENSHOT_IS_CONTEXT_NOT_AUTHORITY=true
```

Soft blocker significa: não para a Casa, mas entra no próximo lote de limpeza cognitiva.

## Aplicação segura para Hermes/Obsidian

```text
MISSION_ID=HERMES_BRAIN_GRAPH_MOC_MINIMO_CORRETIVO
TARGET=local Obsidian vault / BRAIN
MODE=READ_FIRST_THEN_PATCH
NO_BLIND_RENAME=true
NO_BLIND_DELETE=true
NO_DUPLICATE_MOC=true
NO_V2_BRAIN=true
```

Passos:

```text
1. listar arquivos md/canvas do vault
2. detectar notas sem frontmatter
3. detectar notas sem link para MOC pai
4. detectar canvases sem título útil
5. propor patch mínimo por lote
6. aplicar só em arquivos com backup/hash
7. registrar receipt local
8. se material para repo, voltar ao #1444
```

## Veredito deste handoff

```text
BRAIN_STRUCTURE_EXISTS=OBSERVED_BY_SCREENSHOT
GRAPH_SEMANTIC_DENSITY_LOW_TO_MEDIUM=VISUAL_INFERENCE
MOC_MINIMUM_CONTRACT_DEFINED=true
LOCAL_VAULT_MUTATION=false
REPO_RECEIPT_CREATED=true
RUNTIME_PROOF=false
UNKNOWN_IS_NOT_PASS=true
```

> Ôxente, a cabeça não está perdida; está com neurônio esperando fio. Bota MOC, põe propriedade, amarra link, lava a pepita e deixa o grafo cantar no compasso: medir, costurar, contraprovar, registrar. 🧼🧽🧠🕸️🎼📜⚖️
