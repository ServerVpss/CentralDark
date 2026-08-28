---
title: "2026 08 28 Meteor Decomp Pr Bot Assay"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# Assay externo — meteor-decomp PR/claim coordination

Data: 2026-08-28

Status: `CANDIDATE_EXTERNAL_LEARNING`

Modo da rodada: `READ_ONLY_ASSAY -> DOCS_ONLY_REGISTRATION`

## DESTINATION_LOCK

Registrar o pacote técnico estudado no `swstegall/meteor-decomp` sem criar segundo PR bot, segundo control plane, segundo ledger ou copiar implementação AGPL para dentro da CentralDark.

O objetivo é preservar proveniência, separar fato de inferência e destacar apenas mecanismos que podem reforçar owners já existentes da Casa.

## Baselines medidos

CentralDark no início desta escrita:

- repo: `ServerVpss/CentralDark`
- branch: `main`
- HEAD: `4ff55f0caa7cea02c8442dc6b26f5122bd5c7300`

Fonte externa:

- repo: `swstegall/meteor-decomp`
- branch observada: `develop`
- HEAD observado: `9ec1afbcfb4b1122948dd500e36d052139ac3cd6`
- HEAD date: `2026-07-05T17:20:51Z`
- licença observada em `tools/claim.py`: `AGPL-3.0-or-later`

Arquivos materiais revisados:

- `AGENTS.md` — blob `ede54c090fee089882769a1f0a831858760a4b8c`
- `docs/claim-protocol.md` — blob `daa21ed5e12384df0032bf6777384b864a1dd072`
- `.github/workflows/claim.yml`
- `.github/workflows/claim-pr.yml` — blob `bfad75321ebda42480c98d5e2201ebc087c2b9eb`
- `tools/claim.py` — blob `491c514627dc94e918dcbab939087805a585850c`
- `.github/workflows/reconcile.yml` — blob `8f9d67ced3c2892d1bf69b7b4e7fd8a1249feca9`

Proveniência:

- https://github.com/swstegall/meteor-decomp/blob/develop/AGENTS.md
- https://github.com/swstegall/meteor-decomp/blob/develop/docs/claim-protocol.md
- https://github.com/swstegall/meteor-decomp/blob/develop/.github/workflows/claim.yml
- https://github.com/swstegall/meteor-decomp/blob/develop/.github/workflows/claim-pr.yml
- https://github.com/swstegall/meteor-decomp/blob/develop/tools/claim.py
- https://github.com/swstegall/meteor-decomp/blob/develop/.github/workflows/reconcile.yml

## FACT

### 1. Unidade de trabalho estreita

O `AGENTS.md` orienta agentes a trabalhar em uma unidade pequena e exclusiva, evitando limpeza lateral e mutações fora do escopo. O desenho reduz colisão entre agentes paralelos.

### 2. Claim GitHub-native

O sistema externo usa um ledger em branch órfã `claims`. Cada claim ativo possui um arquivo próprio. O conjunto resolvido não é duplicado no ledger; o estado resolvido é derivado da presença do artefato final na árvore de código.

### 3. Lifecycle do claim

O fluxo observado é, conceitualmente:

`FREE -> CLAIM/LEASE -> PR_OPEN/PIN -> MERGE -> RECONCILE_REAL_STATE -> RELEASE`.

O claim de PR mergeado não é liberado pela simples ocorrência do close/merge. O `reconcile.yml` libera somente depois de observar o estado resolvido materializado no branch de destino.

### 4. Compare-and-swap por Git

A serialização não depende de tratar `actions concurrency` como lock global. O mecanismo usa push de uma ref compartilhada como CAS:

`read -> decide -> commit -> push`.

Se o push é rejeitado porque a ref avançou, a execução busca o novo tip, reseta o estado local, REEXECUTA a decisão contra o ledger novo e tenta novamente com limite/backoff.

Isto é mais forte que repetir uma decisão velha depois de concorrência.

### 5. Identidade autenticada

O owner do claim é derivado da identidade autenticada do evento GitHub e não de um campo livre fornecido pelo solicitante.

### 6. pull_request_target com fronteira explícita

