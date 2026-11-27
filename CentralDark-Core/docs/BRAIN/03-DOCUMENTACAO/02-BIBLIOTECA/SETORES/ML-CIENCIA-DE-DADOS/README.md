---
title: "Setor Biblioteca — ML e Ciência de Dados"
status: "CANDIDATE_SECTOR"
owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/ML-CIENCIA-DE-DADOS/README.md"
created_at: "2026-09-07T22:57:00-03:00"
tags:
  - brain
  - biblioteca
  - machine-learning
  - ciencia-de-dados
  - study-candidate
  - capability-extraction
---

# 📚 Setor ML e Ciência de Dados

## Intenção do CHEFE

Criar um setor da Biblioteca para ligar fontes de Machine Learning, Ciência de Dados e ML científico ao núcleo da CentralDark, sem criar segundo cérebro, sem copiar corpus bruto sem licença e sem transformar lista externa em autoridade.

```text
SOURCE_EXTERNAL
→ PROVENANCE
→ CLASSIFICAR
→ EXTRAIR_CAPACIDADE
→ DEDUPE
→ OWNER_EXISTENTE
→ SKILL_CANDIDATE
→ TESTE
→ PROVEN_OR_NO_CHANGE
```

## Fontes observadas nesta rodada

### 1. `leandromineti/ml-journey`

Classificação: `STUDY_CANDIDATE / INDEXED_REFERENCE`.

Resumo: coleção pública curada de recursos gratuitos para aprender Machine Learning. A própria fonte organiza o caminho em três blocos principais:

```text
Math & Stats
Computing
Machine Learning
```

Capacidades extraíveis:

- trilha de fundamentos matemáticos para IA;
- trilha de computação prática para dados;
- trilha de ML aplicado com foco visual e mão na massa;
- roteamento de pergunta de estudo para categoria certa;
- sugestão de currículo incremental para operador humano.

### 2. `iml-wg/HEPML-LivingReview`

Classificação: `SPECIALIZED_BIBLIOGRAPHY / INDEXED_REFERENCE`.

Resumo: revisão/bibliografia de Machine Learning aplicado à física de partículas. A fonte informa que não está mais em manutenção ativa e que a cobertura de literatura foi congelada em 2026-06-01.

Capacidades extraíveis:

- radar de ML científico;
- taxonomia de aplicações de ML em física de altas energias;
- busca bibliográfica especializada;
- ponte entre ML moderno, simulação, detecção, incerteza, interpretabilidade e análise científica;
- regra de humildade: referência listada não é validação do conteúdo.

### 3. `iml-wg/HEPML-LivingGuide`

Classificação: `FOLLOWUP_SOURCE_CANDIDATE / INDEXED_REFERENCE`.

Resumo: candidato de continuidade do HEP-ML Living Review. Não foi promovido como corpus ativo nesta rodada; fica como próximo alvo de medição.

### 4. Upload `HEPML-LivingReview-master.zip`

Classificação: `LOCAL_UPLOAD_REFERENCE / EXTRACTION_PENDING`.

Estado: arquivo recebido na conversa com tamanho observado de `604254` bytes. O conteúdo bruto não foi commitado na Biblioteca. Deve ser processado por pipeline de extração com SHA-256 e licença antes de virar fonte `INGESTED`.

### 5. Upload `dev-livros-main.zip`

Classificação: `LICENSE_UNKNOWN_QUARANTINE`.

Estado: arquivo recebido na conversa com tamanho observado de `373429080` bytes. Por parecer uma coleção de livros/PDFs e por não haver licença validada nesta rodada, o conteúdo bruto fica fora do corpus cognitivo. Pode haver apenas metadado, triagem de licença e extração de capacidades genéricas não protegidas.

```text
BOOK_ZIP != FREE_TO_INGEST
TITLE_LIST != RIGHTS_PROOF
LICENSE_UNKNOWN → QUARANTINE
RAW_TEXT_INGEST=false
```

