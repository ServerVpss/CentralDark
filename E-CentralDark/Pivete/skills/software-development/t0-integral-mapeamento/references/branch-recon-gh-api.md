# Reconhecimento de Branches Remotos via GitHub API

Uso quando precisa inventariar branches remotas (nome, commit, tree) sem clone local ou quando `git ls-remote` falha por falta de repositório local.

## Por que usar gh api em vez de git ls-remote

- `git ls-remote --heads origin` exige um clone local com remote configurado. Se o workspace não é um repo git (como no Front 7: `fatal: not a git repository`), a comando falha.
- `gh api repos/OWNER/REPO/branches --paginate` funciona com apenas `gh auth login` válido — não precisa de clone, de remote, ou de `.git` presente.

## Comando base

```bash
gh api repos/ServerVpss/CentralDark/branches --paginate
```

- Retorna **todas** as branches (paginadas automaticamente pelo `--paginate`).
- Formato: **JSON newline-delimited chunks** (não um único array), cada chunk é um array JSON `[{...}, {...}]`. Para parsing robusto em Python:
  ```python
  import json, subprocess
  result = subprocess.run(
      ["gh", "api", "repos/OWNER/REPO/branches", "--paginate"],
      capture_output=True, text=True, timeout=90
  )
  branches = json.loads(result.stdout)  #  loads direto funciona para o todo
  ```
  Nota: na prática o `--paginate` do gh junta tudo num único array JSON válido ao final — `json.loads` direto no stdout funciona. Não precisa de parser linha-a-linha.

## Filtragem em 3 níveis

Não se limita ao nome da branch. O que importa é o conteúdo.

### Nível 1 — Nome da branch

```
KW = ['harness', 'claude', 'codex', 'orchestrator']
for b in branches:
    if any(kw in b['name'].lower() for kw in KW):
        ...
```

### Nível 2 — Último commit message

```bash
gh api repos/OWNER/REPO/commits/<sha>
# -> commit.commit.message
```

Filtra por keyword no corpo da mensagem (nem sempre refletido no nome).

### Nível 3 — Tree do commit (conteúdo real)

```bash
gh api repos/OWNER/REPO/git/trees/<sha>?recursive=1
# -> tree.tree[] .path
```

Percorre todos os paths do tree recursivamente. Para cada path, checar se contém as keywords. Isso revela branches que têm `.claude/`, `harness/`, `orchestrator/`dentro do tree mesmo quando o nome da branch não deixa explícito.

## Saída típica

Para cada branch relevante, reportar:
- Nome da branch
- SHA do commit (short: 10 chars)
- Mensagem do último commit (truncada)
- Conteúdo relevante do tree (paths que bateram com as keywords, limitados a ~10)

Exemplo real (Front 7, 482 branches → 12 relevantes):
- `claude/multi-agent-semantic-rules-7etunk` — 47 hits `.claude/` no tree, commit sobre regra-mãe multi-agente
- `codex/centraldark-standard-flow-20260831` — 52 hits, referência a reconciliation de screenpipe false-green
- `promote/codex-kit-main` — 51 hits, kit Codex (AGENTS.md, CODEX.md, prompt, template PR) promovido para main

## Combinação com measurement pré-consolidação (t0)

Este procedimento é o eixo **A. GIT/GOVERNANÇA** do T0 integral: inventariar branches remotas antes de qualquer consolidação. Use-o como sub-step do T0 quando a intenção inclui "medir todo o repo".

## Fallback quando gh não está autenticado

```bash
gh auth status   # verificar login
# se não: gh auth login --with-token (quando token disponível de forma segura)
```

Se não houver gh nem acesso ao repo, não inventar — classificar como UNKNOWN e reportar explicitamente.

## Pitfalls

- **JSON parse error por control character**: ao usar `terminal()` que retorna output em pedaços, o JSON pode chegar fragmentado. Usar `subprocess` direto (não terminal) evita o problema.
- **Filtro só por nome perde conteúdo**: uma branch `feat/xpto` pode conter `.claude/` completo no tree. Sem nível 3, falso negativo.
- **Tree enorme (50+ hits)**: limitar a 10 paths no report para não encher o contexto. O número total de hits já informa o volume.
