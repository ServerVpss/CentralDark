---
title: "OLHO BIÔNICO ANTI-FLASH — extensão canônica da Trigger Fabric"
status: "CANÔNICO_CANDIDATO_EM_PR"
authority: "SEGREDO/CHEFE"
owner: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/"
architecture_class: "VISION_RESILIENCE_PROFILE"
versioning_rule: "Evoluir este mesmo perfil; não criar V2/V3/V4 ou engine paralelo"
---

# OLHO BIÔNICO ANTI-FLASH

O `OLHO BIÔNICO ANTI-FLASH` é uma **extensão da Trigger Fabric existente** para matéria visual e fotografia Flambient. Não cria novo cérebro, novo orquestrador, novo workflow, nova autoridade ou runtime concorrente.

```text
OLHO_BIONICO_IS_PROFILE=true
OLHO_BIONICO_IS_NEW_ENGINE=false
OLHO_BIONICO_IS_NEW_ORCHESTRATOR=false
OLHO_BIONICO_IS_NEW_AUTHORITY=false
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## 1. Matéria de origem e limites

A arquitetura absorve somente o delta técnico verificável das matérias fornecidas pelo SEGREDO/CHEFE.

Do PDF `arquitetura_agente_anti_flash.pdf`, o núcleo técnico é:

1. ingestão e alinhamento de RAW/TIFF, com identificação de ambiente/flash e correção de micro-movimentos;
2. visão computacional para segmentar superfícies brilhantes e localizar hotspots de flash;
3. fusão por máscaras de luminosidade, substituindo regiões estouradas com informação limpa da exposição ambiente;
4. QA de balanço de branco/transições e exportação em alta resolução.

O workflow do PDF também exige EXIF para agrupamento, máscara de luminância, inpainting com textura da foto ambiente e ajuste de opacidade para preservar sombras naturais.

As duas artes visuais fornecidas entram como **projeção de arquitetura**, não como prova de runtime. Seus deltas úteis são:

```text
RELÓGIO_DAS_ÚLTIMAS_VAGAS
→ CRISTAL → GATE → CI → SQUASH → PROTEÇÃO

ARQUITETURA_ANTI_FLASH_VISUAL
→ ENTRADAS VISUAIS
→ ANTI-FLASH
→ REDUÇÃO DE RUÍDO
→ ESTABILIZAÇÃO
→ NORMALIZAÇÃO
→ PLACA CENTRAL
→ MONITORES DA CASA
→ CONTROLE DE FRONTEIRA
→ SÍNTESE DE FOTO
```

As referências `Eye Of The Storm` e `Eye of the Chasm` são tratadas apenas como **aliases culturais de leitura**, nunca como autoridade técnica:

```text
EYE_OF_THE_STORM_ALIAS = CENTRO_ESTAVEL_SOB_PERTURBACAO
EYE_OF_THE_CHASM_ALIAS = INSPECAO_PROFUNDA_DE_LACUNA_E_BORDA
CULTURAL_ALIAS_IS_NOT_ENGINE=true
CULTURAL_ALIAS_IS_NOT_PROOF=true
```

## 2. Arquitetura única — pipeline visual determinístico

```text
MATÉRIA VISUAL
RAW | TIFF | JPEG | FRAME | STREAM
        ↓
ASSAY / PROVENIÊNCIA
hash + origem + EXIF + lote + ângulo + exposição
        ↓
ALINHAMENTO
ECC/SIFT/feature alignment quando aplicável
        ↓
PRÉ-PROCESSAMENTO
redução de ruído → estabilização → normalização
        ↓
VISÃO COMPUTACIONAL
segmentação de espelho | vidro | janela | piso polido
        ↓
FLASH MAP
hotspot + máscara de luminância + confiança + borda
        ↓
FUSÃO LOCAL
ambiente limpo → região do flash → inpainting/feather/opacidade
        ↓
QA
transição + balanço de branco + histograma/borda + SSIM quando aplicável
        ↓
