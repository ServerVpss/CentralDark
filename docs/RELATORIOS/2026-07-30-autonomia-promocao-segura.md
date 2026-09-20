# Autonomia de promoção segura — 2026-07-30

## Missão

Eliminar a dependência de o Pivete atualizar branch, apertar merge ou escolher squash depois que um PR autorizado estiver comprovadamente pronto.

## Causa raiz provada

O repositório estava com:

```text
allow_auto_merge=false
allow_update_branch=false
```

Além disso, o `GitHub Bot Controller` existente auditava PRs e fechava substituídos, mas não possuía ciclo de promoção. Os checks podiam ficar verdes e o PR continuava aberto aguardando ação humana.

Usar somente `GITHUB_TOKEN` para atualizar ou mergear também seria falso verde operacional: ações feitas pelo token automático podem não disparar os workflows pós-push. Por isso a promoção exige `GITHUB_PAT_PERFIL`; ausência do PAT bloqueia, não faz fallback silencioso.

## Encaixe canônico

Não foi criado outro bot controlador. O workflow existente `.github/workflows/github-bot-controller.yml` foi estendido e recebeu um motor específico em `scripts/github-autonomia-promocao.mjs`.

## Contrato

```text
PR autorizado pelo Pivete
→ autor e repositório confiáveis
→ fora de draft
→ juiz read-only
→ testes da política
→ checks obrigatórios no HEAD exato
→ zero thread pendente
→ recibo SHA-256 preso a HEAD/base por até 15 minutos
→ promotor com token separado
→ revalidação viva
→ atualizar branch, se necessário
→ checks rodam novamente
→ squash merge com SHA esperado
```

### Autorização sem clique

A promoção aceita:

- label `permito-pivete`; ou
- marcador textual explícito `PERMITO PIVETE` no título/corpo de PR confiável.

Quando somente o marcador existe, o promotor aplica o label automaticamente. Drafts nunca são promovidos; isso preserva o PR-mãe #554 e inventários históricos como #499.

### Checks obrigatórios

- `porta-de-entrada`;
- `codex-validate`;
- `lupa-conformance`;
- `Lupa Drift Guard`;
- `PR auto-review (Codex + checklist)`;
- `Pipeline — Telegram + Painel`.

Runs `skipped` não substituem sucesso real. Falha, ausência, conflito, fork, autor não confiável, base diferente de `main`, thread pendente ou label de bloqueio impedem o merge.

## Separação de poderes

- `autonomy-judge`: token read-only, checkout exclusivo da `main`, gera artifact assinado por hash;
- `autonomy-promote`: token de escrita separado, verifica idade/hash e repete a leitura antes de qualquer mutação.

O código do PR nunca é executado pelo controlador privilegiado.

## Sentinela

Foi removida a contradição:

```text
ANTES: git commit ... || exit 0; git push || true
AGORA: snapshot/report em artifact imutável; zero push de telemetria na main
```

A Sentinela continua abrindo Issues deduplicadas. Git registra código e decisões; artifact/Issue carregam estado transitório.

## Rollback

Reverter o squash merge desta mudança restaura o controlador e a Sentinela anteriores. Nenhuma branch protection, segredo, VPS, banco ou runtime de aplicação é alterado por este contrato.
