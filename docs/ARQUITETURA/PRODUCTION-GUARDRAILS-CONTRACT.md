# PRODUCTION GUARDRAILS CONTRACT — CentralDark

**MISSÃO:** Definir a proteção determinística de produção sem transformar o runtime atual em fonte da verdade e sem devolver tarefas rotineiras ao Pivete.

**BASE_SHA observado na abertura:** `26d92270da4d5707dd378b942a36b07d4ef097c8`

**STATUS:** `ACHADO_PENDENTE_IMPLEMENTACAO`

> Este PR fecha o contrato. Não prova que a autonomia de produção foi implementada.

---

## 1. Autoridade e autonomia

```text
PIVETE DEFINE INTENÇÃO + ESCOPO + CLASSE DE AÇÃO UMA VEZ
→ CÓDIGO VALIDA O CONTRATO
→ AGENTES PRODUZEM E CORRIGEM
→ GATES PROVAM
→ PROMOTOR EXECUTA O AUTORIZADO
→ MONITORAMENTO CONFIRMA
→ GUARDRAILS CONGELAM OU REVERTEM
```

O Pivete não opera labels, reruns, merge ou deploy já autorizados e comprovados. Nova decisão humana só é necessária quando muda missão, escopo, ambiente, classe de risco ou aparece `UNKNOWN` insolúvel por código.

A autorização fica vinculada a missão, repositório, PR/HEAD, caminhos, ambiente, classe de ação e validade. Não existe autorização global transferível entre edição, merge, deploy e rollback.

---

## 2. Fonte da verdade

```text
GITHUB_REPOSITORY=FONTE_DA_VERDADE
ARTEFATO_COM_HASH=UNIDADE_DE_DEPLOY
VPS=EXECUTOR_RUNTIME
VPS_ATUAL=EVIDÊNCIA_HISTÓRICA, NÃO AUTORIDADE ARQUITETURAL
```

O runtime executa o artefato reproduzível gerado pelo GitHub. Estado legado não vira requisito apenas por existir.

---

## 3. Evidência observada

| Componente | Estado comprovado | Limite real |
|---|---|---|
| Juiz/promotor | Existem no motor de autonomia | Fluxo ponta a ponta permanece sem prova no mesmo HEAD |
| Health pós-deploy | Existe validação pontual | Falta vincular saúde ao SHA do artefato |
| Rollback | Existe restauração manual | Alvo ainda não é selecionado por receipt autoritativo |
| Health runtime | Existe coleta periódica | Coleta e notifica, mas não fecha freeze/rollback |
| Notificação | Existem canais | Falta contrato de eventos, deduplicação e `NOT_SENT` |
| Provider health | Existe classificador sanitizado | Deve ser reutilizado fora do caminho crítico |

Achados de segurança e separação de poderes identificados durante a revisão ficam em trilha P0 separada. O conteúdo sensível não é lido nem reproduzido neste contrato.

---

## 4. STOP_WRITE sem ambiguidade

```text
STOP_WRITE_SCOPE=CI_PROMOTION_AND_DEPLOY
```

`STOP_WRITE` bloqueia novas promoções e deploys, congela o candidato, preserva evidência e impede segundo escritor no mesmo alvo. Não bloqueia gravações dos clientes.

### Estado autoritativo

```text
STATE_STORE=CANONICAL_DEPLOY_CONTROL_PLANE
SINGLE_WRITER=PRODUCTION_GUARDRAILS_CONTROLLER
UPDATE=ATOMIC_COMPARE_AND_SET
VERSION=MONOTONIC
TTL=VERSIONED_POLICY
RELEASE=RECOVERY_GATE_PASS
GUARD_UNAVAILABLE=FAIL_CLOSED_FOR_NEW_PROMOTION_AND_DEPLOY
```

Todos os escritores consultam o mesmo estado. Se nenhum armazenamento canônico existente satisfizer o contrato, a implementação fica `BLOCKED`; não se cria estado concorrente.

---

## 5. Máquina de estados

```text
OBSERVING
→ EVALUATING
→ HEALTHY

EVALUATING
→ DEPLOY_FROZEN
→ CAUSE_CLASSIFIED
→ ROLLBACK_ELIGIBLE
→ ROLLBACK_RUNNING
→ VERIFYING_RECOVERY
→ RECOVERED

QUALQUER_ESTADO
→ UNKNOWN
→ SECURITY_BLOCKED
→ PRODUCTION_BLOCKED
```

