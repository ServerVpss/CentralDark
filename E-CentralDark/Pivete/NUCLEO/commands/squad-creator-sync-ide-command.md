# COMANDO - squad-creator-sync-ide-command.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\squad-creator-sync-ide-command.md
**SHA:** 1fe5d5a713a0f1c5
**Timestamp:** 2026-08-28T02:02:09.153623
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - dry_run: Preview sem sincronizar (--dry-run)

### Ouro Bruto (primeiros 5000 chars)
```
---
task: Sync Command to IDE Configurations
responsavel: '@squad-creator'
responsavel_type: agent
atomic_layer: task
status: active
sprint: 9
story: SQC-12
version: 1.0.0
Entrada: |
  - type: agent | task | workflow | squad (obrigatório)
  - name: Nome do componente para sincronizar (obrigatório)
  - ides: Lista de IDEs alvo (opcional, default: todas ativas)
  - dry_run: Preview sem sincronizar (--dry-run)
  - force: Sobrescrever existentes (--force)
Saida: |
  - sync_results: Mapa de resultados por IDE
  - files_created: Lista de arquivos criados
  - files_updated: Lista de arquivos atualizados
  - files_skipped: Lista de arquivos pulados
Checklist:
  - '[x] Carregar .aios-sync.yaml'
  - '[x] Localizar arquivo fonte em squads/'
  - '[x] Verificar arquivos existentes nos destinos'
  - '[x] Sincronizar para cada IDE ativa'
  - '[x] Validar arquivos criados'
---

# \*command

Sincroniza agents, tasks, workflows ou squads inteiros para todas as configurações de IDE configuradas no projeto.

## Uso

```bash
# Sincronizar um agent específico
*command agent legal-chief

# Sincronizar uma task
*command task revisar-contrato

# Sincronizar um workflow
*command workflow legal-workflow

# Sincronizar squad inteiro (todos os componentes)
*command squad legal

# Preview sem executar
*command agent legal-chief --dry-run

# Forçar sobrescrita
*command squad legal --force
```

## Output Exemplo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *command squad legal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Loading sync configuration...
   Active IDEs: claude, cursor
   Pack alias: legal → Legal

📦 Syncing squad: legal

Step 1: Locating source files
   ✓ squads/legal/config.yaml
   ✓ Found 8 agents
   ✓ Found 4 tasks
   ✓ Found 6 checklists
   ✓ Found 1 data file

Step 2: Syncing to Claude Code
   ✓ .claude/commands/Legal/agents/legal-chief.md
   ✓ .claude/commands/Legal/agents/brad-feld.md
   ✓ .claude/commands/Legal/agents/ken-adams.md
   ✓ .claude/commands/Legal/agents/pierpaolo-bottini.md
   ✓ .claude/commands/Legal/agents/tributarista.md
   ✓ .claude/commands/Legal/agents/trabalhista.md
   ✓ .claude/commands/Legal/agents/societarista.md
   ✓ .claude/commands/Legal/agents/lgpd-specialist.md
   ✓ .claude/commands/Legal/tasks/revisar-contrato.md
   ... (4 tasks, 6 checklists, 1 data)

Step 3: Syncing to Cursor
   ✓ .cursor/rules/legal-chief.mdc
   ✓ .cursor/rules/brad-feld.mdc
   ... (8 agents converted to MDC)

Step 4: Validation
   ✓ All files validated

═══════════════════════════════════════════════
✅ SYNC COMPLETE
═══════════════════════════════════════════════

Summary:
  Files created:  19
  Files updated:  0
  Files skipped:  0
  IDEs synced:    2

🚀 Commands available:
   /Legal:agents:legal-chief (Claude Code)
   @legal-chief (Cursor rule)
```

## Configuração

### .aios-sync.yaml

O sistema usa `.aios-sync.yaml` na raiz do projeto para configuração:

```yaml
# IDEs ativas para sincronização
active_ides:
  - claude # .claude/commands/
  - cursor # .cursor/rules/
  # - windsurf  # .windsurf/ (descomentar para ativar)
  # - gemini    # .gemini/

# Mapeamento de diretório → prefixo de comando
pack_aliases:
  legal: Legal
  copy: Copy
  hr: HR
  data: Data

# Mapeamentos de sincronização
sync_mappings:
  squad_agents:
    source: 'squads/*/agents/'
    destinations:
      claude:
        - path: '.claude/commands/{pack}/agents/'
          format: 'md'
      cursor:
        - path: '.cursor/rules/'
          format: 'mdc'
          wrapper: 'cursor-rule'
```

### Pack Aliases

O `pack_aliases` mapeia o nome do diretório do squad para o prefixo usado nos comandos:

| Diretório       | Alias   | Comando Claude              |
| --------------- | ------- | --------------------------- |
| `squads/legal/` | `Legal` | `/Legal:agents:legal-chief` |
| `squads/copy/`  | `Copy`  | `/Copy:agents:copy-chief`   |
| `squads/hr/`    | `HR`    | `/HR:agents:hr-chief`       |

## Workflow Interno

```
┌──────────────────────────────────────────────────┐
│                  *command                         │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. Parse type + name                             │
│     ↓                                             │
│  2. Load .aios-sync.yaml                          │
│     ↓ (not found → create default)                │
│  3. Resolve pack alias                            │
│     ↓                                             │
│  4. Locate source files in squads/                │
│     ↓ (not found → error)                         │
│  5. Check existing files in destinations          │
│     ↓ (exists + no --force → ask)                 │
│  6. For each active IDE:                          │
│     │                                             │
│     ├── Claude: Copy MD → .claude/commands/       │
│     ├── Cursor: Convert MD → MDC                  │
│     ├── Gemini: Copy MD → .gemini/agents/         │
│     └── Winds
```