O workflow de PR usa `pull_request_target` para alcançar segredo do repo base, porém evita checkout/execução do código do PR não confiável; trabalha com metadata e filenames via API antes de alterar o ledger.

### 7. Lógica pura separada do transporte

`tools/claim.py` modela as decisões do ledger separadamente de Git/GitHub. O tempo pode ser injetado, permitindo comportamento determinístico e testável.

### 8. Critério de saída fail-closed

O `AGENTS.md` exige prova forte do artefato antes de commit no domínio dele. Resultado parcial não é tratado como concluído; ao esgotar orçamento, o trabalho parcial é revertido e o aprendizado é preservado como post-mortem.

## SOURCE_CLAIM / LIMITES

A documentação da própria fonte informa que o bootstrap do sistema de claims ainda não foi concluído no repositório canônico observado. Portanto:

`DESIGN_PRESENT = YES`

`WORKFLOWS_PRESENT = YES`

`UPSTREAM_LIVE_CLAIM_SYSTEM = NOT_PROVEN`

Também não se generaliza o critério byte-identical do projeto de decompilação para a CentralDark. O ouro transferível é o padrão `PROOF_TARGET_PASS | PARTIAL_NOT_PASS | FAIL_NOT_PASS`, não o tipo específico de prova.

## CONTRAPROOF

### Não é um PR bot genérico drop-in

`AGENTS.md` é contrato de operação, não bot isolado. O comportamento emerge da combinação de protocolo, workflows, lógica do ledger e reconciliação.

### Não importar o sistema inteiro

CentralDark já possui owners de automação/promoção e push seguro, incluindo:

- `scripts/lupa/writer-safe-push-main.sh`
- `scripts/github-autonomia-varredura.mjs`
- Trigger Fabric / contratos de continuidade
- Writer/Writer-Scope e gates de promoção

Criar outra branch-ledger, outro bot ou outro control plane sem GAP_REAL violaria `ONE_SYSTEM_ONLY` e `REUSE_BEFORE_CREATE`.

### Licença

`tools/claim.py` declara AGPL-3.0-or-later. Nenhum código dessa implementação foi copiado neste aprendizado. A absorção proposta é comportamental/arquitetural e deve preservar a proveniência da fonte.

### Ausência de segredo não pode virar falso verde na Casa

Na fonte, algumas rotas fazem warning/skip quando o token do claim não está configurado. Na CentralDark, se uma defesa/coordenação for obrigatória para o claim em questão, ausência de recurso deve resultar em `BLOCKED|UNKNOWN`, nunca PASS silencioso.

## DELTA ÚTIL PARA A CENTRALDARK

Não criar `meteor-bot`, `claims-bot-v2` ou novo ledger.

O delta candidato é reforçar os owners atuais com estes mecanismos:

### A. WRITER_LEASE por escopo

`Writer + Writer-Scope + target` podem gerar uma lease explícita e durável durante a janela de trabalho.

Objetivo: proteger o escopo antes do momento final do push, reduzindo colisões entre agentes durante toda a execução.

### B. PR_PIN

Quando um PR é aberto para o mesmo escopo, a lease pode ficar vinculada a `PR + HEAD`, não expirar durante review e não ser reclamada por outro writer.

### C. POST_MERGE_RELEASE

`PR_MERGED != LEASE_RELEASED`.

A liberação deve ocorrer somente após a Casa remedir o owner/target no branch canônico e provar que o estado promovido realmente está materializado.

### D. CAS_REDECISION

Se a ref/HEAD/estado muda entre decisão e escrita:

`STATE_CHANGED -> INVALIDATE_DECISION -> REMEASURE -> REDECIDE`.

Não apenas `retry push`.

### E. PURE_DECISION_ENGINE

Separar a decisão de lease/claim do transporte GitHub:

`state + request + time -> GRANT | EXTEND | REJECT | RELEASE | BLOCKED`.

O engine deve ser determinístico e testável; GitHub/MCP são adaptadores.

### F. AUTHENTICATED_OWNER_BINDING

Writer/actor material deve vir de identidade autenticada/proveniência observada, não de texto livre controlável pelo solicitante.