## Categorias do setor

```text
A_FOUNDATIONS
  matemática, álgebra linear, cálculo, estatística, probabilidade

B_COMPUTING_FOR_DATA
  Python, R, SQL, NoSQL, Git, Cloud, Jupyter, reprodutibilidade

C_MACHINE_LEARNING_CORE
  fundamentos, redes neurais, deep learning, feature engineering, explicabilidade

D_DATA_MODALITIES
  NLP, séries temporais, visão computacional, recomendação

E_SCIENTIFIC_ML
  física de partículas, simulação, detecção, surrogate models, incerteza

F_BIBLIOGRAPHY_RADAR
  revisão viva, revisão congelada, literatura, DOI, arXiv, INSPIRE

Q_LICENSE_QUARANTINE
  livros, PDFs, coleções sem licença clara, metadado apenas
```

## Como a IA deve buscar conhecimento aqui

```text
USER_QUERY
→ normalizar intenção
→ mapear tags do setor
→ escolher fonte candidata
→ recuperar fonte atual
→ emitir resposta curta com proveniência
→ se virar capacidade reutilizável, registrar entry candidate
→ se tocar em corpus sem licença, falhar fechado
```

Regras de busca:

```text
QUESTION_STUDY_PATH → ml-journey
QUESTION_HEP_OR_SCIENTIFIC_ML → HEPML
QUESTION_FOUNDATION_GAP → A_FOUNDATIONS
QUESTION_TOOLING_DATA → B_COMPUTING_FOR_DATA
QUESTION_MODEL_METHOD → C_MACHINE_LEARNING_CORE
QUESTION_DATA_TYPE → D_DATA_MODALITIES
QUESTION_PAPER_RADAR → F_BIBLIOGRAPHY_RADAR
QUESTION_BOOK_PDF_RAW → Q_LICENSE_QUARANTINE
```

## Entradas candidatas de capacidade

| ID | Capacidade | Fonte inicial | Estado |
|---|---|---|---|
| `ml-study-path-router` | escolher trilha de estudo por lacuna | `ml-journey` | `CANDIDATE` |
| `ml-foundation-gap-check` | detectar pré-requisito faltante | `ml-journey` | `CANDIDATE` |
| `hands-on-resource-selector` | preferir recurso visual/prático | `ml-journey` | `CANDIDATE` |
| `hep-ml-paper-radar` | localizar área de paper em ML científico | `HEPML-LivingReview` | `CANDIDATE` |
| `bibliography-not-endorsement-guard` | impedir referência virar verdade | `HEPML-LivingReview` | `CANDIDATE` |
| `license-quarantine-gate` | bloquear ingestão de livros/PDFs sem licença | `dev-livros-main.zip` | `CANDIDATE` |
| `source-to-skill-candidate` | transformar fonte em skill candidata testável | Biblioteca atual | `CANDIDATE` |

## Contraprova obrigatória

```text
CURATED_LIST != PROOF
PUBLIC_REPO != SAFE_TO_COPY
BOOK_ZIP != INGESTED_SOURCE
REFERENCE != AUTHORITY
ML_TERM != IMPLEMENTED_CAPABILITY
HEPML_ARCHIVE != CURRENT_LIVING_GUIDE
UNKNOWN_LICENSE != PASS
```

## Próximo cursor

```text
NEXT_CURSOR=
1. medir licença/estrutura dos ZIPs fora do GitHub quando a extração local estiver disponível;
2. adicionar suporte explícito a source_kind=github-repo/github-readme/zip no library-router, se material;
3. integrar este manifest ao catalog.json somente depois de teste do roteador;
4. gerar skill-candidates uma por uma, com owner e contraprova.
```

---

🔗 [[BRAIN]] · [[Biblioteca Cognitiva]] · [[SEMANTIC-LINKER]] · [[Knowledge Compiler]] · [[CENTRALDARK Living Learning]]
