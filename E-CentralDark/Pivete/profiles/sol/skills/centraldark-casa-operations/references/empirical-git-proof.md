# Técnica de Prova Empírica para Semântica Git

Quando o código git tem semântica contraintuitica (ex: `--ours`/`--theirs` durante merge),
nao confie no comentario do codigo. Prove empiricamente com repositorio descartavel.

## Padrao de Prova

```bash
# 1. Criar repositorio descartavel
cd /tmp && rm -rf proof && mkdir proof && cd proof
git init -q -b main . && git config user.email "t@t" && git config user.name "t"
git config core.autocrlf false

# 2. Criar cenario
echo '{"a":1,"b":2}' > f.json && git add . && git commit -qm base
git checkout -qb pr && echo '{"a":9,"b":2}' > f.json && git commit -qam pr
git checkout -q main && echo '{"a":1,"b":7}' > f.json && git commit -qam main

# 3. Merge e verificar
git checkout -f pr && git merge --no-commit --no-ff main 2>&1 | grep CONFLICT
echo "=== :2: (PR) ===" && git show :2:f.json
echo "=== :3: (main) ===" && git show :3:f.json
```

## Resultado Esperado (merge de main na branch do PR)

```text
:2: (ours/HEAD/PR)    → {"a":9,"b":2}   ← lado do PR
:3: (theirs/MERGE_HEAD/main) → {"a":1,"b":7} ← lado da main
```

## Invariante

O motor `resolve-conflicts.sh` esta **NA branch do PR** e faz `git merge origin/main`.
Portanto:
- `--ours` = lado do PR (HEAD/:2:)
- `--theirs` = lado da main (MERGE_HEAD/:3:)

Isso e contraintuitivo e ja custou caro. Sempre validar com repositorio descartavel.

## Quando Usar

- Antes de canonizar qualquer regra de resolucao de conflito
- Quando o comentario do codigo contradiz a intuicao
- Quando o FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
- Ao validar correcao de bug de merge (apos aplicar o fix, refazer a prova)

## Prova de Pacotes (28/08)

Cenario real testado:
```
main:   zod 1.0.0, react 19.0.0, radix 1.2.0
PR:     zod 3.26.0, react 18.0.0, radix 1.1.0 (bump so no zod)

Resultado do motor (apos fix):
  zod: 3.26 (PR) ✓
  react: 19 (main) ✓
  radix: 1.2 (main) ✓
```
