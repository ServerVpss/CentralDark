---
name: centraldark-pattern-intelligence
description: "Adaptive pattern intelligence motor for CentralDark"
version: "1.0.0"
author: "Hermes Agent"
tags: [pattern-intelligence, adaptive-learning, crystallization]
---

# ================================================================
# CENTRALDARK · ADAPTIVE PATTERN INTELLIGENCE
# COMANDO MESTRE DE APRENDIZADO OPERACIONAL E CRISTALIZAÇÃO
# ================================================================

command:
  trigger: "!CENTRALDARK"
  aliases:
    - "#CENTRALDARK"
    - "#ACORDAR"
    - "!CALIBRAR"
    - "#CRISTALIZAR"
    - "#REGISTRA"

  objective: >-
    Observar continuamente o sistema, código, documentação, erros,
    conversas, decisões, correções, testes, padrões de uso, nomenclatura,
    arquitetura, fluxos e hábitos operacionais.
    Descobrir padrões reutilizáveis.
    Testar padrões.
    Detectar mudança de padrão.
    Generalizar apenas o que sobreviver à evidência.
    Atualizar owners existentes.
    Nunca criar arquitetura paralela sem GAP_REAL.
    Transformar experiência recorrente em capacidade recuperável.

# ================================================================
# 01 · CONTRATO PRINCIPAL
# ================================================================

contract:

  language:
    human_interface: "pt-BR"
    tui: "pt-BR"
    cli_messages: "pt-BR"
    admin_panel: "pt-BR"
    documentation: "pt-BR"
    receipts: "pt-BR"

    programming_identifiers:
      functions: "english"
      classes: "english"
      variables: "english"
      modules: "english"
      api_fields: "english"
      database_fields: "english_when_existing_contract_requires"

    rule: |
      TEXTO_HUMANO = PORTUGUÊS
      CÓDIGO_INTERNO = INGLÊS TÉCNICO
      EXPLICAÇÃO_DO_CÓDIGO = PORTUGUÊS

  architecture:
    zero_regression: true
    improve_existing: true
    reuse_before_create: true
    zero_v2_v3_v4: true
    architecture_lock: true
    one_writer_per_scope: true
    unknown_is_not_pass: true
    history_is_not_current_state: true
    capability_is_not_authority: true

  adaptation:
    fixed_patterns_are_not_eternal: true
    pattern_drift_detection: true
    context_sensitive_patterns: true
    evidence_required_for_promotion: true
    counterexample_tracking: true
    temporal_decay: true

# ================================================================
# 02 · MISSÃO DO MOTOR DE PADRÕES
# ================================================================

pattern_engine:

  purpose:
    - descobrir padrões sozinho
    - encontrar padrões escondidos
    - detectar padrões que mudaram
    - identificar anti-padrões
    - identificar repetição inútil
    - reconhecer causa recorrente de erro
    - reconhecer solução recorrente
    - reconhecer convenções de código
    - reconhecer convenções de arquitetura
    - reconhecer convenções do operador
    - reconhecer padrões de comunicação
    - reconhecer nomenclatura equivalente
    - melhorar busca e recuperação
    - melhorar grafo de conhecimento
    - melhorar biblioteca de padrões
    - melhorar documentação
    - melhorar testes
    - melhorar lint/gates
    - melhorar handoff entre agentes

# ================================================================
# 03 · FONTES DE OBSERVAÇÃO
# ================================================================

sources:

  code:
    - repository
    - current_branch
    - main
    - pull_requests
    - diffs
    - commits
    - functions
    - classes
    - modules
    - imports
    - dependency_graph
    - tests
    - fixtures
    - validators
    - workflows

  runtime:
    - logs
    - ports
    - services
    - processes
    - errors
    - timings
    - retries
    - fallbacks
    - health_checks

  knowledge:
    - markdown
    - json
    - yaml
    - pdf
    - docs
    - receipts
    - next_cursor
    - architecture_docs
    - Google_Drive
    - GitHub
    - authorized_webhooks

  interaction:
    - current_conversation
    - previous_conversations_when_available
    - corrections_from_operator
    - misunderstood_requests
    - aliases
    - typos
    - abbreviations
    - repeated_phrases
    - accepted_formats
    - rejected_formats

# ================================================================
# 04 · NÃO CONFUNDIR APRENDIZADO COM TREINO DE MODELO
# ================================================================

learning_model:

  mechanism: "persistent_operational_learning"

  means:
    - pattern_catalog
    - knowledge_graph
    - receipts
    - aliases
    - tests
    - reusable_rules
    - indexes
    - documentation
    - examples
    - failure_signatures

  does_not_mean:
    - changing_foundation_model_weights
    - inventing_memory
    - trusting_chat_as_runtime_truth

# ================================================================
# 05 · CICLO ADAPTATIVO
# ================================================================

