# Prova Empírica de Semântica de Merge

Receita para verificar o comportamento real de `--ours`/`--theirs` em conflitos de merge,
sem depender de documentação ou comentários de código.

## Cenário

Dois branches divergem no mesmo arquivo. O motor faz `git merge main` a partir da branch do PR.

```bash
cd /tmp && rm -rf merge-proof && mkdir merge-proof && cd merge-proof
git init -q -b main . && git config user.email "t@t" && git config user.name "t"
printf 'BASE\n' > f.txt && git add . && git commit -qm base
git checkout -qb pr
printf 'LADO_DO_PR\n' > f.txt && git commit -qam pr
git checkout -q main
printf 'LADO_DA_MAIN\n' > f.txt && git commit -qam main
git checkout -q pr
git merge --no-commit --no-ff main 2>&1 | grep CONFLICT
```

## Verificação

```bash
# --ours = lado do PR (HEAD)
git checkout --ours -- f.txt && cat f.txt    # → LADO_DO_PR

# --theirs = lado da main (MERGE_HEAD)
git checkout --theirs -- f.txt && cat f.txt  # → LADO_DA_MAIN
```

## Quando usar

- Sempre que o motor de resolução for alterado.
- Sempre que houver dúvida sobre qual lado vence em um `git checkout --ours/--theirs`.
- Após qualquer mudança no fluxo de merge (rebase, cherry-pick, merge-tree).

## Por que importa

O bug #1343 provou que o comentário dizia "mantém main" mas o código aceitava o PR (`--ours`).
Sempre validar o **código**, não o comentário:

```text
FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
```
