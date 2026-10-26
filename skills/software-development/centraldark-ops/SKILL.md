---
name: centraldark-ops
description: "Operate CentralDark across current bodies, runtimes and routes using live bindings, capability routing, one-writer scope, minimal proven delta, proof/readback and CURRENT > HISTORY."
related_skills:
  - centraldark-operational-method
  - centraldark-hermes-operations
  - reconciliacao-diaria-centraldark
  - github-actions-runner-diagnostics
  - skill-synchronization
---

# CentralDark ops — router operacional CURRENT

SEGREDO/CHEFE é a autoridade final e fonte da intenção.
SOL coordena, preserva contexto e escolhe o cone pertinente.
HERMES executa quando HERMES é o body/capability escolhido.
PIVETE é vocativo ou proveniência histórica; não é papel técnico.
Modelo, UI, runtime, provider, host e ferramenta são conchas substituíveis.

Este skill não cria segunda arquitetura.
Ele roteia a missão para o owner/capability já existente e mantém
a semântica operacional estável enquanto bindings técnicos mudam.

## Contrato permanente

```text
INTENT_IS_COMMAND=true
CURRENT_OVER_HISTORY=true
REALITY_IS_JUDGE=true

UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
ROUTE != SCOPE
ROUTE_FAILURE_IS_LOCAL

ONE_WRITER_PER_MUTABLE_SCOPE=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
NO_V1_V2_V3_PARALLEL_OWNER=true

MEMORIA_E_SAGRADA=true
CONCHA_E_MUTAVEL=true
SERVIR_SEM_SUBSERVIENCIA=true
CONTEXTO_E_CONSCIENCIA=true

PIVETE_ROLE=RETIRED
SOL_COORDINATES_HERMES_EXECUTES=true

SHELL_MODEL_RUNTIME_ARE_REPLACEABLE=true
ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true
EXECUTION_CLAIM_REQUIRES_RUNTIME_READBACK=true

## Fast path de manutenção e edição

Quando a missão for manutenção, diagnóstico ou edição da CentralDark, aplique esta sequência antes de abrir uma investigação ampla:

```text
FAST_PATH_CENTRALDARK=true
CANONICAL_ROOT=K:/
CURRENT_ROOT_FIRST=true

PERSISTENT_EVOLUTION_REQUIRED=true
EVERY_MATERIAL_OPERATIONAL_LEARNING_UPDATES_EXISTING_SKILL=true
SKILL_UPDATE_IS_NOT_RUNTIME_AUTONOMY_PROOF=true
RUNTIME_AUTONOMY_REQUIRES_LIVE_ROUTE_AND_READBACK=true
RUNTIME_CAN_AUTONOMY_CLAIM_ONLY_AFTER_LIVE_READBACK=true

## Estado por identidade e origem

```text
ONLINE = serviço identificado + medido + dentro da validade da leitura
UNKNOWN = conta, sessão ou serviço sem medição autenticada atual
OFFLINE = falha confirmada no alvo correspondente

SCREENPIPE_ONLINE != HERMES_ONLINE
SCREENPIPE_ONLINE != DUAL_ACCOUNT_AUTHENTICATED
LOCAL_127_0_0_1 != CASA_WHEN_RUNTIME_IS_VPS
DUAL_ACCOUNT = estados independentes por identidade
NO_SHARED_GREEN_STATUS=true
```

Para capacidades remotas ou múltiplas contas, o consumidor deve preservar por perfil: identidade, sessão, origem, timestamp, validade da leitura, autorização e evidência. Nunca elevar uma conta com a prova de outra nem transformar processo detectado em autenticação comprovada.

```text
ACCOUNT_A_STATUS != ACCOUNT_B_STATUS
ACCOUNT_A_PROOF != ACCOUNT_B_PROOF
RUNTIME_RUNNING != AUTHORIZATION_PROVEN
REMOTE_PROCESS_DETECTED != SESSION_AUTHENTICATED
CURRENT_READBACK > HISTORICAL_DEVICE_READY
```

A interface deve separar os cartões por conta/origem quando houver mais de uma identidade. A atualização só pode ser chamada sincronizada depois de publicação e readback no Cockpit vivo.


1. CONFIRMAR_ROOT_K
2. LER_STATUS_GIT_E_BRANCH_NO_MESMO_COMANDO
3. LOCALIZAR_OWNER_POR_CAPABILITY
4. BUSCAR_SIMBOLO_E_CONSUMIDOR_JUNTOS
5. LER_APENAS_JANELA_CAUSAL
6. BATCHAR_LEITURAS_INDEPENDENTES
7. PATCHAR_OWNER_EXISTENTE
8. RODAR_TESTE_MAIS_BARATO_APLICAVEL
9. FAZER_READBACK_NO_RUNTIME
10. REGISTRAR_SHA_PATH_RESULTADO_NEXT_CURSOR
```

Regras de velocidade sem perda de prova:

- Use `K:/` como raiz operacional; nunca percorra `K:/` ou outro checkout para o estado atual.
- Antes de editar, combine status, branch e diff do escopo no mesmo diagnóstico; não repita descoberta já medida.
- Procure primeiro o símbolo, rota, import e consumidor real; documentação e nomes semelhantes ficam depois.
- Batcher leituras independentes numa única chamada; serialize somente ações dependentes.
- Edite o menor arquivo owner que fecha a cláusula; não crie helper, modo, bridge ou arquitetura paralela.
- Após cada mutação, execute o teste mínimo que discrimina a hipótese e faça readback do efeito.
- Se o runtime estiver ativo, prefira HMR/readback antes de reiniciar; reinicie apenas quando o módulo carregado não puder ser invalidado.
- Use `focus_pane("terminal")` + `read_terminal()` para recuperar o terminal visual já aberto, em vez de abrir outro terminal ou redescobrir o comando.
- Preserve alterações fora do cone; nunca use reset, clean ou force push como atalho.
- Acelerar significa reduzir redescoberta e chamadas, não reduzir evidência: `UNKNOWN` permanece visível.

Receita compacta reutilizável:

```text
K_ROOT → OWNER → SYMBOL → CONSUMER → MIN_DELTA → TEST → READBACK → RECEIPT
```
