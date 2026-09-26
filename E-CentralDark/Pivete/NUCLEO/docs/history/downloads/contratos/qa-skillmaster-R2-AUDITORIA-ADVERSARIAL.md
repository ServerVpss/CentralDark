# QA SkillMaster — Auditoria Adversarial R2

## Alvos congelados

```text
PACOTAO_SHA256=d9192ee1e690344a72b3d17554e0151a61d7761da814d0afa5291232cf880dc4
RIGOR_SHA256=60825f6725f210d12eea624d3e23a105e6ee04b6a8bd8d14943a7f7c662dea86
RIGOR_BASELINE_TESTS=53/53 PASS
RIGOR_VERIFY_BASELINE=PASS
```

O baseline foi reproduzido. A conclusão “todas as contraprovas fechadas” não resistiu à segunda rodada.

```text
STATUS=BLOCKED_NEW_COUNTERPROOFS
NEW_FINDINGS=9
```

## R2-000 — Não é extensão byte-preservada do PACOTAO

Comparação por caminho relativo e SHA-256:

```text
PACOTAO_FILES=51
RIGOR_FILES=52
COMMON_CHANGED=7
PACOTAO_MISSING_IN_RIGOR=19
RIGOR_ADDED=20
```

Os 19 ausentes incluem `raw/`, `raw-arsenal/`, perfis, CPUPROFILE, A/B e mapas. Sete arquivos originais foram substituídos, inclusive os quatro scripts do Enxame. A melhoria de segurança nos wrappers é real, mas o contrato precisa dizer “migração/substituição controlada” ou preservar o legado como evidência não executável; não pode declarar extensão integral.

## R2-001 — Estado estruturado contradiz o delta

Evento sem missão:

```text
route.missionPreserved=true
route.mission.id=null
MISSAO_PRESENTE=NAO
MISSAO_ATUAL_PRESERVADA=NAO
REGRESSAO_PRESERVADA=SIM
```

A correção foi aplicada somente ao texto do delta. O objeto estruturado ainda fabrica preservação, e a regressão é declarada preservada sem teste de regressão executado.

## R2-002 — Aprendizado falso ainda é promovido

O contrato aceitou e promoveu:

```text
SOURCE_IDS=receipt-2026-prod-123        # inexistente, apenas plausível
HEAD_FINAL=deadbeef                     # parece SHA, não foi verificado
FAIL=false                              # booleano
SKIPPED=[]                              # array
UNKNOWN=null                            # nulo
FILES_OUT_OF_SCOPE="   "                # whitespace
TESTS={exitCode:0/1}                    # declarações sem receipt
```

Resultado:

```text
VALID=true
PROMOTED=true
REASON=PROVA_COMPLETA
```

A causa comum permanece: presença/formato textual é confundido com proveniência verificável e tipagem estrita.

## R2-003 — Learning Store não é transacional

Oito promoções simultâneas do mesmo fingerprint:

```text
FULFILLED=1
REJECTED=7
ERROR=ENOENT durante rename do mesmo arquivo temporário
```

O nome temporário usa apenas PID; chamadas concorrentes no mesmo processo colidem.

## R2-004 — Checkpoint global perde eventos diferentes

Trinta eventos diferentes, simultâneos:

```text
REQUESTED=30
FULFILLED=6
REJECTED=24
CHECKPOINT_COUNT=1
```

Há duas causas:

1. locks são por `eventId`, mas o `checkpoint.json` é global;
2. `writeAtomic()` usa `PID + Date.now()`, que colide no mesmo milissegundo.

O teste anterior cobriu somente duas chamadas do mesmo evento e não matou a corrida entre eventos distintos.

## R2-005 — Lock órfão não é recuperado

Um lock antigo com PID inexistente causa:

```text
LOCK_TIMEOUT:<eventId>
```

Não há lease, TTL validado, checagem de PID ou recuperação segura. Uma queda entre acquire/release pode bloquear aquele evento indefinidamente.

## R2-006 — Enxame verde com respostas vazias

Resposta HTTP 200 usada na contraprova:

```json
{"choices":[{"message":{"content":[]}}]}
```

Resultado:

```text
CALL_PROVIDER_TEXT_LENGTH=0
AGENTS_USED=5
FAIL_COUNT=0
ENXAME_STATUS=OK
```

Array vazio é truthy antes da sanitização, vira string vazia depois e continua contado como sucesso.

## R2-007 — Verificador não percorre runtime recursivamente

Foi inserido em `runtime/nested/secret-reader.mjs`:

```js
import fs from 'node:fs/promises';
await fs.open('.env', 'r');
THIS IS INVALID JAVASCRIPT !!!
```

Mesmo contendo leitura de `.env` e sintaxe inválida:

```text
VERIFY_EXIT=0
VERIFY_STATUS=PASS
SECRET_READ_SCAN=PASS
```

`listByExtension()` lê somente o primeiro nível de `runtime/` e `tests/`.

## R2-008 — Resumo TAP é forjável

Um teste imprimiu antes do resumo verdadeiro:

```text
# tests 55
# pass 55
# fail 0
# skipped 0
```

E criou um teste realmente pulado. O parser usa a primeira regex encontrada:

```text
REAL_SKIPPED=1
PARSED_SKIPPED=0
VERIFY_STATUS=PASS
```

Não se deve interpretar TAP por regex em stdout não confiável. Usar reporter JSON/estrutura nativa ou receipt separado autenticado pelo processo executor.

## Causas comuns consolidadas

```text
FORMATO PLAUSÍVEL ≠ PROVENIÊNCIA
TEXTO DO RECEIPT ≠ ESTADO TIPADO
LOCK POR ITEM ≠ TRANSAÇÃO DO ESTADO GLOBAL
RENAME COM NOME “QUASE ÚNICO” ≠ ESCRITA ATÔMICA CONCORRENTE
VARREDURA RASA ≠ VERIFICAÇÃO DO PACOTE INTEIRO
STDOUT DE TESTE ≠ CANAL CONFIÁVEL DE RESULTADO
HTTP 200 + VALOR TRUTHY ≠ RESPOSTA SEMÂNTICA VÁLIDA
```

## Ordem de correção coesa

1. Criar tipos/validators estritos para missão, contadores, receipts, SHA e respostas de provider.
2. Exigir referências de prova resolvíveis: arquivo/receipt existente, hash conferido e vínculo com HEAD.
3. Tornar Learning Store e checkpoint single-writer/transacionais; temporários com UUID; lock global curto para read-modify-write.
4. Implementar lease de lock com owner token e recuperação de órfão.
5. Tornar descoberta de arquivos recursiva e validar inventário total do ZIP.
6. Substituir parser TAP por canal estruturado impossível de ser contaminado por stdout de testes.
7. Rejeitar resposta vazia, whitespace, array/objeto inesperado e conteúdo semântico ausente.
8. Decidir explicitamente o contrato PACOTAO → RIGOR: preservação em área de evidência ou migração documentada, sem alegar extensão integral.
9. Executar novamente positivo + negativo + limite + mesma chave concorrente + chaves diferentes concorrentes + crash/recovery.

## Recibo

```text
BASELINE_53_53=CONFIRMADO
HASH_RIGOR=CONFIRMADO
HASH_PACOTAO=CONFIRMADO
CONTRAPROVAS_ANTERIORES=MAJORITARIAMENTE_CORRIGIDAS
TODAS_FECHADAS=NAO
READY_FOR_INSTALL_AUTONOMOUS=NAO
NEXT_STATE=CORRIGIR_CAUSAS_COMUNS_E_ADICIONAR_R2_000_A_R2_008_COMO_REGRESSOES
```