DERIVED OUTPUT
imagem final marcada como derivada + receipt
        ↓
MONITORES DA CASA
preview / sala / quarto / oficina / painel central
SOMENTE COM SINAL LIMPO E PROVENIÊNCIA PRESERVADA
```

### 2.1 Stack de execução

O perfil técnico recomendado continua contido:

```text
ORCHESTRATION = Python
MATRIX_ALIGNMENT_AND_MASKS = OpenCV
SEMANTIC_INFERENCE = PyTorch quando modelo neural for necessário
LANGCHAIN = NOT_APPLICABLE
PRIMARY_RUNTIME = EDGE_LOCAL_WORKER
GPU = CUDA|MPS quando disponível e medido
CLOUD = METADATA_TELEMETRY_WEIGHTS_ONLY quando necessário
RAW_TIFF_PAYLOAD_DEFAULT = LOCAL
```

A escolha de biblioteca não prova instalação nem runtime. Dependência só vira `ACTIVE` depois de medida no worker aplicável.

## 3. Placa central = rendezvous, não cérebro novo

A “placa holográfica central” da projeção visual é mapeada para o rendezvous já existente da Trigger Fabric:

```text
INPUTS
→ NORMALIZE_EVIDENCE
→ DEDUPE
→ SAME_TARGET_CONFLICT ? DISCRIMINATING_TEST : CONTINUE
→ VISION_STATE
→ ONE_NEXT_ACTION
→ ONE_WRITER_PER_SCOPE
```

Ela não armazena uma segunda verdade e não ganha autoridade por estar no centro do desenho.

```text
PLACA_CENTRAL = RENDEZVOUS_VIEW
PLACA_CENTRAL_IS_SOURCE_OF_TRUTH=false
GRAPH_OR_PANEL_IS_AUTHORITY=false
```

## 4. Duplo olho: Storm + Chasm

O perfil usa dois movimentos complementares sobre o mesmo alvo.

### EYE OF THE STORM — centro estável

Serve para proteger invariantes enquanto o material visual sofre ruído, tremor, flare, mudança de exposição, falha de modelo ou pressão de I/O.

```text
PERTURBATION
→ PRESERVE_SOURCE
→ PRESERVE_ALIGNMENT_REFERENCE
→ PRESERVE_COLOR_REFERENCE
→ CONTAIN_BAD_REGION
→ ADAPT_MINIMALLY
→ REMEASURE
```

Invariantes:

```text
SOURCE_PROVENANCE
PIXEL_GEOMETRY_REFERENCE
COLOR_REFERENCE
DERIVED_OUTPUT_MARKER
ONE_WRITER_PER_SCOPE
REALITY_IS_JUDGE
```

### EYE OF THE CHASM — inspeção de lacuna

Serve para procurar a ferida que uma média global esconderia:

```text
HOTSPOT
→ BORDA
→ TRANSIÇÃO
→ TEXTURA
→ REFLEXO RESIDUAL
→ COLOR CAST
→ HALO
→ MÁSCARA VAZANDO
→ REGIÃO SEM FONTE AMBIENTE CONFIÁVEL
```

Se faltar base ambiente confiável, a região não é inventada como limpa:

```text
NO_CLEAN_SOURCE_REGION
→ UNKNOWN_OR_REVIEW_REQUIRED
→ NEVER_SYNTHESIZE_AS_PROVEN_CLEAN
```

## 5. Anti-flash sem “fotografar a fotografia”

O sistema não aceita uma saída bonita como prova do processo. O QA precisa medir o artefato final no mesmo lote/alvo.

```text
PREVIEW_LOOKS_GOOD != PASS
NO_VISIBLE_FLASH_TO_MODEL != PASS
SSIM_ONLY != PASS
HISTOGRAM_ONLY != PASS
```

Prova mínima por item:

```text
SOURCE_SET_ID
ALIGNMENT_RESULT
FLASH_MASK_RECEIPT
FUSION_SOURCE_BINDING
QA_METRICS
DERIVED_OUTPUT_HASH
BEFORE_AFTER_REFERENCE
UNKNOWN_REGIONS
```

A saída sintética/derivada permanece marcada como derivada; espelhamento para painel/monitor só ocorre após o gate aplicável.

## 6. Anti-papagaio — visão com checksum e delta

O perfil herda a disciplina de continuidade existente:

```text
BYTE_IDENTICAL → PROCESS_ONCE_KEEP_PROVENANCE
SAME_SCENE_SAME_EVIDENCE_NO_NEW_INFO → REUSE_VALID_RESULT
NEW_EXPOSURE_OR_CHANGED_SOURCE → REVALIDATE_AFFECTED_REGION_ONLY
SAME_FAILURE_NO_NEW_INFO → REUSE_CRYSTAL
```

Logo, “papagaio” aqui significa repetição sem ganho informacional: não reprocessar a mesma matéria como se fosse descoberta nova.

## 7. Controle de fronteira visual

```text
FLASH_AGGRESSIVE
→ CONTAIN_REGION
→ USE_CLEAN_AMBIENT_SOURCE_IF_PROVEN

