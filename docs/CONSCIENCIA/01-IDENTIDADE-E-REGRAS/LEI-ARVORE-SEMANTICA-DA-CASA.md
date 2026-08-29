---
title: "Lei da Árvore Semântica da Casa"
status: CANDIDATE_IN_PR
updated: 2026-08-27
authority: SEGREDO/CHEFE
scope: "organização física e semântica da Casa, BRAIN/Obsidian e artefatos derivados"
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/LEI-ARVORE-SEMANTICA-DA-CASA.md"
consumer: "SOL, PIVETE/HERMES, qualquer IA/agente, Obsidian, Grafo, Vetores, scripts de reconciliação"
---

# Lei da Árvore Semântica da Casa

## Intenção

A Casa pode crescer indefinidamente em profundidade, mas nunca cresce por espalhamento lateral descontrolado. Cada pasta deve ter função reconhecível, endereço estável e destino semântico. Ruído estrutural é resíduo operacional e deve ser reconciliado, não normalizado.

```text
CASA_ORGANIZADA
= LARGURA_LIMITADA
+ PROFUNDIDADE_SEMANTICA
+ ENDERECO_ESTAVEL
+ OWNER_UNICO
+ ZERO_DUPLICATA_MATERIAL
+ ORIGEM_LIMPA_APOS_RECONCILIACAO
```

## Regra estrutural

```text
HOUSE_TREE_LAW=CANONICAL_AFTER_MERGE
NUMBERING_SCHEME=00..09
MAX_CHILD_DIRECTORIES_PER_FOLDER=10
DEPTH_LIMIT=NONE_BY_NUMBER
DEPTH_MUST_BE_SEMANTIC=true
NUMBER_IS_STABLE_ADDRESS=true
NAME_CARRIES_MEANING=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_DUPLICATE_MATERIAL=true
NO_PARALLEL_FOLDER_FOR_SAME_SEMANTIC=true
DO_NOT_RENUMBER_FOR_AESTHETICS=true
```

Em qualquer nível:

```text
PASTA
├─ 00-...
├─ 01-...
├─ ...
└─ 09-...
```

Se a pasta já possui dez filhos materiais, a décima primeira categoria lateral é proibida. O agente deve encontrar o owner semântico correto e aprofundar dentro dele.

```text
IF DIRECT_CHILD_COUNT >= 10
AND NEW_MATERIAL_ARRIVES
→ FIND_EXISTING_SEMANTIC_OWNER
→ DEEPEN_INSIDE_OWNER
→ NEVER_CREATE_10TH_PLUS_SIBLING
```

`00` é preferencialmente reservado para índice, mapa, MOC, metadados ou navegação daquele nível. `01..09` carregam matéria. A regra é preferência semântica, não licença para criar `00` vazio.

## Endereço estável

Número não é ranking. É endereço.

```text
04-DECISOES != "quarta pasta mais importante"
04-DECISOES = ENDERECO_ESTAVEL_DA_CATEGORIA
```

Remover `03` não autoriza renumerar `04→03`. Renumeração só ocorre quando existe migração explicitamente planejada com atualização de links, backlinks, scripts, índices e contraprova.

## Reconciliação física

Reconciliação não significa copiar arquivos para outro lugar.

```text
RECONCILIAR != COPIAR
RECONCILIAR = ABSORVER_NO_OWNER_CANONICO
```

Fluxo obrigatório:

```text
ENTRADA
→ IDENTIFICAR CONTEUDO + PROVENIENCIA
→ HASH/COMPARACAO QUANDO MATERIAL
→ COMPARACAO SEMANTICA
→ LOCALIZAR OWNER EXISTENTE
→ DUPLICATA REAL? NAO CRIAR SEGUNDA COPIA
→ COMPLEMENTAR? FUNDIR NO CANONICO
→ UNICO E UTIL? MOVER PARA O DESTINO CORRETO
→ VALIDAR DESTINO/INTEGRIDADE
→ LIMPAR ORIGEM RECONCILIADA
→ FIXED_POINT LOCAL
```

