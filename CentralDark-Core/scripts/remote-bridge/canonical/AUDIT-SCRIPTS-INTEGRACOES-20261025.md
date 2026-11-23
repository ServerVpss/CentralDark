# 🔍 Auditoria: Scripts Dependabot e Pontos de Integração
**Data:** 2026-10-25 02:47 BRT  
**Status:** ✅ COMPLETO  
**Escopo:** K:/ (disco inteiro), repositório ServerVpss/CentralDark principal  
**Rateamento:** 3 tentativas anteriores (LLM timeout); auditoria executada localmente SEM dependências remotas.

---

## 📋 Síntese Executiva

### Localização dos scripts Dependabot (ENCONTRADO)
| Arquivo | Caminho | Versão | Papel |
|---------|---------|---------|-------|
| **semantic-all-resolver.mjs** | `K:/scripts/dependabot/semantic-all-resolver.mjs` | HEAD | Resolver de conflitos "BOTH" — aplicar ambos os lados |
| **structured-conflict-resolver.mjs** | `K:/scripts/dependabot/structured-conflict-resolver.mjs` | HEAD | Resolver de conflitos estruturados (JSON, YAML, etc.) |
| **classify-conflict.mjs** | `K:/scripts/dependabot/classify-conflict.mjs` | HEAD | Classificador — decide qual ação por arquivo |
| **resolve-conflicts.sh** | `K:/scripts/dependabot/resolve-conflicts.sh** | HEAD (PR #1824) | Orquestrador bash — coordena fluxo de conflito |

### Copias em outras localizações (Mapeadas)
1. **Sincronização Casa (2026-10-18):** `K:/centraldark-sync-casa-20261018/scripts/dependabot/`
2. **PR #1837 Lineage:** `K:/tmp/lineage-pr1837/scripts/dependabot/`
3. **Arquivo backup (2026-10-15):** `K:/_archive/html-backup-20261015/hud-missions-mvp-20261009/scripts/dependabot/`
4. **Cache HUD:** `K:/_cache/hud-missions-mvp-20261009/scripts/dependabot/`
5. **Worktrees (3):**
   - `K:/_worktrees/centraldark-remote-name-migration-20261024/repo/scripts/dependabot/`
   - `K:/_worktrees/fixed-point-pr1839/scripts/dependabot/`
   - `K:/_worktrees/reconcile-w-skills/scripts/dependabot/`

**Decisão:** Usar sempre **K:/scripts/dependabot/** (primary repo) para novas operações. Copias são snapshots ou worktrees experimentais.

---

## 🔗 Mapeamento de Integração: Fila + Cockpit

### Fila (centraldark-queue-fabric)
**Estado:** Referenciado em docs/skills, mas não como fila ativa.  
**Ocorrências em grep:**
- `.agents/skills/centraldark-operational-method/SKILL.md` — menção em contexto de "receitas operacionais"
- `AGENTS.md` — integração com Cockpit/HUD
- Skills relacionadas: `skill-workshop/SKILL.md`, `meta-lupa/SKILL.md`

**Observação:** A referência "centraldark-queue-fabric" aparenta ser **identificador conceitual** de padrão (Trigger Fabric, Workflow Orquestrador), não um serviço isolado. Roteamento ocorre via:
- Hermes Kanban (trivial local k:/)
- GitHub Actions (CI/CD workflows no .github/workflows/)
- VPS remote dispatch (scripts/vps/neurolink-gateway-dispatch.sh)

### Cockpit — Instinto Superior
**Localização:** `K:/apps/instinto-superior/` (React/TypeScript)

**Componentes críticos mapeados:**
| Arquivo | Linhas | Função |
|---------|--------|--------|
| `CockpitShell.tsx` | 59K | Invólucro shell, navegação, layout |
| `ForjaExecutor.tsx` | 28K | Executor de missões Hermes (UI wrapper) |
| `InfraestruturaSistema.tsx` | 37K | Inventário de capacidades, binding session |
| `HudDeterministico.tsx` | 43K | HUD visual, status de missão |
| `DesignCenter.tsx` | 30K | Catálogo de componentes, assets |
| `AdminCofreSeguranca.tsx` | 17K | Gestão de segredos/credenciais (read-only) |

**Referências em código:**
- `apps/modulos/mcp/src/oauth.js` — OAuth broker (não herda GitHub, isolado)
- `apps/instinto-superior/scripts/verify-hud-zone.mjs` — Testes de Marketplace/ownership
- `npm run verify:hud` — Validação automática pré-build

**Estado vivo (2026-10-25 02:47):**
- Cockpit ligado a `lerEstadoCentralDark()` + `lerMissoesMaeCentralDark()` — read-only de Kanban.db
- Binding de sessão VS Code: **pendente** (O05 em ForjaExecutor.tsx comprovação)
- OAuth + Obsidian vault: Integração planejada, não ativa

---

## 🔄 PR #1824 — Escopo de Preservação

### Commit de Merge
```
Commit:  111cdbe5a89c7bbe21c1d3ca5ee1f4da71cb8ff8
Author:  SegredoiDev <133285946+segredounlock@users.noreply.github.com>
Date:    Thu Oct 15 02:41:00 2026 -0300
Subject: Merge PR #1824: centraldark high scope — rota única casa VS code hermes cockpit
```

### Arquivos Modificados (4)
1. **scripts/dependabot/classify-conflict.mjs** (+10, -6 linhas)
   - Mudança: Emissão de métricas estruturadas na classificação
   - Preservação: SIM — alteração crítica para telemetria COSTURA

2. **scripts/dependabot/resolve-conflicts.sh** (+12 linhas)
   - Adição: Função `emit_costura_metrics()` + chamadas de estado
   - Preservação: SIM — integradora ao fluxo de conflito

3. **scripts/vscode/centraldark-single-route-evidence.ps1** (NOVO, +32 linhas)
   - Propósito: Prova de rota determinística Casa VS Code → Hermes → Cockpit
   - Preservação: SIM — validação de endpoint único

4. **apps/instinto-superior/src/components/ponte-mcp/CardConectarIA.tsx** (+14 linhas)
   - Adição: UI para distinção OAuth vs GitHub App pendente
   - Preservação: SIM — usabilidade Cockpit

### Regras de Preservação
```
✅ DEVE ser preservado:
   - Tudo em scripts/dependabot/ — motor crítico de resolução
   - Emissão de métricas COSTURA em resolve-conflicts.sh
   - Prova de rota (centraldark-single-route-evidence.ps1)
   - UI do Cockpit para OAuth/GitHub App

