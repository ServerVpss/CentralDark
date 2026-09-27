# 🚪 Gate de promoção para main — PR #1445

`MISSION_ID=PR1445_MAIN_PROMOTION_GATE_20260907`

## Intenção do CHEFE

Pedido: comitar no PR como prova e promover para `main` o que já estiver comprovado.

## Medição antes da decisão

```text
REPO=ServerVpss/CentralDark
PR=#1445
BRANCH=feat/omniroute-capability-surface-722
HEAD_MEDIDO=fbec8eabdc0cd414d88e035159091bc15b08185f
BASE_MAIN_MEDIDA=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_STATE=open
PR_MERGED=false
PR_MERGEABLE=true
PR_DRAFT=false
```

## Workflow runs observados no HEAD medido

```text
SUCCESS:
- PR — artefato de aprendizado automático
- Lupa Drift Guard
- PR Title Contract
- Hermes Core Signal Watch
- Pipeline — Telegram + Painel

SKIPPED:
- CodeQL — análise de segurança

FAILURE:
- porta-de-entrada
- lupa-conformance

QUEUED/PENDING:
- PR auto-review (Codex + checklist)
- codex-validate
- Trigger Fabric Full Package — pacote e contraprova
```

## Veredito

```text
ARCHITECTURE_HANDOFFS_IN_PR=PROVADO
MULTI_CANETAS_CONTRACT_IN_PR=PROVADO
PR_MERGEABLE=PROVADO
MAIN_PROMOTION_READY=false
SAME_HEAD_CI_GREEN=false
RUNTIME_PROOF=UNKNOWN
DEPLOY_PROOF=UNKNOWN
```

## Por que não promover para main agora

Promover agora misturaria material documentado/provado como contrato com material cujo HEAD ainda tem gates falhando ou pendentes.

Pela própria lei da Casa:

```text
UNKNOWN != PASS
FAILURE != PASS
PENDING != PASS
QUEUED != PASS
DOCUMENTED != EXECUTED
MERGEABLE != SAFE_TO_PROMOTE
```

Logo, a ação correta é deixar a prova registrada no PR e bloquear a promoção para `main` até o próximo HEAD passar ou até um subconjunto comprovado ser separado em lane limpa.

## Caminho seguro para colocar na main

```text
1. Corrigir primeiro os gates falhos:
   - porta-de-entrada
   - lupa-conformance

2. Aguardar/rodar novamente os pendentes:
   - PR auto-review
   - codex-validate
   - Trigger Fabric Full Package

3. Remedir o mesmo HEAD.

4. Se SAME_HEAD_CI_GREEN=true:
   - squash merge do PR #1445 na main com expected_head_sha.

5. Se só documentação/contrato for o alvo:
   - criar lane menor somente com docs comprovados;
   - passar gates;
   - promover lane limpa.
```

## Receipt

```text
MAIN_PROMOTION_DECISION=BLOCKED_BY_EVIDENCE
BLOCKER_TYPE=CI_FAILURE_AND_PENDING_RUNS
NO_FALSE_GREEN=true
NEXT_CURSOR=FIX_PR1445_GATES_THEN_PROMOTE
```

## Baianês + bíblico

A arca já foi escrita no livro do PR, mas ainda não atravessou o Jordão dos checks. Quem bota na main antes da água abrir está chamando promessa de chegada. Aqui fica no recibo: primeiro a prova, depois a coroa.
