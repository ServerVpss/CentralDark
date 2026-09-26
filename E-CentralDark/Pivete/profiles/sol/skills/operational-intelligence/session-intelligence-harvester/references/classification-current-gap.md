---
name: session-intelligence-harvester

eixos_de_classificacao_observados:
  - CRITICAL_GAP_CURRENT_CANDIDATE: sem criterio declarado, CURRENT_CANDIDATE=0 é o correto — não é bug, é falta de criterio.
  - CLASSIFICADOR_TUDO_DESCONHECIDO: se o classificador retornar tudo DESCONHECIDO, não é ausencia de material — é falha de parse/formato. Verificar formato do rastro antes de concluir que não há material.
  - CRISTALIZATION_HOLD: o que foi classificado/cristalizado antes não desaparece — mesmo arquivo corrompido/inacessível agora, os hashes e contagens anteriores são HISTORICO_REFERENCE.

regras_cruzadas_confirmadas:
  - UNKNOWN != PASS
  - ACTION != PROOF
  - HISTORICAL != CURRENT
  - DOCUMENTED != EXECUTED
  - NOTEPAD_STATE != CANONICAL_TRUTH
  - UNSAVED_TAB != SAFE_TO_PERSIST
  - SECRET_DETECTED -> SENSITIVE_QUARANTINE (sem expor conteudo bruto)
  - RAW_LOCALSTATE -> DO_NOT_COMMIT
  - OLD_GREEN != CURRENT_GREEN
  - PERSISTED_RECEIPT != LIVE_RUNTIME
  - CHAT_STATEMENT != CANONICAL_STATE

handoff_fields_obrigatorios:
  - MEASURED_AT
  - CENTRALDARK_BRANCH
  - CENTRALDARK_HEAD
  - ACTIVE_PR
  - WRITER_SCOPE
  - notepad: WINDOWS_FOUND, TABS_FOUND, UNSAVED_TABS, FILE_BACKED_TABS
  - DEDUPED_ITEMS
  - SENSITIVE_QUARANTINED
  - HISTORICAL_ITEMS
  - CURRENT_CANDIDATES
  - FORMAT_VERIFIED
  - CURRENT_FACTS
  - SUPERSEDED_HISTORY
  - OPEN_GAPS
  - CONTRADICTIONS
  - IPNAMES_DELTA
  - NEXT_SAFE_ACTION

criterio_current_candidade_exige_declaracao: true