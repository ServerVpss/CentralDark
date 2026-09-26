---
name: autonomous-task-routing
version: "1.0.0"
description: "Route autonomous-agent intents to real Hermes capabilities."
author: "Hermes Agent"
license: "MIT"
tags: ["autonomous-ai-agents", "routing", "agent-selection", "cronjob", "delegate_task", "skill-naming"]
category: "autonomous-ai-agents"
metadata:
  hermes:
    tags: ["autonomous-ai-agents", "routing", "agent-selection", "cronjob", "delegate_task", "skill-naming"]
    related_skills: ["hermes-agent", "claude-code", "codex", "opencode", "centraldark-omni-router"]
phases: "INTENT → CAPABILITY_MATRIX → SELECT → CONFIRM_OR_EXECUTE"
runtime_checks:
  - intent_classified
  - capability_selected
  - naming_reality_explained_when_needed
  - no_assumed_skill_name_left_unexplained
failure_signature: "AUTONOMOUS_TASK_ROUTING_INTENT_MISMATCH_v1"
remediation_escalation: "explain > reroute > execute with right capability"
provenance:
  sources:
    - "autonomous-task-routing/SKILL.md|sha256:PENDING_CREATION"
    - "autonomous-task-routing/references/agent-capability-matrix.md|sha256:PENDING_CREATION"
  tests:
    - "validate_all_skills.py|sha256:PENDING_EXECUTION"
    - "skill_gold_validator.py|sha256:PENDING_EXECUTION"
  receipts:
    - "centraldark.runtime.receipt.v1|sha256:PENDING_GENERATION"
counterproof: "Clean mapping of a user autonomous intent to a real capability without inventing a non-existent skill name"
fixed_point_contribution: "Resolves phase denominators: intent classification, capability selection, naming clarity"
mantra: "NENHUM NOME DE SKILL EXISTS SÓ PORQUE O USUÁRIO FALOU. MAPEAR INTENÇÃO → CAPABILIDADE REAL. NÃO MAPEAR NOME → CAPABILIDADE FALSO."
three_planes:
  KNOWLEDGE:
    - failure_signatures: ["AUTONOMOUS_TASK_ROUTING_INTENT_MISMATCH_v1"]
    - capability_matrix: "cronjob / delegate_task / spawned-hermes / claude-code / codex / opencode / computer-use"
    - intent_taxonomy: "monitor-sozinho, roda-agente, autonomia-ate-hora, usa-skill-agi, executar-sem-mim"
    - naming_reality: "não existe skill 'agi'; capabilities distribuídas"
  EXECUTION:
    - intent_classification: "extrair o que o usuário quer de fato (monitorar, executar, delegar, observar)"
    - capability_selection: "cronjob para ciclos auto sem LLM; delegate_task para subtarefa limitada; spawn para processo independente hours/days; CLI agent para tarefa de código via claude-code/codex/opencode"
    - naming_reality_explanation: "quando o usuário invoca 'skill agi' ou nome que não existe, explicar a equipe real de capabilities antes de executar"
  CONFIG_ORIGIN:
    - config_source_tracking: "profile ativo, skills carregados, cron sincronizado"
    - fix_at_right_layer: "skill de roteamento de intent > skill de agent > config do agent CLI"
three_dimensions:
  DEPENDÊNCIA:
    definition: "Qual runtime/project requer"
    reopen_trigger: "novo tipo de intent do usuário, nova capability disponível, skill nome mudou"
  DECADÊNCIA:
    definition: "Conhecimento/compat foi stale"
    reopen_trigger: "novo skill disponível, novo agent CLI disponível, cron behavior mudou, delegate_task limits mudaram"
  CADÊNCIA:
    definition: "Quando revalidar"
    reopen_trigger: "event-driven: novo intent do usuário, nova skill instalada, mudança no cronjob CLI, mudança no delegate_task limite"
---

# Autonomous Task Routing — Mapeamento de Intenção para Capacidade Hermes

## When to Use