NOISE_HIGH
→ FILTER_WITH_PARAMETER_RECEIPT
→ PRESERVE_DETAIL_CHECK

ALIGNMENT_DRIFT
→ REALIGN
→ RECHECK_EDGES

SYNTHETIC_OUTPUT
→ MARK_DERIVED
→ KEEP_SOURCE_BINDING

MIRROR_TO_MONITOR
→ ONLY_IF_QA_GATE_PASS
```

Falha crítica bloqueia somente a região/saída afetada quando contenção segura for possível; não precisa derrubar a Casa inteira.

## 8. Relógio de proteção — fechar bypass entre regra e execução

O ciclo de promoção do perfil reaproveita o circuito já existente:

```text
1 CRISTAL
  contrato visual + invariantes + proveniência
        ↓
2 GATE
  verifier determinístico
        ↓
3 CI
  Trigger Fabric Full Package / porta-de-entrada quando aplicável
        ↓
4 SQUASH
  promoção limpa para main quando todos os gates causais aplicáveis passarem
        ↓
5 PROTEÇÃO
  regra fica presa ao owner + teste + workflow existente
        ↺
  DRIFT → RECONCILIAR
```

```text
RULE_WITHOUT_CONSUMER = NOT_CRYSTALIZED
DOC_ONLY = NOT_RUNTIME
CI_QUEUED = NOT_PASS
MERGED = NOT_DEPLOYED
DEPLOY = OUT_OF_SCOPE_THIS_MISSION
```

## 9. Contraprovas obrigatórias do perfil

O pacote/gate deve conseguir quebrar pelo menos estas regressões:

```text
1. arquivo do perfil ausente;
2. perfil promovendo novo engine/orquestrador;
3. ausência de marcação DERIVED_OUTPUT;
4. ausência de UNKNOWN quando não existe fonte ambiente limpa;
5. painel/monitor tratado como fonte da verdade;
6. alias cultural tratado como mecanismo técnico;
7. CI/merge confundido com runtime/deploy.
```

## 10. Fixed point do escopo

```text
PROFILE_IN_CANONICAL_FAMILY
AND PACKAGE_CONSUMES_PROFILE
AND VERIFIER_REQUIRES_PROFILE_MARKERS
AND ARCHITECTURE_DIAGRAM_REFERENCES_PROFILE
AND NO_NEW_ENGINE
AND NO_NEW_WORKFLOW
AND NO_DEPLOY
AND CI_APPLICABLE_GREEN
AND SQUASH_MERGED_TO_MAIN
AND MAIN_REMEASURED
→ OLHO_BIONICO_ANTI_FLASH_FIXED_POINT
```

Até o merge e remedição da `main`, o estado é candidato em PR; depois do merge ele pode ser promovido a canônico efetivo do repositório. Runtime local de OpenCV/PyTorch continua separado e só vira PASS quando o worker local for realmente medido.