Timeout, métrica obsoleta, body inválido, coletor indisponível, SHA ausente e parse inválido geram `UNKNOWN` + `DEPLOY_FROZEN` + receipt. Nunca viram `PASS`.

Retries exigem evidência nova. Mudança de HEAD ou artefato invalida prova anterior. Execução concorrente usa lock e idempotency key.

---

## 6. Sinais e causalidade

Rollback por qualquer sinal isolado foi refutado.

### Classe A — ligada diretamente ao artefato

Freeze e rollback elegível:

- SHA esperado diferente do runtime;
- artefato sem checksum/receipt válido;
- health com schema inválido após deploy;
- processo crítico do novo artefato parado;
- canário do novo artefato falhou com anterior saudável.

### Classe B — degradação sustentada

Freeze; rollback somente após correlação:

- taxa de erros acima do limite com volume mínimo;
- latência p99 alta junto com health degradado;
- restart storm por delta na janela;
- falhas consecutivas de endpoint crítico;
- regressão contra baseline versionado.

### Classe C — dependência externa

Freeze, failover e notificação. Sem rollback por padrão.

Cada dependência crítica vem de registro versionado:

```text
DEPENDENCY_ID=
PROBE_SOURCE=
PROBE_TYPE=
TIMEOUT_MS=
RETRIES=
QUORUM=
STALE_AFTER_SECONDS=
AUTH_FAILURE_ACTION=
PARTIAL_FAILURE_RULE=
NEGATIVE_CONDITION=
POSITIVE_RECOVERY_CONDITION=
FAILOVER_TARGET=
ROLLBACK_ELIGIBLE=false
```

Dados obsoletos, ausência de quorum, autenticação inválida e probe não parseável geram `UNKNOWN` ou `SECURITY_BLOCKED`.

---

## 7. Correlação exigida para rollback

Rollback automático somente quando ao menos uma condição for comprovada:

1. SHA esperado diverge do runtime;
2. incidente começou na janela pós-deploy e o anterior possui saúde comprovada;
3. canário falhou antes da promoção completa;
4. teste determinístico reproduz a regressão no novo artefato e não no anterior.

Caso contrário:

```text
DEPLOY_FROZEN=true
ROLLBACK_ELIGIBLE=false
```

---

## 8. Política versionada

```json
{
  "schema": "centraldark.production-guardrails.v1",
  "mode": "SHADOW|ENFORCE",
  "observation_window_seconds": 300,
  "cooldown_seconds": 300,
  "max_rollback_attempts": 1,
  "rollback_target": "PREVIOUS_PROVEN_ARTIFACT",
  "critical_processes_ref": "CANONICAL_RUNTIME_MANIFEST",
  "critical_dependencies_ref": "CANONICAL_DEPENDENCY_REGISTRY",
  "thresholds_ref": "VERSIONED_BASELINE",
  "state_store_ref": "CANONICAL_DEPLOY_CONTROL_PLANE",
  "rollback_requires_correlation": true
}
```

Limites vêm de baseline, contrato do serviço ou teste reproduzível. Ativação começa em `SHADOW`; somente prova permite `ENFORCE`.

---

## 9. Artefato anterior comprovado

`PREVIOUS_PROVEN_ARTIFACT` exige:

- commit SHA;
- SHA-256 do artefato;
- hash da política;
- workflow de origem;
- build e testes;
- health/canário;
- ambiente e timestamp;
- receipt íntegro;
- localização recuperável;
- compatibilidade de rollback.

O alvo é selecionado pelo receipt vinculado ao SHA, nunca apenas por data ou mtime.

---

## 10. Implementação no canônico existente

1. Evoluir health pós-deploy com parser, schema, SHA e saída sanitizada.
2. Evoluir rollback para aceitar somente receipt válido, lock, idempotência e verificação pós-rollback.
3. Evoluir health periódico para separar coleta de decisão, calcular deltas e não publicar estado bruto.
4. Reutilizar classificador de provider e notificador com eventos versionados, dedup e `NOT_SENT`.
5. O destino de notificação deve ser o canal canônico do CentralDark; fallback para canal não autorizado é bloqueado.
6. Criar um único coordenador apenas se busca provar ausência de equivalente. Sem V2/V3.
7. Achados P0 correlatos são corrigidos em trilha separada, com scanner e prova de não recorrência.