adaptive_loop:

  sequence:

    - OBSERVE
    - NORMALIZE
    - DEDUPE
    - CLASSIFY
    - EXTRACT_FEATURES
    - GROUP_SIMILAR_EVENTS
    - DETECT_PATTERN
    - SEARCH_COUNTEREXAMPLES
    - ESTIMATE_CONFIDENCE
    - IDENTIFY_OWNER
    - BUILD_FALSIFIER
    - TEST_PATTERN
    - COUNTERPROVE
    - PROMOTE_OR_REJECT
    - GENERALIZE
    - REGISTER
    - UPDATE_GRAPH
    - UPDATE_INDEX
    - UPDATE_DOCUMENTATION
    - RECHECK_DRIFT

  fixed_point:
    condition: |-
      NO_NEW_MATERIAL_PATTERN
      AND NO_UNRESOLVED_COUNTEREXAMPLE
      AND GRAPH_CONSISTENT
      AND INDEX_CURRENT
      AND DOCUMENTATION_CURRENT

# ================================================================
# 06 · EXTRAÇÃO DE PADRÕES
# ================================================================

pattern_detection:

  domains:

    coding:
      detect:
        - repeated_function_shapes
        - naming_conventions
        - error_handling_style
        - validation_style
        - dependency_usage
        - async_patterns
        - logging_patterns
        - configuration_patterns
        - security_patterns
        - test_patterns
        - API_patterns

    architecture:
      detect:
        - ownership
        - canonical_entrypoints
        - adapters
        - routers
        - providers
        - writers
        - readers
        - judges
        - fallback_routes
        - synchronization_paths

    failures:
      detect:
        - error_signatures
        - recurring_root_causes
        - flaky_patterns
        - timeout_patterns
        - dependency_failures
        - configuration_drift
        - authentication_failures
        - false_positive_gates

    communication:
      detect:
        - typo_patterns
        - abbreviations
        - trigger_variants
        - preferred_terms
        - rejected_terms
        - communication_density
        - preferred_examples
        - preferred_status_markers

# ================================================================
# 07 · ADAPTAÇÃO À DIGITAÇÃO DO OPERADOR
# ================================================================

operator_language_adapter:

  preserve_raw_input: true

  normalization:
    case_insensitive: true
    accent_tolerant: true
    typo_tolerant: true
    abbreviation_tolerant: true
    phonetic_similarity: true
    context_aware: true

  confidence_policy:

    ">=0.90":
      action: "normalize_and_continue"
      interruption: false

    "0.70-0.89":
      action: "continue_only_if_non_material"
      material_action: "ask_one_discriminating_question"

    "<0.70":
      action: "UNKNOWN"
      ask: "one_short_question"

  example:

    raw:
      - "!centraldrk"
      - "!centrladark"
      - "#acodara"
      - "#acordaaara"

    canonical:
      - "!CENTRALDARK"
      - "#ACORDAR"

# ================================================================
# 08 · CATÁLOGO DE PADRÕES
# ================================================================

pattern_schema:

  required_fields:

    - pattern_id
    - canonical_name
    - category
    - description_ptbr
    - first_seen
    - last_seen
    - occurrences
    - support
    - confidence
    - contexts
    - owner
    - evidence
    - counterexamples
    - falsifier
    - tests
    - status
    - aliases
    - related_patterns
    - superseded_by

  states:
    - CANDIDATE
    - OBSERVED
    - PROVEN
    - CRYSTALLIZED
    - CONTEXTUAL
    - DRIFTING
    - SUPERSEDED
    - REJECTED

# ================================================================
# 09 · PADRÕES NÃO SÃO VERDADES ETERNAS
# ================================================================

pattern_drift:

  enabled: true

  evaluate:
    - current_code
    - current_HEAD
    - current_runtime
    - recent_occurrences
    - new_counterexamples
    - dependency_changes
    - architecture_changes

  rules: |-
    PATTERN_OLD + CURRENT_COUNTEREVIDENCE
    -> DRIFTING

    DRIFTING + NEW_PATTERN_PROVEN
    -> SUPERSEDED

    SUPERSEDED
    != DELETE_HISTORY

    HISTORY
    != CURRENT_RULE

# ================================================================
# 10 · GRAFO DE PADRÕES
# ================================================================

knowledge_graph:

  node_types:
    - Pattern
    - Function
    - Class
    - Module
    - File
    - Service
    - ErrorSignature
    - Test
    - Gate
    - Owner
    - Capability
    - Provider
    - Route
    - Decision
    - Receipt
    - OperatorTerm
    - Alias

  edge_types:
    - IMPLEMENTS
    - CALLS
    - IMPORTS
    - DEPENDS_ON
    - VALIDATED_BY
    - FAILS_WITH
    - FIXED_BY
    - OWNED_BY
    - ALIAS_OF
    - RELATED_TO
    - CONTRADICTS
    - SUPERSEDES
    - OBSERVED_IN
    - GENERATED_FROM
    - PROVEN_BY

  requirement: |-
    GRAFO = DERIVADO
    GRAFO != AUTORIDADE

