# Sync de Worktrees — Checklist Operacional

Padrão de sincronização de worktrees num clone multi-agente.
Referência complementar à **Regra 75b** do SKILL.md.

## Quando usar

Sempre que for rodar `git pull --rebase` (ou qualquer operação que altere refs/working tree) em um worktree, executar o checklist abaixo antes do pull.

Não assumir que worktree está limpo ou que a branch rastreada ainda existe.

## Checklist por worktree

### 0 — Identificar o worktree

```bash
git worktree list --porcelain
```

Percorrer cada entrada. Anotar:
- `path:`
- `branch:` (se existe)
- `HEAD:`
- `locked:` (se presente)

### 1 — Verificar estado do working tree

```bash
git status --short
```

Se houver staged/unstaged/untracked, **não pular para o pull**.

#### 1a — Se há mudanças

```bash
git diff --stat
```

Decidir antes de prosseguir:

- **Lixo óbvio** (build artifacts, asset dumps, temporários): `git checkout -- <arquivo>` ou `git clean -fdn` (dry-run primeiro, só depois `git clean -fd` se confirmar).
- **Trabalho útil**: `git stash push -m "WIP: <assunto>"` ou commit WIP com mensagem `WIP: <assunto>` antes do pull.
- **Não sei se é útil**: ler o diff, perguntar ao CHEFE se o escopo estiver ambíguo.

**Proibido**: resolver o erro de rebase com `git add -A` cego.

#### 1b — Se está limpo (apenas `??` untracked que não são parte do trabalho)

Registrar os untracked e avançar se não havia staged/unstaged.

### 2 — Verificar tipo de checkout

```bash
git branch --show-current
```

#### 2a — Se mostra branch nomeada

Ter tracking confirmado (próximo passo).

#### 2b — Se vazia (detached HEAD)

Verificar se a branch referenciada ainda existe no remoto:

```bash
git fetch origin
git branch -a | grep -i <nome-da-branch-ou-sha>
```

- Se a branch existe: considerar checkout para ela antes do pull.
- Se a branch não existe mais: reportar ao CHEFE, não adivinhar.

### 3 — Verificar tracking

```bash
git rev-parse --abbrev-ref @{upstream}
```

#### 3a — Se retorna `origin/<branch>`

Tracking existe. Verificar se a ref remota ainda existe:

```bash
git ls-remote origin | grep -i <branch>
```

- Se existe: avançar para o pull.
- Se não existe: reportar ao CHEFE.

#### 3b — Se retorna erro (`fatal: HEAD does not point to a branch` ou `there is no tracking information`)

Não ha um upstream configurado. Se a branch remota existe:

```bash
git branch --set-upstream-to=origin/<branch>
```

Ou usar explicitamente:

```bash
git pull origin <branch> --rebase
```

#### 3c — Se o pull falhou com "Your configuration specifies to merge with the ref ... but no such ref was fetched"

A branch que o worktree rastreava foi deletada/renomeada no remoto.

Diagnosticar:

```bash
git ls-remote origin | grep -i <nome-da-branch-antiga>
```

- Se existe sob outro nome: reconfigurar tracking para o novo nome.
- Se não existe mais: reportar ao CHEFE para decisão.

### 4 — Executar o pull --rebase (se checklist passou)

```bash
git pull --rebase
```

Ou, se não há upstream:

```bash
git pull origin <branch> --rebase
```

#### 4a — Se conflito durante rebase

Não abortar cego, não ignorar cego.

1. Ler o arquivo conflitante:
   ```bash
   git diff <arquivo-conflictante>
   ```
2. Decidir qual versão (ou mescla) faz sentido para o escopo.
3. Marcar resolvido:
   ```bash
   git add <arquivo-conflictante>
   ```
4. Continuar:
   ```bash
   git rebase --continue
   ```
5. `git rebase --abort` apenas se a continuação não tem base ou se a escolha não está clara.

#### 4b — Se for fast-forward ou already up to date

Ok. Registrar e avançar.

### 5 — Tratar worktrees locked

Se `git worktree list --porcelain` mostra `locked`:

1. Verificar se o lock é órfão:
   - O caminho existe no disco?
   - O worktree está sendo usado por outro agente?
2. Se órfão:
   ```bash
   git worktree unlock <path>
   git worktree remove <path>   # se seguro e confirmado
   ```
3. Se ativo: não mexer, reportar ao CHEFE.

### 6 — Tratar worktrees que não existem mais no disco

Se o caminho listado não existe mais:

```bash
git worktree list
```

Se ainda consta na listagem, pode ser um ghost/worktree órfão. Reportar ao CHEFE para limpeza.

## Fluxo de decisão para refs remotos inexistentes

Quando a branch que um worktree rastreia não existe mais no remoto:

1. Verificar se existe sob outro nome:
   ```bash
   git ls-remote origin | grep -i <termo>
   ```
2. Se existe sob outro nome: reconfigurar o worktree para a nova branch.
3. Se não existe mais: reportar ao CHEFE e aguardar decisão:
   - (a) reatribuir o worktree para outra branch,
   - (b) remover o worktree com `git worktree remove` (se limpo),
   - (c) abandonar a sincronização.

**Padrão**: não continuar tentando `git pull` achando que a branch vai reaparecer.

## Casos reais observados (2026-09-01)

### Refs remotos inexistentes

- `fix-ci-codex-auditar` → apontava para `fix/ci-codex-auditarFinalizacao-export`, ref não existe mais no remoto.
- `fix-ci-lupa-drift` → apontava para `fix/ci-lupa-drift-bayesiana-alias`, ref não existe mais no remoto.

### Worktree inexistente no disco

- `_wt_garimpo` → caminho não existe mais (`No such file or directory`).

### Unstaged changes bloqueando rebase

- `absorver-para-hermes` → `D .agents/ACORDO-TRI-AGENTES-20260809.json` e outros.
- `CD-emoji-models` → `M .claude/rules/00-centraldark-boot-universal.md`, `M CLAUDE.md`.
- `CDPR1389` → `M LEIA-ME-IA.md`, `.env.example`, `CONTRACT.yml`, `DELTA-CONTINUO.md`, `MASTER-CYCLE.yml`.

### Sem tracking

- `desktop-absorcao-pr` → `There is no tracking information for the current branch`. Branch `absorcao-hermes-desktop` pode existir no remoto.

### Conflito

- `CDSF` → conflito em `scripts/trigger-fabric/verify_repo_contract.py` durante rebase.

## Referências cruzadas

- **Regra 75b** do SKILL.md: sync de worktrees.
- **Regra 75b1** do SKILL.md: stash ou commit WIP antes de mexer.
- **Regra 75**: checkout móvel / multi-writer.
- **Regra 74**: `git hash-object` vs `git rev-parse HEAD:` para evitar mentiras do `git diff` com CRLF.
- **Regra 77**: re-medir remoto toda rodada.