---

## 11. Receipt completo

```text
SCHEMA=
MISSION_ID=
AUTHORITY_DECISION_REF=
AUTHORIZATION_RECEIPT_SHA256=
REPOSITORY=
ENVIRONMENT=
ACTOR_ROLE=
BASE_SHA=
HEAD_SHA=
POLICY_SHA256=
DEPLOY_SHA=
TARGET_ID=
ARTIFACT_SHA256=
PREVIOUS_ARTIFACT_SHA256=
SIGNAL_CLASS=
SIGNAL_VALUES=
BASELINE_REF=
EVIDENCE_REFS=
TEST_RESULTS=
IMPACT=
DECISION_RULE=
ACTION=
ROLLBACK_RESULT=
RECOVERY_RESULT=
SANITIZATION_PROFILE=
TIMESTAMP_UTC=
IDEMPOTENCY_KEY=
RESULT=
```

Todos os campos ficam presos ao mesmo HEAD/artefato. `AUTHORITY_DECISION_REF` reutiliza a autorização prévia da missão; não exige repetição durante rotina já autorizada.

---

## 12. Testes de contrato

1. erro abaixo do volume mínimo → sem reversão;
2. erro sustentado e correlacionado → freeze + rollback elegível;
3. p99 alto isolado → sem rollback;
4. p99 alto + health degradado após deploy → rollback elegível;
5. SHA mismatch → freeze + rollback elegível;
6. restart storm usa delta;
7. dependência externa → failover/freeze;
8. autenticação inválida → `SECURITY_BLOCKED`;
9. probe sem quorum → `UNKNOWN`;
10. medição inválida → nunca PASS;
11. receipt anterior ausente → rollback bloqueado;
12. duas execuções → um lock;
13. evento repetido → idempotência e dedup;
14. promoção após freeze → rejeitada;
15. rollback saudável → `RECOVERED` com SHA;
16. rollback falho → `PRODUCTION_BLOCKED`;
17. canal falho → `NOT_SENT`;
18. destino não autorizado → envio bloqueado;
19. `SHADOW` → zero mutação;
20. `ENFORCE` → somente ações autorizadas.

---

## 13. Definition of Done

```text
POLICY_SCHEMA=PASS
DEPENDENCY_REGISTRY=PASS
STATE_STORE_ATOMICITY=PASS
SHADOW_REPLAY=PASS
CANARY_FAILURE=DETECTED
DEPLOY_FREEZE=PROVED
WRITE_AFTER_FREEZE=REJECTED
ROLLBACK_ELIGIBILITY=PROVED
ROLLBACK=PROVED_IN_SAFE_ENVIRONMENT
POST_ROLLBACK_SHA=PROVED
POST_ROLLBACK_HEALTH=PASS
IDEMPOTENCY=PASS
CONCURRENCY_LOCK=PASS
NOTIFICATION=PROVED_OR_NOT_SENT_RECORDED
ZERO_SECRET_OUTPUT=PASS
ZERO_REGRESSION=PASS
```

---

## 14. Veredito reconciliado

```text
MISSION_ID=CENTRALDARK-AUTONOMIA-DETERMINISTICA-END-TO-END
CONTRACT_STATUS=REVIEWED_FOR_PIVETE
PRODUCTION_AUTONOMY=NOT_IMPLEMENTED
PROMOTION_AUTONOMY_END_TO_END=UNPROVEN
VPS_LEGACY_AS_SOURCE_OF_TRUTH=REFUTED
STOP_WRITE_SCOPE=CI_PROMOTION_AND_DEPLOY
ROLLBACK_ON_ANY_SIGNAL=REFUTED
ROLLBACK_REQUIRES_CAUSAL_CORRELATION=YES
AI_IN_CRITICAL_DECISION_PATH=NO
PIVETE_ROUTINE_INTERVENTION=NO
VERDICT=ACHADO_PENDENTE
```

**Pivete apresenta intenção e autoridade. Código carrega, executa, corrige e prova. IA trabalha no `UNKNOWN`; não substitui gate determinístico.**
