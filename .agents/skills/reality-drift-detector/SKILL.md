---
name: "reality-drift-detector"
description: "Detecta automaticamente quando realidade diverge de histórico; ativa tarefas de reconciliação sem esperar confirmação"
type: "automation"
trigger: "continuous"
authority: "SEGREDO/CHEFE (auto-execute sem prompt)"
version: "1.0.0"
---

# Reality Drift Detector

Monitora continuamente a divergência entre **estado real** (git, filesystem, runtime) e **histórico registrado** (DELTAUNIFICADOCENTRALDARK.md, logs, PROOF_OF_*).

## Função

```
REALIDADE_AGORA ≠ REGISTRADO_ANTES
  ↓
MEDIR_DIVERGÊNCIA
  ↓
CRIAR_TASK_RECONCILIAÇÃO (auto-execute)
  ↓
REGISTRAR_DELTA
  ↓
PROSSEGUIR (sem pausa)
```

## Detecção Automática

### Categoria 1: Git Drift
- `git status` muda (novo arquivo, branch, upstream diverge)
- `git log HEAD~10..HEAD` contém commits não registrados em DELTA
- `REMOTE_HEAD_SHA` mudou desde último checkpoint

### Categoria 2: Filesystem Drift
- Arquivo canônico (LEIA-ME-IA.md, AGENTS.md, SOUL-SOL.md) foi modificado
- `.agents/skills/*/SKILL.md` adicionado/removido sem entry em catálogo
- `docs/CONSCIENCIA/*` mudou conteúdo/estrutura

### Categoria 3: Runtime Drift
- PM2 status mudou (processo parou, restartou, novo PID)
- VPS filesystem fora de sync com GitHub
- MCP server health status divergiu

### Categoria 4: Histórico Drift
- DELTAUNIFICADOCENTRALDARK.md ≠ git log HEAD
- PROOF_OF_* arquivo obsoleto (sha256 diverge)
- Aprendizado registrado não aplicado em novo ciclo

## Ação Automática

Quando detecta drift:

1. **Snapshot**: git show HEAD, filesystem stat, runtime ps
2. **Diff**: DELTA novo vs histórico
3. **Classifique**: qual categoria
4. **Create task**:
   ```yaml
   TASK_ID: auto-generated
   TYPE: reconciliation
   CATEGORY: git|filesystem|runtime|histórico
   DIVERGENCE: descritivo
   ACTION: específica (merge, revert, re-sync, restart)
   EXECUTE: true (sem prompt)
   ```
5. **Register**: adicionar entry a DELTAUNIFICADOCENTRALDARK.md
6. **Continue**: prosseguir ciclo

## Configuração

```bash
# Modo contínuo (recomendado para VPS)
pm2 start reality-drift-detector.sh --name "drift-detector" --cron "*/5 * * * *"

# Modo hook (git)
# .git/hooks/post-merge → chamar detector
# .git/hooks/post-commit → chamar detector

# Modo manual
./reality-drift-detector.sh --once
```

## Segurança

- **WRITE mode**: ativa tasks mas não altera main automaticamente
- **Sem prompt**: conforme permissão SEGREDO/CHEFE
- **Reversível**: todos os drifts registrados com snapshot
- **Prova obrigatória**: antes de consolidar, medir T0→T1

## Saída

```
DRIFT_DETECTED: true|false
CATEGORIA: git|filesystem|runtime|histórico
DIVERGÊNCIA: breve descrição
TASK_CREATED: true|false
TASK_ID: id gerado
AÇÃO_TOMADA: descrição
PRÓXIMO_CHECKPOINT: novo SHA256
```

---

**Dono:** SOL/Reality Judge  
**Executor:** PM2 + git hooks + CLI  
**Integração:** CentralDark main (AGENTS.md + CLAUDE.md referência obrigatória)