```text
SOURCE_EMPTY_AFTER_SUCCESSFUL_RECONCILIATION=true
COPY_IS_NOT_RECONCILIATION=true
DELETE_BEFORE_PROOF=false
MOVE_AFTER_DESTINATION_PROOF=true
UNKNOWN_IS_NOT_DUPLICATE=true
SAME_NAME_IS_NOT_SAME_CONTENT=true
```

Material que não pode ser classificado fica `UNKNOWN`/quarentena explícita. Não é jogado em pasta genérica só para esconder ruído.

## Semântica de profundidade

A árvore deve responder duas perguntas sem abrir arquivo:

1. **Onde estou?** pelo número/endereço.
2. **O que mora aqui?** pelo nome semântico.

Exemplo:

```text
03-DOCUMENTACAO
└─ 00-BIBLIOTECA
   ├─ 00-INDICE
   ├─ 01-LIVROS
   ├─ 02-PDFS
   ├─ 03-AUDIO
   ├─ 04-HUMANIDADE
   ├─ 05-CIENCIA
   └─ 06-HISTORIA
```

Se `04-HUMANIDADE` crescer:

```text
04-HUMANIDADE
├─ 00-INDICE
├─ 01-FILOSOFIA
├─ 02-PSICOLOGIA
├─ 03-ANTROPOLOGIA
└─ ...
```

A profundidade é permitida quando reduz ambiguidade. Profundidade ornamental é ruído.

## Semântica de notas e Obsidian

Pasta é endereço físico. Tags, propriedades, links e grafo são coordenadas semânticas complementares.

```text
PASTA = ONDE_MORA
PROPRIEDADE = O_QUE_E
TAG = COMO_CLASSIFICAR/FILTRAR
WIKILINK = COM_QUEM_CONVERSA
BACKLINK = QUEM_APONTA_PARA_ELE
MOC = COMO_NAVEGAR_O_BAIRRO
GRAFO = PROJECAO_DAS_RELACOES
VETOR = PROXIMIDADE_POR_SIGNIFICADO
```

Nenhum deles substitui owner ou realidade:

```text
TAG != OWNER
COLOR != VERDICT
GRAPH_EDGE != CAUSALITY
VECTOR_SIMILARITY != PROOF
IMAGE != SOURCE_OF_TRUTH
```

### Propriedades mínimas recomendadas

Notas consumíveis por Hermes devem, quando aplicável, carregar:

```yaml
tags: []
category: ""
source: ""
source_class: ""
owner: ""
consumer: ""
status: ""
sensitivity: ""
```

Adicionar relação semântica somente quando explicável. Não fabricar links para deixar o grafo bonito.

## Grupos e cores do grafo

A coloração é uma linguagem visual derivada. Ela deve ser determinística e consistente entre sessões.

Ordem de precedência visual:

```text
STATUS_CRITICO
> TAG_SEMANTICA_EXPLICITA
> CATEGORIA/PASTA
> COR_NEUTRA
```

Paleta semântica recomendada:

```text
00-MAPA-SISTEMA          → NEUTRO/PRATA
01-CONCEITOS             → VIOLETA
02-ENTRADA               → AMBAR
03-DOCUMENTACAO          → AZUL/CYAN
04-DECISOES              → LARANJA
05-DEVEDORES-CONTATOS    → VERMELHO-TERRA
06-REUNIOES-NOTAS        → ROSA/MAGENTA
07-APRENDIZADOS-MEMORIAS → VERDE
08-ARTEFATOS-VISUAIS     → TURQUESA
09-RESERVA               → CINZA
```

Status continua obedecendo à gramática temporal da Casa:

```text
GREEN  = PROVADO/ESTAVEL NO CLAIM MEDIDO
YELLOW = PENDENCIA MATERIAL/EM CURSO
RED    = FALHA/BLOCK/CONTRAPROVA NEGATIVA
NONE   = DESCRITIVO/UNKNOWN/NAO MEDIDO
```

