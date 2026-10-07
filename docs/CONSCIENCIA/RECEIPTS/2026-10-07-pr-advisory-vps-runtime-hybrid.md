# Receipt — IA consultiva híbrida ancorada no runtime VPS

Data: 2026-10-07
Status: CANDIDATE_UNTIL_CI
Authority: SEGREDO/CHEFE
Owner: `.github/workflows/pr-auto-review.yml`
Base medida: `9bdf7d0abab7ca2acbce9c476a4bfb171228860c`

## Intenção

Fazer a revisão consultiva nascer primeiro do runtime vivo da CentralDark na VPS, sem depender de saldo/disponibilidade do Codex ou de outro provedor remoto.

## Delta

```text
PR_DIFF_SANITIZADO
→ RUNNER_SELF_HOSTED_VPS
→ SNAPSHOT_RUNTIME_VIVO
→ LLAMACPP_LOCAL/HERMES_MODEL
→ ADVISORY_JSON
→ COMMENT_GITHUB

se local indisponível:
→ CENTRALDARK_API_FALLBACK
→ DARKAI_PROVIDER_FALLBACK

gates determinísticos continuam autoridade
IA consultiva não aprova/não bloqueia/não executa código
```

## Runtime que o advisory mede

- host;
- `hermes-gateway.service`;
- MCP local `:9100/health`;
- Hermes `:9900/health`;
- Triton live/ready;
- bridge Kylin;
- modelo local efetivamente exposto pelo llama.cpp.

O token interno do llama.cpp é lido somente do state file local pelo processo do runner root e não é impresso, enviado ao GitHub ou gravado no repo.

## Segurança

- `pull_request_target` continua sem executar código do PR;
- checkout adicionado é somente do `base.sha` confiável;
- diff continua vindo da API e passa pela sanitização existente;
- modelo local recebe apenas texto e nenhum tool binding;
- `contents: read` continua; o job só escreve comentário/issue;
- external provider é fallback, não obrigação.

## Contrato

```text
LOCAL_RUNTIME_FIRST=true
CODEX_REQUIRED=false
REMOTE_MODEL_REQUIRED=false
MODEL_OUTPUT_IS_MERGE_AUTHORITY=false
DETERMINISTIC_GATES_REMAIN_AUTHORITY=true
RUNTIME_STATE_IS_CONTEXT_NOT_PROOF_OF_PR=true
UNKNOWN != PASS
```

## NEXT_CURSOR

Rodar sintaxe/teste do helper no HEAD da branch → abrir PR → CI do HEAD exato → depois do merge disparar um PR controlado e comprovar comentário com `Fonte: vps-local-runtime` + snapshot vivo.

## Correção de arquitetura — máquina de estado viva

A leitura CURRENT mostrou que o comentário de PR não deve ser o centro do sistema. Ele é somente projeção.

```text
CHEFE=intenção
VPS/HERMES-CORE=máquina de estado operacional
modelo local=calibrador/engine substituível
HERMES=executor
Executor/Critic=braços
Reality Judge=fechamento factual
GitHub=projeção/ledger externo
```

O loop absorvido no mesmo HERMES-CORE:

```text
MEASURE_CURRENT
→ CLASSIFY_WOUNDS
→ FINGERPRINT
→ SAME_WOUND_STREAK
→ LOCAL_SEMANTIC_ADVISORY
→ HERMES_RUNTIME_MISSION
→ EXECUTOR
→ CRITIC
→ REMEASURE
→ REWARD/TREND
→ REALITY_JUDGE
→ NEXT_CURSOR
```

Isto é feedback/calibração operacional, não treinamento dos pesos do modelo.

### False-green fechado

O primeiro probe via `/health` dizia Kylin bridge saudável. A contraprova funcional adicionada mediu:

```text
GET /health = 200
POST /v1/chat/completions = 502
WOUND_1=HTTP_UNHEALTHY:kylin_bridge_chat:502
WOUND_2=KYLIN_BRIDGE_CHAT_FAILED:502
```

A mesma ferida sobreviveu duas leituras consecutivas e tornou-se elegível para remediação. Logo:

```text
HEALTH_200 != CAPABILITY_PASS
SAME_WOUND_STREAK=2
CALIBRATION_VERDICT=DRIFT
```

### Ferida seguinte descoberta pelo próprio caminho

A missão de calibração foi entregue ao HERMES-CORE existente. A primeira retomada foi bloqueada corretamente pelo continuity guard porque faltava contrato de continuidade. O delta de branch agora gera sidecar de continuidade antes do arquivo de missão.

Depois de fornecer um continuity state válido à missão CURRENT, o Hermes retomou e expôs a próxima ferida:

```text
DECISOR_REMOTE_DEPENDENCY=true
darkai/provider chain unavailable
local model was not primary decisor
```

Por isso o mesmo PR também evolui `decisor.mjs` para:

```text
PRIMARY_DECISOR=LOCAL_LLAMA_RUNTIME
REMOTE_PROVIDERS=FALLBACK
CODEX_REQUIRED=false
```

A prova de autonomia só fecha quando o decisor local responder dentro do budget e a missão Kylin completar com contraprova. Até lá:

```text
STATE_MACHINE_BINDING=IMPLEMENTED_IN_PR
KYLİN_CHAT_CURRENT=FAIL_502
LOCAL_DECISOR_E2E=UNKNOWN
FULL_SELF_HEALING=NOT_YET_PASS
```
