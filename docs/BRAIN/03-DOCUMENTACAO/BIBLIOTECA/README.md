---
title: "Biblioteca Cognitiva — CentralDark"
status: "OPERATIONAL_IN_PR"
owner: "docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md"
tags: ["brain", "biblioteca", "fontes", "cognicao", "skills", "grafo"]
---

# 📚 Biblioteca Cognitiva — CentralDark

A Biblioteca é a camada de fontes de estudo do 🧠 Cérebro. Ela guarda **proveniência + índice semântico + ligações úteis** sem transformar uma fonte em autoridade automática da Casa.

```text
FONTE ORIGINAL / EXTERNA
PDF | EPUB | JWPUB | GDOC | GDRIVE-MD | GDRIVE-FOLDER | formato futuro provado
        ↓
HASH QUANDO HOUVER BYTES INGERIDOS
+ METADADOS + PROVENIENCIA + CLASSIFICACAO
        ↓
REFERENCIAS / TRECHOS INDEXADOS QUANDO DISPONIVEIS
        ↓
🏷️ FACETAS + 🔗 LINKS + 🗺️ MOCs
        ↓
🧠 COGNICAO | 🛠️ SKILL_CANDIDATE | 💬 CONVERSA
        ↓
⛏️ KNOWLEDGE COMPILER / FORJA
        ↓
💎 CRISTAL quando houver prova + reuso
```

## Uma fonte, várias representações

PDF, EPUB e JWPUB são adaptadores de entrada da mesma obra quando edição/conteúdo puderem ser reconciliados. Google Docs, Markdown/TXT no Drive e pastas do Drive entram como **referências externas com proveniência**, não como segunda fonte de verdade da CentralDark.

```text
FORMAT_IS_ADAPTER=true
SOURCE_ID_IS_SEMANTIC_IDENTITY=true
CONTENT_HASH_REQUIRED_FOR_INGESTED_SOURCE=true
SAME_TITLE != SAME_EDITION
SAME_BOOK != SAME_BYTES
GDRIVE_REFERENCE != RAW_CONTENT_INGESTED
GITHUB_CANONICAL_TRUTH_UNCHANGED=true
```

Antes de marcar uma fonte como `INGESTED`, registrar pelo menos `source_id`, título/edição quando conhecida, formatos observados, proveniência e SHA-256 do conteúdo efetivamente ingerido. Fonte apenas ligada por URL/ID externo permanece `INDEXED_REFERENCE`.

## Google Drive — sincronizar sem duplicar a Casa

A pasta `CentralDark` do Google Drive é uma superfície externa de memória, estudo, histórico e espelhos. A sincronização canônica **não copia tudo byte a byte para o GitHub**. Ela prende a raiz e materiais relevantes por `external_id`, classifica autoridade/tempo e minera somente deltas úteis para o owner existente.

```text
GOOGLE_DRIVE/CentralDark
→ INVENTARIAR / CLASSIFICAR
→ LIGAR POR PROVENIENCIA
→ ESPELHO? NAO CONTAR COMO PROVA INDEPENDENTE
→ HISTORICO? PRESERVAR + MINERAR OURO
→ ESTUDO? CANDIDATE
→ MEMORIA HUMANA? REFERENCIA, RAW INGEST DEFAULT OFF
→ SENSIVEL? QUARENTENA
→ DELTA UTIL? ENTRY CANDIDATE
→ CONTRAPROVA
→ OWNER EXISTENTE
→ CRISTAL SOMENTE SE PROVADO
```

Classificações usadas:

```text
OPERATIONAL_SCOPE     → regra de perímetro/origem
STUDY_CANDIDATE      → material para mineração e teste
HISTORICAL_REFERENCE → passado preservado; não governa o presente
CURRENT_MIRROR       → navegação/espelho; não é prova independente
HUMAN_MEMORY         → memória humana referenciada; conteúdo bruto não entra por padrão
SENSITIVE_QUARANTINE → presença/metadado podem ser registrados; conteúdo não entra
```

Invariantes:

