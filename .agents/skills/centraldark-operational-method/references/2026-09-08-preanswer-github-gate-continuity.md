# CentralDark Preanswer GitHub Gate — continuidade viva

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**Tipo:** reference subordinada / receipt operacional  
**Status:** `CANDIDATE_RULE_TESTED`  
**Data:** 2026-09-08  
**Fonte da intenção:** sessão do CHEFE com `#ACORDAR !CENTRALDARK !MEDIR !ALINHAR !CONTEMPLAR !RECONCILIAR`.

## Dor tampada

Falha observada: resposta operacional sobre CentralDark saiu pobre quando não mediu GitHub/PR/issues antes de responder.

```text
OLD_BAD_FLOW:
PEDIDO -> RACIOCÍNIO -> RESPOSTA -> GITHUB_DEPOIS
```

Fluxo correto:

```text
NEW_REQUIRED_FLOW:
PEDIDO -> MEDIR -> GITHUB -> PRS -> ISSUES -> WORKFLOWS/CHECKS -> ARQUIVOS -> RUNTIME/CASA_SE_DISPONÍVEL -> RECONCILIAR -> RESPONDER
```

## Regra da Casa

Quando o pedido envolver estado vivo do `ServerVpss/CentralDark`, PR, issue, workflow, deploy, runtime, casa, site, agenda operacional ou `#ACORDAR/!CENTRALDARK`, a resposta deve passar pelo gate abaixo.

```yaml
CENTRALDARK_PREANSWER_GATE:
  required_before_answer:
    - repo_confirmed
    - main_head_measured
    - relevant_prs_measured
    - relevant_issues_measured_when_material
    - workflows_or_checks_measured_when_material
  optional_but_mark_if_missing:
    - runtime_measured
    - remote_desktop_measured
    - deploy_measured
    - site_measured
  fail_closed:
    - no_github_measurement_blocks_operational_answer
    - unknown_is_not_pass
    - skipped_without_reason_is_not_pass
    - historical_green_does_not_approve_new_head
  output_shape:
    - PROVADO
    - QUEBRADO
    - EVIDENCIA_FALTANTE
    - RAIZ
    - ARQUIVO_OU_WORKFLOW
    - NEXT_CURSOR
```

## Base lógica Horn aplicada

Do PDF `Lógica Computacional 23`, foi usado apenas o subconjunto operacional de Horn:

```text
(p1 ∧ ... ∧ pn) -> p
(p1 ∧ ... ∧ pn) -> F
forward chaining ate fixed point
```

Aplicação:

```text
centraldark_command ∧ not_github_measured -> answer_blocked
centraldark_command ∧ repo_context_ready ∧ skill_context_ready ∧ pdf_logic_ready -> answer_allowed
```

`UNKNOWN` não vira `FALSE` automaticamente e não vira `PASS`. Ele permanece `UNKNOWN` até medição ou bloqueio explícito.

## Continuidade por prints e anexos

Novo padrão aprovado nesta sessão:

```text
PRINT_OU_ANEXO_NOVO != INTERRUPÇÃO
PRINT_OU_ANEXO_NOVO = DELTA_CANDIDATO
```

Procedimento:

```text
LER -> COMPREENDER -> COSTURAR_COM_ESTADO_VIVO -> CLASSIFICAR -> CONTINUAR
```

Se o print/anexo traz evidência nova, ele entra no denominador. Se não for legível ou não estiver acessível, registrar como `EVIDENCIA_FALTANTE`, sem inventar conteúdo.

## Evidência desta sessão

```text
REPO=ServerVpss/CentralDark
MAIN_HEAD_MEDIDO=ad4ed0ac76cb2361b005684c9c1323876a5174a5
PR_1189=closed+merged
PR_1444=umbrella/rendezvous atual
REMOTE_SKILL_FOUND=.agents/skills/centraldark-operational-method/SKILL.md
PDF_BASE=tlc23(2).pdf
BRIDGE_SCRIPT=CentralDark-Remote-Bridge(1).ps1
BRIDGE_SESSION_JSON=bridge-session-20260907-100639.json
REMOTE_DESKTOP_COMMANDER=TIMEOUT_NO_RESPONSE_FROM_DEVICE
ZIP_GITHUB_ACTIONS_FTP=EVIDENCIA_FALTANTE_NAO_ANEXADA_NESTA_CONVERSA
GITHUB_COPILOT_LNK=EVIDENCIA_FALTANTE_NAO_ANEXADO_NESTA_CONVERSA
```

## Invariantes preservadas

```text
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
CURRENT_GT_HISTORICAL=true
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING_NOT_REPLACE=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
MANY_READERS=true
NO_BLIND_OVERWRITE=true
NO_V2_V3_PARALLEL_SYSTEMS=true
DOCUMENTED_NOT_EXECUTED=true
MERGED_NOT_DEPLOYED=true
PRINT_IS_DELTA_CANDIDATE=true
ANSWER_AFTER_MEASURE=true
```

## Próximo cursor

```text
NEXT_CURSOR:
1. manter este receipt subordinado ao owner existente;
2. rodar test/ci/centraldark-preanswer-gate quando disponível;
3. se Remote Desktop voltar a responder, medir E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE;
4. se ZIP/LNK forem anexados de fato, materializar e classificar links/capacidades;
5. cruzar PR + issue + workflow + arquivo antes de qualquer novo plano operacional.
```
