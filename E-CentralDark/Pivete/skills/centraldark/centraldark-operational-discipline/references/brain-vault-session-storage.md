# BRAIN Vault Session Storage Pattern (2026-09-07)

## Vault Location
Obsidian BRAIN vault: `E:\CentralDark\workspace\docs\BRAIN`
Estrutura 10×10: número+nome, teto 10 irmãos/nível, sem pasta vazia.

## Memória da Casa — Onde Tudo Vive

| Tipo | Local |
|------|-------|
| **Memórias operacionais Hermes** | `C:\Users\danda\AppData\Local\hermes\memories\MEMORY.md` + `USER.md` |
| **Sessões cristalizadas (BRAIN)** | `E:\CentralDark\workspace\docs\BRAIN\07-APRENDIZADOS-MEMORIAS\02-SESSOES\` |
| **Ouro (aprendizados promovidos)** | `E:\CentralDark\workspace\docs\BRAIN\07-APRENDIZADOS-MEMORIAS\01-OURO\` |
| **Mapa navegação IA** | `E:\CentralDark\workspace\docs\BRAIN\00-MAPA-SISTEMA\02-GRAFOS\MAPA-OBSIDIAN-BRAIN.md` |
| **Skill registro** | `E:\CentralDark\workspace\docs\BRAIN\03-DOCUMENTACAO\01-AGENTS-LIBRARY\02-AGENTES\MEMORY-REGISTRAR.md` |

## Padrão de Gravação (skill MEMORY-REGISTRAR)

```text
CONCRETIZOU
→ CLASSIFICAR
→ DEDUPE
→ RESOLVER_OWNER_EXISTENTE
→ PRESERVAR_PROVENIENCIA + TEMPO + ESCOPO
→ GRAVAR_MENOR_DELTA_UTIL
→ EMITIR_RECEIPT
→ PROXIMO_BOOT_REUTILIZA
```

## Sessão de Hoje Gravada
`2026-09-07-CASA-VPS-FULL-RECONCILIATION-FIXED-POINT.md` em:
`docs/BRAIN/07-APRENDIZADOS-MEMORIAS/02-SESSOES/`

## Recuperação de Contexto Anterior (Fio de Ontem)

Ler sessões na mesma pasta para extrair `NEXT_CURSOR`:

1. **2026-09-06-CASA-VPS-KANBAN-HOST-HANDOFF.md** (seção 9):
   ```text
   !CENTRALDARK
   → MEASURE_EXACT_PR_1444_HEAD_AND_CHECKS
   → INSPECT_CI_HOUSEKEEPING_FAILURE_LOG_IF_ANY
   → INSPECT_SUBMODULE_GITLINK_IF_ANY
   → MEASURE_CASA_HERMES_KANBAN
   → MEASURE_VPS_HERMES_RUNTIME
   → MEASURE_VPS_KANBAN
   → CREATE_OR_REUSE_HOST_TASK_ENVELOPE_BRIDGE
   → VPS_CANARY
   → WRITER_LEASE_HANDOFF
   → CASA_READ_ONLY_STANDBY
   → CONTRAPROVA
   → RECEIPT
   → FIXED_POINT_OR_NEXT_CURSOR
   ```

2. **2026-09-06-GARIMPO-CHEFE-ONE-SITE-ONE-MCP-ONE-ADMIN.md** (seção 11):
   ```text
   !CENTRALDARK
   → GARIMPO_CHEFE_FULL_TEXT_INVENTORY
   → CURRENT_RUNTIME_PORT_PROCESS_ROUTE_INVENTORY
   → ONE_SITE_OWNER_RESOLUTION
   → ONE_MCP_RUNTIME_DISCRIMINATING_TEST
   → OMNI_CONSUMER_CAPABILITY_MATRIX
   → API_HUB_MCP_ROUTE_MATRIX
   → ZERO_REGRESSION_PLAN
   → CONTRAPROVA
   → DELTA_MINIMO
   → FIXED_POINT_OR_NEXT_CURSOR
   ```

## O que Foi Feito Hoje vs O que Faltava

| Next Cursor 06/09 | Status 07/09 |
|-------------------|--------------|
| MEASURE_EXACT_PR_1444 | ✅ Medido — CI FAIL (Autonomia) |
| INSPECT_CI_HOUSEKEEPING | ✅ Identificado |
| INSPECT_SUBMODULE_GITLINK | ✅ .gitmodules presente |
| MEASURE_CASA_HERMES_KANBAN | ✅ Ativo |
| MEASURE_VPS_HERMES_RUNTIME | ✅ v0.21.0 compatível Desktop SSH |
| MEASURE_VPS_KANBAN | ⚠️ Pendente |
| CREATE_HOST_TASK_ENVELOPE | ⚠️ Pendente |
| VPS_CANARY | ⚠️ Pendente |
| WRITER_LEASE_HANDOFF | ⚠️ Pendente |
| CASA_READ_ONLY_STANDBY | ⚠️ Pendente |
| **GIT_SYNC_VPS** | 🎯 **PRÓXIMO CURSOR ATUAL** |

## Regra de Navegação para IA (do MAPA-OBSIDIAN-BRAIN)

```text
INTENCAO
→ BRAIN/MOC MAIS PROXIMO
→ MATCH TEXTUAL
→ WIKILINKS
→ BACKLINKS
→ 1-2 HOPS RELEVANTES
→ OWNER CANONICO
→ ESTADO VIVO QUANDO O CLAIM EXIGIR
→ CONTEXTO COMPRIMIDO
```

## Próxima Ação Concreta (CASA_VPS_GIT_SYNC)

```bash
# 1. VPS Git Sync (preservando painel-data.json)
ssh Segredo-VPS "cd /root/CentralDark && git fetch && git merge origin/main"

# 2. Verificar CI Autonomia #1444
gh run list --branch reconcile/garimpo-one-site-one-mcp-admin-20260906 --limit 1

# 3. Se green → squash merge autorizado
gh pr merge 1444 --squash
```

## Referências Relacionadas
- `centraldark-vps-operations` → `references/desktop-ssh-compatibility-fix.md` (mesma sessão)
- `centraldark-operational-discipline` → `references/google-generative-api-inline-config.md` (mesma sessão)