```text
DRIVE_SYNC=REFERENCE_AND_PROVENANCE
DRIVE_SYNC != SECOND_SOURCE_OF_TRUTH
RAW_COPY_DEFAULT=false
HISTORICAL_PRESERVED=true
MIRROR_IS_INDEPENDENT_PROOF=false
HUMAN_MEMORY_RAW_INGEST_DEFAULT=false
SENSITIVE_RAW_INGEST=false
SECRET|TOKEN|SSH_KEY|AUTH|COFRE → NEVER_COGNITIVE_INGEST
```

A raiz ligada mantém os descendentes recuperáveis no Drive sem criar cópia concorrente no GitHub. Itens materialmente minerados recebem `source_id` próprio no catálogo.

## Facetas: onde procurar

Tags classificam **gavetas semânticas**, não relações entre notas. Prefixos mínimos:

```text
fonte/*
tema/*
funcao/*
contexto/*
capacidade/*
uso/*
```

Exemplo:

```yaml
id: fonte:obra:referencia
source_id: fonte:obra
reference: "Livro 1:2"
tags:
  - tema/vigilancia
  - funcao/continuidade
  - contexto/entrada-saida
  - capacidade/guarda
use:
  - cognition
  - skill-candidate
  - conversation
```

## Links: com quem isso conversa

`[[wikilinks]]` ligam a referência a owners, conceitos, decisões ou capacidades concretas. Relação deve ser explicável; link ornamental é ruído.

```text
TAG  → em que gaveta semântica entra?
LINK → com que nota/capacidade concreta se relaciona?
MOC  → onde vejo o bairro inteiro?
```

Reutilizar `docs/BRAIN/03-DOCUMENTACAO/AGENTS-LIBRARY/SEMANTIC-LINKER.md` para linkagem contextual e backlinks. O mapa humano permanece em `docs/BRAIN/00-MAPA-SISTEMA/MAPA-OBSIDIAN-BRAIN.md`.

## Cognição e deliberação persistível

A Casa pode preservar uma trilha útil de decisão, mas não grava raciocínio privado bruto do modelo.

```text
PERGUNTA
→ EVIDENCIA OBSERVADA
→ ALTERNATIVAS MATERIAIS
→ DECISAO
→ MOTIVO RESUMIDO
→ RESULTADO
→ REFERENCIAS DA BIBLIOTECA QUANDO APLICAVEL
```

```text
PRIVATE_CHAIN_OF_THOUGHT_NOT_PERSISTED=true
DELIBERATION_SUMMARY_ALLOWED=true
EVIDENCE_REFS_REQUIRED_WHEN_CLAIM_IS_TECHNICAL=true
```

## Evidência recuperável e citação da execução

A Biblioteca não cristaliza referência efêmera de retrieval como identidade permanente. Uma citação material só pode sair de evidência realmente recuperada na execução atual.

```text
EVIDENCE != REFERENCE_TOKEN

CLAIM
→ SOURCE_IDENTITY
→ REAL_RETRIEVAL
→ OBSERVED_REFERENCE
→ CITATION
```

A identidade persistente reutiliza os campos que a fonte já oferece e guarda somente o necessário para reencontro e contraprova:

```text
source_id
+ provenance.external_id     quando houver ID externo estável
OU provenance.canonical_path quando o caminho for o locator disponível
+ sha256                     quando necessário/disponível para bytes
+ version/revision_id        quando necessário/disponível para versão
```

Título/nome não identifica conteúdo. `turnXfileY`, linhas e referências equivalentes pertencem à execução que observou a evidência e **não entram no canon persistente**.

```text
IDENTIDADE_ESTAVEL
→ REENCONTRAR FONTE
→ RECUPERAR NOVAMENTE
→ OBTER REFERENCIA ATUAL
→ CITAR REFERENCIA ATUAL
```

