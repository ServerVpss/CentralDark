# HERMES-CORE / agents — contrato herdado

Este arquivo **refina**, não substitui, `/LEIA-ME-IA.md` e `/AGENTS.md`. Ele vale para todos os agentes sob este diretório: `Auto-Diagnostico`, `Critic`, `Deploy-Watcher`, `Executor`, `GraphRAG-Master`, `Knowledge-Collector`, `Log-Verificador` e `Universal-Handler`.

## EXTEND-ONLY obrigatório

Cada agente deve preservar o owner/capacidade existente. Antes de sugerir ou executar reconstrução, V2/V3, `novo`, `final`, `copy`, `backup`, handler paralelo, monitor paralelo, memória paralela ou serviço concorrente, deve localizar a implementação atual, seus consumidores e testes, provar um gap material e então aplicar somente a menor extensão segura no owner canônico. Se a mesma função já existe, a ação correta é reutilizar, corrigir, consolidar ou `NO_CHANGE`; nunca criar uma variante só porque um modelo prefere outra arquitetura.

```text
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING=true
NEW_PARALLEL_CAPABILITY_WITHOUT_PROVED_GAP=BLOCK
MODEL_IS_NOT_AUTHORITY=true
SEGREDO_CHEFE_IS_FINAL_AUTHORITY=true
UNKNOWN_SKIPPED_PENDING_ARE_NOT_PASS=true
```

Agentes determinísticos aplicam isso ao escolher paths/ações. Agentes que consultam IA devem incluir a mesma restrição no contexto efetivo da decisão quando a IA puder propor arquitetura ou correção.

## Pendência externa — observação efêmera

Quando uma ação já foi disparada e o próximo delta pertence a executor externo, agentes não devem repetir a mesma ordem nem criar monitor/daemon paralelo. Se a missão já contém intenção explícita de acompanhamento, a espera pode virar um watch temporário read-only, limitado por condição terminal e timeout, com receipt e limpeza verificada ao final.

```text
ACTION_ALREADY_DISPATCHED + EXTERNAL_EXECUTOR_OWNS_NEXT_STATE
→ OBSERVE_NOT_REPEAT

TEMPORARY_EXTERNAL_WATCH=true
TEMP_WATCH_READ_ONLY=true
TEMP_WATCH_TARGET_MUTATION=false
TEMP_WATCH_REQUIRES_TERMINAL_CONDITION=true
TEMP_WATCH_REQUIRES_TIMEOUT=true
TEMP_WATCH_CLEANUP_REQUIRED=true
TEMP_WATCH_CLEANUP_MUST_BE_VERIFIED=true
SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE
TIMEOUT_IS_NOT_SUCCESS=true
SILENCE_IS_NOT_SUCCESS=true
PERSISTENT_DAEMON_FOR_EPHEMERAL_WAIT=FORBIDDEN
UNSOLICITED_MONITOR_CREATION=FORBIDDEN
```

A autorização para acompanhar uma pendência não autoriza mutar o alvo observado. Sem intenção humana de monitoramento aplicável, não criar job por inferência. Com a intenção já dentro do escopo da mesma missão, não devolver ao CHEFE escolhas técnicas equivalentes de baixo risco: use a menor implementação reversível e somente de observação.
