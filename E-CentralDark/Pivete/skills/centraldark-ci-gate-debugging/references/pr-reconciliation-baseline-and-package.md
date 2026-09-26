# Receita: PR com baseline debt, main avançando e pacote cross-owner

Use quando um PR CentralDark recebe vários gates vermelhos e a causa pode misturar regressão, dívida herdada e runner.

## Diagnóstico

1. Medir o HEAD remoto do PR, `origin/main`, merge-base, mergeability e runs:

```bash
gh pr view <PR> --json headRefOid,baseRefOid,mergeable,mergeStateStatus
gh run list --branch <branch> --limit 30 --json databaseId,workflowName,status,conclusion,headSha,event
git fetch origin main <branch>
BASE=$(git merge-base origin/main HEAD)
HEAD_SHA=$(git rev-parse HEAD)
```

2. Abrir logs por run com `gh run view <RUN_ID> --log-failed`; não depender de `gh api .../jobs/.../log`, nem de `gh run watch` como única prova.

3. Comparar o diagnóstico no merge-base/main e no HEAD. Fingerprint e contagem idênticos são dívida baseline; um `UNSAFE_PATHS` novo é regressão material.

## Correções provadas

- `EXTERNAL_SOURCE_*_FORBIDDEN`: sanitizar nomes literais no documento (`AIOX` → `AI-OX`, por exemplo), sem enfraquecer o validador.
- `git diff --check`: remover espaços finais somente nos arquivos apontados pelo gate.
- `modify/delete` de workflow: consultar política de runner e consumidor. Se o workflow usa `ubuntu-latest` contra a política self-hosted e não é necessário ao sistema, manter a remoção do lado canônico; não escolher por posição visual.
- `verify_package.py` pedindo arquivo fora da família empacotada: o builder deve incluir o arquivo no ZIP no caminho relativo exigido. Não duplicar o owner no repositório.
- tokens exigidos no diagrama: alterar `ARCHITECTURE.mmd`; o PNG é artefato gerado pelo workflow Mermaid, não um placeholder commitado.

## Validação mínima

```bash
node scripts/lupa/validar-porta-de-entrada.mjs --repo-root . --json --base-sha "$BASE" --head-sha "$HEAD_SHA"
node scripts/lupa/validar-identidade-operacional.mjs --repo-root . --json
node --test scripts/memory-linker/*.test.mjs
npm run test
npm run build
npm run lint # se falhar fora do delta, registrar dívida preexistente
```

Para pacote, gerar/extrair o ZIP e executar o verificador contra a raiz extraída. `VERIFY=PASS` é obrigatório; imagem ausente localmente pode ser uma pré-condição do gerador Mermaid, não deve ser simulada com imagem vazia no commit.

## Critério de fechamento

- `MERGEABLE` observado após reconciliar `origin/main` atual;
- `PORTA_OK=true`, canônicos alcançáveis completos e zero erros;
- testes/build locais passados;
- lint global separado entre delta e dívida preexistente;
- checks remotos `queued`/`pending` continuam UNKNOWN até conclusão real;
- não declarar CI verde por ação de push, check skipped ou job queued.
