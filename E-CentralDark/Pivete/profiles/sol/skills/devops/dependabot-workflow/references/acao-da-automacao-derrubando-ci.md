# Catálogo de Falhas de Automação que Derrubam CI (sem relação com o PR)

## Quando usar
- CI vermelho em PR de dependabot ou outro PR automático
- A falha está em step de aprovação, comentário, review, ou automação relacionada
- O diff do PR parece OK (lockfile, manifest, sem código novo problemático)

## Catálogo

### 1. HTTP 422 — aprovação bloqueada em repo privado
- **Erro**: `GitHub Actions is not permitted to approve pull requests`
- **Onde**: passo que executa `createReview({event:'APPROVE'})` via `actions/github-script`
- **Causa**: repo privado bloqueia criação de review via API Actions; mesmo com `pull-requests: write`
- **Correção**: remover passo de aprovação; `enablePullRequestAutoMerge` via GraphQL não exige review prévio
- **PR de referência**: #1397 (fast-uri), #1407 (corrigido aqui)
- **Contrasinal**: o diff pode estar limpo — o CI vermelho é da automação, não do PR

### 2. Step de comentário falhando por rate limit ou permissão insuficiente
- **Sintoma**: `403`, `422`, ou mensagem de rate limit no step de `createComment`
- **Causa**: token com escopo insuficiente, rate limit, ou automação tentando comentar em PR que não deve
- **Correção**: remover ou ajustar step de comentário; não retry cego

### 3. Workflow rodando em loop por gatilho recursivo
- **Sintoma**: múltiplos runs do mesmo workflow para o mesmo evento
- **Causa**: workflow faz commit/push que dispara outro workflow que dispara o primeiro
- **Correção**: review do `on:` do workflow e steps que tocam no repo

### 4. Permissão insuficiente para a ação que o workflow tenta
- **Sintoma**: `403 Forbidden` em steps de escrita, merge, ou configuração
- **Causa**: `permissions:` no workflow ou repo não concede a permissão necessária
- **Correção**: ajustar `permissions:` ou usar token com escopo adequado

## Fluxo de diagnóstico

```bash
# 1. Verificar se a falha é na automação ou no PR
gh pr checks $PR_NUMBER

# 2. Ver log do run específico focando em step de aprovação/comentário/review
gh run view $RUN_ID --log | grep -E "(error|Error|fail|422|403|404)" | head -30

# 3. Se falha for em step de aprovação/comentário/review, investigar se é causa da própria automação
```

## Princípio

Nem todo CI vermelho exige correção do PR. Às vezes o problema é o mecanismo de automação que tenta cuidar do PR.

Diagnóstico rápido:
1. Verificar se o CI falhou em step de aprovação/comentário/review (não em gates de lint/build/test)
2. Se sim: investigar se é causa da própria automação; se for, remover ou ajustar o passo problemático
3. Só então considerar correção do PR se a falha for realmente no diff

## Zona de risco

- Adicionar retry, sleep, ou workaround em steps que estão falhando por permissão insuficiente ou operação proibida
- Assumir que CI vermelho = PR problemático e começar a corrigir o código do PR sem investigar a causa real
- Manter passo de aprovação que falha em repo privado e "resolver" com workaround em vez de removê-lo

## Status

Documentado após diagnóstico de falha real em PR #1397 (fast-uri) e correção aplicada em PR #1407.
