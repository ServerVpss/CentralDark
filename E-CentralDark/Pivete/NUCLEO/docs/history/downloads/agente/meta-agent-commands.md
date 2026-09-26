# AGENTE - meta-agent-commands.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\meta-agent-commands.md
**SHA:** 76bc7de9910bbcc4
**Timestamp:** 2026-08-28T02:02:31.057282
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- All meta-agent commands follow this pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Meta-Agent Commands Reference

> 🌐 **EN** | [PT](./pt/meta-agent-commands.md) | [ES](./es/meta-agent-commands.md)

---

Complete reference guide for all Synkra AIOS meta-agent commands.

## Table of Contents

1. [Command Syntax](#command-syntax)
2. [Core Commands](#core-commands)
3. [Agent Management](#agent-management)
4. [Task Operations](#task-operations)
5. [Workflow Commands](#workflow-commands)
6. [Code Generation](#code-generation)
7. [Analysis & Improvement](#analysis--improvement)
8. [Memory Layer](#memory-layer)
9. [Self-Modification](#self-modification)
10. [System Commands](#system-commands)
11. [Advanced Commands](#advanced-commands)

## Command Syntax

All meta-agent commands follow this pattern:

```
*command-name [required-param] [--optional-flag value]
```

- Commands start with `*` (asterisk)
- Parameters in `[]` are required
- Flags start with `--` and may have values
- Multiple flags can be combined

### Examples

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## Core Commands

### *help

Display all available commands or get help for specific command.

```bash
*help                    # Show all commands
*help create-agent       # Help for specific command
*help --category agents  # Commands by category
```

### *status

Show current system status and active agents.

```bash
*status                  # Basic status
*status --detailed       # Detailed system information
*status --health        # Health check results
```

### *config

View or modify configuration.

```bash
*config                  # View current config
*config --set ai.model gpt-4      # Set config value
*config --reset         # Reset to defaults
*config --export        # Export configuration
```

### *version

Display version information.

```bash
*version                # Current version
*version --check-update # Check for updates
*version --changelog    # Show changelog
```

## Agent Management

### *create-agent

Create a new AI agent.

```bash
*create-agent <name> [options]

Options:
  --type <type>         Agent type: assistant, analyzer, generator, specialist
  --template <name>     Use template: basic, advanced, custom
  --capabilities        Interactive capability builder
  --from-file <path>    Create from YAML definition

Examples:
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

List all available agents.

```bash
*list-agents                      # List all agents
*list-agents --active            # Only active agents
*list-agents --type analyzer     # Filter by type
*list-agents --detailed          # Show full details
```

### *activate

Activate an agent for use.

```bash
*activate <agent-name>            # Activate single agent
*activate agent1 agent2          # Activate multiple
*activate --all                  # Activate all agents
*activate --type assistant       # Activate by type
```

### *deactivate

Deactivate an agent.

```bash
*deactivate <agent-name>         # Deactivate single agent
*deactivate --all               # Deactivate all agents
*deactivate --except agent1     # Deactivate all except specified
```

### *modify-agent

Modify existing agent configuration.

```bash
*modify-agent <name> [options]

Options:
  --add-capability <name>        Add new capability
  --remove-capability <name>     Remove capability
  --update-instructions         Update instructions
  --version <version>           Update version
  --interactive                 Interactive modification

Examples:
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

Remove an agent (with confirmation).

```bash
*delete-agent <name>            # Delete single agent
*delete-agent --force          # Skip confirmation
*delete-agent --backup         # Create backup before deletion
```

### *clone-agent

Create a copy of existing agent.

```bash
*clone-agent <source> <target>  # Basic clone
*clone-agent bot bot-v2 --modify  # Clone and modify
```

## Task Operations

### *create-task

Create a new reusable task.

```bash
*create-task <name> [options]

Options:
  --type <type>           Task type: command, automation, analysis
  --description <text>    Task description
  --parameters           Define parameters interactively
  --template <name>      Use task template

Examples:
*create-task validate-input --type command
*create-task daily-backup --type automation
*create-task code-metrics --template analyzer
```

### *list-tasks

List available tasks.

```bash
*list-tasks                     # List all tasks
*list-tasks --type automation  # Filter by type
*list-tasks --recent          # Recently used tasks
*list-tasks --search <query>  # Search tasks
```

### *run-task

Execute a specific task.

```bash
*run-task <task-name> [params]

Examples:
*run-task val
```

---

# AGENTE - meta-agent-commands.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\meta-agent-commands.md
**SHA:** b4b6cde2db3c3178
**Timestamp:** 2026-08-28T02:02:38.455219
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Todos os comandos do meta-agente seguem este padrão:

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/meta-agent-commands.md
  Última sincronização: 2026-01-26
-->

# Referência de Comandos do Meta-Agente

> 🌐 [EN](../meta-agent-commands.md) | **PT** | [ES](../es/meta-agent-commands.md)

---

Guia de referência completo para todos os comandos do meta-agente Synkra AIOS.

## Sumário

1. [Sintaxe de Comandos](#sintaxe-de-comandos)
2. [Comandos Principais](#comandos-principais)
3. [Gerenciamento de Agentes](#gerenciamento-de-agentes)
4. [Operações de Tarefas](#operações-de-tarefas)
5. [Comandos de Workflow](#comandos-de-workflow)
6. [Geração de Código](#geração-de-código)
7. [Análise e Melhoria](#análise--melhoria)
8. [Camada de Memória](#camada-de-memória)
9. [Auto-Modificação](#auto-modificação)
10. [Comandos do Sistema](#comandos-do-sistema)
11. [Comandos Avançados](#comandos-avançados)

## Sintaxe de Comandos

Todos os comandos do meta-agente seguem este padrão:

```
*command-name [required-param] [--optional-flag value]
```

- Comandos começam com `*` (asterisco)
- Parâmetros em `[]` são obrigatórios
- Flags começam com `--` e podem ter valores
- Múltiplas flags podem ser combinadas

### Exemplos

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## Comandos Principais

### *help

Exibe todos os comandos disponíveis ou obtém ajuda para um comando específico.

```bash
*help                    # Mostra todos os comandos
*help create-agent       # Ajuda para comando específico
*help --category agents  # Comandos por categoria
```

### *status

Mostra o status atual do sistema e agentes ativos.

```bash
*status                  # Status básico
*status --detailed       # Informações detalhadas do sistema
*status --health        # Resultados de verificação de saúde
```

### *config

Visualiza ou modifica configuração.

```bash
*config                  # Ver configuração atual
*config --set ai.model gpt-4      # Definir valor de configuração
*config --reset         # Restaurar padrões
*config --export        # Exportar configuração
```

### *version

Exibe informações de versão.

```bash
*version                # Versão atual
*version --check-update # Verificar atualizações
*version --changelog    # Mostrar changelog
```

## Gerenciamento de Agentes

### *create-agent

Cria um novo agente de IA.

```bash
*create-agent <name> [options]

Options:
  --type <type>         Tipo de agente: assistant, analyzer, generator, specialist
  --template <name>     Usar template: basic, advanced, custom
  --capabilities        Construtor interativo de capacidades
  --from-file <path>    Criar a partir de definição YAML

Exemplos:
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

Lista todos os agentes disponíveis.

```bash
*list-agents                      # Lista todos os agentes
*list-agents --active            # Apenas agentes ativos
*list-agents --type analyzer     # Filtrar por tipo
*list-agents --detailed          # Mostrar detalhes completos
```

### *activate

Ativa um agente para uso.

```bash
*activate <agent-name>            # Ativar um único agente
*activate agent1 agent2          # Ativar múltiplos
*activate --all                  # Ativar todos os agentes
*activate --type assistant       # Ativar por tipo
```

### *deactivate

Desativa um agente.

```bash
*deactivate <agent-name>         # Desativar um único agente
*deactivate --all               # Desativar todos os agentes
*deactivate --except agent1     # Desativar todos exceto o especificado
```

### *modify-agent

Modifica configuração de agente existente.

```bash
*modify-agent <name> [options]

Options:
  --add-capability <name>        Adicionar nova capacidade
  --remove-capability <name>     Remover capacidade
  --update-instructions         Atualizar instruções
  --version <version>           Atualizar versão
  --interactive                 Modificação interativa

Exemplos:
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

Remove um agente (com confirmação).

```bash
*delete-agent <name>            # Deletar um único agente
*delete-agent --force          # Pular confirmação
*delete-agent --backup         # Criar backup antes da exclusão
```

### *clone-agent

Cria uma cópia de um agente existente.

```bash
*clone-agent <source> <target>  # Clone básico
*clone-agent bot bot-v2 --modify  # Clonar e modificar
```

## Operações de Tarefas

### *create-task

Cria uma nova tarefa reutilizável.

```bash
*create-task <name> [options]

Options:
  --type <type>           Tipo de tarefa: command, automation, analysis
  --description <text>    Descrição da tarefa
  --parameters           Definir parâmetros interativamente
  --template <name>      Usar template de tarefa

Exemplos:
*create-task validate-input --type command
*create-task daily-
```