- **Use when** o usuário pede comportamento autônomo genérico: "usa skill agi", "sozinho", "roda autonomous", "monitora sem mim", "autonomia até N horas", "faz isso e não me manda msg"
- **Use when** o usuário invoca um nome de skill que não existe na biblioteca (ex: "skill agi") e você precisa mapear a intenção real para capabilities disponíveis
- **Use when** precisa escolher entre cronjob / delegate_task / spawned-agent / CLI-agent para uma tarefa autônoma
- **Don't use for** tarefas interativas que exigem o usuário presente a cada passo, ou quando já está claro qual capacidade usar

---

## O Problema que Esta Skill Resolve

O usuário frequentemente fala em termos de "skill agi" ou "skill de agente autônomo" como se existisse uma skill única com esse nome. **Essa skill não existe.**

As capacidades reais para tarefas autônomas no Hermes estão distribuídas:
- `cronjob` — tarefas recorrentes, sem LLM (se no_agent=true) ou com LLM, ciclo fino, entrega local ou para plataforma
- `delegate_task` — subagente isolado, bounded, retorna somente o resumo final
- `spawn hermes process` — processo Hermes independente, hours/days, tool access completo, PTY via tmux
- `claude-code` — CLI do Claude Code para tarefas de código
- `codex` — CLI do OpenAI Codex para tarefas de código
- `opencode` — CLI do OpenCode para revisão/tarefas de código
- `computer-use` — drive da área de trabalho em background

**Regra:** quando o usuário fala "skill agi", não trate isso como se uma skill chamada "agi" existisse. Trate como intenção de autonomia e selecione a capacidade real.

---

## Intent Taxonomy

| Intenção do usuário (exemplo) | Classe | Capacidade primária |
|---|---|---|
| "usa skill agi" / "uso skill agi" | nome inexistente → intenção autônoma | depende do que ele quer na prática |
| "sozinho" / "roda autonomous" | execução autônoma sem acompanhamento | cronjob (ciclo) ou delegate_task (subtarefa) ou spawn |
| "monitora PRs sem me mandar msg" | observação recorrente sem entrega | cronjob com no_agent=true + deliver=local |
| "autonomia até 18h" | ciclo com deadline de clock | cronjob com condição de parada por hora |
| "faz isso e não me interrompa" | execução autônoma | delegate_task ou spawn, sem entrega ao usuário |
| "faz tudo e melhora tudo" | executor agnóstico de tarefas | claude-code/codex/opencode se for código, ou spawn hermes se for geral |

---

## Capability Matrix

### cronjob
- Auto-recorrente, tick finito (every N min, daily, timestamp)
- no_agent=true → script puro, sem LLM, stdout é o registro/delivery
- no_agent=false → agente com prompt + skills roda cada tick
- deliver=local → sem entrega ao usuário (para monitoração silenciosa)
- Entrega só salva output; não há canal de live-delivery no CLI por padrão
- Condição de parada por clock: script verifica hora e sai (ex: "roda até 18:00 Brasil")
- Use para: monitoração recorrente, watchdog, ciclos auto sem intervenção humana

### delegate_task
- Subagente isolado, contexto independente, terminal separado
- Retorna somente o resumo final ao chamador
- Bounded (max 3 tarefas paralelas neste usuário)
- Leaf não pode delegar, não pode cronjob, não pode clarificar
- Use para: subtarefa concreta que o chamador pode esperar o resumo, sem vigilância contínua

### Spawn hermes process (tmux)
- Processo Hermes independente, horas/dias
- Full tool access, PTY via tmux para interação
- Use para: missões de longo prazo que precisam de ferramentas completas e pode interagir
- Limpeza: matar sessão tmux ao final

### Claude Code / Codex / OpenCode CLI
- Tarefas de código via CLI dos agentes respectivos
- Print mode (-p) para one-shot; tmux para multi-turn
- Use para: tarefas de código onde o agente específico é o escolhido
- Detalhes de cada um na skill respectiva (claude-code, codex, opencode)

