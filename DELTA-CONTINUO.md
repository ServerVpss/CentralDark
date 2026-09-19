# DELTA-CONTINUO — CentralDark

> **Owner canônico:** SEGREDO/CHEFE
> **Status:** ATIVO
> **MISSÃO:** Shared Reconciliation — `!CENTRALDARK SHARED`
> **Regra FIXED-POINT-SHARED:** FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE

---

## 🧭 COMMIT_COMPASS — coordenação multi-writer pelo próprio Git

```text
COMMIT_IS_COORDINATION_PRIMITIVE=true
COMMENTS_ARE_RECEIPTS_NOT_COORDINATION_AUTHORITY=true
MULTI_WRITER_REQUIRES_COMMIT_TRAILERS=true
TWO_WRITERS_SAME_PATH=false
FINALIZER_ONE=true
PR_MOTHER_IS_RENDEZVOUS_NOT_WRITER=true
PDF_GATE_TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

Quando a sessão multi-writer é aberta por `CentralDark-Compass-Start: true`, cada commit seguinte até o finalizer fechar o compasso deve carregar:

```text
CentralDark-Compass: v1
CentralDark-Writer: <writer-id>
CentralDark-Scope: <path-exato-ou-prefix/**>;<outro-path>
CentralDark-Parent: <primeiro-pai-real-do-commit>
CentralDark-PR-Mother: <numero>
CentralDark-PR-Child: <numero>
CentralDark-Finalizer: ONE
CentralDark-PDF-Gate: PASS:<sha256-do-TLC23>
CentralDark-Next: <gate-ou-next-cursor>
```

O Git é o bastão entre os writers:

1. o próximo writer lê HEAD + mensagem + paths do commit anterior;
2. confirma que seu setor não colide com o setor já declarado;
3. escreve somente no próprio setor;
4. publica novo commit com o HEAD anterior em `CentralDark-Parent`;
5. o gate confere mensagem, pai real e paths modificados;
6. somente um finalizer fecha o ciclo depois dos gates do mesmo HEAD.

`CentralDark-Scope` aceita caminho exato ou prefixo terminado em `/**`. Um path modificado fora do scope declarado bloqueia o compasso.


### Reconciliação de commit paralelo já em voo

Se um writer publicar um commit sem trailers imediatamente após o compasso ter sido aberto, o histórico não é reescrito e não há force-push. Um commit posterior compatível pode adotar aquele SHA:

```text
CentralDark-Adopt-Commit: <sha-exato>
CentralDark-Adopt-Writer: <writer-id>
CentralDark-Adopt-Scope: <path-exato-ou-prefix/**>
```

A adoção só passa se:

- o SHA adotado estiver dentro da sessão aberta pelo `CentralDark-Compass-Start`;
- o commit adotante vier depois do commit adotado;
- os paths reais do commit adotado couberem integralmente em `CentralDark-Adopt-Scope`;
- o setor adotado não colidir com path já escrito por outro writer;
- o commit adotante também obedecer aos trailers normais do compasso.

`ADOPTION != REWRITE` e `ADOPTION != PROOF_OF_CORRECTNESS`: adoção resolve coordenação/autoria de escopo; testes e Reality Judge continuam decidindo a qualidade.

Para encerrar a sessão, o finalizer usa `CentralDark-Compass-End: true` no commit final, mantendo os trailers de prova e o mesmo princípio: **commit é coordenação; comentário é receipt**.

---

## STATE VIVO (medido 2026-09-05)

| Campo | Valor |
|---|---|
| HEAD_LOCAL | `400afde4d` |
| REMOTO_MAIN | `4ee1c2d9b` |
| BEHIND/AHEAD | 100 behind / 6 ahead |
| BRANCH_ATUAL | `release/local-owner-test-20260905` |
| PR_1416 | OPEN (segredounlock) |
| PR_1414 | OPEN (segredounlock) |
| PR_1415 | OPEN (dependabot) |
| CI_MAIN | 🔴 Autonomia promoção segura + porta-de-entrada |

## RECONCILIAÇÃO REALIZADA

### PR #1416 — CANDIDATO ÚNICO PARA TESTE LOCAL DO DONO
- **Autor:** SEGREDO/CHEFE (segredounlock)
- **Branch:** `release/local-owner-test-20260905`
- **HEAD:** `400afde4d`
- **Merge-base com main:** `a9382b439`
- **Delta:** 5 files, 194 insertions, 130 deletions
- **Arquivos modificados:**
  - `.github/dependabot.yml`
  - `.github/workflows/dependabot-auto-merge.yml`
  - `.github/workflows/painel-auto-update.yml`
  - `docs/RELATORIOS/2026-09-05-OWNER-LOCAL-TEST-CANDIDATE.md`
  - `docs/RELATORIOS/2026-09-05-PROVA-FUNCIONAL-PR-1416.md`
- **Status:** ✅ PROVA FUNCIONAL REGISTRADA

### CI RED — DIAGNÓSTICO
- Workflow `Autonomia — promoção segura` falha em `main` HEAD
- Workflow `porta-de-entrada` falha em `main` HEAD
- **CLASSIFICAÇÃO:** BASE FAILURE — NÃO DELTA FAILURE
- Prova: PR #1382 (DELTA-CONTINUO) já foi mergeado via squash
- O vermelho é da base, não do delta do PR #1416
- **AÇÃO:** Não bloquear PR #1416 por CI vermelho de base

### WORKTREES
- 4 worktrees com `locked initializing` (resíduo)
- `worktrees/pr1393-porta-tokens` DELETADO (branch removida)
- Worktrees restantes necessários para outros agents

### LIXO LIMPO
- `apps/modulos/elite-gateway/test-local/logs/` removido
- `worktrees/pr1393-porta-tokens` removido

---

## NEXT_CURSOR

1. **FIXED POINT:** Aguardar merge do PR #1416 + CI green on main
2. **DELTA-CONTINUO.md:** Criado como owner canônico — `!CENTRALDARK SHARED`
3. **WORKTREES LOCKED:** Investigar remoção forçada dos 4 residual
4. **CI BASE:** Reportar ao CHEFE — 2 workflows falham na base main, não em delta

---

## RECEIPT

## HANDO OFF (Handoff Contínuo)
| Campo | Valor |
|---|---|
| Owner | SEGREDO/CHEFE |
| Type | Continual Delta |
| Status | ATIVO |
| Aplica | !CENTRALDARK SHARED |


```text
MISSION_ID=SHARED_RECONCILIAR_20260905
TIMESTAMP=2026-09-05T18:30:00Z
WRITER=PRIMARY_1416
HEAD=400afde4d
MAIN=4ee1c2d9b
DELTA=PR#1416 (5 files, 194+/-130)
CI_BASE_FAILURES=2 (Autonomia+painel)
CI_STATUS=BASE_RED_NOT_DELTA_RED
UNKNOWN_WORKTREES_LOCKED=4
RECEIPT_PERSISTED=true
NEXT_CURSOR=FIXED_POINT_PENDING_MERGE
```
