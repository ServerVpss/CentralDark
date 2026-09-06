---
name: git-conflict-resolve-house-standard
description: Padrão único da Casa para detectar e resolver conflito de PR (dependabot ou humano). Todo PR aberto passa pelo radar global; não criar segundo resolvedor nem fazer merge manual fora deste padrão.
metadata:
  type: operational
  version: "1.1"
  owner: SEGREDO/CHEFE
---

# Conflito de PR — padrão único da Casa

Owner do motor: `scripts/dependabot/resolve-conflicts.sh`  
Radar global: `scripts/dependabot/reconcile-open-prs.sh`  
Gatilho: `.github/workflows/dependabot-auto-merge.yml`

O nome histórico `dependabot` permanece por compatibilidade/proveniência. A função do radar é **global do repositório**: nenhum PR aberto, humano ou bot, deve ficar invisível ao circuito de reconciliação.

```text
ONE_CONFLICT_ENGINE=true
ALL_OPEN_PRS_PASS_GLOBAL_RADAR=true
DEPENDABOT_SPECIALIZATION != SECOND_SYSTEM
HUMAN_PR_AUTO_CONTENT_RESOLUTION=false
UNKNOWN != PASS
```

Se aparecer um segundo resolvedor, ele é o errado. Este se atualiza; não se duplica.

## 1. Radar global antes da resolução

```text
PR_OPEN_OR_UPDATED
→ RADAR_GLOBAL
→ MEASURE MAIN + HEAD + AUTHOR + BASE + MERGEABILITY
→ UPDATE_BRANCH quando same-repo e seguro
→ REMEASURE
→ CONFLICT?
   → DEPENDABOT: resolver determinístico especializado
   → HUMANO/OUTRO: medir conflitos + receipt + Writer semântico fail-closed
→ SAME_HEAD_TEST
→ COUNTERPROOF
```

O radar é repositório-global, não “um job por PR Dependabot”. O job especializado de auto-merge continua exclusivo do Dependabot; isso não impede que PRs humanos atravessem o mesmo radar de conflitos.

## 2. A regra que quase ninguém acerta

O motor está na branch do PR e faz `git merge origin/main`. Logo:

```text
--ours    = lado do PR    (HEAD)
--theirs  = lado da main  (MERGE_HEAD)
```

Isso é contraintuitivo e já custou caro: a versão anterior do motor tinha comentários invertidos em relação ao código — dizia “mantém main” e usava `--ours`, que aceita o PR.

```text
FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
```

## 3. Política por classe de PR

### Dependabot

| Caminho | Lado que vence | Por quê |
|---|---|---|
| `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` — em qualquer diretório | **PR** (`--ours`) | o PR é o bump; manter a main aqui apaga o motivo do PR |
| todo o resto | **main** (`--theirs`) | fail-closed: PR automático não promove código canônico sozinho |

### PR humano / não-Dependabot

O motor **não escolhe conteúdo automaticamente**. Ele reproduz o merge em worktree isolado, lista cada path em conflito, aborta o merge e devolve:

```text
HUMAN_CONFLICT_AUTO_RESOLUTION=BLOCKED_FAIL_CLOSED
NEXT_CURSOR=SEMANTIC_WRITER_RECONCILE
PR_BRANCH_WRITE=0
DIRECT_MAIN_WRITE=0
```

O radar deixa receipt idempotente no próprio PR e aplica `🔄 GIT-DIVERGÊNCIA` quando a label existir. O Writer do escopo reconcilia o significado; depois os mesmos gates medem o HEAD novo.

## 4. Fluxo canônico

```text
PR abre/anda
→ radar global dispara
→ main/head/mergeability medidos
→ update-branch quando aplicável
→ conflito passa pelo motor único
→ Writer semântico só quando necessário
→ checks no mesmo HEAD
→ contraprova
→ squash/promoção apenas pela política aplicável
```

Na mão, quando o runner estiver fora:

```bash
ssh Segredo-VPS "cd /root/CentralDark && PR_KIND=dependabot PR_HEAD_REF=<branch> bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

Para PR humano, o modo seguro é somente medir/listar:

```bash
ssh Segredo-VPS "cd /root/CentralDark && PR_KIND=human PR_HEAD_REF=<branch> bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

## 5. Regras de ferro

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != CI_PASS
SKIPPED != PASS
CONFLICT_SEEN != CONFLICT_RESOLVED
```

- Não criar segundo script de conflito.
- Não `force push` em `main`.
- `NO_CONFLICT` significa apenas que naquele instante não havia divergência.
- Se a main avançar, medir de novo.
- PR humano não recebe resolução cega de arquivos conflitantes.
- Job skipped por filtro especializado não significa que o PR saiu do radar global.
- Squash é padrão de promoção quando aplicável; checks continuam sendo evidência, não decoração.

## 6. Armadilhas registradas

1. **`--ours`/`--theirs` invertidos.** Sempre reprovar a semântica quando a política mudar.
2. **Reinjetar bump por nome de branch.** O manifesto do próprio PR é a fonte do bump, não inferência do branch name.
3. **Lockfile único = conflito em cadeia.** Agrupamento Dependabot reduz colisões; radar global continua medindo todas.
4. **Radar especializado confundido com radar global.** O job de auto-merge é Dependabot-only; o radar de conflitos não pode ser Dependabot-only.
5. **Resolver PR humano com winner automático.** Proibido: conflito semântico humano exige Writer do escopo.

## 7. Receipt mínimo do radar

```text
PR_NUMBER
AUTHOR
BASE_REF
HEAD_REF
HEAD_SHA
MAIN_SHA
MERGEABILITY
CONFLICT_CLASS
ENGINE
WRITER_REQUIRED
NEXT_CURSOR
```

Para conflito humano, o comentário no PR é proveniência/ledger, nunca fonte da verdade.

## 8. Adaptação

Realidade nova (outro gerenciador, lockfile, tipo de PR ou regra de conflito) atualiza **este arquivo, este radar e este motor no lugar**. Nunca um segundo sistema.
