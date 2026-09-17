---
name: universal-method-contract
description: Gate global obrigatorio do metodo universal CentralDark. Subordinado ao MASTER-CYCLE; nao cria owner, cerebro ou autoridade paralela.
---

# UNIVERSAL METHOD CONTRACT — SKILL OBRIGATORIA

## Classe e autoridade

```text
AUTHORITY_CLASS=MANDATORY_CONTRACT_ADAPTER
OWNER=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
VALIDATOR=apps/modulos/HERMES-CORE/core/universal-method-contract.mjs
PARALLEL_OWNER=FORBIDDEN
SECOND_BRAIN=FORBIDDEN
ONE_SYSTEM_ONLY=true
```

Esta skill materializa o contrato universal; ela nao substitui Meta Lupa, Multibussola, TLC23/Horn, Reality Judge nem o owner causal.

## LEI E ORDEM 1 — nenhuma rota lateral

```text
NO_LATERAL_ROUTE=true
UNI_DIRECTIONAL_REQUIRES_GATE=true
BI_DIRECTIONAL_REQUIRES_GATE=true
RETURN_PATH_REQUIRES_GATE=true
ENTRY_REQUIRES_GATE=true
EXIT_REQUIRES_GATE=true
SILENT_REROUTE=false
ENGINE_SPECIFIC_BYPASS=false
PROVIDER_SPECIFIC_BYPASS=false
RUNTIME_SPECIFIC_BYPASS=false
```

Entrou pela porta canonica, fecha a porta. Saiu pela porta canonica, fecha a porta. Fluxo uni, bi ou de retorno usa a mesma lei e os mesmos gates materialmente aplicaveis.

## Cadeia obrigatoria quando materialmente aplicavel

```text
!CENTRALDARK
→ TLC23_OPEN
→ DESTINATION_LOCK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
→ PEGATUDO
→ READERS_MEASURE
→ !META_LUPA
→ DELTA_MINIMUM
→ RENDEZVOUS
→ RECONCILE
→ OWNER
→ ONE_WRITER
→ PATCH
→ TESTE
→ CONTRAPROVA
→ REALITY_JUDGE
→ FIXED_POINT
→ TLC23_CLOSE
→ REGISTRA
→ HANDOFF
```

`TLC23_CHECK=ALWAYS`. A cadeia completa executa somente nas fases materialmente aplicaveis. `NO_NEW_INFORMATION -> NO_CHANGE -> KEEP_GOAL -> KEEP_NEXT_CURSOR`.

## Cadeado do consolidado

Tudo que chegou a fixed point fica fechado pelo fingerprint do objeto:

```text
CONSOLIDATED_STATE=LOCKED
LOCK_KEY=OBJECT_ID+OWNER+HEAD_OR_ARTIFACT_HASH+DEPENDENCY_FINGERPRINT
```

O cadeado so reabre quando houver evidência material nova e uma destas razoes:

```text
SAME_OBJECT_PROVEN_IMPROVEMENT
SAME_OWNER_DOMAIN_EXPANSION
```

Nao reabre para:

```text
PARALLEL_REINVENTION
V2_V3_COPY_BACKUP
OWNER_DRIFT
COSMETIC_REWRITE_WITHOUT_DELTA
SAME_FAILURE_WITHOUT_NEW_INFORMATION
```

Melhoria deve preservar identidade/owner do objeto. Expansao de dominio deve ampliar capacidade do mesmo objeto/owner; nao autoriza criar arquitetura concorrente.

## Quando travar: diagnosticar, nunca contornar

Se qualquer gate bloquear, o bloqueio vira entrada de diagnostico:

```text
BLOCK
→ !CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
→ !META_LUPA
→ LOCALIZAR_PREMISSA_FALHA
→ LOCALIZAR_OWNER_CORRETO
→ MEDIR LOG/RUNTIME/SOURCE
→ CORRIGIR MENOR DELTA CAUSAL
→ TESTE
→ CONTRAPROVA
→ REMEDIR
```

Proibido trocar de owner, engine, provider, host ou rota apenas para escapar da trava.

## Modo CHEFE — pre-producao privada orientada a acao

Quando SEGREDO/CHEFE conceder `👑 PERMITO-SEGREDO` para a missao e o alvo continuar na mesma Casa/VPS/pre-producao privada, a autorizacao e herdada pelo ciclo material ate fixed point, revogacao explicita ou mudanca de alvo/escopo.