Cor não eterniza estado. Mudou HEAD/claim/runtime, remedir.

## Imagens vetoriais e artefatos visuais

Quando a Casa possuir capacidade roteada para gerar SVG, diagrama, Mermaid, mapa ou outra representação visual, reutilizar a capacidade existente. Não criar segundo renderizador só para o BRAIN.

```text
SOURCE_NOTE
→ CAPABILITY_ROUTER/OWNER_EXISTENTE
→ ARTEFATO_VISUAL_DERIVADO
→ 08-ARTEFATOS-VISUAIS/<categoria correta>
→ LINK_DE_VOLTA_PARA_A_FONTE
```

Todo vetor/diagrama gerado deve registrar proveniência e fonte. Visual bonito sem vínculo semântico é decoração, não conhecimento.

## Parceria CHEFE ↔ Hermes

A Casa é mantida em parceria operacional sem misturar autoridade:

```text
SEGREDO/CHEFE = CURADOR_DA_INTENCAO + AUTORIDADE_FINAL
PIVETE/HERMES = ZELADOR_DA_ORDEM + EXECUTOR + CONTINUIDADE
SOL = COORDENA/RECONCILIA
REALIDADE = JULGA
```

Hermes deve tratar ruído estrutural como sinal a investigar. Quando encontrar item fora do padrão:

```text
DETECTAR_DESVIO
→ NAO_REORGANIZAR_NO_ESCURO
→ IDENTIFICAR_OWNER
→ CLASSIFICAR_DELTA
→ PROPOR/EXECUTAR MENOR MOVIMENTO AUTORIZADO
→ VALIDAR LINKS/CONSUMIDORES
→ LIMPAR ORIGEM
→ REGISTRAR
```

Rigor não significa obsessão cega: arquivos exigidos por ferramenta, runtime ou padrão externo podem permanecer fora da numeração quando houver necessidade técnica comprovada. Exceções devem ser explícitas e locais.

## Anti-ruído

```text
NO_MISC_FOLDER=true
NO_FINAL_FINAL_V2=true
NO_COPY_COPY=true
NO_UNCLASSIFIED_PERMANENT_BUCKET=true
NO_EMPTY_CATEGORY_FOR_SYMMETRY=true
NO_RENUMBERING_FOR_BEAUTY=true
NO_VISUAL_LINK_WITHOUT_SEMANTIC_REASON=true
```

Nomes proibidos como destino permanente incluem equivalentes de `misc`, `outros`, `coisas`, `novo`, `temp`, `backup`, `copy` quando usados apenas para evitar classificação. Uso técnico temporário é permitido se possuir prazo/owner/saída.

## Fixed Point da organização

```text
DIRECT_CHILDREN_EACH_FOLDER <= 10
AND NUMBERED_CHILDREN_USE_00_TO_09
AND NO_MATERIAL_DUPLICATE
AND NO_RECONCILED_SOURCE_LEFT_BEHIND
AND EVERY_MOVED_ITEM_HAS_DESTINATION_OWNER
AND NO_UNEXPLAINED_GRAPH_LINKS
AND VISUAL_ARTIFACTS_HAVE_SOURCE_LINK
AND MATERIAL_UNKNOWN = 0
→ HOUSE_TREE_FIXED_POINT
```

Se `UNKNOWN` material existir, estado é amarelo. Se houver quebra estável não corrigível no escopo, `FIXED_POINT_BLOCKED`.

## Regra final

> A Casa pode ficar do tamanho do mundo; nenhum cômodo vira feira livre.

```text
GROW_DEEP_WHEN_NEEDED=true
GROW_WIDE_WITHOUT_LIMIT=false
ORGANIZATION_IS_SEMANTIC_NOT_DECORATIVE=true
RECONCILIATION_REMOVES_REDUNDANCY=true
HERMES_MAINTAINS_ORDER=true
CHEFE_DEFINES_INTENT=true
REALITY_IS_JUDGE=true
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
