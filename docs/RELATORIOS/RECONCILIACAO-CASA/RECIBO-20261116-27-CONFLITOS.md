# RECIBO — Reconciliação dos 27 conflitos (VM CentralDark-OS)

**Data:** 2026-11-16
**Host reconciliado:** `openkylin-vm:/home/CentralDark-OS/CentralDark`
**Fonte canônica da intenção:** `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md`
**Mecanismo usado:** `scripts/auto-sync/AUTO-SYNC-MASTER.py` (resolver `cd40.v1`) — nenhum mecanismo paralelo criado.

## Estado antes

```
state=DIRTY_CONFLICTS  conflicts=32  conflict_hunks>0
HEAD 4207576f4c86  |  origin/main 401 commits à frente
```

## Classificação dos conflitos

| Classe | Qtd | Decisão |
|---|---|---|
| Alteração exclusiva local válida | 1 | `apps/modulos/mcp/src/index.js` + `dist/index.js` — proxy `/mcp/ui` → `127.0.0.1:8742` |
| Local era artefato superado pela `main` | 22 | alinhado a `origin/main` |
| Remoção consistente nos dois lados (legado AionUI) | 8 | aposentado |
| Adição idêntica nos dois lados | 1 | alinhado |

O proxy `/mcp/ui` foi **preservado como patch**, não publicado:

```
.auto-sync/backup-reconcile-<TS>/EXCLUSIVO-mcp-ui-proxy.diff
```

Evidência de que não era código vivo: única ocorrência de `/mcp/ui` e `TUNNEL_UI_SAME_OWNER` em todo `apps/ scripts/ docs/` é o próprio arquivo; nenhum consumidor, teste ou doc. MCP não escutava em TCP (8787 fechado).

## Defeitos encontrados no mecanismo (corrigidos no owner)

O probe 3-way devolvia `PATH_SHAPE_OR_DELETE` sempre que BASE, remoto **ou** local não existiam, sem olhar os outros dois lados. Isso produzia conflito permanente em caminho já reconciliado.

- **#2080** — `DELETED_ON_BOTH_SIDES`: BASE presente + remoto ausente + local ausente.
- **#2081** — classificação completa por conteúdo: `NEW_LOCAL_ONLY`, `NEW_ON_REMOTE_ONLY`, `NEW_IDENTICAL_ON_BOTH_SIDES`, `NEW_ON_BOTH_SIDES_DIFFER`, `DELETED_ON_REMOTE_KEPT_LOCALLY`, `DELETED_LOCALLY_KEPT_ON_REMOTE`.

Casos divergentes continuam conflito e exigem dono; a segurança do classificador não foi relaxada.

## Estado depois (medido)

```
state=DIRTY_RECONCILE_READY  conflicts=0  conflict_hunks=0  mutated_worktree=false
origin_main=8f234ba8cebe3dd6d06f00b894cd40bb0e23e07a
```

## Contrapova — gates reais na VM

| Gate | Comando | Resultado |
|---|---|---|
| HUD | `npm run verify:hud` | **36/36 PASS** |
| Sync safety | `node --test scripts/verify-sync-safety.mjs` | **8/8 PASS** |
| Memory linker | `node --test scripts/memory-linker/library-router.test.mjs` | **27/27 PASS** |
| MCP pairing | `node --test tests/pairing-consent-flow.test.mjs` | **9/9 PASS** |

## Cockpit em execução real

```
pid 2371  vite dev --host 0.0.0.0 --port 8080 --strictPort   (uptime 10h40m)
HTTP 200 — 268.372 bytes — 0,91s
```

## Trabalho preservado

Backup antes de qualquer escrita:

```
.auto-sync/backup-reconcile-<TS>/worktree-paths.tar.gz
.auto-sync/backup-reconcile-<TS>/skills-vs-code-restore.tar.gz
refs/auto-sync/pre-reconcile-<TS>  (git stash create — snapshot da árvore)
```

## Pendências declaradas (UNKNOWN ≠ PASS)

1. **HEAD da VM continua 403 commits atrás da `main`.** O worktree está reconciliado nos caminhos classificados, mas avançar o HEAD exige commitar ou descartar os 97 caminhos `auto_mergeable` e 19 `non_overlap_dirty` — decisão de dono, fora do escopo desta rodada.
2. O proxy `/mcp/ui` segue não publicado; publicar exige owner do MCP, teste e contraprova própria.
3. Após reinício do processo MCP, o proxy deixa de existir em `dist/` (alinhado à `main`) — comportamento esperado e registrado.

## Cuidado operacional registrado

`git reset --hard` nesta casa descarta trabalho local real. Nesta rodada 6 arquivos rastreados foram apagados por engano e **restaurados** a partir do snapshot `a582b10e374`, com verificação de diff vazia contra o snapshot. A reconciliação deve continuar usando `git checkout <ref> -- <path>`, nunca `reset --hard`.
