# resolve-conflicts.sh — Bug e Correção

## Bug (28/08)

O `git checkout --ours -- package.json` é cego — aceita o arquivo INTEIRO do PR, perdendo TODAS as outras mudanças da main que não são o bump.

**Prova empírica:**
- main: zod 3.0.0, react 19.0.0
- PR: zod 3.25.0, react 18.0.0 (bump só no zod)
- Resultado antigo: zod 3.25.0, react 18.0.0 ← PERDEU react 19.0 da main!

## Correção (commit 9d31ebe4d)

O motor agora usa merge inteligente com merge-base:

```python
pr = read_json("2")      # :2: = ours = HEAD = PR
main = read_json("3")    # :3: = theirs = MERGE_HEAD = main
base = read_base()       # merge-base

for dep in all_deps:
    if pr_val != base_val:
        merged[dep] = pr_val   # PR mudou, aplica bump
    else:
        merged[dep] = main_val # PR não mudou, mantém main
```

**Por que não comparar PR vs main diretamente?**
Porque se a main mudou react de 18→19 e o PR não mexeu no react,
a comparação PR vs main mostraria "diferente" e aplicaria o PR (18),
perdendo a mudança da main. Comparando PR vs merge-base,
o PR não mudou em relação ao base, então mantemos main (19).

**Resultado:** main preservada + bump do PR aplicado.

## Validação

Após rodar o motor:
```bash
git diff origin/main -- package.json
```
Deve mostrar APENAS o bump do PR, não regressões silenciosas.

## Lockfile

Lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) continua `--ours` — é gerado, não editado manualmente.
