# Receipt — Erro 422 no dependabot-auto-merge.yml

## Data
2026-09-04

## Problema
O workflow `dependabot-auto-merge.yml` executava um passo "Aprovar PR" que tentava criar um review APPROVE via API:

```javascript
await github.rest.pulls.createReview({
  owner: context.repo.owner,
  repo: context.repo.repo,
  pull_number: context.payload.pull_request.number,
  event: 'APPROVE',
  body: 'Aprovação automática...'
});
```

Este passo falhava com HTTP 422:
```
Unprocessable Entity: "GitHub Actions is not permitted to approve pull requests."
```

## Causa Raiz
Em repositórios privados, o GitHub Actions não tem permissão para criar reviews automaticamente via API. O passo de aprovação era redundante porque o auto-merge via GraphQL (enablePullRequestAutoMerge) já funciona sem review prévio.

## Solução Aplicada
Removido o passo "Aprovar PR" do workflow. O auto-merge agora depende exclusivamente do GraphQL mutation `enablePullRequestAutoMerge`, que não requer review manual.

## Arquivos Modificados
- `.github/workflows/dependabot-auto-merge.yml` — removido passo de aprovação (24 linhas removidas, 2 linhas adicionadas de comentário explicativo)

## Testes
- Workflow YAML validado (syntax ok)
- Alteração mínima: somente remoção do passo problemático, sem alterar lógica de negócio

## Autoria
- Diagnóstico: analise do log do workflow (run 33740528363)
- Correção: remoção do passoAPPROVE
- Commit: f2efe4615

## Status
✅ RESOLVIDO
