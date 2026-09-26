# 07 — COMANDÃO PARA HERMES

Cole o bloco abaixo inteiro no Hermes.

---

```text
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA
!META_LUPA

MISSION_MODE=AUTONOMOUS_ORCHESTRATION
REPO=ServerVpss/CentralDark
WRITER=HERMES
WRITER_SCOPE=PR_AUTHORIZATION_AND_CI_QUEUE
AUTHORITY=SEGREDO/CHEFE  (PERMITO SEGREDO concedido 2026-08-24)
FREQUENCIA=FORTE

REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON

================================================================
ESTADO JÁ MEDIDO — NÃO REDESCOBRIR, APENAS REVALIDAR O HEAD
================================================================

MAIN_HEAD_MEDIDO=01135a7eca5ed6375860e35578a6db23deed34f9
OBSERVED_AT=2026-08-24T22:05:00-03:00
PRs_ALVO=1149, 1150, 1151, 1152
PR_1116=DRAFT, FORA DA RODADA
CONFLITO_ENTRE_PRs=NENHUM (arquivos disjuntos, todos aditivos)

CAUSA_RAIZ_PROVADA:
  Nenhum dos 4 PRs está autorizado. Todos batem em
  AUTHORITY_AUTHORIZATION_MISSING (github-autonomia-promocao.mjs L443).
  A fila de CI é SINTOMA, não causa.

MECANISMO (github-autonomia-promocao.mjs no HEAD):
  L20   FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN"
  L103  valid = Intent-Authorized=="SEGREDO/CHEFE"
              && Merge-Policy === FAST_MERGE_POLICY   (igualdade EXATA)
              && Intent-Scope && Writer && Writer-Scope
  L127  segredoLabel = labels.has("👑 permito-segredo")
  L~128 authorized = segredoLabel || receipt.valid
  L433  fastPath = merge_policy===FAST_MERGE_POLICY && viaBody
  L468  applicableWorkflows = fastPath ? [] : requiredWorkflows

PAPAGAIO 1 — Merge-Policy com string quase-certa:
  #1149 = "HUMAN_DECISION_REQUIRED"     (+ Intent-Scope ausente)
  #1150 = recibo INTEIRO ausente
  #1151 = "SQUASH_IF_CLEAN"             (falta o prefixo AUTO_)
  #1152 = "SQUASH_WHEN_GATES_PASS"      (+ Intent-Scope ausente)

PAPAGAIO 2 — etiqueta inerte:
  O repo tem DUAS labels. Só a da coroa funciona.
    "👑 PERMITO-SEGREDO"  -> autoriza
    "permito-segredo"     -> NÃO autoriza (nunca é consultada)

INFRA:
  runner self-hosted = 1 (vmi3256920-centraldark, online, BUSY)
  fila = ~67 queued + ~11 pending
  workflow de promoção = .github/workflows/autonomia-promocao.yml
    cron */5 + gatilho em pull_request_target [labeled, edited]
    BOT_TRUSTED_AUTHORS=segredounlock
    BOT_REQUIRED_WORKFLOWS=porta-de-entrada, codex-validate,
      lupa-conformance, Lupa Drift Guard,
      PR auto-review (Codex + checklist), Pipeline — Telegram + Painel

================================================================
DECISÃO DO CHEFE
================================================================

VIA=ETIQUETA (não recibo-no-corpo)

Motivo registrado: a etiqueta deixa fastPath=false, então o bot AGUARDA
os 6 workflows obrigatórios. Isso obedece o CRITERIO_DE_PARADA do CHEFE
(REQUIRED_CHECKS=PASS). O recibo-no-corpo zeraria applicableWorkflows e
mergearia sem check nenhum — seria falso-verde. NÃO USAR.

================================================================
EXECUTAR
================================================================

PASSO 0 — REVALIDAR
  Medir MAIN_HEAD agora. Se != 01135a7e, o estado acima virou HISTÓRICO:
  remedir PRs/checks antes de mutar. Não prosseguir com dado velho.

PASSO 1 — AUTORIZAR (mutação serializada)
  Aplicar a label "👑 PERMITO-SEGREDO" (COM A COROA) em 1149, 1150, 1151, 1152.
  Conferir depois que os 4 têm a label. Sem confirmação, não seguir.

PASSO 2 — DESTRAVAR A FILA
  Cancelar runs queued de branches JÁ MERGEADAS ou abandonadas.
  PRESERVAR todo run das branches dos 4 PRs.
  Objetivo: liberar o runner para os 6 workflows obrigatórios.

PASSO 3 — AGUARDAR O BOT (não mergear na mão)
  O autonomia-promocao.yml faz o squash sozinho (merge_method:"squash", L851).
  Gatilho: label aplicada + cron */5.
  PROIBIDO: gh pr merge, gh pr merge --admin, --auto, force-push.
  Motivo canônico (LEIA-ME-IA §8):
    "A promoção vive somente no fluxo canônico já existente.
     Não criar segundo workflow para a mesma promoção."

PASSO 4 — ACOMPANHAR
  Vigiar os 6 workflows obrigatórios por PR.
  Se algum FALHAR: causa -> owner existente -> menor delta -> reteste.
  Não remover UNKNOWN para parecer verde.

PASSO 5 — REMEDIR E FECHAR
  Medir MAIN_HEAD novo. Confirmar quais PRs entraram e com qual merge SHA.
  Emitir recibo.

================================================================
GATES QUE CONTINUAM VALENDO — NÃO PULAR NENHUM
================================================================

SECURITY_FINDING          scan de segredo/path sensível no diff
CANONICAL_VALIDATION      precisa dar PASS
MERGE_CONFLICT            mergeable=false ou dirty
CHANGES_REQUESTED         review bloqueante
BLOCKING_LABEL
PR_IS_DRAFT / BASE_NOT_MAIN / AUTHOR_NOT_TRUSTED

================================================================
ATENÇÃO EXPLÍCITA
================================================================

#1149  o corpo declara "HUMAN_DECISION_REQUIRED" e está behind=1.
       A label SOBRESCREVE essa declaração. O CHEFE decidiu — mas isso
       fica no rastro, nominalmente, no recibo final.

#1150  não tem recibo de intenção nenhum. Entra só pela label.

CLONE LOCAL E:\CentralDark\Pivete\CentralDark está 🔒 LOCKED:
  merge conflict não resolvido (UU package.json / package-lock.json),
  3 commits locais não publicados, behind 76.
  NÃO tocar. NÃO reset. NÃO clean. A rodada roda 100% via gh.

================================================================
NUNCA
================================================================
force-push · reset --hard · gh pr merge --admin · sobrescrever main suja
fabricar PASS · declarar sucesso sem prova · criar V2/V3
deploy só porque houve merge · mergear o #1116 (draft)

================================================================
CRITERIO_DE_PARADA
================================================================
LABEL_APLICADA_NOS_4=true
AND REQUIRED_CHECKS=PASS
AND MERGE_FEITO_PELO_WORKFLOW_CANONICO=true
AND MAIN_REMEDIDA=true

Qualquer item material UNKNOWN => STATUS=BLOCKED_OR_PENDING.
Nunca declarar sucesso total.

================================================================
FECHAMENTO OBRIGATORIO
================================================================
FEITO=
EVIDENCIA=
MAIN_HEAD_ANTES=01135a7eca5ed6375860e35578a6db23deed34f9
MAIN_HEAD_DEPOIS=
PRs_MERGEADOS=
MERGE_SHAS=
CHECKS_NO_MOMENTO_DO_MERGE=
PENDENCIA=
UNKNOWN_RESTANTE=
PROXIMO_PASSO=
FIO_DA_MISSAO=
```