❌ NÃO deve ser alterado:
   - Segredos (OAuth tokens, GitHub App secrets)
   - Branch principal (main)
   - Padrões de decisão de conflito (logic em classify-conflict.mjs)

⚠️ PODE ser estudado para otimização:
   - Tempo de merge (worktree + CI)
   - Métrica COSTURA — agregar em dashboard
```

---

## 📊 Alterações Locais Não Commitadas (git status)

**Estado:** 8+ arquivos com mudanças não commitadas detectadas  
**Categorias:**
- `M` (Modified) — edições em arquivos versionados
- `T` (Type-changed) — conversão simbólico ↔ regular
- `??` (Untracked) — novos arquivos sem versionamento

**Exemplo checado:**
```bash
$ cd K:/ && git status --porcelain | head -50
 M  .agents/skills/centraldark-operational-method/SKILL.md
 M  docs/CONSCIENCIA/APRENDIZADOS.md
?? K:/tmp/working-draft-audit-20261025.txt
```

**Ação recomendada:** Rever `git diff --stat` antes de próxima operação de merge.

---

## 🏗️ Dependências de Execução (resolve-conflicts.sh)

### Variáveis de Ambiente Esperadas
```bash
PR_NUM              # Pull Request number (obrigatório via $1)
PR_HEAD_REF         # Branch alvo (obrigatório; não pode ser 'main')
REPO_DIR            # /root/CentralDark (default) ou outra
GITHUB_TOKEN        # PAT/token para git fetch/push (opcional)
SEMANTIC_ALL_HELPER # scripts/dependabot/semantic-all-resolver.mjs (default)
STRUCTURED_HELPER   # scripts/dependabot/structured-conflict-resolver.mjs (default)
CONFLICT_CLASSIFIER # scripts/dependabot/classify-conflict.mjs (default)
```

### Fluxo Observado (resolve-conflicts.sh:13–242)
1. **Validação de entrada:** PR_NUM, PR_HEAD_REF, repo existente
2. **Worktree isolada:** Nunca toca a branch principal da Casa
3. **Merge + detecção de conflito:** `git merge --no-commit --no-ff origin/main`
4. **Classificação por arquivo:** classify-conflict.mjs → JSON (ação, razão, tipo)
5. **Resolução:**
   - `CURRENT` → git checkout --ours
   - `INCOMING` → git checkout --theirs
   - `BOTH` → semantic-all-resolver.mjs (aplicar ambos os lados)
   - `STRUCTURED` → structured-conflict-resolver.mjs (JSON, YAML, etc.)
   - `YELLOW` → Parada; exige decisão humana
6. **Contraprova:** Valida sintaxe/formato (JSON, JS, YAML, Python, Bash)
7. **Métricas COSTURA:** Emite JSON estruturado com contagem e estado
8. **Push (só se YELLOW=0):** Envia head_ref para origin, aguardando SAME_HEAD CI
9. **Abortamento:** Limpa worktree em caso de erro; nunca escreve em main

### Bloqueadores Documentados (Falha Fechada)
| Exit Code | Significado |
|-----------|-------------|
| 2 | PR_HEAD_REF ausente ou é "main" |
| 3 | Conflito detectado mas sem unmerged paths |
| 4 | Marcadores de conflito `<<<<`, `====`, `>>>>` deixados após resolução |
| 5 | semantic-all-resolver.mjs não encontrado |
| 6 | classify-conflict.mjs ou structured-conflict-resolver.mjs não encontrado |
| 7 | Ação desconhecida retornada do classificador |
| 20 | YELLOW_COUNT > 0 (conflito ambíguo; push bloqueado) |

---

## 🎯 Inventário Consolidado (Base para Próximas Tarefas)

### Arquivos-Chave Validados
```
✅ K:/scripts/dependabot/semantic-all-resolver.mjs
✅ K:/scripts/dependabot/structured-conflict-resolver.mjs
✅ K:/scripts/dependabot/classify-conflict.mjs
✅ K:/scripts/dependabot/resolve-conflicts.sh
✅ K:/scripts/vscode/centraldark-single-route-evidence.ps1 (PR #1824)
✅ K:/apps/instinto-superior/src/components/central/ForjaExecutor.tsx
✅ K:/apps/instinto-superior/src/components/central/CockpitShell.tsx
✅ .agents/skills/centraldark-operational-method/SKILL.md (com AUTOCATALOGO)
```

### Componentes Mapeados
```
🔗 Fila (conceitual)        → Hermes Kanban + GitHub Actions
🎛️ Cockpit (Instinto Superior) → K:/apps/instinto-superior/
📊 Orquestrador             → scripts/dependabot/resolve-conflicts.sh
🔐 Cockpit Segredos         → AdminCofreSeguranca.tsx (read-only)
🛠️ Forja Executor           → ForjaExecutor.tsx (UI wrapper Hermes)
```

### PR #1824 Escopo
- 4 arquivos modificados
- 2026-10-15 02:41 (merge commit 111cdbe5a8)
- **Áreas de preservação:** scripts/dependabot/*, prova de rota, UI OAuth
- **Bloqueadores conhecidos:** Sem YELLOW_COUNT, sintaxe validada

### Alterações Locais
- Detectadas em SKILL.md, APRENDIZADOS.md, e worktrees
- **Ação:** Validar antes de PR; não descartar sem revisão

---

## 📝 Recomendações para Próximas Tarefas

1. **Integração de métricas COSTURA:**
   - Adicionar dashboard em Cockpit para visualizar histórico de resoluções
   - Alimentar de `COSTURA_METRICS_JSON` emitido por resolve-conflicts.sh

2. **Validação de rota Casa → Cockpit:**
   - Executar centraldark-single-route-evidence.ps1 para confirmar prova
   - Readback real de ForjaExecutor.tsx + Hermes Kanban

3. **Catálogo de Cockpit:**
   - Reutilizar estrutura `lerMissoesMaeCentralDark()` existente
   - Expandir para missões-filhas sem criar segundo leaderboard

4. **Preservação de PR #1824:**
   - Nunca remover linhas de emissão de métricas em resolve-conflicts.sh
   - Testar cada modificação a classify-conflict.mjs em PR antes de merge

5. **Auditoria contínua:**
   - Manter este documento atualizado com `hermes kanban show` real
   - Executar diff antes de operações destrutivas

---

## 🔏 Rastreabilidade

**Arquivo gerado:** K:/scripts/remote-bridge/canonical/AUDIT-SCRIPTS-INTEGRACOES-20261025.md  
**Gerado por:** Hermes Kanban task t_4f8fd5af (default profile)  
**Técnicas utilizadas:**
- `grep -r` (mapeamento de referências)
- `git log --oneline --all` (histórico de PR #1824)
- `git show <commit> --stat` (escopo de mudanças)
- `read_file` (inspeção de conteúdo crítico)
- `find . -name` (localização de copias)

**Fontes de dados:**
- K:/ (filesystem completo)
- git log/show
- Conteúdo de arquivos TypeScript/mjs/bash

**Validação:**
- Nenhum segredo exposto
- Nenhuma modificação realizada
- Nenhum merge/deploy executado
- Pronto para próximas tarefas

---

✅ **Status:** AUDITORIA CONSOLIDADA — PRONTO PARA AÇÃO
