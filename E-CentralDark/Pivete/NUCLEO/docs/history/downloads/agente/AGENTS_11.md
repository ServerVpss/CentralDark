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