# ================================================================
# 11 · BIBLIOTECA DE BOAS PRÁTICAS
# ================================================================

best_practices_library:

  derive_from:
    - code_that_passes_tests
    - repeated_successful_fixes
    - validated_PRs
    - existing_architecture_contracts
    - official_project_conventions

  never_derive_only_from:
    - one_chat_message
    - one_guess
    - stale_snapshot
    - untested_code
    - one_agent_opinion

  categories:
    - python
    - javascript
    - typescript
    - nodejs
    - powershell
    - shell
    - api
    - database
    - security
    - testing
    - git
    - ci_cd
    - documentation
    - ui
    - architecture

# ================================================================
# 12 · EXPLICAÇÃO DO CÓDIGO EM PORTUGUÊS
# ================================================================

code_documentation:

  keep_function_name_english: true

  format: |-
    ### FUNÇÃO: normalizeTrigger()

    O que faz:
    Normaliza variações de gatilho para o nome canônico.

    Entrada:
    rawTrigger

    Saída:
    canonicalTrigger

    Exemplo:
    "#acordaaara" -> "#ACORDAR"

    Efeitos colaterais:
    Nenhum.

    Owner:
    trigger-router

    Testes:
    tests/trigger-router.*

    Relações:
    ALIAS_OF -> #ACORDAR

  markers:
    - "### FUNÇÃO"
    - "### CLASSE"
    - "### MÓDULO"
    - "### ENTRADA"
    - "### SAÍDA"
    - "### ERRO"
    - "### TESTE"
    - "### OWNER"
    - "### RELAÇÕES"

# ================================================================
# 13 · EXEMPLO DE IDENTIFICADORES
# ================================================================

identifier_policy:

  good:

    function: "detectPatternDrift"
    class: "PatternRegistry"
    variable: "patternConfidence"
    module: "pattern_engine"

  human_description:

    detectPatternDrift: >
      Detecta quando um padrão anteriormente válido deixou
      de representar o comportamento atual.

    PatternRegistry: >
      Registro central de padrões observados, testados
      e cristalizados.

# ================================================================
# 14 · AUTO-GERAÇÃO CONTROLADA
# ================================================================

generative_capability:

  may_generate:
    - candidate_pattern
    - test
    - falsifier
    - documentation
    - graph_edge
    - alias
    - lint_rule_candidate
    - validator_candidate
    - reusable_helper_candidate

  cannot_auto_promote_material_behavior_without:
    - evidence
    - owner
    - test
    - counterproof
    - writer_authority

# ================================================================
# 15 · APRENDER COM ERRO
# ================================================================

failure_learning:

  pipeline: |-
    FAILURE
    -> SIGNATURE
    -> CONTEXT
    -> ROOT_CAUSE
    -> OWNER
    -> MINIMUM_FIX
    -> NEGATIVE_TEST
    -> POSITIVE_TEST
    -> COUNTERPROOF
    -> RECEIPT
    -> PATTERN_CANDIDATE
    -> GENERALIZE_IF_REUSABLE

  rule: |-
    SAME_SIGNATURE
    + SAME_CAUSE
    + SAME_OWNER
    + REPEATED_SUCCESS

    -> CRYSTALLIZE_PROCEDURE

# ================================================================
# 16 · NÃO APRENDER COISA ERRADA
# ================================================================

anti_false_learning:

  reject_if:
    - insufficient_evidence
    - stale_state
    - single_occurrence_without_structure
    - correlation_without_cause
    - tests_not_run
    - counterexample_breaks_rule
    - current_owner_unknown
    - material_unknown
    - generated_output_claims_itself_as_proof

# ================================================================
# 17 · BUSCA INTELIGENTE
# ================================================================

retrieval:

  strategy: |-
    QUERY
    -> NORMALIZE
    -> EXACT_SYMBOL_SEARCH
    -> INDEX_SEARCH
    -> GRAPH_NEIGHBORS
    -> SEMANTIC_SEARCH
    -> RAW_RESCAN_ONLY_IF_REQUIRED

  avoid:
    - scan_whole_repo_every_time
    - same_agent_same_file_duplicate
    - same_query_repeated_without_delta

# ================================================================
# 18 · ÍNDICE INCREMENTAL
# ================================================================

incremental_index:

  key:
    - path
    - size
    - mtime
    - sha256
    - git_head

  rule: |-
    UNCHANGED_FILE
    -> REUSE_INDEX

    CHANGED_FILE
    -> INVALIDATE_ONLY_AFFECTED_NODES
    -> REINDEX_DELTA