### computer-use
- Drive da área de trabalho em background
- Screenshot + click por elemento + type + scroll
- Use para: interação com UI Windows, não para ciclos de monitoração de repo

---

## Flow de Seleção

```
INTENÇÃO DO USUÁRIO
  → CLASSIFICAR: o que ele quer de fato?
     - monitorar recorrente sem entrega?  → cronjob + no_agent=true + deliver=local
     - subtarefa para retornar resumo?    → delegate_task
     - missão longa com ferramentas?      → spawn hermes (tmux)
     - tarefa de código com agente CLI?   → claude-code / codex / opencode
     - interação com UI?                  → computer-use
  → SE O USUÁRIO FALOU "SKILL AGI" OU NOME QUE NÃO EXISTE:
     -> explicar a equipe real de capabilities antes de executar
     -> não criar a skill que ele pediu se ela não existe
  → EXECUTAR COM A CAPABILIDADE SELECIONADA
```

---

## Nomenclatura e Realidade

- Não existe skill chamada "agi" na biblioteca deste perfil
- Não existe skill chamada "autonomous" ou "autonomous-agent" única
- As capacidades autônomas são: cronjob, delegate_task, spawned-hermes, e os agentes CLI (claude-code, codex, opencode)
- O usuário pode estar usando "agi" como sinônimo de "agente autônomo" — trate como intenção, não como nome de skill

---

## Reusable Pattern: Silent PR/Commit Monitoring Cycle Until Clock Deadline

Pattern usado nesta sessão: monitorar PRs abertos com commits em ciclo silencioso até 18:00 Brasil, sem entregar ao usuário.

Implementação:
1. Script bash + python3 que:
   - Verifica gh disponível
   - gh pr list --state open --json ...
   - Para cada PR com commits: gh pr view + gh pr checks
   - Escreve log interno (data/hora UTC + Brasil, PR, commits, estado, CI summary)
   - Condição de parada: se hora Brasil >= 18:00, para e registra stop
2. Cronjob:
   - schedule: every 30m (ou intervalo desejado)
   - no_agent=true (script puro sem LLM)
   - deliver=local (sem entrega ao usuário)
   - script: caminho relativo sob scripts/
3. Registro: log em pasta controlada, não entrega ao usuário

Pitfalls:
- Não entregar ao usuário se ele disse "não me manda msg" — usar deliver=local
- Condição de parada por clock deve estar no script, não apenas no cron schedule
- Se gh indisponível, registrar "GH indisponível" e parar, não falhar silenciosamente com resultado falso
- Log interno deve incluir hora UTC e Brasil para rastreabilidade

---

## Pitfalls

| # | Pitfall | Fix |
|---|---------|-----|
| 1 | Asumir que "skill agi" existe | Mapear intenção para capacidade real; explicar se nome não existe |
| 2 | Usar cronjob para tarefa interativa | Cron é para ciclo/recorrente; delegate_task/spawn para tarefas pontuais |
| 3 | Delegate_task para missão longa hours/days | Delegate é bounded; usar spawn para longa duração |
| 4 | Explicar em vez de executar quando intenção já é clara | Se intenção + capacidade + permissão estão claros, executar sem pedir confirmação extra (salvo R4) |
| 5 | Entregar ao usuário quando ele pediu silêncio | deliver=local; registrar internamente |
| 6 | Condição de parada apenas no schedule do cron | Colocar condição de clock no script também |
| 7 | Registrar "GH indisponível" como se PRs não existissem | Registrar indisponibilidade, não falsificar estado dos PRs |

---

## Guardrails

- Nunca invocar um nome de skill que não existe como se existisse
- Nunca afirmar que "skill agi" está sendo usada se não existe
- Nunca confundir cronjob com agente interativo
- Nunca entregar ao usuário quando ele pediu silêncio para monitoração
- Sempre ter condição de parada explícita em ciclos autônomos

---

## Referências

- `references/agent-capability-matrix.md` — mapeamento completo de capacidades e quando usar cada uma