---

## Comandos crus, se o Hermes precisar

**Passo 0 — revalidar:**

```bash
gh api repos/ServerVpss/CentralDark/commits/main --jq .sha
```

**Passo 1 — etiquetar (a coroa é obrigatória):**

```bash
for pr in 1149 1150 1151 1152; do gh pr edit $pr --repo ServerVpss/CentralDark --add-label "👑 PERMITO-SEGREDO"; done
```

**Conferir:**

```bash
for pr in 1149 1150 1151 1152; do echo -n "#$pr: "; gh pr view $pr --repo ServerVpss/CentralDark --json labels --jq '[.labels[].name]|join("|")'; done
```

**Passo 2 — ver a fila antes de cancelar qualquer coisa:**

```bash
gh run list --repo ServerVpss/CentralDark --status queued --limit 100 --json databaseId,headBranch,name --jq '.[]|"\(.databaseId)  \(.headBranch)  \(.name)"'
```

**Passo 4 — acompanhar:**

```bash
for pr in 1149 1150 1151 1152; do echo -n "#$pr "; gh pr view $pr --repo ServerVpss/CentralDark --json state,mergeStateStatus --jq '"\(.state)/\(.mergeStateStatus)"'; done
```

**Passo 5 — remedir:**

```bash
gh api repos/ServerVpss/CentralDark/commits/main --jq '.sha + " | " + (.commit.message|split("\n")[0])'
```