```text
OPERATING_MODE=PRIVATE_PREPROD
PERMITO_SEGREDO_MISSION_SCOPE=ACTIVE_WHEN_EXPLICITLY_GRANTED
PER_STEP_REASK=OFF_WITHIN_SAME_MISSION_TARGET
AUTHORIZED_REVERSIBLE_ACTION=EXECUTE_MEASURE_PROVE
PLAN_ONLY_WHEN_ACTION_AUTHORIZED=FORBIDDEN
ACTION_FIRST_WHEN_GATE_PASS=true
SECURITY_HARDENING_BY_CEREMONY=FORBIDDEN
SECURITY_HARDENING_WHEN_CAUSAL_OR_EXPOSURE_BOUNDARY=REQUIRED
COORDINATOR_GUARD_ROLE=ADVISE_ROUTE_AND_COUNTERPROVE_NOT_STALL
REAL_BLOCK_REQUIRES_MEASURED_CAUSE=true
```

Fluxo de pre-producao:

```text
INTENCAO AUTORIZADA
→ GATE NORMAL
→ ACAO REVERSIVEL
→ MEDIR
→ TESTAR
→ CORRIGIR
→ CONTRAPROVAR
→ CONTINUAR
```

Nao transformar seguranca futura em bloqueio ornamental do desenvolvimento atual. Se seguranca nao for causa do erro, requisito do teste ou fronteira real de exposicao, registrar como backlog/UNKNOWN futuro e continuar a missao.

Segredos podem ser consumidos somente em superficie local/autenticada apropriada (runtime, TTY, env ou secret store). Nunca republicar senha, token, cookie, chave privada ou segredo bruto em chat, PR, log, receipt ou artefato.

Mudanca destrutiva/irreversivel, gasto, producao real ou mudanca para alvo diferente nao herda permissao silenciosamente: precisa estar contida na ordem literal atual do CHEFE.

## Evidencia obrigatoria

Toda passagem material deve produzir um envelope com, quando aplicavel:

```text
OBSERVED_AT_UTC
TRACE_ID
OBJECT_ID
OWNER
WRITER_SCOPE
DIRECTION=UNI|BI|RETURN
PHASE=ENTRY|EXIT|DIAGNOSE
MAIN_SHA
TARGET_SHA
HEAD_OR_ARTIFACT_HASH
DEPENDENCY_FINGERPRINT
RUNTIME_FINGERPRINT
LOG_REFS
BYTE_SIZE
SHA256
ACTION
ACTION_RESULT
POST_PROBE
COUNTERPROOF
VERDICT
NEXT_CURSOR
```

Log bruto nao e autoridade. Data/hora, bytes, rastro e hash ligam a prova ao alvo observado.

## POMBO64+

O nome operacional `POMBO64+` e somente envelope de transporte legivel por maquina, subordinado ao canone existente:

```text
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
POMBO64_PLUS=BASE64URL(SANITIZED_EVIDENCE_ENVELOPE_UTF8)+SHA256(PLAINTEXT)
POMBO64_PLUS_IS_PROOF=false
CHECKSUM_MISMATCH=BLOCK
BASE64_IS_NOT_SECURITY=true
```

Nunca colocar secrets, tokens, cookies, senhas, chaves privadas ou conteudo sensivel no envelope. Base64 nao cifra nada.

## META MENOS E MAIS

```text
ESSENCE + CLARITY + CAPABILITY + SAFETY + PROOF - EXCESS = MENOS_E_MAIS
```

Aplicacao:
- medir somente superficies materiais;
- reutilizar prova valida enquanto o fingerprint nao mudou;
- nao repetir tool/gate/narracao sem delta;
- retornar um blocker causal, nao uma lista de ruido;
- corrigir no owner existente;
- menor blast radius possivel.

## Runtime

Entrada obrigatoria para mutadores:

```bash
node .agents/skills/universal-method-contract/scripts/gate.mjs --phase ENTRY --object <id> --owner <owner> --direction UNI
```

Saida obrigatoria apos mutacao:

```bash
node .agents/skills/universal-method-contract/scripts/gate.mjs --phase EXIT --object <id> --owner <owner> --direction UNI --result-hash <sha256>
```

Para VPS, receipts devem ser enviados para diretorio de runtime fora do source quando configurado (`CENTRALDARK_UNIVERSAL_RECEIPT_DIR`).

## Veredito

```text
PASS      = todas as premissas materiais provadas no mesmo alvo/fingerprint
NO_CHANGE = nenhum delta material; nao autoriza mutacao
UNKNOWN   = nao e PASS
BLOCKED   = nao autoriza mutacao
FAIL      = nao autoriza mutacao
```

Exit code zero nunca deve ser interpretado sozinho como PASS; o consumidor deve validar `verdict` e `trace_id` do envelope.