### G. RELEASE_AFTER_REALITY

A liberação de coordenação deve ser consequência de pós-condição observável, não apenas de evento de UI/PR.

## OWNER MAPPING CANDIDATO

Sem mutação nesta rodada:

- push concorrente / reobservação de `main` -> `scripts/lupa/writer-safe-push-main.sh`
- elegibilidade, Writer/Writer-Scope e promoção -> `scripts/github-autonomia-varredura.mjs` + owner de promoção existente
- continuidade/estado/prova -> Trigger Fabric existente
- destilação/proveniência -> `knowledge-compiler`

A implementação deve primeiro provar se já existe lease equivalente antes de criar qualquer estado persistente adicional.

## MATRIZ DE ASSAY

| Mecanismo externo | Qualidade observada | Reuso candidato | Importar literalmente? |
|---|---|---|---|
| unidade estreita de trabalho | forte | Writer-Scope | não necessário |
| lease/claim | forte | autonomia/writer | não |
| PR pin | forte | autonomia/writer | não |
| CAS com redecision | muito forte | writer-safe/autonomia | não |
| pure decision engine | muito forte | owner de autonomia | reimplementar se GAP_REAL |
| authenticated owner | forte | autoridade/writer | reusar conceito |
| release pós-reconciliação | muito forte | continuity/promotion | reusar conceito |
| byte-identical exit gate | domínio-específico | princípio fail-closed | não |
| branch órfã `claims` | eficaz no contexto da fonte | somente se GAP_REAL | não por padrão |
| token/bot dedicado | específico da fonte | UNKNOWN | não por padrão |

## TESTES EXIGIDOS SE O DELTA FOR IMPLEMENTADO

1. Dois writers tentam adquirir a mesma lease simultaneamente: apenas um recebe `GRANT`.
2. Mesmo writer renova lease: `EXTEND` idempotente.
3. Writer diferente recebe `REJECT` enquanto lease válida existe.
4. Estado/ref muda durante tentativa: decisão antiga é descartada e recalculada.
5. PR abre no mesmo escopo: lease fica pinned ao PR/HEAD.
6. PR fecha sem merge: lease é liberada somente conforme política reconciliada.
7. PR mergeia: lease continua até pós-condição no branch canônico ser medida.
8. Pós-condição não provada: `UNKNOWN|BLOCKED`, nunca release falso-verde.
9. Actor informado no payload diverge da identidade autenticada: identidade autenticada vence.
10. Falta de recurso obrigatório: fail-closed.
11. Nenhum segundo writer/control plane surge como efeito colateral.
12. Writer-safe push atual continua funcionando sem regressão.

## RECOMMENDED_MINIMUM_ACTION

`NO_CODE_IMPORT_NOW`.

Próxima ação elegível, somente se autorizada:

1. medir owners atuais para lease/coordenação;
2. provar GAP_REAL entre `writer-safe-push` e coordenação de ciclo inteiro;
3. desenhar a menor extensão no owner atual;
4. reimplementar apenas o mecanismo necessário, sem copiar AGPL;
5. testar concorrência + PR pin + pós-merge remeasurement;
6. registrar receipt e proveniência.

## RECEIPT

```text
SOURCE_CLASS=EXTERNAL_PUBLIC
SOURCE_REPO=swstegall/meteor-decomp
SOURCE_REF=develop@9ec1afbcfb4b1122948dd500e36d052139ac3cd6
SOURCE_LICENSE_SIGNAL=AGPL-3.0-or-later in tools/claim.py
CENTRALDARK_BASE=main@4ff55f0caa7cea02c8442dc6b26f5122bd5c7300
CODE_COPIED=false
SECOND_PR_BOT_CREATED=false
SECOND_CONTROL_PLANE_CREATED=false
DELTA_CLASS=WRITER_LEASE+PR_PIN+CAS_REDECISION+POST_MERGE_RELEASE
UPSTREAM_RUNTIME_STATUS=NOT_PROVEN
CENTRALDARK_IMPLEMENTATION_STATUS=NOT_STARTED
FIXED_POINT=ASSAY_COMPLETE_IMPLEMENTATION_NOT_PROVEN
```
