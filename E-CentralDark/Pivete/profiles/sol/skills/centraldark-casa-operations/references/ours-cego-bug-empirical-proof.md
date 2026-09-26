# --ours cego — Bug empírico provado e fix correto (2026-08-28)

## O bug

O script `scripts/dependabot/resolve-conflicts.sh` tinha um bug documentado:
`git checkout --ours -- package.json` é cego — aceita o arquivo inteiro do PR,
perdendo TODAS as outras mudanças da main, não só o bump que o PR queria fazer.

## Prova empírica

Cenário controlado:
```
main:   zod 3.0.0, react 19.0.0
PR:     zod 3.25.0, react 18.0.0  (bump só no zod)
```

Resultado do `git checkout --ours -- package.json`:
```
zod: 3.25.0 ✓ (PR)
react: 18.0.0 ✗ — REGREDIU! Deveria ser 19.0 (main)
```

Esperado: `zod: 3.25 (PR) + react: 19 (main)`

## O fix correto (commit 9d31ebe4d)

Usa a sintaxe de stage do git durante merge conflict + merge-base:
- `:2:` = ours = HEAD = lado do PR
- `:3:` = theirs = MERGE_HEAD = lado da main
- `git merge-base HEAD MERGE_HEAD` = base comum

O merge inteligente parte do merge-base como referência:
```python
pr = read_json("2")      # :2: = PR
main = read_json("3")    # :3: = main
base = read_base()       # merge-base

# Para cada dependência:
#   - Se PR != base: PR mudou, aplica bump
#   - Se PR == base: PR não mudou, mantém main
```

**Por que não comparar PR vs main diretamente?**
Porque se a main mudou react de 18→19 e o PR não mexeu no react,
a comparação PR vs main mostraria "diferente" e aplicaria o PR (18),
perdendo a mudança da main. Comparando PR vs merge-base,
o PR não mudou em relação ao base, então mantemos main (19).

## Validação

Resultado após fix:
```
zod: 3.26.0 (PR) ✓
react: 19.0.0 (main) ✓
@radix-ui/react-dialog: 1.2.0 (main) ✓
```

## Lição

1. `git checkout --ours/--theirs` é cego — aceita o arquivo inteiro de um lado.
2. Para package.json, use merge inteligente que preserva mudanças da main que não são o bump.
3. A referência para comparação é o **merge-base**, não o main.
4. Lockfile continua `--ours` (é gerado, não editado manualmente).
5. Validação pós-fix: `git diff origin/main -- package.json` deve mostrar APENAS o bump do PR.
