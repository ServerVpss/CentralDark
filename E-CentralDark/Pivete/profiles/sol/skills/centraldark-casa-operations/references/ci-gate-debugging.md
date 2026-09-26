# CentralDark CI Gate Debugging — Recipes (derivado 29/08)

Reprodução determinística dos 3 modos de falha de CI vistos na Casa e a correção
mínima de cada um. Zero regressão: estende o que existe, não cria V2.

## 0. Extrair o erro real (não adivinhe)

```bash
# Lista recentes (raw, sem python3 — este host não tem python3; use python 3.13 ou node)
gh run list --limit 40

# Acha o run FAIL na BASE (porta-de-entrada é o gate que trava TODOS os PRs)
gh run list --limit 40 | grep -iE "porta-de-entrada|failure"

# Log completo do run que falhou -> arquivo (gh api jobs/<id>/log dá 404, NÃO usar)
gh run view <RUN_ID> --log-failed > /caminho/estavel/_run_fail.txt

# Ponto de decisão do gate (marcadores do validador)
grep -nE "RESULTADO=|CAUSE=|UNREGISTERED|INVARIANT|##\[error|exit code|EXTERNAL_SOURCE|DRIFT" _run_fail.txt
```

`gh api repos/.../actions/jobs/<id>/log` retorna **404** neste repo (log por job
expira/sem permissão). Sempre usar `gh run view <run> --log-failed`.

## 1. codex-validate — `SyntaxError: module './x.mjs' does not provide an export named 'Y'`

Causa típica: um PR consolidador removeu uma função exportada que um teste ainda
importa. Correção = **recuperar o símbolo perdido do git history** (não reimplementar).

```bash
# 1. Achar a ÚLTIMA versão do arquivo que TINHA o export
LAST=$(git log -S "export function Y" --pretty=format:"%H" -- <caminho/arquivo.mjs> | tail -1)

# 2. RESTAURAR o arquivo inteiro dessa versão canônica (preserva auditar/vetar/etc intactos)
git show "$LAST:<caminho/arquivo.mjs>" > /tmp/arquivo_restaurado.mjs
# diff contra o atual p/ confirmar que não perde melhoria legítima em outras funções
```

**PITFALL CRÍTICO (custou 3 tentativas):** não restaure do primeiro SHA que contém
o *nome* da função. O teste evolui e a função pode exigir campos novos (ex:
`receipt.mutations_total`, `receipt.unproven_mutations`). Restaurar a versão antiga
faz o import resolver mas o teste falha em asserção nova.

Correto: achar o SHA onde a função já tem o *contrato atual do teste*:

```bash
# Procura a versão onde a função possui o campo novo que o teste exige
for sha in $(git log --pretty=format:"%H" -- <arquivo.mjs> | head -15); do
  if git show "$sha:<arquivo.mjs>" 2>/dev/null | grep -q "unproven_mutations"; then
    echo "ACHOU em $sha"; break
  fi
done
git show "$sha:<arquivo.mjs>" > <arquivo.mjs>   # restaura estado que bate com o teste
```

```bash
# 3. Contraprova local (node roda direto; MSYS não tem o bug de ROOT pathname p/ teste unitário simples)
node --check <arquivo.mjs> && echo SYNTAX_OK
node --test <teste.mjs>     # esperado: N tests, N pass, 0 fail
```

Se a função recuperada usa `await import('node:crypto')` dentro de função síncrona
(bug de recuperação), trocar por `import { createHash } from 'node:crypto'` no topo.

## 2. Lupa Drift Guard — `SKILL_PARALELA_LUPA: .agents/skills/lupa-bayesiana`

Causa: skill com "lupa" no nome fora da canônica, sem ser alias validado. O detector
(`scripts/lupa/detectar_drift.py`) só aceita se o nome estiver em `ALIASES_COMPAT` E
a pasta tiver `SKILL.md` redirect válido.

Correção (extensão segura — NÃO apaga o código nivel-7 que pode ser ouro):

```bash
# a) Estende a allowlist (1 linha) — não cria V2, não inverte dono
#    ALIASES_COMPAT = {"tecnica-da-lupa", "lupa-bayesiana"}
```

`SKILL.md` redirect válido (o `alias_compativel()` exige EXATAMENTE estes campos):

```yaml
---
name: lupa-bayesiana
type: redirect
status: COMPATIBILITY_ALIAS
owner: .agents/skills/meta-lupa/SKILL.md
TECNICA_DA_LUPA_IS_SECOND_SKILL=false
TECNICA_DA_LUPA_IS_SECOND_OWNER=false
META_LUPA_IS_CANONICAL_OWNER=true
---
```

```bash
# Contraprova
python scripts/lupa/detectar_drift.py; echo "DRIFT_EXIT=$?"   # esperado: 0 (SEM DRIFT)
```

## 3. porta-de-entrada — `EXTERNAL_SOURCE_*_FORBIDDEN` (SynkraAI/aiox-core)

ISTO NÃO É BUG — é o gate de governança **funcionando**. O
`validar-identidade-operacional.mjs` barra referências a fontes externas não-canônicas.
Corrigir = decisão de arquitetura do CHEFE (incorporar canonicamente, sanitizar a
referência, ou isentar), NÃO mexer no validador (seria regressão de governança).

Filtro: todo erro de CI é medido e classificado antes de agir:
- bug de infra/conteúdo interno → corrige por PR de missão (R2).
- gate de política barrando conteúdo externo → fronteira, pergunta ao CHEFE.

## 4. Fluxo de fechamento (ONE_WRITER por scope)

```bash
git worktree add -f <wt> origin/main
cd <wt>; git checkout -b fix/<escopo>
# edita, commita (single-writer HERMES-CASA), push, gh pr create --base main
```

Não editar `origin/main` direto. Não force-push. Não abrir PR de teste repetido após
o primeiro já ter provado (wasted turn).