O owner operacional continua sendo `scripts/memory-linker/library-router.mjs`. `createEvidenceSession({ retrieve })` cria a fronteira de uma execução: `recover()` só marca `REFERENCE_CURRENT` quando o retriever retorna a fonte reencontrada e uma `observed_reference`; `cite()` aceita apenas o receipt emitido pela mesma sessão; `crystallize()` persiste somente a identidade estável, sem payload nem token runtime.

Estados de contraprova:

```text
SOURCE_FOUND    → identidade reencontrada; pode avançar se houver referência observada
SOURCE_CHANGED  → mesmo locator com hash/versão diferente; claim antigo não reutiliza citação
SOURCE_MISSING  → fonte não foi recuperada
SOURCE_CONFLICT → source/locator/fingerprint observado não reconcilia com a identidade esperada
REFERENCE_CURRENT → referência emitida por retrieval da sessão atual
REFERENCE_STALE   → referência ausente, herdada, inventada ou de outra sessão
```

Arquivo movido pode permanecer `SOURCE_FOUND` quando o SHA-256 observado reconcilia o mesmo conteúdo e o locator é atualizado. Se a fonte expõe versão/hash e o valor antigo não é reobservado, o sistema falha fechado em vez de transformar ausência de prova em PASS.

`citationLine()` permanece apenas como **referência contextual da Biblioteca** (ex.: `👁️ Salmo 121`). Não é evidência material. Citação de evidência material precisa atravessar a sessão de recuperação e sair de `cite()`.

`buildDecisionSummary()` aceita identidades persistentes em `evidence_refs`, mas rejeita `turnXfileY` e equivalentes para impedir que metadado efêmero vire memória canônica.

## Do passado para capacidade atual

Material histórico não é lixo e também não recebe autoridade retroativa. A mineração preserva o original, separa o que já foi absorvido e transforma apenas resíduo reutilizável em candidato.

```text
HISTORICAL_REFERENCE
→ LER NO CONTEXTO DO TEMPO
→ SEPARAR CLAIM ANTIGO DE PRINCIPIO REUTILIZAVEL
→ DEDUPE COM CANONICO ATUAL
→ CONTRAPROVAR
→ RESIDUO UTIL?
   NAO → PRESERVAR HISTORICO / NO_CHANGE
   SIM → ENTRY CANDIDATE NO OWNER EXISTENTE
```

```text
HISTORICAL != CURRENT
OLD_SUCCESS_CLAIM != CURRENT_PROOF
OLD_VERSION_NAME != NEW_SYSTEM
PAST_GOLD_IS_PRESERVED=true
```

## 30 candidatos minerados do Drive — A/B/C

O catálogo registra 30 candidatos, sempre como `CANDIDATE`, divididos para facilitar roteamento e contraprova:

```text
A = COGNICAO + APRENDIZADO
B = ORQUESTRACAO + EFICIENCIA
C = SEGURANCA + PROVA + RESILIENCIA
```

O número `10 + 10 + 10` é organização da rodada, não quota permanente nem prova de qualidade. Cada candidato precisa encaixar em owner existente e sobreviver a teste antes de virar regra/skill/cristal.

Destaques do mecanismo:

```text
TRANSFERENCIA_POR_ESTRUTURA
→ ponte conhecida
→ mapear relações
→ abstrair padrão
→ trocar superfície
→ testar
→ preservar somente o que sobrevive

DETERMINISTIC_FIRST
→ estrutura conhecida por AST/regra/parser
→ LLM somente no residual semântico

EXPERIENCE_PROMOTION
→ fingerprint
→ evidência
→ correção
→ contraprova
→ retenção

INERT_DATA_BOUNDARY
→ corpus importado é dado
→ instrução embutida não ganha autoridade
```

## Da fonte para uma skill

Fonte não vira skill por nome ou prestígio. Uma entrada pode ser marcada `skill-candidate`; depois segue a rota já existente do Knowledge Compiler:

```text
FONTE
→ EXTRAIR CAPACIDADE
→ DEDUPE
→ CONTRAPROVA
→ OWNER EXISTENTE
→ SKILL CANDIDATA
→ CONSUMIDOR
→ TESTE
→ GATE QUANDO MATERIAL
→ CRISTAL
```