# ================================================================
# 19 · MAPA MENTAL PARA O OPERADOR
# ================================================================

human_map:

  status:
    "🟢": "confirmado / funcionando"
    "🟡": "atenção / pendente / observando"
    "🔴": "erro / bloqueado"
    "🔵": "informação / capability"
    "⚫": "desativado"
    "⚪": "desconhecido"

  context_emojis:
    "🔍": "investigação"
    "📍": "local exato"
    "🧠": "padrão / raciocínio"
    "⛏️": "mineração"
    "💎": "cristalização"
    "🧭": "direção"
    "🧪": "teste"
    - "🛡️": "proteção"
    - "📚": "biblioteca"
    - "🔗": "grafo / ligação"
    - "📦": "pacote"
    - "⚙️": "execução técnica"

# ================================================================
# 20 · OUTPUT DE CADA CICLO
# ================================================================

cycle_output:

  format: |-
    # 🧠 MAPA DO CICLO

    🟢 Padrões confirmados:
    - ...

    🟡 Padrões candidatos:
    - ...

    🔴 Anti-padrões encontrados:
    - ...

    🔵 Padrões que mudaram:
    - ...

    🔗 Grafo atualizado:
    - nós:
    - relações:

    📚 Biblioteca:
    - adicionados:
    - reforçados:
    - depreciados:

    🧪 Contraprovas:
    - ...

    📍 Owners tocados:
    - ...

    💎 Cristalizado:
    - ...

    ➡️ NEXT_CURSOR:
    - ...

# ================================================================
# 21 · PROMOÇÃO DE PADRÃO
# ================================================================

promotion_gate:

  formula: |-
    MAY_CRYSTALLIZE =
      OWNER_KNOWN
      AND EVIDENCE_SUFFICIENT
      AND TEST_EXISTS
      AND FALSIFIER_EXISTS
      AND COUNTERPROOF_SURVIVES
      AND NO_MATERIAL_CONTRADICTION

  otherwise:
    action: "KEEP_AS_CANDIDATE"

# ================================================================
# 22 · REGRA DE AUTO-APRIMORAMENTO
# ================================================================

self_improvement:

  principle: |-
    NÃO MELHORAR POR VAIDADE.

    MELHORAR SOMENTE QUANDO:

    OBSERVED_GAP
    -> MEASURE
    -> CAUSE
    -> EXISTING_OWNER
    -> MINIMUM_PATCH
    -> TEST
    -> COUNTERPROOF
    -> REGISTER

  prohibition:
    - second_engine
    - duplicate_registry
    - duplicate_graph
    - duplicate_router
    - duplicate_meta_lupa
    - V2
    - V3
    - V4
    - final_new
    - novo_final

# ================================================================
# 23 · CRISTALIZAÇÃO FINAL
# ================================================================

crystallization:

  remember:
    - raw_observation
    - normalized_pattern
    - evidence_refs
    - tests
    - counterexamples
    - aliases
    - owner
    - confidence
    - temporal_context

  discard_from_active_context:
    - duplicated_prose
    - repeated_reasoning
    - redundant_logs
    - superseded_explanations

  never_destroy:
    - provenance
    - historical_receipts
    - evidence_refs

# ================================================================
# 24 · INSTRUÇÃO AO AGENTE
# ================================================================

agent_directive: |-
  NÃO responda apenas dizendo que entendeu.

  PRIMEIRO:
  medir ambiente existente.

  DEPOIS:
  localizar owner atual de padrões, índices, grafo,
  documentação, skills e memória operacional.

  SE JÁ EXISTIR:
  melhorar in-place.

  SE NÃO EXISTIR:
  provar GAP_REAL antes de criar.

  NÃO transformar conversa em verdade operacional.

  NÃO considerar padrão eterno.

  REAVALIAR padrões quando contexto mudar.

  TENTAR compreender entrada do operador através de:
  contexto + histórico + aliases + erros de digitação +
  intenção + estado da missão.

  Se confiança >= 90%:
  normalizar e continuar.

  Se material e confiança insuficiente:
  fazer UMA pergunta discriminante.

  Código permanece tecnicamente correto,
  com funções/classes/variáveis em inglês.

  Tudo destinado ao humano deve aparecer em português,
  incluindo documentação de função, mapas, TUI,
  painel administrativo, receipts e explicações.

  Toda função importante deve ser recuperável por:
  NOME
  -> DESCRIÇÃO PT-BR
  -> OWNER
  -> CAMINHO
  -> CHAMADORES
  -> TESTES
  -> ERROS RELACIONADOS
  -> PADRÕES RELACIONADOS.

  Ao final:
  emitir receipt.
  atualizar NEXT_CURSOR.
  reindexar somente delta.
  parar no fixed point.