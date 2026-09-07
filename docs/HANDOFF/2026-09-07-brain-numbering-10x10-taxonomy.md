# 📐🧠 Handoff — taxonomia 10x10 do BRAIN / Obsidian

`MISSION_ID=BRAIN_NUMBERING_10X10_TAXONOMY_20260907`

## Intenção do CHEFE

Corrigir o desalinhamento observado na cabeça da CentralDark: o BRAIN tem estrutura boa, mas o padrão de numeração não está totalmente respeitado, há rascunhos/canvases soltos e a semântica por propriedades ainda está fraca.

Este handoff define o **mínimo correto** para Hermes aplicar na vault local com leitura, backup/hash e patch pequeno. Não mexe às cegas no Obsidian local e não cria BRAIN V2.

```text
#ACORDAR
→ medir vault
→ respeitar numeração
→ no máximo 10 pastas por nível
→ no máximo 10 subpastas por pasta até necessidade comprovada
→ adicionar propriedades mínimas
→ ligar MOC pai/filho
→ grafo caracol
→ receipt
→ Reality Judge
```

## Observação visual recebida

Pelas imagens, foi observado:

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
```

Também há:

```text
CentralDark root note
Excalidraw
09-RASCUNHO com vários Sem título / doc-Sem título / canvases
02-ENTRADA/01-RAW/CONVERGENCIA_DUPLICACAO_20260819
```

Diagnóstico:

```text
STRUCTURE_EXISTS=true
NUMBERING_PATTERN_PARTIAL=true
DUPLICATE_ZERO_MAP_RISK=true
UNTITLED_CANVAS_RISK=true
PROPERTY_DENSITY_LOW_OR_UNKNOWN=true
MOC_ALIGNMENT_INCOMPLETE=true
GRAPH_SEMANTIC_DENSITY_LOW_TO_MEDIUM=true
```

Contraprova:

```text
SCREENSHOT_CONTEXT=true
SCREENSHOT != FULL_VAULT_SCAN
LOCAL_OBSIDIAN_MUTATION=false
UNKNOWN != PASS
```

## Regra 10x10

A Casa deve trabalhar com **até 10 pastas numeradas por nível**, usando `00` até `09`. Subpastas também seguem `00` até `09` quando virarem áreas estáveis.

```text
LEVEL_1_MAX_FOLDERS=10
LEVEL_N_MAX_SUBFOLDERS_PER_PARENT=10
NUMBER_RANGE=00..09
CREATE_10_OR_MORE=false_until_architecture_review
```

Se passar de 10, não cria `10-...` no impulso. Primeiro faz split consciente:

```text
PARENT_TOO_FULL
→ medir densidade
→ achar domínio real
→ promover sub-MOC
→ mover por copy/hash/check/delete
→ receipt
```

## Padrão canônico de nomes

```text
NN-NOME-CANONICO
```

Regras:

```text
NN = 00..09
NOME = MAIUSCULO_SEM_ACENTO_RECOMENDADO
usar hífen como separador
não misturar `00 - Nome` e `00-NOME` como duas áreas vivas
não usar `Sem título` por mais de uma triagem
```

Exemplos bons:

```text
00-MAPA-SISTEMA
01-CONCEITOS
02-ENTRADA
03-DOCUMENTACAO
04-DECISOES
05-CONTATOS
06-REUNIOES-NOTAS
07-APRENDIZADOS-MEMORIAS
08-ARTEFATOS-VISUAIS
09-RASCUNHO
```

Exemplo de risco visto:

```text
00 - Mapa do Sistema
00-MAPA-SISTEMA
```

Ação segura:

```text
não deletar nenhum dos dois automaticamente
medir conteúdo
identificar qual é owner vivo
fundir links e MOC
marcar o outro como alias/superseded ou redirecionamento
só mover/deletar após backup + hash + consumer check
```

## Mapa 10x10 recomendado

```text
00-MAPA-SISTEMA
  00-MOCS
  01-INDICES
  02-GRAFOS
  03-ROTAS
  04-OWNERS
  05-CHECKLISTS
  06-RECEIPTS-GERAIS
  07-LINHAGEM
  08-PAINEIS
  09-RESERVA