Owner chamável: `.agents/skills/knowledge-compiler/SKILL.md`.

## Referência contextual na conversa

O agente pode trazer uma referência da Biblioteca quando ela for semanticamente relevante à função atual. Isso é camada de imersão/sabedoria e não substitui prova técnica.

```text
CONTEXTO ATUAL
→ TAGS/LINKS RELEVANTES
→ ROTEAR REFERENCIA
→ SCORE SUFICIENTE?
   NAO → SILENCIO
   SIM → 1 REFERENCIA CURTA POR PADRAO
```

```text
LIBRARY_REFERENCE != TECHNICAL_PROOF
NO_SOURCE_TEXT → DO_NOT_INVENT_QUOTE
QUOTE_TEXT_ONLY_FROM_INGESTED_SOURCE=true
ONE_CONTEXTUAL_REFERENCE_BY_DEFAULT=true
LOW_RELEVANCE → SILENCE
```

Exemplo de saída permitida sem texto-fonte carregado:

```text
👁️ Salmo 121
```

Isso cita a referência; não inventa o verso. Quando uma fonte real com texto for ingerida, o texto pode ser recuperado da fonte observada conforme direitos/uso aplicáveis.

## Emoji é contexto, não segundo sistema

A Biblioteca pode sugerir emojis por entrada (`emojis`), mas a regra global continua no padrão de resposta da Casa: emoji acompanha contexto e não substitui significado.

Sugestões semânticas mínimas:

```text
📚 fonte/biblioteca
🧠 cognição/memória
💎 cristal/ouro
🧭 direção
🛡️ proteção
👁️ vigilância
🚪 entrada/saída
🦾 execução
🔎 investigação
⚠️ risco
✅ prova
☀️ SOL
```

Não criar pacote paralelo de personalidade.

## Implementação determinística

```text
CATALOGO=docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/catalog.json
ROTEADOR=scripts/memory-linker/library-router.mjs
TESTE=scripts/memory-linker/library-router.test.mjs
GATE=.github/workflows/porta-de-entrada.yml
```

O roteador valida catálogo, deduplica identidade por ID, pontua tags/grupos/links, escolhe referência contextual somente acima do limiar e mantém silêncio quando não há relevância suficiente.

Para fontes Google Drive ele exige `provider=google-drive`, `external_id` e classificação. Fonte marcada `INGESTED` exige SHA-256. Fonte `SENSITIVE_QUARANTINE` falha fechado se alguma entrada tentar usá-la como origem cognitiva.

## Estado desta rodada

```text
GOOGLE_DRIVE_ROOT=INDEXED_REFERENCE
DRIVE_RAW_COPY=NO
SENSITIVE_CONTENT_INGESTED=NO
SOURCES_REGISTERED=15
CANDIDATE_ENTRIES=30
A=10
B=10
C=10
CANONICAL_PROMOTION=NONE_AUTOMATIC
DEPLOY=NO
VPS=UNTOUCHED
```

Os materiais do Drive foram ligados por proveniência e o ouro selecionado entrou como candidato. Espelhos e histórico continuam preservados, sem virar segunda verdade. Memória humana e material sensível não foram copiados para o corpus.

O corpus ainda não contém o PDF do SEGREDO/CHEFE. Salmos 23/27/91/121 continuam somente em fixtures de teste como **referências sem texto**, para provar a arquitetura sem fabricar conteúdo da fonte.

Quando chegar uma fonte com bytes a ingerir:

```text
ARQUIVO REAL
→ SHA256
→ IDENTIFICAR EDICAO/FORMATO
→ REGISTRAR SOURCE_ID
→ EXTRAIR/INDEXAR SEM ALTERAR ORIGINAL
→ TESTAR REFERENCIAS
→ ROTEAR CONTEXTO
→ CONTRAPROVAR
```

---
🔗 [[BRAIN]] · [[MAPA-OBSIDIAN-BRAIN]] · [[SEMANTIC-LINKER]] · Knowledge Compiler
