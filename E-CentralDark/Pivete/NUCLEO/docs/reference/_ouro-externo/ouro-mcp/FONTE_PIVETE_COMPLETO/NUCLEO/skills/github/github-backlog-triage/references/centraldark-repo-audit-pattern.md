---
tipo: reference
repo_alvo: ServerVpss/CentralDark
data: 2026-08-08
autor: Hermes Pivete (profile pivete)
fonte: audit live via `gh` + `gh api`
---

# CentralDark Repo Audit — PR + Branch Inventory Pattern

Padrão para auditar um repo GitHub com **muitos PRs + branches + issues**,
**sem escrever nada no remoto**. Caso real: `ServerVpss/CentralDark`
com 39 issues, 16 PRs abertos, 123 branches remotas (audit 08/08/2026).

## Princípios (Pivete 08/08)

> "Pivete já tem ordem explícita: refinar/corrigir o existente. NÃO
> destruir. NÃO inventar autoridade."

- **R0 apenas**: `gh api`, `gh pr view`, `gh issue list` — zero escrita.
- **Nada de merge, force-push, reset, delete, close, label-change**.
- **Nada de bot aleatório mexendo em PR de missão crítica** — só o
  Pivete (ou ordem literal) autoriza mutações.
- **Saída**: tabela estruturada + classificação, NUNCA ação.

## 1. Pull estado completo (read-only)

```bash
# Issues abertas (max 100; paginar se precisar)
gh issue list --repo $R --state open --limit 100 \
  --json number,title,author,createdAt,labels,body

# PRs abertos (mesma coisa)
gh pr list --repo $R --state open --limit 100 \
  --json number,title,author,headRefName,baseRefName,isDraft,mergeable,statusCheckRollup,additions,deletions,changedFiles,createdAt,updatedAt

# Branches (paginar — primeira página = 100)
gh api "repos/$R/branches?per_page=100"
gh api "repos/$R/branches?per_page=100&page=2"
```

## 2. Classificação PR (4 estados)

```text
DRAFT     → PR em draft, ainda em desenvolvimento
READY     → não-draft + mergeable=MERGEABLE + checks COMPLETED
BLOCKED   → checks falham OU precisa ação humana
CONFLICT  → mergeable=CONFLICTING (precisa rebase)
```

**Tabela produzida (audit 08/08, 16 PRs):**

| Categoria | Contagem | Lista |
|---|---:|---|
| DRAFT | 9 | #704, #678, #677, #676, #668, #659, #658, #576, #554 |
| READY (mergeable + não-draft) | 5 | #667, #664, #660, #657, #648 |
| CONFLICT | 2 | **#662, #646** |
| BLOCKED (checks pendentes) | 0 | — |

**Pivete tip:** PRs com `mergeable=CONFLICTING` precisam rebase antes de
qualquer conversa de merge. **Não** fazer `gh pr merge` em conflito.

## 3. Branch inventory (read-only)

Para classificar 100+ branches, pegar a data do **último commit** via:
```bash
gh api "repos/$R/commits/heads/<branch>" | jq '.commit.author.date'
```

**Atenção:** um `gh api` por branch = 100+ chamadas. **Rate-limit** real
(~5000/h com auth). Spread em batelada ou usar `git log` local após
`git fetch --all`.

### Categorização

```text
ATIVA    → ultimo commit < 30 dias
STALE    → ultimo commit > 30 dias
PROTEGIDA→ branch com proteção (main, releases, production)
ORPHAN   → sem PR aberto E stale (candidata a arquivar)
```

**Observação real (audit 08/08):** muitos prefixes em `pivete/`, `agent/`,
`lovable-sync-*`, `docs/`, `feat/`, `fix/`. Padrão de **PR-por-branch-curta**
(branch criada, 1 PR, branch nunca mais tocada). Esperado: ORPHAN.

### Prefixos observados (8/8)

```
agent: 4        automation: 1   auditoria: 1    chore: 3
claude: 2       codex: 1        docs: 21        evol: 1
feat: 19        feature: 1      fix: 36         <no-prefix>: 14
plan: 3         promote: 2      snapshot: 1     staging: 1
test: 1
```

**Inferência (não-ação):** muito `fix/*` (36) + `feat/*` (19) + `docs/*` (21)
sugere **trabalho fragmentado**. Sem PR aberto = ORPHAN. Arquivar?

**R0 só.** Pivete decide.

## 4. Issues — divida em SENTINELA vs humano

(O SKILL `github-backlog-triage` já cobre em detalhe. Resumo:)

```python
def is_sentinela(i):
    return i['title'].startswith('[SENTINELA') or any(
        'sentinela' in (l.get('name') or '').lower() for l in i.get('labels', []))
```

**Audit 08/08:** 39 issues abertas. Padrão observado:
- ~10+ `[SENTINELA ...] Workflows: Workflow vermelh...` (auto-alerts)
- ~5 com labels `🤖 IA-VALIDAR`, `🤖 IA-PESQUISAR`, `🧠 AGENTE-CODEX/JARVIS`
- 2 com label `bug` (`#420 clone-deck`, `#419 Monitoramento24h`)

**Recomendação (não-ação):** SENTINELA alertas são STALE-prone. Antes de
classificar como "down", `curl` ao endpoint. (Já documentado no SKILL.)

## 5. Tabela de saída sugerida

```text
PR RESUMO
| # | branch | draft | merge | linha | + | - | arquivos | última atualização |

BRANCH INVENTORY
| branch | último commit | dias | PR associado | estado |

ISSUES RESUMO
| # | tipo | root cause | ação |
```

**Onde publicar:** `CARTAO-MESTRE.md` (Pivete tem atalho `card`) ou
changelog da sessão. **Não** commitar — a audit é estado, não história.

## 6. R0 — o que NÃO fazer

```text
✗ gh pr merge (mesmo READY)
✗ gh pr close
✗ gh issue close
✗ gh api -X DELETE  /repos/.../branches/<orphan>
✗ git push --force
✗ git push --delete origin <branch>
✗ Criar PR novo a partir de inventário
✗ Mudar label
✗ Adicionar comentário a PR de outro agente
```

**Se for pra agir:** Pivete autoriza, transforma em R2, e cada passo
vai num goal/missão separado. Audit é só leitura.

## 7. Próximo passo REAL (sem ação agora)

Pivete precisa decidir:

1. **Quais DRAFTs promover** (transformar em READY).
2. **Quais CONFLICT rebasear** (#662, #646).
3. **Quais ORPHANs arquivar** (após diff-vs-main).
4. **Quais SENTINELA fechar** (após live curl confirmando recovery).

A audit provê o **mapa**. **Pivete decide o ritmo**. Hermes executa
quando virar goal R2.

## 8. Ligações

- Skill pai: `github-backlog-triage`
- Skill complementar: `pr-auditing` (falso-verde em PR)
- Skill complementar: `pr-adversarial-gate` (merge condicional)
- Skill central: `centraldark-pr` (workflow de PR para CentralDark)
- Skill do dia-a-dia: `github-pr-workflow` (ciclo abrir→revisar→merge)