01-CONCEITOS
  00-DOUTRINA
  01-REGRAS
  02-GLOSSARIO
  03-COMANDOS
  04-METAFORAS
  05-ARQUITETURA-MENTAL
  06-PADROES
  07-ANTI-PADROES
  08-PERGUNTAS
  09-RESERVA

02-ENTRADA
  00-INBOX
  01-RAW
  02-SCREENSHOTS
  03-CHATS
  04-LINKS
  05-LOGS
  06-IMPORTS
  07-TRIAGEM
  08-QUARENTENA
  09-RESERVA

03-DOCUMENTACAO
  00-MOC
  01-ARQUITETURA
  02-GUIAS
  03-CONTRATOS
  04-HANDOFFS
  05-PLAYBOOKS
  06-REFERENCIAS
  07-DECISOES-LINKADAS
  08-VALIDACOES
  09-RESERVA

04-DECISOES
  00-MOC
  01-ADR
  02-GOVERNANCA
  03-OWNERSHIP
  04-POLITICAS
  05-TRADEOFFS
  06-APROVACOES
  07-BLOCKERS
  08-SUPERSEDES
  09-RESERVA

05-CONTATOS
  00-MOC
  01-PESSOAS
  02-SERVICOS
  03-CREDORES-DEVEDORES
  04-SUPORTE
  05-FORNECEDORES
  06-COMUNIDADES
  07-PERMISSOES
  08-HISTORICO
  09-RESERVA

06-REUNIOES-NOTAS
  00-MOC
  01-AGENDA
  02-ATAS
  03-PENDENCIAS
  04-RETORNOS
  05-DECISOES
  06-AUDIO-TRANSCRICAO
  07-RESUMOS
  08-RECEIPTS
  09-RESERVA

07-APRENDIZADOS-MEMORIAS
  00-MOC
  01-OURO
  02-SESSOES
  03-PADROES
  04-ERROS
  05-CONTRAPROVAS
  06-DREAM-REVIEW
  07-PATTERN-DISCOVERY
  08-COMPILADOS
  09-RESERVA

08-ARTEFATOS-VISUAIS
  00-MOC
  01-CARTAZES-CANONICOS
  02-DIAGRAMAS
  03-CANVAS
  04-EXCALIDRAW
  05-SCREENSHOTS
  06-POSTERS
  07-EXPORTS
  08-PROTOTIPOS
  09-RESERVA

09-RASCUNHO
  00-INBOX
  01-CANVAS-RAW
  02-NOTAS-SEM-TITULO
  03-IDEIAS-SOLTAS
  04-PARA-TRIAR
  05-PARA-LINKAR
  06-PARA-RENOMEAR
  07-PARA-ARQUIVAR
  08-QUARENTENA
  09-RESERVA
