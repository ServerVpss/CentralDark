# Merge-Base como Referência — Técnica de Resolução de Conflitos

Quando um PR de bump conflita com a main, o `git checkout --ours` é cego: ele aceita o arquivo INTEIRO do PR, perdendo TODAS as outras mudanças da main (não só o bump que o PR queria fazer).

## O Bug (provado empiricamente)

```
Cenário:
  main:   zod 3.0.0, react 19.0.0
  PR:     zod 3.25.0, react 18.0.0 (bump só no zod)

Resultado do motor antigo (--ours cego):
  zod: 3.25.0 ✓
  react: 18.0.0 ← PERDEU react 19.0 da main!
```

## A Correção

Comparar PR vs **merge-base** (não vs main):

```python
base = read_json(merge_base_commit)
pr = read_json("2")      # :2: = ours = HEAD = PR
main = read_json("3")    # :3: = theirs = MERGE_HEAD = main

for dep in all_deps:
    if pr[dep] != base[dep]:
        merged[dep] = pr[dep]   # PR mudou, aplica bump
    else:
        merged[dep] = main[dep]  # PR não mudou, mantém main
```

## Validação Pós-Fix

```bash
# Após rodar o motor, verificar que só o bump do PR foi aplicado
git diff origin/main -- package.json
# Deve mostrar APENAS o bump do PR, não regressões silenciosas
```

## Prova Empírica (28/08)

```
Cenário:
  main:   zod 1.0.0, react 19.0.0, radix 1.2.0
  PR:     zod 3.26.0, react 18.0.0, radix 1.1.0 (bump só no zod)

Resultado do motor corrigido:
  zod: 3.26 (PR) ✓
  react: 19 (main) ✓
  radix: 1.2 (main) ✓
```

## Referências

- `references/empirical-git-proof.md` — técnica de prova empírica para semântica git
- `references/ours-cego-bug-empirical-proof.md` — prova do bug `--ours` cego
- Commit `9d31ebe4d` — fix merge inteligente com merge-base
- Commit `3c77bf7a6` — remove bloco obsoleto de re-aplicação