```

Esta árvore é **contrato de destino**, não prova de estado local aplicado.

## Propriedades mínimas obrigatórias por tipo

### Pasta/MOC

```yaml
type: MOC
status: active
owner: BRAIN
scope: brain
parent: "[[CentralDark]]"
children: []
index_role: folder-map
proof: none
next_cursor: "linkar filhos materiais e limpar órfãos"
tags: [brain, moc]
```

### Entrada RAW

```yaml
type: RAW
status: raw
source: screenshot | chat | screenpipe | manual | unknown
owner: BRAIN
scope: brain
proof: screenshot | none | receipt
triage_target: unknown
next_cursor: "classificar, linkar MOC, extrair delta útil"
tags: [brain, raw, needs-triage]
```

### Aprendizado/Ouro

```yaml
type: LEARNING
status: validated | linked | triaged
source: chat | github | runtime | screenpipe | manual
owner: BRAIN
scope: memory
proof: receipt | commit | ci | log | screenshot | none
related_prs: []
related_issues: []
next_cursor: ""
tags: [brain, aprendizado]
```

### Canvas / Excalidraw

```yaml
type: CANVAS
status: raw | linked | validated
source: manual | screenshot | unknown
owner: BRAIN
scope: visual
proof: none | screenshot | receipt
parent_moc: "[[08-ARTEFATOS-VISUAIS-MOC]]"
next_cursor: "renomear e linkar ao MOC correto"
tags: [brain, visual, canvas]
```

## Busca e correção: trilho mínimo

Hermes deve primeiro procurar violações, sem escrever:

```text
1. listar pastas nível 1 e nível 2
2. detectar nomes fora de ^[0-9]{2}-
3. detectar pares duplicados por normalização: `00 - Nome` vs `00-NOME`
4. detectar arquivos `Sem título*`
5. detectar md sem frontmatter
6. detectar canvas sem owner/status/source
7. detectar notas sem link para MOC pai
8. gerar plano por lote
9. aplicar patch mínimo só após backup/hash
10. registrar receipt
```

Normalização para detectar duplicação:

```text
lowercase
remover acentos
remover espaços ao redor de hífen
converter múltiplos espaços em um hífen
comparar número + slug
```

## Correção semântica mínima

```text
IF folder_or_note has no number AND material=true:
    assign NN only after parent MOC confirms slot

IF two folders share same semantic slot:
    choose owner by freshest links + most children + root references
    mark other as alias/superseded
    no blind delete

IF note is RAW:
    never promote to canonical without owner + proof

IF note is CANVAS and title starts Sem título:
    set status=raw
    set next_cursor=renomear/classificar/linkar
```

## Grafo caracol esperado

```text
CentralDark
→ 00-MAPA-SISTEMA
→ MOC da área
→ nota material
→ receipt/prova
→ decisão/aprendizado
→ owner GitHub/runtime quando existir
→ volta ao CentralDark
```

Todo nó material deve ter pelo menos:

```text
1 link para pai
1 tipo
1 status
1 owner
1 next_cursor ou proof
```

## O que não fazer

```text
NO_FULL_VAULT_REWRITE=true
NO_BLIND_DELETE=true
NO_CREATE_PARALLEL_BRAIN=true
NO_RENUMBER_EVERYTHING_AT_ONCE=true
NO_MOVE_WITHOUT_HASH=true
NO_ASSUME_SCREENSHOT_FULL_TRUTH=true
NO_CANONICAL_FROM_RAW=true
```

## Lote seguro inicial

Começar por estes pontos visíveis:

```text
A. raiz CentralDark: garantir link para 00-MAPA-SISTEMA/CentralDark-MOC.md
B. resolver duplicidade visual `00 - Mapa do Sistema` vs `00-MAPA-SISTEMA` como owner/alias, sem delete cego
C. 09-RASCUNHO: marcar `Sem título*` e `doc-Sem título*` como raw/needs-triage
D. 02-ENTRADA/01-RAW: garantir frontmatter RAW e link para ENTRADA-MOC
E. 08-ARTEFATOS-VISUAIS: garantir MOC para canvas/excalidraw/cartazes
```

## Veredito

```text
NUMBERING_PATTERN_NOT_FULLY_RESPECTED=OBSERVED_BY_SCREENSHOT
10X10_TAXONOMY_DEFINED=true
LOCAL_PATCH_EXECUTED=false
REPO_HANDOFF_CREATED=true
OBSIDIAN_GRAPH_FIXED=false
HERMES_LOCAL_APPLICATION_REQUIRED=true
UNKNOWN != PASS
```

> Ôxente, agora a cabeça ganha régua: dez portas por corredor, dez gavetas por porta, MOC no batente e propriedade na escritura. Sem isso o grafo canta desafinado; com isso o caracol acha o trilho e a música anda. 🧼🧽🧠🕸️📐🎼📜⚖️
